import React from 'react';
import './NotificationCenter.css';

const NotificationCenter = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-center">
      <div className="notification-center-header">
        <h3>Уведомления ({notifications.length})</h3>
        <button onClick={() => notifications.forEach(n => onRemove(n.id))}>
          Очистить все
        </button>
      </div>

      <div className="notification-list">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item ${notification.type}`}
          >
            <div className="notification-content">
              <span className="notification-message">{notification.message}</span>
              <button
                onClick={() => onRemove(notification.id)}
                className="notification-close"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;