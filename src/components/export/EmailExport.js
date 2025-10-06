import React, { useState } from 'react';
import './EmailExport.css';

const EmailExport = ({ tasks, onExport }) => {
  const [email, setEmail] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Введите email адрес');
      return;
    }

    setIsSending(true);
    try {
      await onExport(email, period);
      alert('Отчет отправлен на email!');
      setEmail('');
    } catch (error) {
      alert('Ошибка при отправке отчета: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickExport = async () => {
    if (!email.trim()) {
      alert('Введите email адрес');
      return;
    }

    setIsSending(true);
    try {
      await onExport(email, 'manual');
      alert('Отчет отправлен на email!');
    } catch (error) {
      alert('Ошибка при отправке отчета: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="email-export">
      <h3>📧 Экспорт отчета на email</h3>
      
      <form onSubmit={handleSubmit} className="email-form">
        <div className="form-group">
          <label>Email адрес:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Период отправки:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="manual">Ручная отправка</option>
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
            <option value="monthly">Ежемесячно</option>
          </select>
        </div>

        <div className="export-actions">
          <button 
            type="button" 
            onClick={handleQuickExport}
            disabled={isSending || !email.trim()}
            className="quick-export-btn"
          >
            {isSending ? 'Отправка...' : '📧 Быстрая отправка'}
          </button>
          
          <button 
            type="submit"
            disabled={isSending || !email.trim() || period === 'manual'}
            className="schedule-export-btn"
          >
            {isSending ? 'Настройка...' : '⏰ Настроить расписание'}
          </button>
        </div>
      </form>

      <div className="export-info">
        <h4>Статистика для отправки:</h4>
        <ul>
          <li>Всего заявок: <strong>{tasks.length}</strong></li>
          <li>Новые: <strong>{tasks.filter(t => t.status === 'новая').length}</strong></li>
          <li>В работе: <strong>{tasks.filter(t => t.status === 'в работе').length}</strong></li>
          <li>Выполнено: <strong>{tasks.filter(t => t.status === 'выполнено').length}</strong></li>
        </ul>
        
        <div className="department-stats">
          <h5>По подразделениям:</h5>
          <ul>
            <li>🏢 Общие: <strong>{tasks.filter(t => t.department === 'general').length}</strong></li>
            <li>🔧 Сантехник: <strong>{tasks.filter(t => t.department === 'plumber').length}</strong></li>
            <li>⚡ Электрик: <strong>{tasks.filter(t => t.department === 'electrician').length}</strong></li>
            <li>🛠️ Наладка: <strong>{tasks.filter(t => t.department === 'adjustment').length}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailExport;
