import dbConnect from '../../../lib/mongodb';
import Todo from '../../../models/Todo';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();
  
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const { id: userId } = verifyToken(token);

    if (req.method === 'GET') {
      const todos = await Todo.find({ user: userId }).populate('user', 'email');
      res.status(200).json(todos);
    } else if (req.method === 'POST') {
      const { title } = req.body;
      const todo = await Todo.create({ title, user: userId });
      const populatedTodo = await Todo.findById(todo._id).populate('user', 'email');
      res.status(201).json(populatedTodo);
    } else {
      res.status(405).end();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}