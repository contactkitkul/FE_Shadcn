import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getEntityMessages } from '@/config/messages';

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

interface UseFetchDataOptions {
  entityName: string;
  initialSort?: string;
  initialSortOrder?: 'asc' | 'desc';
  autoFetch?: boolean;
}

interface UseFetchDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching paginated data
 * @param fetchFn - Function that fetches data from API
 * @param options - Configuration options
 * @returns Data, loading state, error, and refetch function
 */
export function useFetchData<T>(
  fetchFn: (params: PaginationParams) => Promise<any>,
  options: UseFetchDataOptions
): UseFetchDataReturn<T> {
  const {
    entityName,
    initialSort = 'createdAt',
    initialSortOrder = 'desc',
    autoFetch = true,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messages = getEntityMessages(entityName);

  const fetchData = useCallback(async (params: PaginationParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFn({
        page: 1,
        limit: 100,
        sortBy: initialSort,
        sortOrder: initialSortOrder,
        ...params,
      });

      if (response.success) {
        setData(response.data.data || []);
      } else {
        const errorMessage = response.error || messages.loadError;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || messages.loadError;
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(`Error fetching ${entityName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, initialSort, initialSortOrder, messages, entityName]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
