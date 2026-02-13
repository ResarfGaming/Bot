// api/add_transaction.js
import { sb, genTransactionId } from './_helpers.js';
import { getSessionFromReq } from './_session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getSessionFromReq(req);
  if (!session || session.role !== 'banker') return res.status(403).json({ error: 'forbidden' });

  const { account, action_type, item, citizen_id } = req.body || {};
  if (!account || !action_type || !item) return res.status(400).json({ error: 'missing' });

  // create transaction
  const txid = genTransactionId();
  const { error } = await sb.from('transactions').insert([{
    transaction_id: txid, account, action_type, item, citizen_id
  }]);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ ok: true, transaction_id: txid });
}
