import React, { useState } from 'react';
import './AssigneeManagement.css';

const AssigneeManagement = ({ assignees, onAdd, onRemove }) => {
  const [newAssignee, setNewAssignee] = useState('');

  const handleAdd = () => {
    if (newAssignee.trim()) {
      onAdd(newAssignee.trim());
      setNewAssignee('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="admin-panel">
      <h2>👥 Управление исполнителями</h2>

      <div className="assignee-management">
        <div className="add-assignee">
          <input
            type="text"
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите имя нового исполнителя"
            className="assignee-input"
          />
          <button onClick={handleAdd} className="add-btn">
            ➕ Добавить
          </button>
        </div>

        <div className="assignee-list">
          <h3>Список исполнителей ({assignees.length})</h3>

          {assignees.length === 0 ? (
            <p className="no-assignees">Нет исполнителей</p>
          ) : (
            <ul>
              {assignees.map(assignee => (
                <li key={assignee} className="assignee-item">
                  <span className="assignee-name">{assignee}</span>
                  <button 
                    onClick={() => onRemove(assignee)} 
                    className="remove-assignee-btn"
                    title="Удалить исполнителя"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssigneeManagement;