import { useState, useMemo, useCallback } from 'react';

export const useSearch = (items, searchableFields) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    dateFrom: '',
    dateTo: ''
  });

  const searchItems = useMemo(() => {
    if (!searchTerm && Object.values(searchFilters).every(filter => !filter)) {
      return items;
    }

    return items.filter(item => {
      // Поиск по тексту
      const matchesText = !searchTerm || searchableFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });

      // Фильтрация по статусу
      const matchesStatus = !searchFilters.status || item.status === searchFilters.status;

      // Фильтрация по приоритету
      const matchesPriority = !searchFilters.priority || item.priority === searchFilters.priority;

      // Фильтрация по исполнителю
      const matchesAssignee = !searchFilters.assignee || item.assignee === searchFilters.assignee;

      // Фильтрация по дате
      const matchesDateFrom = !searchFilters.dateFrom || 
        new Date(item.createdAt) >= new Date(searchFilters.dateFrom);

      const matchesDateTo = !searchFilters.dateTo || 
        new Date(item.createdAt) <= new Date(searchFilters.dateTo + 'T23:59:59');

      return matchesText && matchesStatus && matchesPriority && 
             matchesAssignee && matchesDateFrom && matchesDateTo;
    });
  }, [items, searchTerm, searchFilters, searchableFields]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchFilters({
      status: '',
      priority: '',
      assignee: '',
      dateFrom: '',
      dateTo: ''
    });
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchFilters,
    setSearchFilters,
    searchResults: searchItems,
    clearSearch,
    hasActiveSearch: !!searchTerm || Object.values(searchFilters).some(filter => !!filter)
  };
};