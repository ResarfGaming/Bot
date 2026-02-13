// api/court_add_note.js
import { sb } from './_helpers.js';
import { getSessionFromReq } from './_session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getSessionFromReq(req);
  if (!session || session.role !== 'court') return res.status(403).json({ error: 'forbidden' });

  const { citizen_id, company_id, note } = req.body || {};
  if (!note || (!citizen_id && !company_id)) return res.status(400).json({ error: 'missing' });

  const { error } = await sb.from('legal_actions').insert([{ target_citizen: citizen_id || null, target_company: company_id || null, note }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}
