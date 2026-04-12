import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBillOrders, updateOrderStatus } from '@/api/billOrders';

/**
 * Custom hook to fetch bill orders
 * Auto-refetches every 5 seconds for real-time updates on Kitchen Screen
 * @param {number} refetchInterval - Milliseconds between refetches (default: 5000ms for hot data)
 * @returns {Object} { data: billOrders[], isLoading, error, isError, refetch }
 */
export function useBillOrders(refetchInterval = 5000) {
  return useQuery({
    queryKey: ['billOrders'],
    queryFn: () => fetchBillOrders(),
    staleTime: 0, // Always consider stale (for kitchen, we want fresh data)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval, // Auto-refetch every 5 seconds by default
  });
}

/**
 * Hook to update bill order status
 * Automatically invalidates billOrders query on success
 * @returns {Object} { mutate, isPending, error }
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billId, status }) => updateOrderStatus(billId, status),
    onSuccess: () => {
      // Invalidate and refetch bill orders
      queryClient.invalidateQueries({ queryKey: ['billOrders'] });
    },
    onError: (error) => {
      console.error('[useUpdateOrderStatus] Error:', error);
    },
  });
}
