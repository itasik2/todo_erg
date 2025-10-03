import React from 'react';
import './DepartmentTabs.css';

const DepartmentTabs = ({ activeDepartment, onDepartmentChange }) => {
  const departments = [
    { key: 'all', label: '📋 Все заявки', icon: '📋' },
    { key: 'general', label: '🏢 Общие', icon: '🏢' },
    { key: 'plumber', label: '🔧 Сантехник', icon: '🔧' },
    { key: 'electrician', label: '⚡ Электрик', icon: '⚡' },
    { key: 'adjustment', label: '🛠️ Наладка', icon: '🛠️' }
  ];

  return (
    <div className="department-tabs">
      {departments.map(dept => (
        <button
          key={dept.key}
          className={`tab ${activeDepartment === dept.key ? 'active' : ''}`}
          onClick={() => onDepartmentChange(dept.key)}
        >
          <span className="tab-icon">{dept.icon}</span>
          <span className="tab-label">{dept.label}</span>
        </button>
      ))}
    </div>
  );
};

export default DepartmentTabs;
