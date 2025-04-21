import { hashPassword, createToken, createUser, findUserByEmail } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  
  try {
    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(email, hashedPassword);
    const token = createToken(user);
    
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly`);
    res.status(200).json({ user: { id: user._id, email } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Signup failed' });
  }
}