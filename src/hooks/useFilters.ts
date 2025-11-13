import { useState } from 'react';

interface UseFiltersReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  resetFilters: () => void;
}

/**
 * Custom hook for managing common filter state
 * @returns Filter state and handlers
 */
export function useFilters(): UseFiltersReturn {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    resetFilters,
  };
}
