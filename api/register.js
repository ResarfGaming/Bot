// api/register.js
import { sb, genCitizenId, genSessionToken, hashPassword } from './_helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { name, minecraft_username, password } = req.body || {};
    if (!name || !minecraft_username || !password) return res.status(400).json({ error: 'missing fields' });

    // check uniqueness
    const { data: exists } = await sb.from('users').select('id').eq('minecraft_username', minecraft_username).limit(1);
    if (exists && exists.length) return res.status(400).json({ error: 'username taken' });

    const passHash = await hashPassword(password);
    const citizen_id = genCitizenId();

    const { data, error } = await sb.from('users').insert([{
      name, minecraft_username, password_hash: passHash, citizen_id, account_status: 1, rank: 'Normal'
    }]).select().single();

    if (error) throw error;

    // create session
    const token = genSessionToken();
    const expires = new Date(Date.now() + 7*24*60*60*1000).toISOString();

    await sb.from('sessions').insert([{ token, user_id: data.id, role: data.role, expires_at: expires }]);

    // set cookie via response header (Vercel will forward)
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Strict; Secure`);
    res.json({ ok: true, user: { id: data.id, name: data.name, minecraft_username: data.minecraft_username, account_status: data.account_status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
