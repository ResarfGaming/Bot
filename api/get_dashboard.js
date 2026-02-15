// api/get_dashboard.js
import { sb } from './_helpers.js';

async function getSessionUserId(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
  if (!m) return null;
  const token = m.split('=')[1];
  const { data } = await sb.from('sessions').select('*').eq('token', token).limit(1).single();
  return data ? data.user_id : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  try {
    const uid = await getSessionUserId(req);
    if (!uid) return res.status(401).json({ error: 'not logged in' });
    const { data } = await sb.from('users').select('id,name,minecraft_username,citizen_id,account_status,role,rank,verify_code').eq('id', uid).limit(1).single();
    if (!data) return res.status(404).json({ error: 'user not found' });
    res.json({ ok: true, user: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
