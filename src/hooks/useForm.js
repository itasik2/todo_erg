import { useState, useCallback, useMemo } from 'react';

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
  }, []);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  // Упрощенная валидация
  const validateAll = useCallback((fieldsToValidate) => {
    const newErrors = {};
    
    fieldsToValidate.forEach(field => {
      const value = formData[field]?.toString().trim() || '';
      const rules = validationRules[field];
      
      if (rules?.required && !value) {
        newErrors[field] = ['Обязательное поле'];
      } else if (rules?.minLength && value.length < rules.minLength) {
        newErrors[field] = [`Минимум ${rules.minLength} символов`];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      [field]: [message]
    }));
  }, []);

  const clearError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Упрощенная проверка валидности формы
  const isFormValid = useMemo(() => {
    const requiredFields = Object.keys(validationRules).filter(
      field => validationRules[field]?.required
    );
    
    return requiredFields.every(field => {
      const value = formData[field]?.toString().trim() || '';
      return value.length > 0;
    });
  }, [formData, validationRules]);

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
    hasErrors: Object.keys(errors).length > 0,
    isFormValid
  };
};