import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IPlannedItem } from '@/models/PlannedItem';
import { ICategory } from '@/models/Category';

export interface PlannedItemWithCategory extends Omit<IPlannedItem, 'categoryId'> {
  categoryId: ICategory;
}

export function usePlannedItems(year: number, month: number) {
  const queryClient = useQueryClient();
  const queryKey = ['planned-items', year, month];

  const { data: items = [], isLoading } = useQuery<PlannedItemWithCategory[]>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ year: String(year), month: String(month) });
      const res = await fetch(`/api/planned-items?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch planned items');
      return res.json();
    },
    enabled: !isNaN(year) && !isNaN(month),
  });

  const createItem = useMutation({
    mutationFn: async (body: {
      year: number;
      month: number;
      title: string;
      type: 'income' | 'expense';
      amount: number;
      categoryId: string;
      note?: string;
    }) => {
      const res = await fetch('/api/planned-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create planned item');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const markDone = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/planned-items/${id}/done`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to mark as done');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['month', year, month] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['year-overview'] });
    },
  });

  const undo = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/planned-items/${id}/undo`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to undo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['month', year, month] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['year-overview'] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/planned-items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    items,
    isLoading,
    createItem,
    markDone,
    undo,
    deleteItem,
  };
}
