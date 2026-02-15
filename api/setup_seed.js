// api/setup_seed.js
import { sb } from './_helpers.js';
import { hashPassword } from './_helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    // create admin if not exists
    const adminUser = {
      name: 'Admin',
      minecraft_username: 'admin',
      password_hash: await hashPassword('password'),
      account_status: 0,
      role: 'admin',
      rank: 'Admin'
    };

    const { error } = await sb.from('users').upsert(
      { ...adminUser },
      { onConflict: 'minecraft_username' }
    );
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
