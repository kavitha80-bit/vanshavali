// POST /api/tree/create
// Creates a new tree, returns { token, treeId }

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { ownerName, lang } = req.body || {};

    const result = await sql`
      INSERT INTO trees (owner_name, lang)
      VALUES (${ownerName || ''}, ${lang || 'en'})
      RETURNING id, share_token
    `;

    const tree = result[0];
    return res.status(200).json({
      treeId: tree.id,
      token: tree.share_token
    });
  } catch (err) {
    console.error('create tree error:', err);
    return res.status(500).json({ error: err.message });
  }
}
