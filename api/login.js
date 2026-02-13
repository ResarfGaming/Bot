// api/login.js
import { sb, genSessionToken, verifyPassword } from './_helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing' });

  // check staff_accounts
  const { data: staff } = await sb.from('staff_accounts').select('*').eq('username', username).limit(1);
  if (staff && staff[0]) {
    const ok = await verifyPassword(password, staff[0].password_hash);
    if (ok) {
      const token = genSessionToken();
      const expires = new Date(Date.now() + 7*24*3600*1000); // 7 days
      await sb.from('sessions').insert([{ token, user_id: staff[0].id, role: staff[0].role, expires_at: expires }]);
      res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=${7*24*3600}; SameSite=Strict; Secure`);
      return res.json({ ok: true, role: staff[0].role });
    }
  }

  // check company owners (login by owner_username)
  const { data: comp } = await sb.from('companies').select('*').eq('owner_username', username).limit(1);
  if (comp && comp[0]) {
    const ok = await verifyPassword(password, comp[0].password_hash);
    if (ok) {
      const token = genSessionToken();
      const expires = new Date(Date.now() + 7*24*3600*1000);
      await sb.from('sessions').insert([{ token, user_id: comp[0].id, role: 'company_owner', expires_at: expires }]);
      res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=${7*24*3600}; SameSite=Strict; Secure`);
      return res.json({ ok:true, role: 'company_owner' });
    }
  }

  return res.status(401).json({ error: 'invalid' });
}
