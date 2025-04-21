import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import EditTodoModal from '../components/EditTodoModal';

export async function getServerSideProps(context) {
  const { token } = parseCookies(context);
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
}

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('/api/auth/me');
        setCurrentUser(userRes.data.user);
        
        const todosRes = await axios.get('/api/todos');
        setTodos(todosRes.data);
      } catch (error) {
        if (error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    try {
      await axios.post('/api/todos', formData);
      setFormData({ title: '', description: '', dueDate: '' });
      const res = await axios.get('/api/todos');
      setTodos(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        alert('Failed to add todo');
      }
    }
  };

  const updateTodoStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'In Progress' : 'Done';
    try {
      await axios.put(`/api/todos/${id}`, { 
        status: newStatus,
        // Explicitly preserve all other fields including dueDate
        $currentDate: { lastModified: true }
      });
      const res = await axios.get('/api/todos');
      setTodos(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        alert('Failed to update todo status');
      }
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    try {
      await axios.delete(`/api/todos/${id}`);
      const res = await axios.get('/api/todos');
      setTodos(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        alert('Failed to delete todo');
      }
    }
  };

  const handleTodoUpdate = (updatedTodo) => {
    setTodos(todos.map(todo => 
      todo._id === updatedTodo._id ? updatedTodo : todo
    ));
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      alert('Logout failed');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      {editingTodo && (
        <EditTodoModal 
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onUpdate={handleTodoUpdate}
        />
      )}

      <header>
        <div>
          <h1>My Todo List</h1>
          {currentUser && (
            <p className="user-info">User: {currentUser.email}</p>
          )}
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <form onSubmit={addTodo} className="todo-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
          />
        </div>
        
        <button type="submit" className="add-btn">
          Add Todo
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="no-todos">No todos yet. Add your first todo above!</p>
      ) : (
        <ul className="todo-list">
            {todos.map((todo) => (
            <li 
                key={todo._id} 
                className={`todo-item ${todo.status.toLowerCase().replace(' ', '-')}`}
            >
                <div className="todo-content">
                <h3>{todo.title}</h3>
                <p className="description">{todo.description || 'No description'}</p>
                
                <div className="todo-meta">
                    <span className={`status ${todo.status.toLowerCase().replace(' ', '-')}`}>
                    {todo.status}
                    </span>
                    {/* Always show due date regardless of status */}
                    {todo.dueDate && (
                    <span className={`due-date ${todo.status === 'Done' ? 'done' : ''}`}>
                        Due: {formatDate(todo.dueDate)}
                        {todo.status === 'Done' && ' (completed)'}
                    </span>
                    )}
                    <span className="created-at">
                    Created: {formatDate(todo.createdAt)}
                    </span>
                </div>
                </div>
              
              <div className="todo-actions">
                <button 
                  onClick={() => updateTodoStatus(todo._id, todo.status)}
                  className={`status-btn ${todo.status === 'Done' ? 'undo' : 'complete'}`}
                >
                  {todo.status === 'Done' ? 'Undo' : 'Complete'}
                </button>
                <button 
                  onClick={() => setEditingTodo(todo)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteTodo(todo._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .user-info {
          margin: 5px 0 0;
          color: #666;
        }
        
        .logout-btn {
          padding: 8px 16px;
          background-color: #ff4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        }
        
        .todo-form {
          margin-bottom: 30px;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .form-group textarea {
          min-height: 100px;
        }
        
        .add-btn {
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .no-todos {
          text-align: center;
          color: #666;
        }
        
        .todo-list {
          list-style: none;
          padding: 0;
        }
        
        .todo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          margin-bottom: 15px;
          background: #f9f9f9;
          border-radius: 8px;
          border-left: 5px solid;
        }
        
        .todo-item.in-progress {
          border-left-color: #FFC107;
        }
        
        .todo-item.done {
          border-left-color: #4CAF50;
        }
        
        .todo-item.overdue {
          border-left-color: #f44336;
        }
        
        .todo-content {
          flex: 1;
        }
        
        .todo-content h3 {
          margin: 0 0 5px;
        }
        
        .description {
          color: #666;
          margin: 0 0 10px;
        }
        
        .todo-meta {
          display: flex;
          gap: 15px;
          font-size: 0.9rem;
          color: #666;
        }
        
        .status {
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: bold;
        }
        
        .status.in-progress {
          background-color: #FFF3E0;
          color: #FF8F00;
        }
        
        .status.done {
          background-color: #E8F5E9;
          color: #2E7D32;
        }
        
        .status.overdue {
          background-color: #FFEBEE;
          color: #C62828;
        }
        
        .todo-actions {
          display: flex;
          gap: 8px;
        }
        
        .status-btn,
        .edit-btn,
        .delete-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .status-btn.complete {
          background-color: #4CAF50;
          color: white;
        }
        
        .status-btn.undo {
          background-color: #FFC107;
          color: white;
        }
        
        .edit-btn {
          background-color: #2196F3;
          color: white;
        }
        
        .delete-btn {
          background-color: #f44336;
          color: white;
        }

        .due-date.done {
          text-decoration: line-through;
          color: #888;
        }
      `}</style>
    </div>
  );
}