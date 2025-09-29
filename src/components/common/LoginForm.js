import React, { useState } from "react";
import "./LoginForm.css";

const LoginForm = ({ onLogin, onAdminLogin }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
  });
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      return;
    }

    if (isAdminLogin) {
      if (formData.password !== "admin123") {
        return;
      }
      onAdminLogin(formData);
    } else {
      onLogin(formData);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>🔐 Авторизация</h1>

        {!isAdminLogin ? (
          <>
            <div className="form-group">
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                placeholder="Имя"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                placeholder="Фамилия"
              />
            </div>
            <button type="submit" className="login-button">
              Войти
            </button>
            <button
              type="button"
              onClick={() => setIsAdminLogin(true)}
              className="admin-login-button"
            >
              Войти как администратор
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Пароль администратора"
                required
              />
            </div>
            <button type="submit" className="login-button">
              Войти как админ
            </button>
            <button
              type="button"
              onClick={() => setIsAdminLogin(false)}
              className="cancel-button"
            >
              Отмена
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
