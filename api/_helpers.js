// api/_helpers.js
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Supabase client (server role)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// generate secure 20-digit transaction id (decimal string)
export function genTransactionId() {
  let s = '';
  while (s.length < 20) {
    s += crypto.randomInt(0, 10).toString();
  }
  return s.slice(0, 20);
}

// generate a random session token
export function genSessionToken() {
  return crypto.randomBytes(32).toString('hex'); // 64 hex chars
}

// password hashing and verification
export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}