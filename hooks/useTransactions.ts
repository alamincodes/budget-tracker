import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ITransaction } from '@/models/Transaction';
import { ICategory } from '@/models/Category';

export interface TransactionWithCategory extends Omit<ITransaction, 'categoryId'> {
  categoryId: ICategory;
}

interface TransactionFilters {
  from?: string;
  to?: string;
  type?: string;
  categoryId?: string;
}

export function useTransactions(filters: TransactionFilters) {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading, error } = useQuery<TransactionWithCategory[]>({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.type) params.append('type', filters.type);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return res.json();
    },
  });

  const createTransaction = useMutation({
    mutationFn: async (newTransaction: Partial<ITransaction>) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });
      if (!res.ok) {
        throw new Error('Failed to create transaction');
      }
      return res.json();
    },
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', filters] });

      const previousTransactions = queryClient.getQueryData<TransactionWithCategory[]>(['transactions', filters]);

      // We can try to find the category in the cache if we want to be fancy,
      // but for now, we will just rely on invalidation for the list view to be correct.
      // Or we can mock it if we know the category details.
      
      // If we don't update the cache optimistically, the UI won't feel instant.
      // But adding an incomplete object might break the UI.
      
      // Let's try to find category from 'categories' query cache if possible.
      const categories = queryClient.getQueryData<ICategory[]>(['categories']);
      const category = categories?.find(c => String(c._id) === String(newTransaction.categoryId));

      if (category) {
         queryClient.setQueryData<TransactionWithCategory[]>(['transactions', filters], (old) => {
            const optimisticTransaction: any = {
              ...newTransaction,
              _id: Math.random().toString(),
              categoryId: category,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            return [optimisticTransaction, ...(old || [])];
         });
      }

      return { previousTransactions };
    },
    onError: (err, newTransaction, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions', filters], context.previousTransactions);
      }
    },
    onSuccess: (data: { date?: string | Date }) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['year-overview'] });
      if (data?.date) {
        const d = new Date(data.date);
        if (!isNaN(d.getTime())) {
          queryClient.invalidateQueries({
            queryKey: ['month', d.getFullYear(), d.getMonth() + 1],
          });
        }
      }
    },
  });

  return {
    transactions,
    isLoading,
    error,
    createTransaction,
  };
}
