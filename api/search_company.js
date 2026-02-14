// api/search_company.js
import { supabase } from './_helpers.js'; // same helper you use in other endpoints

export default async function handler(req, res) {
  try {
    const owner = req.query.owner;
    if (!owner) return res.status(400).json({ error: 'Missing owner' });

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_username', owner)
      .limit(1);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}