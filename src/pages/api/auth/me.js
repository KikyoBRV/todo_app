import { verifyToken, findUserById } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { id } = verifyToken(token);
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.status(200).json({ 
      user: { 
        id: user._id, 
        email: user.email,
        createdAt: user.createdAt 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}