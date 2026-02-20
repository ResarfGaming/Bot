export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).send('hello world');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}