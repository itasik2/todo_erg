// Убрали ненужные escape-символы
export const validationRules = {
  foreman: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[а-яА-ЯёЁa-zA-Z\s\-\.]+$/, // Убрали \
    message: 'ФИО должно содержать только буквы, пробелы, точки и дефисы',
    validate: (value) => {
      const words = value.trim().split(/\s+/);
      if (words.length < 2) {
        return 'Введите имя и фамилию';
      }
      return null;
    }
  },
  lab: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[а-яА-ЯёЁa-zA-Z0-9\s\-\(\)]+$/, // Убрали \
    message: 'Название лаборатории может содержать буквы, цифры, пробелы, дефисы и скобки'
  },
  roomNumber: {
    required: true,
    minLength: 1,
    maxLength: 10,
    pattern: /^[0-9а-яА-Яa-zA-Z\-/]+$/, // Убрали \
    message: 'Номер кабинета может содержать цифры, буквы, дефисы и слэши'
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 1000,
    message: 'Описание должно быть от 10 до 1000 символов',
    validate: (value) => {
      if (value.trim().length < 10) {
        return 'Описание слишком короткое. Минимум 10 символов';
      }
      if (value.trim().length > 1000) {
        return 'Описание слишком длинное. Максимум 1000 символов';
      }
      return null;
    }
  },
  assignee: {
    maxLength: 100,
    pattern: /^[а-яА-ЯёЁa-zA-Z\s\-]+$/, // Убрали \
    message: 'Имя исполнителя должно содержать только буквы, пробелы и дефисы'
  },
  priority: {
    required: true,
    allowedValues: ['low', 'medium', 'high']
  }
};

export const validateField = (name, value, rules = validationRules) => {
  const fieldRules = rules[name];
  if (!fieldRules) return null;

  const errors = [];

  if (fieldRules.required && (!value || value.toString().trim() === '')) {
    errors.push('Это поле обязательно для заполнения');
    return errors;
  }

  if (!value || value.toString().trim() === '') {
    return null;
  }

  const stringValue = value.toString().trim();

  if (fieldRules.minLength && stringValue.length < fieldRules.minLength) {
    errors.push(`Минимальная длина: ${fieldRules.minLength} символов`);
  }

  if (fieldRules.maxLength && stringValue.length > fieldRules.maxLength) {
    errors.push(`Максимальная длина: ${fieldRules.maxLength} символов`);
  }

  if (fieldRules.pattern && !fieldRules.pattern.test(stringValue)) {
    errors.push(fieldRules.message);
  }

  if (fieldRules.allowedValues && !fieldRules.allowedValues.includes(stringValue)) {
    errors.push('Недопустимое значение');
  }

  if (fieldRules.validate) {
    const customError = fieldRules.validate(stringValue);
    if (customError) {
      errors.push(customError);
    }
  }

  return errors.length > 0 ? errors : null;
};

export const validateForm = (formData, fieldsToValidate) => {
  const errors = {};
  let isValid = true;

  fieldsToValidate.forEach(field => {
    const fieldErrors = validateField(field, formData[field]);
    if (fieldErrors) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

export const validateTime = (hours, minutes) => {
  const errors = [];

  if (hours < 0 || hours > 1000) {
    errors.push('Часы должны быть от 0 до 1000');
  }

  if (minutes < 0 || minutes > 59) {
    errors.push('Минуты должны быть от 0 до 59');
  }

  if (hours === 0 && minutes === 0) {
    errors.push('Время выполнения не может быть нулевым');
  }

  return errors;
};

export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] ? errors[fieldName][0] : null;
};

export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

export const clearFieldError = (errors, fieldName) => {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};