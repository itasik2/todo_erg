import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ onLogin, onAdminLogin }) => {
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim()) {
      alert('Введите имя');
      return;
    }

    if (isAdminLogin && !formData.password) {
      alert('Введите пароль администратора');
      return;
    }

    // Простая проверка пароля администратора
    if (isAdminLogin) {
      if (formData.password === 'admin123') { // Стандартный пароль
        onAdminLogin(formData);
      } else {
        alert('Неверный пароль администратора');
        return;
      }
    } else {
      onLogin(formData);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Вход в систему</h2>
        
        <div className="login-toggle">
          <button
            type="button"
            className={!isAdminLogin ? 'active' : ''}
            onClick={() => setIsAdminLogin(false)}
          >
            Обычный пользователь
          </button>
          <button
            type="button"
            className={isAdminLogin ? 'active' : ''}
            onClick={() => setIsAdminLogin(true)}
          >
            Администратор
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Введите ваше имя"
              required
            />
          </div>

          <div className="form-group">
            <label>Фамилия</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Введите вашу фамилию"
            />
          </div>

          {isAdminLogin && (
            <div className="form-group">
              <label>Пароль администратора *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                required
              />
              <small className="password-hint">
                Стандартный пароль: admin123
              </small>
            </div>
          )}

          <button type="submit" className="login-button">
            {isAdminLogin ? 'Войти как администратор' : 'Войти'}
          </button>
        </form>

        {isAdminLogin && (
          <div className="admin-info">
            <p><strong>Для тестирования:</strong></p>
            <p>Пароль: <code>admin123</code></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
