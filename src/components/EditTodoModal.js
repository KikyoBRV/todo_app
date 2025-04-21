"use client"

import { useState } from "react"

export default function EditTodoModal({ todo, onClose, onUpdate }) {
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description)
  const [dueDate, setDueDate] = useState(todo.dueDate ? todo.dueDate.substring(0, 10) : "")
  const [status, setStatus] = useState(todo.status)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          status,
        }),
      })

      if (res.ok) {
        const updatedTodo = await res.json()
        onUpdate(updatedTodo)
        onClose()
      } else {
        alert("Failed to update todo")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("Failed to update todo")
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button onClick={onClose} className="close-btn">
            <span className="icon">❌</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Task Title</label>
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
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Update Task
            </button>
          </div>
        </form>
        <style jsx>{`
          .modal-backdrop {
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
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            width: 90%;
            max-width: 600px;
            padding: 20px;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
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
            color: #6b7280;
          }

          .modal-form {
            display: flex;
            flex-direction: column;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-group label {
            font-weight: 500;
            margin-bottom: 5px;
            display: block;
          }

          .form-group input,
          .form-group textarea,
          .form-group select {
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 1rem;
            width: 100%;
            box-sizing: border-box;
          }

          .form-group textarea {
            min-height: 100px;
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
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
          }

          .submit-btn {
            background-color: #2563eb;
            color: white;
          }

          .cancel-btn {
            background-color: #f3f4f6;
            color: #4b5563;
          }
        `}</style>
      </div>
    </div>
  )
}
