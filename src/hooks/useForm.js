import { useState, useCallback, useMemo } from 'react';
import { validateField, validateForm } from '../utils/validation';

export const useForm = (initialState, validationRules) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      const fieldErrors = validateField(name, value, validationRules);
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors
      }));
    }
  }, [touched, validationRules]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    const fieldErrors = validateField(name, formData[name], validationRules);
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors
    }));
  }, [formData, validationRules]);

  const validateAll = useCallback((fieldsToValidate) => {
    const allTouched = {};
    fieldsToValidate.forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    const validation = validateForm(formData, fieldsToValidate, validationRules);
    setErrors(validation.errors);

    return validation.isValid;
  }, [formData, validationRules]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialState]);

  const setError = useCallback((field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: Array.isArray(message) ? message : [message]
    }));
  }, []);

  const clearError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Исправленная функция hasErrors - проверяет только реальные ошибки
  const hasErrors = useMemo(() => {
    return Object.keys(errors).some(key => {
      const error = errors[key];
      // Проверяем, что ошибка существует и не пустая
      return error && 
             Array.isArray(error) ? error.length > 0 : Boolean(error);
    });
  }, [errors]);

  // Дополнительная функция для проверки валидности формы
  const isFormValid = useCallback((requiredFields = []) => {
    // Проверяем, что все обязательные поля заполнены
    const requiredFieldsFilled = requiredFields.every(
      field => formData[field] && formData[field].toString().trim()
    );
    
    // Проверяем, что нет ошибок валидации
    const noValidationErrors = !hasErrors;

    return requiredFieldsFilled && noValidationErrors;
  }, [formData, hasErrors]);

  return {
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
    setFormData,
    hasErrors,
    isFormValid
  };
};