// api/complete_account.js
import { sb } from './_helpers.js';

async function getSessionToken(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
  if (!m) return null;
  return m.split('=')[1];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const token = await getSessionToken(req);
    if (!token) return res.status(401).json({ error: 'not logged in' });
    const { data: s } = await sb.from('sessions').select('*').eq('token', token).limit(1).single();
    if (!s) return res.status(401).json({ error: 'invalid session' });
    const { data: user } = await sb.from('users').select('*').eq('id', s.user_id).limit(1).single();
    if (!user) return res.status(404).json({ error: 'user not found' });
    if (user.account_status !== 2) return res.status(400).json({ error: 'not in ready state' });
    await sb.from('users').update({ account_status: 0 }).eq('id', user.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
