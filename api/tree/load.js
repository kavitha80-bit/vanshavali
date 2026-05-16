// GET /api/tree/load?token=abc123
// Returns full graph: { rv_persons, rv_edges, rv_nid, lang, ownerName }

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { token } = req.query;

    if (!token) return res.status(400).json({ error: 'token required' });

    // Get tree
    const trees = await sql`
      SELECT id, lang, owner_name FROM trees WHERE share_token = ${token}
    `;
    if (!trees.length) return res.status(404).json({ error: 'Tree not found' });
    const tree = trees[0];

    // Get persons
    const persons = await sql`
      SELECT id, name, dob, city, gotra, naksh, notes, is_root, is_mother, placeholder
      FROM persons WHERE tree_id = ${tree.id}
    `;

    // Get edges
    const edges = await sql`
      SELECT a, b, t FROM edges WHERE tree_id = ${tree.id}
    `;

    // Reconstruct rv_persons object
    const rv_persons = {};
    let maxId = 100;
    for (const p of persons) {
      rv_persons[p.id] = {
        name: p.name, dob: p.dob, city: p.city,
        gotra: p.gotra, naksh: p.naksh, notes: p.notes,
        isRoot: p.is_root,
        isMother: p.is_mother,
        placeholder: p.placeholder
      };
      // Track highest numeric ID for rv_nid
      const num = parseInt(p.id.replace(/\D/g, ''));
      if (!isNaN(num) && num > maxId) maxId = num;
    }

    return res.status(200).json({
      rv_persons,
      rv_edges: edges.map(e => ({ a: e.a, b: e.b, t: e.t })),
      rv_nid: maxId + 1,
      lang: tree.lang,
      ownerName: tree.owner_name
    });
  } catch (err) {
    console.error('load tree error:', err);
    return res.status(500).json({ error: err.message });
  }
}
