import { useState, useCallback } from 'react';
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
        [name]: fieldErrors || null
      }));
    }
  }, [touched, validationRules]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    const fieldErrors = validateField(name, formData[name], validationRules);
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors || null
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
    hasErrors: Object.keys(errors).length > 0
  };
};