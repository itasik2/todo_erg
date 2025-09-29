import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Показано {startItem}-{endItem} из {totalItems} заявок
      </div>

      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ««
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          «
        </button>

        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          »
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          »»
        </button>
      </div>

      <div className="pagination-size">
        <select 
          onChange={(e) => onPageChange(1, parseInt(e.target.value))}
          className="page-size-select"
        >
          <option value="10">10 на странице</option>
          <option value="25">25 на странице</option>
          <option value="50">50 на странице</option>
          <option value="100">100 на странице</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;