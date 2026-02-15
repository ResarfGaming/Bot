// api/_helpers.js
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
}

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// generate random citizen ID like XXX-XXX-XXX-XXX (uppercase letters & digits)
export function genCitizenId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function seg() {
    let s = '';
    for (let i = 0; i < 3; i++) s += chars.charAt(crypto.randomInt(0, chars.length));
    return s;
  }
  return `${seg()}-${seg()}-${seg()}-${seg()}`;
}

// generate 6-digit numeric code as string (e.g., '034592')
export function gen6Digit() {
  let n = crypto.randomInt(0, 1000000).toString();
  while (n.length < 6) n = '0' + n;
  return n;
}

export function genSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
