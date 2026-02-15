// api/verify_code.js
import { sb } from './_helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'missing code' });

    const { data } = await sb.from('users').select('id,name,minecraft_username,citizen_id,verify_code,verify_code_created_at').eq('verify_code', code).limit(1).single();
    if (!data) return res.status(404).json({ error: 'code not found' });

    // return user info associated with this code
    res.json({ ok: true, user: { id: data.id, name: data.name, minecraft_username: data.minecraft_username, citizen_id: data.citizen_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
