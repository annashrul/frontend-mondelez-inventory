import { getPagination } from '@/services/api';
import { createCrudService } from '@/services/crudService';

const service = createCrudService('pengambilan');

export async function refreshWithdrawalHistory(client, { mobile, limit, userId }, list = service.list) {
  const queryKey = ['pengambilan-history'];
  await client.cancelQueries({ queryKey });
  await client.invalidateQueries({ queryKey, refetchType: 'none' });
  const filters = { search: '', limit, userId };
  if (mobile) {
    return client.fetchInfiniteQuery({
      queryKey: [...queryKey, 'infinite', filters],
      initialPageParam: 1,
      queryFn: ({ pageParam, signal }) => list({ search: '', page: pageParam, limit }, { signal }),
      getNextPageParam: lastPage => {
        const pagination = getPagination(lastPage);
        return pagination.has_next ? pagination.page + 1 : undefined;
      },
      staleTime: 0,
    });
  }
  return client.fetchQuery({
    queryKey: [...queryKey, { ...filters, page: 1 }],
    queryFn: ({ signal }) => list({ search: '', page: 1, limit }, { signal }),
    staleTime: 0,
  });
}
