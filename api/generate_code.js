// api/generate_code.js
import { sb, gen6Digit } from './_helpers.js';

async function getSessionUserId(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
  if (!m) return null;
  const token = m.split('=')[1];
  const { data } = await sb.from('sessions').select('*').eq('token', token).limit(1).single();
  return data ? data.user_id : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: 'not logged in' });
    const code = gen6Digit();
    const now = new Date().toISOString();
    const { error } = await sb.from('users').update({ verify_code: code, verify_code_created_at: now }).eq('id', userId);
    if (error) throw error;
    res.json({ ok: true, code }); // returning code so user can see it in UI; in real systems you'd send via email/sms
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
