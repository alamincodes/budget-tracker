import { useQuery } from '@tanstack/react-query';

interface DashboardFilters {
  from?: string;
  to?: string;
}

/** Year to show in Year Overview (e.g. from "Specific year" filter). Defaults to current year. */
export interface UseDashboardOptions {
  filters: DashboardFilters;
  year?: number;
}

const currentYear = () => new Date().getFullYear();

export function useDashboard(options: UseDashboardOptions | DashboardFilters) {
  const filters = 'filters' in options ? options.filters : options;
  const year = 'year' in options ? (options.year ?? currentYear()) : currentYear();

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['dashboard', 'summary', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      const res = await fetch(`/api/summary?${params.toString()}`);
      return res.json();
    },
  });

  const { data: yearOverview, isLoading: isYearLoading } = useQuery({
    queryKey: ['year-overview', year],
    queryFn: async () => {
      const res = await fetch(`/api/summary/year?year=${year}`);
      return res.json();
    },
  });

  const { data: categorySummary, isLoading: isCategoryLoading } = useQuery({
    queryKey: ['dashboard', 'category', filters],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (filters.from) params.append('from', filters.from);
        if (filters.to) params.append('to', filters.to);
        const res = await fetch(`/api/summary/category?${params.toString()}`);
        return res.json();
    }
  });

  return {
    summary,
    yearOverview,
    categorySummary,
    isLoading: isSummaryLoading || isYearLoading || isCategoryLoading,
  };
}
