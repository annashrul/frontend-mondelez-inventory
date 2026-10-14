import { useCallback, useEffect } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { getDashboardStats } from '@/services/dashboardService';
import { subscribeDashboardRefresh } from '@/lib/dashboardRealtime';
import { useDashboardStore } from '@/stores/dashboardStore';

const dashboardQueryKey = ['dashboard-stats'];

export function useDashboardData(days = 30) {
  const queryClient = useQueryClient();
  const lastResponse = useDashboardStore((state) => state.lastResponse);
  const setQueryResponse = useDashboardStore((state) => state.setQueryResponse);

  const query = useQuery({
    queryKey: [...dashboardQueryKey, { days }],
    queryFn: ({ signal }) => getDashboardStats({ days }, { signal }),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => subscribeDashboardRefresh(window, () => {
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
  }), [queryClient]);

  // Response yang sedang ditampilkan: data baru, atau fallback data terakhir
  // yang tersimpan di store agar tidak kedip saat navigasi kembali.
  const displayResponse = query.data || (lastResponse?.analytics?.days === days ? lastResponse : null);
  const loading = query.isPending && !displayResponse;

  // Sama seperti pola master barang: simpan response sukses ke store,
  // dan tampilkan error via toast lewat useEffect.
  const setSuccessResponse = useCallback(() => {
    if (query.data && !query.isPlaceholderData) setQueryResponse(query.data);
  }, [setQueryResponse, query.data, query.isPlaceholderData]);

  useEffect(() => {
    setSuccessResponse();
  }, [setSuccessResponse]);

  useEffect(() => {
    if (query.error) toast.error(query.error.message || 'Gagal memuat dashboard');
  }, [query.error]);

  return {
    query,
    stats: displayResponse,
    loading,
  };
}
