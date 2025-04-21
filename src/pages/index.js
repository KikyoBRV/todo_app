"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import EditTodoModal from "../components/EditTodoModal"
import Calendar from "../components/Calendar"

export async function getServerSideProps(context) {
  const { token } = parseCookies(context)
  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    }
  }
  return { props: {} }
}

export default function Home() {
  const [todos, setTodos] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  })
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [editingTodo, setEditingTodo] = useState(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get("/api/auth/me")
        setCurrentUser(userRes.data.user)

        const todosRes = await axios.get("/api/todos")
        setTodos(todosRes.data)
      } catch (error) {
        if (error.response?.status === 401) {
          router.push("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      await axios.post("/api/todos", formData)
      setFormData({ title: "", description: "", dueDate: "" })
      const res = await axios.get("/api/todos")
      setTodos(res.data)
      setIsFormVisible(false)
    } catch (error) {
      if (error.response?.status === 401) {
        router.push("/login")
      } else {
        alert("Failed to add todo")
      }
    }
  }

  const updateTodoStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Done" ? "In Progress" : "Done"
    try {
      await axios.put(`/api/todos/${id}`, {
        status: newStatus,
        // Explicitly preserve all other fields including dueDate
        $currentDate: { lastModified: true },
      })
      const res = await axios.get("/api/todos")
      setTodos(res.data)
    } catch (error) {
      if (error.response?.status === 401) {
        router.push("/login")
      } else {
        alert("Failed to update todo status")
      }
    }
  }

  const deleteTodo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this todo?")) return
    try {
      await axios.delete(`/api/todos/${id}`)
      const res = await axios.get("/api/todos")
      setTodos(res.data)
    } catch (error) {
      if (error.response?.status === 401) {
        router.push("/login")
      } else {
        alert("Failed to delete todo")
      }
    }
  }

  const handleTodoUpdate = (updatedTodo) => {
    setTodos(todos.map((todo) => (todo._id === updatedTodo._id ? updatedTodo : todo)))
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout")
      router.push("/login")
    } catch (error) {
      alert("Logout failed")
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isOverdue = (dueDate, status) => {
    if (!dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    return due < today && status !== "Done"
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your tasks...</p>
      </div>
    )
  }

  return (
    <div className="app-container">
      {editingTodo && (
        <EditTodoModal todo={editingTodo} onClose={() => setEditingTodo(null)} onUpdate={handleTodoUpdate} />
      )}

      <header className="app-header">
        <div className="header-content">
          <h1>TodoApp</h1>
          {currentUser && (
            <div className="user-profile">
              <div className="avatar">{currentUser.email.charAt(0).toUpperCase()}</div>
              <span>{currentUser.email}</span>
            </div>
          )}
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <span className="icon">🚪</span>
          <span>Logout</span>
        </button>
      </header>

      <main className="main-content">
        {/* Calendar Component */}
        <Calendar todos={todos} />

        <div className="todo-header">
          <h2>My Tasks</h2>
          <button className="add-todo-btn" onClick={() => setIsFormVisible(!isFormVisible)}>
            {isFormVisible ? (
              "Cancel"
            ) : (
              <>
                <span className="icon">➕</span>
                <span>New Task</span>
              </>
            )}
          </button>
        </div>

        {isFormVisible && (
          <form onSubmit={addTodo} className="todo-form">
            <div className="form-group">
              <label htmlFor="title">Task Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add details about this task..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input id="dueDate" type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setIsFormVisible(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Add Task
              </button>
            </div>
          </form>
        )}

        {todos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Add your first task to get started</p>
            <button className="add-first-todo-btn" onClick={() => setIsFormVisible(true)}>
              <span className="icon">➕</span>
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          <div className="todo-list-container">
            <ul className="todo-list">
              {todos.map((todo) => {
                const isTaskOverdue = isOverdue(todo.dueDate, todo.status)

                return (
                  <li
                    key={todo._id}
                    className={`todo-item ${todo.status === "Done" ? "done" : ""} ${isTaskOverdue ? "overdue" : ""}`}
                  >
                    <button
                      className="status-button"
                      onClick={() => updateTodoStatus(todo._id, todo.status)}
                      title={todo.status === "Done" ? "Mark as not done" : "Mark as done"}
                    >
                      {todo.status === "Done" ? (
                        <>
                          <span className="status-icon completed">✅</span>
                          <span className="status-text">Done</span>
                        </>
                      ) : (
                        <>
                          <span className="status-icon">⭕</span>
                          <span className="status-text">Mark done</span>
                        </>
                      )}
                    </button>

                    <div className="todo-content">
                      <h3 className={todo.status === "Done" ? "completed-title" : ""}>{todo.title}</h3>

                      {todo.description && <p className="todo-description">{todo.description}</p>}

                      <div className="todo-meta">
                        {todo.dueDate && (
                          <div
                            className={`meta-item due-date ${isTaskOverdue ? "overdue" : ""} ${
                              todo.status === "Done" ? "completed" : ""
                            }`}
                          >
                            <span className="meta-icon">📅</span>
                            <span>Due: {formatDate(todo.dueDate)}</span>
                            {isTaskOverdue && (
                              <span className="overdue-badge">
                                <span className="warning-icon">⚠️</span>
                                Overdue
                              </span>
                            )}
                          </div>
                        )}

                        <div className="meta-item created-date">
                          <span className="meta-icon">🕒</span>
                          <span>Created: {formatDate(todo.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="todo-actions">
                      <button onClick={() => setEditingTodo(todo)} className="action-btn edit-btn" title="Edit task">
                        <span className="action-icon">✏️</span>
                      </button>
                      <button
                        onClick={() => deleteTodo(todo._id)}
                        className="action-btn delete-btn"
                        title="Delete task"
                      >
                        <span className="action-icon">🗑️</span>
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </main>

      <style jsx>{`
        .app-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          color: #333;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #3498db;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eaeaea;
        }
        
        .header-content {
          display: flex;
          flex-direction: column;
        }
        
        .app-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #2563eb;
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          margin-top: 8px;
          font-size: 14px;
          color: #666;
        }
        
        .avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #2563eb;
          color: white;
          border-radius: 50%;
          font-size: 12px;
          margin-right: 8px;
        }
        
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background-color: #f3f4f6;
          color: #4b5563;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .logout-btn:hover {
          background-color: #e5e7eb;
        }
        
        .icon {
          font-size: 16px;
        }
        
        .main-content {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        
        .todo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background-color: #f9fafb;
          border-bottom: 1px solid #eaeaea;
        }
        
        .todo-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .add-todo-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .add-todo-btn:hover {
          background-color: #1d4ed8;
        }
        
        .todo-form {
          padding: 20px;
          background-color: #f9fafb;
          border-bottom: 1px solid #eaeaea;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #4b5563;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .cancel-btn {
          padding: 8px 16px;
          background-color: #f3f4f6;
          color: #4b5563;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .submit-btn {
          padding: 8px 16px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .empty-state h3 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 600;
        }
        
        .empty-state p {
          margin: 0 0 24px;
          color: #6b7280;
        }
        
        .add-first-todo-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .todo-list-container {
          padding: 20px;
        }
        
        .todo-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .todo-item {
          display: flex;
          align-items: flex-start;
          padding: 16px;
          margin-bottom: 12px;
          background-color: #f9fafb;
          border-radius: 8px;
          border-left: 3px solid #d1d5db;
          transition: all 0.2s ease;
        }
        
        .todo-item:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .todo-item.done {
          border-left-color: #10b981;
          background-color: #f0fdf4;
        }
        
        .todo-item.overdue {
          border-left-color: #ef4444;
        }
        
        .status-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
          margin-right: 12px;
        }

        .status-button:hover {
          background-color: #f3f4f6;
        }

        .status-text {
          font-size: 10px;
          color: #6b7280;
          font-weight: 500;
        }

        .status-icon.completed + .status-text {
          color: #10b981;
        }
        
        .todo-status {
          margin-right: 12px;
          cursor: pointer;
        }
        
        .status-icon {
          font-size: 20px;
        }
        
        .todo-content {
          flex: 1;
        }
        
        .todo-content h3 {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 600;
        }
        
        .completed-title {
          text-decoration: line-through;
          color: #9ca3af;
        }
        
        .todo-description {
          margin: 0 0 12px;
          font-size: 14px;
          color: #6b7280;
        }
        
        .todo-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12px;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
        }
        
        .meta-icon {
          font-size: 14px;
        }
        
        .due-date.overdue {
          color: #ef4444;
        }
        
        .due-date.completed {
          text-decoration: line-through;
          color: #9ca3af;
        }
        
        .overdue-badge {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-left: 6px;
          padding: 2px 6px;
          background-color: #fee2e2;
          color: #ef4444;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }
        
        .warning-icon {
          font-size: 10px;
        }
        
        .todo-actions {
          display: flex;
          gap: 8px;
          margin-left: 12px;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background-color: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          background-color: #f3f4f6;
        }
        
        .action-icon {
          font-size: 16px;
        }
        
        @media (max-width: 640px) {
          .app-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .logout-btn {
            align-self: flex-start;
          }
          
          .todo-item {
            flex-direction: column;
          }
          
          .status-button {
            margin-bottom: 12px;
            align-self: flex-start;
          }
          
          .todo-status {
            margin-bottom: 12px;
          }
          
          .todo-actions {
            margin-left: 0;
            margin-top: 12px;
            align-self: flex-end;
          }
          
          .todo-meta {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  )
}
