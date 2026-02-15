// api/admin_get_users.js
import { sb } from './_helpers.js';

async function getAdminFromReq(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
  if (!m) return null;
  const token = m.split('=')[1];
  const { data } = await sb.from('sessions').select('*').eq('token', token).limit(1).single();
  if (!data) return null;
  const { data: u } = await sb.from('users').select('id,role').eq('id', data.user_id).limit(1).single();
  if (!u || u.role !== 'admin') return null;
  return u;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  try {
    const admin = await getAdminFromReq(req);
    if (!admin) return res.status(403).json({ error: 'forbidden' });
    const { data, error } = await sb.from('users').select('id,name,minecraft_username,citizen_id,account_status,role,rank,created_at').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
