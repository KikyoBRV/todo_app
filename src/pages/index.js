import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get('/api/todos');
    setTodos(res.data);
  };

  const addTodo = async () => {
    await axios.post('/api/todos', { title });
    setTitle('');
    fetchTodos();
  };

  const updateTodo = async (id, status) => {
    await axios.put(`/api/todos/${id}`, { status });
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`/api/todos/${id}`);
    fetchTodos();
  };

  return (
    <div>
      <h1>Todo App</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            {todo.title} - {todo.status}
            <button onClick={() => updateTodo(todo._id, "Done")}>
              Mark Done
            </button>
            <button onClick={() => deleteTodo(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}