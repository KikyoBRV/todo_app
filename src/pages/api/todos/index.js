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
      const todos = await Todo.find({ user: userId }).sort({ dueDate: 1 });
      res.status(200).json(todos);
    } else if (req.method === 'POST') {
      const { title, description, dueDate } = req.body;
      const todo = await Todo.create({ 
        title, 
        description, 
        dueDate: dueDate ? new Date(dueDate) : null,
        user: userId 
      });
      res.status(201).json(todo);
    } else {
      res.status(405).end();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}