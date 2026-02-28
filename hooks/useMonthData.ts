import { startOfDay, endOfDay } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TransactionWithCategory } from './useTransactions';

export function useMonthData(year: number, month: number) {
  const queryClient = useQueryClient();
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0); // last day of month
  const startDate = startOfDay(firstDay);
  const endDate = endOfDay(lastDay); // include full last day (23:59:59.999)

  const from = startDate.toISOString();
  const to = endDate.toISOString();

  const queryKey = ['month', year, month];

  const { data: transactions, isLoading } = useQuery<TransactionWithCategory[]>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('from', from);
      params.append('to', to);
      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch month data');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const prefetchMonth = async (prefetchYear: number, prefetchMonth: number) => {
    const pFirst = new Date(prefetchYear, prefetchMonth - 1, 1);
    const pLast = new Date(prefetchYear, prefetchMonth, 0);
    const pFrom = startOfDay(pFirst).toISOString();
    const pTo = endOfDay(pLast).toISOString();
    
    await queryClient.prefetchQuery({
      queryKey: ['month', prefetchYear, prefetchMonth],
      queryFn: async () => {
        const params = new URLSearchParams();
        params.append('from', pFrom);
        params.append('to', pTo);
        const res = await fetch(`/api/transactions?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch month data');
        return res.json();
      },
    });
  };

  return {
    transactions,
    isLoading,
    prefetchMonth,
  };
}
