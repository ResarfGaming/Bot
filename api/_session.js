// api/_session.js
import { sb } from './_helpers.js';

export async function getSessionFromReq(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
  if (!m) return null;
  const token = m.split('=')[1];
  const { data } = await sb.from('sessions').select('*').eq('token', token).limit(1);
  if (!data || !data[0]) return null;
  const s = data[0];
  if (new Date(s.expires_at) < new Date()) {
    // optionally delete expired session
    await sb.from('sessions').delete().eq('token', token);
    return null;
  }
  return s;
}
