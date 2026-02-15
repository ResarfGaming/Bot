// api/login.js
import { sb, genSessionToken, verifyPassword } from './_helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { minecraft_username, password } = req.body || {};
    if (!minecraft_username || !password) return res.status(400).json({ error: 'missing fields' });

    const { data } = await sb.from('users').select('*').eq('minecraft_username', minecraft_username).limit(1).single();
    if (!data) return res.status(401).json({ error: 'invalid' });

    const ok = await verifyPassword(password, data.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid' });

    const token = genSessionToken();
    const expires = new Date(Date.now() + 7*24*60*60*1000).toISOString();
    await sb.from('sessions').insert([{ token, user_id: data.id, role: data.role, expires_at: expires }]);
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Strict; Secure`);
    res.json({ ok: true, user: { id: data.id, name: data.name, minecraft_username: data.minecraft_username, account_status: data.account_status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
