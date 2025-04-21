import { verifyPassword, findUserByEmail, createToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid password' });

    const token = createToken(user);
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly`);
    res.status(200).json({ user: { id: user._id, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}