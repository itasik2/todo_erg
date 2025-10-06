import React, { useState } from 'react';
import './TaskTable.css';

const TaskTable = ({
  tasks,
  assignees,
  adminMode,
  onStatusChange,
  onDelete,
  formatDateTime,
  onAssigneeChange
}) => {
  const [editingTime, setEditingTime] = useState(null);
  const [timeInput, setTimeInput] = useState('');

  const handleTimeEdit = (taskId, currentTime) => {
    if (!adminMode) return;
    setTimeInput(currentTime || '');
    setEditingTime(taskId);
  };

  const saveTime = (taskId) => {
    onAssigneeChange(taskId, timeInput);
    setEditingTime(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="no-tasks">
        <p>Нет заявок</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="tasks-table">
        <thead>
          <tr>
            <th>Подразделение</th>
            <th>Дата подачи</th>
            <th>Бригадир</th>
            <th>Лаборатория</th>
            <th>Кабинет</th>
            <th>Описание</th>
            <th>Дата принятия</th>
            <th>Статус</th>
            <th>Время работы</th>
            <th>Исполнитель</th>
            {adminMode && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr 
              key={task.id} 
              className={`task-row priority-${task.priority} status-${task.status}`}
            >

              <td>
                <span className={`department-badge department-${task.department}`}>
                  {task.department === 'general' && '🏢 Общие'}
                  {task.department === 'plumber' && '🔧 Сантехник'}
                  {task.department === 'electrician' && '⚡ Электрик'}
                  {task.department === 'adjustment' && '🛠️ Наладка'}
                </span>
              </td>
              <td>{formatDateTime(task.createdAt)}</td>
              <td>{task.foreman}</td>
              <td>{task.lab}</td>
              <td>{task.roomNumber}</td>
              <td className="task-description">{task.description}</td>
              <td>{formatDateTime(task.acceptedAt)}</td>
              <td>
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value, task.status)}
                  disabled={task.status === 'выполнено' && !adminMode}
                >
                  <option value="новая">Новая</option>
                  <option value="в работе">В работе</option>
                  <option value="выполнено">Выполнено</option>
                </select>
              </td>
              <td>
                {editingTime === task.id ? (
                  <div className="time-edit">
                    <input
                      type="text"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      placeholder="Например: 2ч 30м"
                    />
                    <button onClick={() => saveTime(task.id)}>✓</button>
                    <button onClick={() => setEditingTime(null)}>×</button>
                  </div>
                ) : (
                  <span 
                    className="time-display" 
                    onClick={() => handleTimeEdit(task.id, task.timeSpent)}
                    style={{ cursor: adminMode ? 'pointer' : 'default' }}
                  >
                    {task.timeSpent || '-'}
                  </span>
                )}
              </td>
              <td>
                <select
                  value={task.assignee || ''}
                  onChange={(e) => onAssigneeChange(task.id, e.target.value)}
                  disabled={!adminMode}
                >
                  <option value="">Не назначен</option>
                  {assignees.map(assignee => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))}
                </select>
              </td>
              {adminMode && (
                <td>
                  <button 
                    onClick={() => onDelete(task.id)} 
                    className="delete-btn"
                    title="Удалить заявку"
                  >
                    🗑️
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
