// api/setup_seed.js
import { sb, hashPassword } from './_helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { bankerPass='1234', courtPass='1234' } = req.body || {};

  const hb = await hashPassword(bankerPass);
  const hc = await hashPassword(courtPass);

  await sb.from('staff_accounts').upsert([
    { username: 'banker', password_hash: hb, role: 'banker' },
    { username: 'court', password_hash: hc, role: 'court' }
  ]);

  return res.json({ ok: true });
}
