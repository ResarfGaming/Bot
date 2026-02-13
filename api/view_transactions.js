// api/view_transactions.js
import { sb } from './_helpers.js';
import { getSessionFromReq } from './_session.js';

export default async function handler(req, res) {
  const session = await getSessionFromReq(req);
  if (!session || session.role !== 'banker') return res.status(403).json({ error: 'forbidden' });
  const { data, error } = await sb.from('transactions').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
}
