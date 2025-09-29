import React, { useState } from 'react';
import { exportToExcel, exportToPDF, exportToCSV } from '../../utils/exportUtils';
import './ExportButton.css';

const ExportButton = ({ tasks, disabled = false }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = (format) => {
    switch (format) {
      case 'excel':
        exportToExcel(tasks);
        break;
      case 'pdf':
        exportToPDF(tasks);
        break;
      case 'csv':
        exportToCSV(tasks);
        break;
      default:
        break;
    }
    setShowMenu(false);
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="export-container">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled}
        className="export-button"
      >
        📊 Экспорт
      </button>

      {showMenu && (
        <div className="export-menu">
          <button onClick={() => handleExport('excel')}>📈 Excel</button>
          <button onClick={() => handleExport('pdf')}>📄 PDF</button>
          <button onClick={() => handleExport('csv')}>📝 CSV</button>
        </div>
      )}

      {showMenu && (
        <div 
          className="export-overlay"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;