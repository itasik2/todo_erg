import React from 'react';
import './Header.css';

const Header = ({ user, onLogout, stats }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>📝 Система управления заявками</h1>
          <div className="stats">
            <span>Всего: {stats.total}</span>
            <span>Новые: {stats.new}</span>
            <span>В работе: {stats.inProgress}</span>
            <span>Выполнено: {stats.completed}</span>
          </div>
        </div>
        <div className="header-right">
          <span className="user-info">
            {user.firstName} {user.lastName} {user.isAdmin && "(Admin)"}
          </span>
          <button onClick={onLogout} className="logout-button">
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;