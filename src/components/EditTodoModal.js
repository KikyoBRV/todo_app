"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/router"

const EditTodoModal = ({ todo, onClose, onUpdate }) => {
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description)
  const [dueDate, setDueDate] = useState(todo.dueDate || "")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const updatedTodo = { ...todo, title, description, dueDate }
      await axios.put(`/api/todos/${todo._id}`, updatedTodo)
      onUpdate(updatedTodo)
      onClose()
    } catch (error) {
      if (error.response?.status === 401) {
        router.push("/login")
      } else {
        alert("Failed to update todo")
      }
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Update
              </button>
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .modal {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 500px;
            max-width: 90%;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #eaeaea;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
          }

          .modal-body {
            padding: 20px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 1rem;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
          }

          .submit-btn,
          .cancel-btn {
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          }

          .submit-btn {
            background-color: #2563eb;
            color: white;
          }

          .cancel-btn {
            background-color: #f3f4f6;
            color: #333;
          }
        `}</style>
      </div>
    </div>
  )
}

export default EditTodoModal
