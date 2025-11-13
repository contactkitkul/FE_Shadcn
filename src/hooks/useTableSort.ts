import { useState } from 'react';

export type SortDirection = 'asc' | 'desc';

interface UseTableSortReturn {
  sortColumn: string;
  sortDirection: SortDirection;
  setSortColumn: (column: string) => void;
  setSortDirection: (direction: SortDirection) => void;
  handleSort: (column: string) => void;
}

/**
 * Custom hook for table sorting logic
 * @param initialColumn - Initial column to sort by (default: 'createdAt')
 * @param initialDirection - Initial sort direction (default: 'desc')
 * @returns Sort state and handlers
 */
export function useTableSort(
  initialColumn: string = 'createdAt',
  initialDirection: SortDirection = 'desc'
): UseTableSortReturn {
  const [sortColumn, setSortColumn] = useState<string>(initialColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return {
    sortColumn,
    sortDirection,
    setSortColumn,
    setSortDirection,
    handleSort,
  };
}
