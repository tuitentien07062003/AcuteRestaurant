import { useQuery } from '@tanstack/react-query';
import { fetchMenu } from '@/api/menu';

/**
 * Custom hook to fetch menu items by category
 * Backend uses Redis cache for these items
 * @param {string} category - Menu category code
 * @returns {Object} { data: menuItems[], isLoading, error, isError }
 */
export function useMenuItems(category) {
  return useQuery({
    queryKey: ['menuItems', category],
    queryFn: () => fetchMenu(category),
    enabled: !!category, // Only run if category is provided
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
