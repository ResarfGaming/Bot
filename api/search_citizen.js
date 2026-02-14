// api/search_citizen.js
import { supabase } from './_helpers.js';

export default async function handler(req, res) {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Missing search query' });

    const { data, error } = await supabase
      .from('citizens')
      .select('*')
      .or(`minecraft_username.eq.${q},citizen_number.eq.${q}`)
      .limit(1);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}