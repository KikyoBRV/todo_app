import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';

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
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user data
        const userRes = await axios.get('/api/auth/me');
        setCurrentUser(userRes.data.user);
        
        // Fetch user's todos
        const todosRes = await axios.get('/api/todos');
        setTodos(todosRes.data);
      } catch (error) {
        if (error.response?.status === 401) {
          router.push('/login');
        } else {
          console.error('Failed to load data:', error);
          alert('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const addTodo = async () => {
    if (!title.trim()) return;
    try {
      await axios.post('/api/todos', { title });
      setTitle('');
      const res = await axios.get('/api/todos');
      setTodos(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        console.error('Failed to add todo:', error);
        alert('Failed to add todo');
      }
    }
  };

  const updateTodo = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'In Progress' : 'Done';
    try {
      await axios.put(`/api/todos/${id}`, { status: newStatus });
      const res = await axios.get('/api/todos');
      setTodos(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        console.error('Failed to update todo:', error);
        alert('Failed to update todo');
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
        console.error('Failed to delete todo:', error);
        alert('Failed to delete todo');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading your data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <div>
          <h1>My Todo List</h1>
          {currentUser && (
            <p style={{ margin: '5px 0 0', color: '#666' }}>
              User: {currentUser.email} (ID: {currentUser.id})
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          style={{
            flex: 1,
            padding: '10px',
            marginRight: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Add Todo
        </button>
      </div>

      {todos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>
          No todos yet. Add your first todo above!
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map((todo) => (
            <li
              key={todo._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                borderLeft: `5px solid ${todo.status === 'Done' ? '#4CAF50' : '#FFC107'}`
              }}
            >
              <div>
                <span style={{
                  display: 'block',
                  textDecoration: todo.status === 'Done' ? 'line-through' : 'none',
                  color: todo.status === 'Done' ? '#888' : '#333',
                  marginBottom: '5px'
                }}>
                  {todo.title}
                </span>
                {todo.user && (
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>
                    Created by: {todo.user.email}
                  </small>
                )}
              </div>
              <div>
                <button
                  onClick={() => updateTodo(todo._id, todo.status)}
                  style={{
                    marginRight: '8px',
                    padding: '6px 12px',
                    backgroundColor: todo.status === 'Done' ? '#FFC107' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {todo.status === 'Done' ? 'Undo' : 'Complete'}
                </button>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}