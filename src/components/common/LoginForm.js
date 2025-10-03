import React, { useState } from "react";
import "./LoginForm.css";

const LoginForm = ({ onLogin, onAdminLogin }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
  });
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Введите имя";
    }

    if (isAdminLogin) {
      if (!formData.password) {
        newErrors.password = "Введите пароль";
      } else if (formData.password !== "admin123") {
        newErrors.password = "Неверный пароль администратора";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isAdminLogin) {
        await onAdminLogin(formData);
      } else {
        await onLogin(formData);
      }
    } catch (error) {
      setErrors({ submit: error.message || "Ошибка при входе в систему" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: "" }));
    }
  };

  const switchToAdmin = () => {
    setIsAdminLogin(true);
    setErrors({});
    setFormData(prev => ({ ...prev, password: "" }));
  };

  const switchToUser = () => {
    setIsAdminLogin(false);
    setErrors({});
    setFormData(prev => ({ ...prev, password: "" }));
  };

  // Проверяем возможность отправки формы
  //const canSubmit = isAdminLogin 
   // ? formData.password.trim() && !isSubmitting
    //: formData.firstName.trim() && !isSubmitting;

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>🔐 Авторизация</h1>
        
        {/* Общие ошибки */}
        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isAdminLogin ? (
            <>
              <div className="form-group">
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Имя"
                  className={errors.firstName ? 'error' : ''}
                  disabled={isSubmitting}
                  autoFocus
                />
                {errors.firstName && (
                  <div className="field-error">{errors.firstName}</div>
                )}
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Фамилия (необязательно)"
                  disabled={isSubmitting}
                />
              </div>
              
              <button 
                type="submit" 
                className="login-button" 
                disabled={
                  isAdminLogin 
                    ? !formData.password.trim() || isSubmitting
                    : !formData.firstName.trim() || isSubmitting
                }
              >
                {isSubmitting ? 'Вход...' : 'Войти'}
              </button>
              
              <button 
                type="button"
                onClick={switchToAdmin}
                className="admin-login-button"
                disabled={isSubmitting}
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
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Пароль администратора"
                  className={errors.password ? 'error' : ''}
                  disabled={isSubmitting}
                  autoFocus
                />
                {errors.password && (
                  <div className="field-error">{errors.password}</div>
                )}
              </div>
              
              <button 
                type="submit" 
                className="login-button" 
                disabled={!formData.password.trim() || isSubmitting}
              >
                {isSubmitting ? 'Вход...' : 'Войти как админ'}
              </button>
              
              <button 
                type="button"
                onClick={switchToUser}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Отмена
              </button>

              {/* Подсказка для тестирования */}
              <div className="admin-hint">
                Подсказка: пароль - <strong>admin123</strong>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
