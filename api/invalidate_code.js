// api/invalidate_code.js
import { sb, gen6Digit } from './_helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { user_id } = req.body || {};
    if (!user_id) return res.status(400).json({ error: 'missing user_id' });

    // clear existing code and generate a new one
    const newCode = gen6Digit();
    const now = new Date().toISOString();
    await sb.from('users').update({ verify_code: newCode, verify_code_created_at: now }).eq('id', user_id);
    res.json({ ok: true, newCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
