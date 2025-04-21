import dbConnect from '../../../lib/mongodb';
import Todo from '../../../models/Todo';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();
  
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { id } = req.query;
    const { id: userId } = verifyToken(token);

    if (req.method === 'GET') {
      const todo = await Todo.findOne({ _id: id, user: userId });
      if (!todo) return res.status(404).json({ error: 'Todo not found' });
      res.status(200).json(todo);
    } 
    else if (req.method === 'PUT') {
      const { title, description, status, dueDate } = req.body;
      const updatedTodo = await Todo.findOneAndUpdate(
        { _id: id, user: userId },
        { 
          title,
          description,
          status,
          dueDate
        },
        { new: true }
      );
      if (!updatedTodo) return res.status(404).json({ error: 'Todo not found' });
      res.status(200).json(updatedTodo);
    }
    else if (req.method === 'DELETE') {
      const deletedTodo = await Todo.findOneAndDelete({ _id: id, user: userId });
      if (!deletedTodo) return res.status(404).json({ error: 'Todo not found' });
      res.status(200).json({ message: 'Todo deleted successfully' });
    }
    else {
      res.status(405).end();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}