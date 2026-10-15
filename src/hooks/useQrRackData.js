import { useQuery } from '@tanstack/react-query';
import { getQrRacks } from '@/services/qrRackService';

export function useQrRackData(userId) {
  const query = useQuery({
    queryKey: ['rak', 'qr-print', userId],
    queryFn: getQrRacks,
  });
  return { query, racks: query.data || [], loading: query.isPending };
}
