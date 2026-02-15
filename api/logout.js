// api/logout.js
import { sb } from './_helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const cookie = req.headers.cookie || '';
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
    if (m) {
      const token = m.split('=')[1];
      await sb.from('sessions').delete().eq('token', token);
    }
    // clear cookie
    res.setHeader('Set-Cookie', `session=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
