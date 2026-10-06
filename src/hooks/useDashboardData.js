import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getDashboardStats } from '@/services/dashboardService';
import { useDashboardStore } from '@/stores/dashboardStore';

const dashboardQueryKey = ['dashboard-stats'];

export function useDashboardData() {
  const lastResponse = useDashboardStore((state) => state.lastResponse);
  const hasLoadedOnce = useDashboardStore((state) => state.hasLoadedOnce);
  const setQueryResponse = useDashboardStore((state) => state.setQueryResponse);

  const query = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: getDashboardStats,
    // Data dashboard tidak perlu refetch agresif; cukup saat mount/invalidasi.
    staleTime: 30_000,
  });

  // Response yang sedang ditampilkan: data baru, atau fallback data terakhir
  // yang tersimpan di store agar tidak kedip saat navigasi kembali.
  const displayResponse = query.data || lastResponse;
  const loading = query.isPending && !hasLoadedOnce;

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
