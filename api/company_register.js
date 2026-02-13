// api/company_register.js
import { sb, hashPassword } from './_helpers.js';
import { getSessionFromReq } from './_session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getSessionFromReq(req);
  if (!session) return res.status(401).json({ error: 'not logged in' });

  const { name, owner_username, password, info } = req.body || {};
  if (!name || !owner_username || !password) return res.status(400).json({ error: 'missing' });

  const ph = await hashPassword(password);
  const { error } = await sb.from('companies').insert([{ name, owner_username, password_hash: ph, info }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
}
