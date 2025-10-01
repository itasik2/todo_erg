// utils/validation.js
export const validationRules = {
  foreman: { required: true, minLength: 2 },
  lab: { required: true, minLength: 2 },
  roomNumber: { required: true, minLength: 1 },
  description: { required: true, minLength: 10 }
};