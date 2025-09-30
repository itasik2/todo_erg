import React, { useEffect, useRef } from 'react';
import { useForm } from '../../hooks/useForm';
import { validationRules } from '../../utils/validation';
import './TaskModal.css';

const initialFormState = {
  foreman: '',
  lab: '',
  roomNumber: '',
  description: '',
  assignee: '',
  priority: 'medium'
};

const requiredFields = ['foreman', 'lab', 'roomNumber', 'description'];

const TaskModal = ({ show, onClose, onSubmit, assignees }) => {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setError,
    clearError,
    hasErrors
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

  // Проверка валидности формы
  const isFormValid = useRef(() => {
    // Проверяем, что все обязательные поля заполнены
    const requiredFieldsFilled = requiredFields.every(
      field => formData[field] && formData[field].trim()
    );
    
    // Проверяем, что нет ошибок валидации
    const noValidationErrors = !Object.keys(errors).some(
      key => key !== 'submit' && errors[key] && errors[key].length > 0
    );

    return requiredFieldsFilled && noValidationErrors;
  }).current;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация всех полей
    const isValid = validateAll(requiredFields);

    if (!isValid) {
      // Прокрутка к первой ошибке
      const firstErrorField = Object.keys(errors).find(
        key => key !== 'submit' && errors[key] && errors[key].length > 0
      );
      if (firstErrorField) {
        const errorElement = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setError('submit', error.message || 'Произошла ошибка при создании заявки');
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
    const baseClass = 'form-input';
    const hasError = errors[fieldName] && touched[fieldName];
    const isTouched = touched[fieldName];

    if (hasError) return `${baseClass} error`;
    if (isTouched && !hasError) return `${baseClass} success`;
    return baseClass;
  };

  const getCharacterCount = (fieldName, maxLength) => {
    const value = formData[fieldName] || '';
    return `${value.length}/${maxLength}`;
  };

  // Проверка активности кнопки отправки
  const isSubmitDisabled = isSubmitting || !isFormValid();

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <form 
        ref={formRef}
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
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
          {/* Сообщение об ошибке отправки */}
          {errors.submit && (
            <div className="submit-error">
              <span className="error-icon">⚠️</span>
              {errors.submit}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="foreman" className="required">
                Ф.И.О. Бригадира
              </label>
              <input
                ref={firstInputRef}
                type="text"
                id="foreman"
                name="foreman"
                value={formData.foreman}
                onChange={handleInputChange}
                onBlur={() => handleBlur('foreman')}
                placeholder="Иванов Иван Иванович"
                className={getFieldClassName('foreman')}
                disabled={isSubmitting}
                maxLength={validationRules.foreman?.maxLength || 100}
              />
              <div className="field-meta">
                <span className="char-count">
                  {getCharacterCount('foreman', validationRules.foreman?.maxLength || 100)}
                </span>
              </div>
              {errors.foreman && touched.foreman && (
                <div className="error-message">
                  {Array.isArray(errors.foreman) ? errors.foreman.map((error, index) => (
                    <div key={index} className="error-item">
                      <span className="error-dot">•</span> {error}
                    </div>
                  )) : (
                    <div className="error-item">
                      <span className="error-dot">•</span> {errors.foreman}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lab" className="required">
                Лаборатория
              </label>
              <input
                type="text"
                id="lab"
                name="lab"
                value={formData.lab}
                onChange={handleInputChange}
                onBlur={() => handleBlur('lab')}
                placeholder="Название лаборатории"
                className={getFieldClassName('lab')}
                disabled={isSubmitting}
                maxLength={validationRules.lab?.maxLength || 100}
              />
              <div className="field-meta">
                <span className="char-count">
                  {getCharacterCount('lab', validationRules.lab?.maxLength || 100)}
                </span>
              </div>
              {errors.lab && touched.lab && (
                <div className="error-message">
                  {Array.isArray(errors.lab) ? errors.lab.map((error, index) => (
                    <div key={index} className="error-item">
                      <span className="error-dot">•</span> {error}
                    </div>
                  )) : (
                    <div className="error-item">
                      <span className="error-dot">•</span> {errors.lab}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="roomNumber" className="required">
                Номер кабинета
              </label>
              <input
                type="text"
                id="roomNumber"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                onBlur={() => handleBlur('roomNumber')}
                placeholder="123"
                className={getFieldClassName('roomNumber')}
                disabled={isSubmitting}
                maxLength={validationRules.roomNumber?.maxLength || 20}
              />
              <div className="field-meta">
                <span className="char-count">
                  {getCharacterCount('roomNumber', validationRules.roomNumber?.maxLength || 20)}
                </span>
              </div>
              {errors.roomNumber && touched.roomNumber && (
                <div className="error-message">
                  {Array.isArray(errors.roomNumber) ? errors.roomNumber.map((error, index) => (
                    <div key={index} className="error-item">
                      <span className="error-dot">•</span> {error}
                    </div>
                  )) : (
                    <div className="error-item">
                      <span className="error-dot">•</span> {errors.roomNumber}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                Приоритет
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                onBlur={() => handleBlur('priority')}
                className={getFieldClassName('priority')}
                disabled={isSubmitting}
              >
                <option value="low">🟢 Низкий</option>
                <option value="medium">🟡 Средний</option>
                <option value="high">🔴 Высокий</option>
              </select>
              {errors.priority && touched.priority && (
                <div className="error-message">
                  {Array.isArray(errors.priority) ? errors.priority.map((error, index) => (
                    <div key={index} className="error-item">
                      <span className="error-dot">•</span> {error}
                    </div>
                  )) : (
                    <div className="error-item">
                      <span className="error-dot">•</span> {errors.priority}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="required">
              Описание проблемы
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={() => handleBlur('description')}
              placeholder="Подробное описание проблемы или задачи..."
              rows="4"
              className={getFieldClassName('description')}
              disabled={isSubmitting}
              maxLength={validationRules.description?.maxLength || 500}
            />
            <div className="field-meta">
              <span className="char-count">
                {getCharacterCount('description', validationRules.description?.maxLength || 500)}
              </span>
            </div>
            {errors.description && touched.description && (
              <div className="error-message">
                {Array.isArray(errors.description) ? errors.description.map((error, index) => (
                  <div key={index} className="error-item">
                    <span className="error-dot">•</span> {error}
                  </div>
                )) : (
                  <div className="error-item">
                    <span className="error-dot">•</span> {errors.description}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="assignee">
              Исполнитель
            </label>
            <select
              id="assignee"
              name="assignee"
              value={formData.assignee}
              onChange={handleInputChange}
              onBlur={() => handleBlur('assignee')}
              className={getFieldClassName('assignee')}
              disabled={isSubmitting}
            >
              <option value="">-- Не назначен --</option>
              {assignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
            {errors.assignee && touched.assignee && (
              <div className="error-message">
                {Array.isArray(errors.assignee) ? errors.assignee.map((error, index) => (
                  <div key={index} className="error-item">
                    <span className="error-dot">•</span> {error}
                  </div>
                )) : (
                  <div className="error-item">
                    <span className="error-dot">•</span> {errors.assignee}
                  </div>
                )}
              </div>
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
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Создание...
                </>
              ) : (
                '✅ Создать заявку'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskModal;