import dbConnect from '../../../lib/mongodb';
import Todo from '../../../models/Todo';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { status } = req.body;
      const updatedTodo = await Todo.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      res.status(200).json(updatedTodo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await Todo.findByIdAndDelete(id);
      res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}