import { useMemo } from 'react';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { emptyPagination, getList, getPagination } from '@/services/api';
import { logActivityService } from '@/services/logActivityService';

export function useLogActivityData({ search, limit, userId, searchDebouncing = false }) {
  const query = useInfiniteQuery({
    queryKey: ['log-activity', { search, limit, userId }],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => logActivityService.list({ search, page: pageParam, limit }, signal),
    getNextPageParam: lastPage => {
      const pagination = getPagination(lastPage);
      return pagination.has_next ? pagination.page + 1 : undefined;
    },
    placeholderData: keepPreviousData,
  });
  const logs = useMemo(() => {
    const seen = new Set();
    return (query.data?.pages || []).flatMap(getList).filter(log => {
      if (seen.has(log.id)) return false;
      seen.add(log.id);
      return true;
    });
  }, [query.data]);
  const pagination = query.data?.pages?.length ? getPagination(query.data.pages.at(-1)) : emptyPagination;
  return {
    query, logs, pagination,
    loading: query.isPending,
    loadingMore: query.isFetchingNextPage,
    hasNext: Boolean(query.hasNextPage && !query.isPlaceholderData),
    searchLoading: searchDebouncing || (query.isFetching && (query.isPending || query.isPlaceholderData)),
    loadMore: () => query.fetchNextPage({ cancelRefetch: false }),
  };
}
