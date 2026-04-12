import { useQuery } from '@tanstack/react-query';
import { fetchMenuCategories } from '@/api/menuCategories';

/**
 * Custom hook to fetch and cache menu categories
 * Data is cached with React Query and refetched when stale
 * @returns {Object} { data: categories[], isLoading, error, isError }
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchMenuCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes - menu categories rarely change
    gcTime: 60 * 60 * 1000, // 1 hour (cache time in memory)
  });
}
