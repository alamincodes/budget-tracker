import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ICategory } from '@/models/Category';

export function useCategories() {
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery<ICategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const createCategory = useMutation({
    mutationFn: async (newCategory: Partial<ICategory>) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (!res.ok) throw new Error('Failed to create category');
      return res.json();
    },
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previous = queryClient.getQueryData<ICategory[]>(['categories']);
      queryClient.setQueryData<ICategory[]>(['categories'], (old) => {
        const optimistic = {
          _id: `temp-${Date.now()}`,
          name: newCategory.name!,
          type: newCategory.type!,
          color: newCategory.color!,
          icon: newCategory.icon!,
          userId: previous?.[0]?.userId ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as ICategory;
        return [...(old ?? []), optimistic];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(['categories'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ICategory> & { id: string }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update category');
      return res.json();
    },
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previous = queryClient.getQueryData<ICategory[]>(['categories']);
      queryClient.setQueryData<ICategory[]>(['categories'], (old) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (old ?? []).map((c) => (String(c._id) === id ? { ...c, ...data } as any : c))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(['categories'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previous = queryClient.getQueryData<ICategory[]>(['categories']);
      queryClient.setQueryData<ICategory[]>(['categories'], (old) =>
        (old ?? []).filter((c) => String(c._id) !== id)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(['categories'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
