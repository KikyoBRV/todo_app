"use client"

import { useState, useEffect } from "react"

export default function Calendar({ todos }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [todosForSelectedDate, setTodosForSelectedDate] = useState([])

  // Generate calendar days for current month
  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Get the day of the week for the first day (0-6, where 0 is Sunday)
    const firstDayOfWeek = firstDay.getDay()

    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek

    // Calculate total days to show (previous month days + current month days)
    const totalDays = daysFromPrevMonth + lastDay.getDate()

    // Calculate rows needed (ceil to nearest week)
    const rows = Math.ceil(totalDays / 7)

    // Generate calendar days array
    const days = []

    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const day = prevMonthLastDay - daysFromPrevMonth + i + 1
      days.push({
        date: new Date(year, month - 1, day),
        day,
        currentMonth: false,
        isToday: false,
      })
    }

    // Add days from current month
    const today = new Date()
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        day: i,
        currentMonth: true,
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
      })
    }

    // Add days from next month to complete the rows
    const remainingDays = rows * 7 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        day: i,
        currentMonth: false,
        isToday: false,
      })
    }

    setCalendarDays(days)
  }, [currentDate])

  // Filter todos for selected date
  useEffect(() => {
    if (!todos || !todos.length) {
      setTodosForSelectedDate([])
      return
    }

    const filteredTodos = todos.filter((todo) => {
      if (!todo.dueDate) return false

      const dueDate = new Date(todo.dueDate)
      return (
        dueDate.getDate() === selectedDate.getDate() &&
        dueDate.getMonth() === selectedDate.getMonth() &&
        dueDate.getFullYear() === selectedDate.getFullYear()
      )
    })

    setTodosForSelectedDate(filteredTodos)
  }, [selectedDate, todos])

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Navigate to today
  const goToToday = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  // Get todos count for a specific date
  const getTodosCountForDate = (date) => {
    if (!todos || !todos.length) return 0

    return todos.filter((todo) => {
      if (!todo.dueDate) return false

      const dueDate = new Date(todo.dueDate)
      return (
        dueDate.getDate() === date.getDate() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear()
      )
    }).length
  }

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Calendar</h2>
        <div className="calendar-navigation">
          <button onClick={prevMonth} className="nav-btn">
            <span className="icon">◀</span>
          </button>
          <h3>{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
          <button onClick={nextMonth} className="nav-btn">
            <span className="icon">▶</span>
          </button>
          <button onClick={goToToday} className="today-btn">
            Today
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="days">
          {calendarDays.map((day, index) => {
            const todosCount = getTodosCountForDate(day.date)
            return (
              <div
                key={index}
                className={`day ${!day.currentMonth ? "other-month" : ""} ${day.isToday ? "today" : ""} ${
                  selectedDate.getDate() === day.date.getDate() &&
                  selectedDate.getMonth() === day.date.getMonth() &&
                  selectedDate.getFullYear() === day.date.getFullYear()
                    ? "selected"
                    : ""
                }`}
                onClick={() => setSelectedDate(day.date)}
              >
                <span className="day-number">{day.day}</span>
                {todosCount > 0 && <span className="todo-indicator">{todosCount}</span>}
              </div>
            )
          })}
        </div>
      </div>

      {todosForSelectedDate.length > 0 && (
        <div className="selected-date-todos">
          <h3>{formatDate(selectedDate)}</h3>
          <ul className="date-todos-list">
            {todosForSelectedDate.map((todo) => (
              <li key={todo._id} className={`date-todo-item ${todo.status === "Done" ? "done" : ""}`}>
                <span className={`status-dot ${todo.status === "Done" ? "done" : ""}`}></span>
                <span className="todo-title">{todo.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          margin-bottom: 30px;
          overflow: hidden;
        }
        
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background-color: #f9fafb;
          border-bottom: 1px solid #eaeaea;
        }
        
        .calendar-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .calendar-navigation {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .calendar-navigation h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          min-width: 150px;
          text-align: center;
        }
        
        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          background-color: #f3f4f6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .nav-btn:hover {
          background-color: #e5e7eb;
        }
        
        .today-btn {
          padding: 6px 12px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .today-btn:hover {
          background-color: #1d4ed8;
        }
        
        .calendar-grid {
          padding: 16px;
        }
        
        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
        }
        
        .weekday {
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          padding: 8px 0;
        }
        
        .days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        
        .day {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .day:hover {
          background-color: #f3f4f6;
        }
        
        .day.other-month {
          color: #9ca3af;
        }
        
        .day.today {
          background-color: #eff6ff;
          font-weight: 600;
          color: #2563eb;
        }
        
        .day.selected {
          background-color: #2563eb;
          color: white;
        }
        
        .day.selected .todo-indicator {
          background-color: white;
          color: #2563eb;
        }
        
        .day-number {
          font-size: 14px;
        }
        
        .todo-indicator {
          position: absolute;
          bottom: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background-color: #2563eb;
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 600;
        }
        
        .selected-date-todos {
          padding: 16px;
          border-top: 1px solid #eaeaea;
        }
        
        .selected-date-todos h3 {
          margin: 0 0 12px;
          font-size: 16px;
          font-weight: 600;
        }
        
        .date-todos-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .date-todo-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        
        .date-todo-item:hover {
          background-color: #f9fafb;
        }
        
        .date-todo-item.done .todo-title {
          text-decoration: line-through;
          color: #9ca3af;
        }
        
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #2563eb;
        }
        
        .status-dot.done {
          background-color: #10b981;
        }
        
        .todo-title {
          font-size: 14px;
        }
        
        @media (max-width: 640px) {
          .calendar-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .calendar-navigation {
            width: 100%;
            justify-content: space-between;
          }
          
          .day {
            height: 36px;
          }
        }
      `}</style>
    </div>
  )
}
