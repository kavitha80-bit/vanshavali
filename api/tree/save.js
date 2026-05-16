// POST /api/tree/save
// Body: { token, rv_persons, rv_edges, rv_nid, lang }
// Saves full graph state — replaces all persons+edges for this tree

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { token, rv_persons, rv_edges, rv_nid, lang } = req.body;

    if (!token) return res.status(400).json({ error: 'token required' });

    // Look up tree
    const trees = await sql`SELECT id FROM trees WHERE share_token = ${token}`;
    if (!trees.length) return res.status(404).json({ error: 'Tree not found' });
    const treeId = trees[0].id;

    // Update tree metadata
    await sql`
      UPDATE trees SET lang = ${lang || 'en'}, updated_at = NOW()
      WHERE id = ${treeId}
    `;

    // Delete existing persons + edges (cascade handles edges via FK)
    await sql`DELETE FROM persons WHERE tree_id = ${treeId}`;
    await sql`DELETE FROM edges WHERE tree_id = ${treeId}`;

    // Insert all persons
    const personRows = Object.entries(rv_persons || {});
    for (const [id, p] of personRows) {
      await sql`
        INSERT INTO persons (id, tree_id, name, dob, city, gotra, naksh, notes, is_root, is_mother, placeholder)
        VALUES (
          ${id}, ${treeId},
          ${p.name || ''}, ${p.dob || ''}, ${p.city || ''},
          ${p.gotra || ''}, ${p.naksh || ''}, ${p.notes || ''},
          ${p.isRoot || false}, ${p.isMother ?? null}, ${p.placeholder || false}
        )
      `;
    }

    // Insert all edges
    for (const e of (rv_edges || [])) {
      await sql`
        INSERT INTO edges (tree_id, a, b, t)
        VALUES (${treeId}, ${e.a}, ${e.b}, ${e.t})
      `;
    }

    return res.status(200).json({ ok: true, saved: personRows.length });
  } catch (err) {
    console.error('save tree error:', err);
    return res.status(500).json({ error: err.message });
  }
}
