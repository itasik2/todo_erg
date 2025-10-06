import React, { useEffect, useRef } from 'react';
import { useForm } from '../../hooks/useForm';
import { validationRules } from '../../utils/validation';
import './TaskModal.css';

const initialFormState = {
  foreman: '',
  lab: '',
  roomNumber: '',
  description: '',
  department: 'general', // Теперь это обязательное поле вместо assignee
  priority: 'medium'
};

const TaskModal = ({ show, onClose, onSubmit }) => { // Убрали assignees из пропсов
  const {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    resetForm,
    clearError,
  } = useForm(initialFormState, validationRules);

  const formRef = useRef(null);
  const firstInputRef = useRef(null);

  // Фокус на первое поле при открытии
  useEffect(() => {
    if (show && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current.focus();
      }, 100);
    }
  }, [show]);

  // Сброс формы при закрытии
  useEffect(() => {
    if (!show) {
      setTimeout(resetForm, 300);
    }
  }, [show, resetForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
    clearError(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 Начало отправки формы...');

    // Простая валидация
    const requiredFields = ['foreman', 'lab', 'roomNumber', 'description', 'department'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      console.log('❌ Не заполнены поля:', missingFields);
      return;
    }

    console.log('✅ Форма валидна, отправляем...', formData);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      console.log('🎉 Заявка успешно отправлена!');
      onClose();
    } catch (error) {
      console.error('❌ Ошибка отправки:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? 'form-input error' : 'form-input';
  };

  // Упрощенная проверка активности кнопки
  const isSubmitDisabled = isSubmitting || 
    !formData.foreman?.trim() || 
    !formData.lab?.trim() || 
    !formData.roomNumber?.trim() || 
    !formData.description?.trim() ||
    !formData.department?.trim();

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <form 
        ref={formRef}
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-header">
          <h2>📝 Новая заявка</h2>
          <button 
            type="button"
            className="close-button" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="required">Ф.И.О. Бригадира</label>
              <input
                ref={firstInputRef}
                type="text"
                name="foreman"
                value={formData.foreman}
                onChange={handleInputChange}
                onBlur={() => handleBlur('foreman')}
                placeholder="Иванов Иван Иванович"
                className={getFieldClassName('foreman')}
                disabled={isSubmitting}
              />
              {errors.foreman && (
                <div className="error-message">• {errors.foreman[0]}</div>
              )}
            </div>

            <div className="form-group">
              <label className="required">Лаборатория</label>
              <input
                type="text"
                name="lab"
                value={formData.lab}
                onChange={handleInputChange}
                onBlur={() => handleBlur('lab')}
                placeholder="Название лаборатории"
                className={getFieldClassName('lab')}
                disabled={isSubmitting}
              />
              {errors.lab && (
                <div className="error-message">• {errors.lab[0]}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="required">Номер кабинета</label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                onBlur={() => handleBlur('roomNumber')}
                placeholder="123"
                className={getFieldClassName('roomNumber')}
                disabled={isSubmitting}
              />
              {errors.roomNumber && (
                <div className="error-message">• {errors.roomNumber[0]}</div>
              )}
            </div>

            <div className="form-group">
              <label>Приоритет</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-input"
                disabled={isSubmitting}
              >
                <option value="low">🟢 Низкий</option>
                <option value="medium">🟡 Средний</option>
                <option value="high">🔴 Высокий</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="required">Подразделение</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="form-input"
                disabled={isSubmitting}
                required
              >
                <option value="general">🏢 Общие задания</option>
                <option value="plumber">🔧 Сантехник</option>
                <option value="electrician">⚡ Электрик</option>
                <option value="adjustment">🛠️ Наладка оборудования</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="required">Описание проблемы</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={() => handleBlur('description')}
              placeholder="Подробное описание проблемы или задачи..."
              rows="4"
              className={getFieldClassName('description')}
              disabled={isSubmitting}
            />
            {errors.description && (
              <div className="error-message">• {errors.description[0]}</div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="form-requirements">
            <span className="required-marker">*</span> Обязательные поля
          </div>

          <div className="modal-actions">
            <button 
              type="button"
              onClick={handleClose} 
              className="cancel-button"
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button 
              type="submit"
              className={`submit-button ${isSubmitDisabled ? 'disabled' : ''}`}
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? 'Создание...' : '✅ Создать заявку'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskModal;
