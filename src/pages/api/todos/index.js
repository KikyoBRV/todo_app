import dbConnect from '../../../lib/mongodb';
import Todo from '../../../models/Todo';
import { mockUser } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const todos = await Todo.find({ userId: mockUser.id }); // Fetch todos for the mock user
      res.status(200).json(todos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { title } = req.body;
      const todo = await Todo.create({ 
        title, 
        userId: mockUser.id,
      });
      res.status(201).json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}