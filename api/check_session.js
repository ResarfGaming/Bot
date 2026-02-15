// api/check_session.js
import { sb } from './_helpers.js';

async function getSessionFromReq(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
  if (!m) return null;
  const token = m.split('=')[1];
  const { data } = await sb.from('sessions').select('*').eq('token', token).limit(1).single();
  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) {
    await sb.from('sessions').delete().eq('token', token);
    return null;
  }
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  try {
    const sess = await getSessionFromReq(req);
    if (!sess) return res.json({ loggedIn: false });
    const { data: user } = await sb.from('users').select('id,name,minecraft_username,account_status,role,citizen_id').eq('id', sess.user_id).limit(1).single();
    if (!user) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
         }
