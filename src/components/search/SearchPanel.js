import React from 'react';
import './SearchPanel.css';

const SearchPanel = ({ 
  searchTerm, 
  onSearchChange, 
  searchFilters, 
  onFilterChange,
  onClearSearch,
  assignees,
  hasActiveSearch 
}) => {
  return (
    <div className="search-panel">
      <div className="search-section">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Поиск по всем полям..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {hasActiveSearch && (
            <button onClick={onClearSearch} className="clear-search-btn">
              ×
            </button>
          )}
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Статус:</label>
          <select
            value={searchFilters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="">Все</option>
            <option value="новая">Новая</option>
            <option value="в работе">В работе</option>
            <option value="выполнено">Выполнено</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Приоритет:</label>
          <select
            value={searchFilters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
          >
            <option value="">Все</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Исполнитель:</label>
          <select
            value={searchFilters.assignee}
            onChange={(e) => onFilterChange('assignee', e.target.value)}
          >
            <option value="">Все</option>
            {assignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>С:</label>
          <input
            type="date"
            value={searchFilters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>По:</label>
          <input
            type="date"
            value={searchFilters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;