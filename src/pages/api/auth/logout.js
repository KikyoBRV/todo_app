export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    res.status(200).json({ message: 'Logged out' });
  }