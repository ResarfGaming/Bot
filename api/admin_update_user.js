// api/admin_update_user.js
import { sb, hashPassword } from './_helpers.js';

async function isAdmin(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
  if (!m) return false;
  const token = m.split('=')[1];
  const { data } = await sb.from('sessions').select('*').eq('token', token).limit(1).single();
  if (!data) return false;
  const { data: u } = await sb.from('users').select('role').eq('id', data.user_id).limit(1).single();
  return u && u.role === 'admin';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    if (!await isAdmin(req)) return res.status(403).json({ error: 'forbidden' });
    const { user_id, account_status, role, rank, new_password } = req.body || {};
    if (!user_id) return res.status(400).json({ error: 'missing user_id' });

    const updates = {};
    if (account_status !== undefined) updates.account_status = account_status;
    if (role !== undefined) updates.role = role;
    if (rank !== undefined) updates.rank = rank;
    if (new_password) updates.password_hash = await hashPassword(new_password);

    const { error } = await sb.from('users').update(updates).eq('id', user_id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
