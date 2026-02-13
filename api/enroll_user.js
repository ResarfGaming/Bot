// api/enroll_user.js
import { sb } from './_helpers.js';
import { getSessionFromReq } from './_session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getSessionFromReq(req);
  if (!session) return res.status(401).json({ error: 'not logged in' });

  const { minecraft_username, real_name, citizen_number } = req.body || {};
  if (!minecraft_username || !citizen_number) return res.status(400).json({ error: 'missing' });

  const { error } = await sb.from('citizens').insert([{ minecraft_username, real_name, citizen_number }]);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ ok: true });
}
