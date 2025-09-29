import React from 'react';
import './TimeInputModal.css';

const TimeInputModal = ({ 
  show, 
  onClose, 
  hours, 
  minutes, 
  onHoursChange, 
  onMinutesChange, 
  onSave, 
  error 
}) => {
  if (!show) return null;

  const handleSave = () => {
    onSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content time-modal" onClick={(e) => e.stopPropagation()}>
        <h3>⏱️ Введите время выполнения</h3>

        {error && (
          <div className="error-message time-error">
            {error}
          </div>
        )}

        <div className="time-inputs">
          <div className="time-input-group">
            <label>Часы:</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={hours}
              onChange={(e) => onHoursChange(parseInt(e.target.value) || 0)}
              className="time-input"
            />
          </div>

          <div className="time-input-group">
            <label>Минуты:</label>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => onMinutesChange(parseInt(e.target.value) || 0)}
              className="time-input"
            />
          </div>
        </div>

        <div className="time-preview">
          <span>Общее время: {hours}ч {minutes}м</span>
        </div>

        <div className="modal-buttons">
          <button onClick={onClose} className="cancel-button">
            Отмена
          </button>
          <button onClick={handleSave} className="save-btn">
            💾 Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeInputModal;