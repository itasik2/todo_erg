import React from 'react';
import './Notification.css';

const Notification = ({ show, message, type = 'success' }) => {
  if (!show) return null;

  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
};

export default Notification;