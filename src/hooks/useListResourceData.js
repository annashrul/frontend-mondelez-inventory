import { useCallback } from 'react';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { emptyPagination, getList, getPagination } from '@/services/api';

export function useListResourceData({
  queryKey,
  mobile = false,
  params,
  lastResponse,
  hasLoadedOnce,
  loadingSource,
  listFn,
  onSuccessResponse,
}) {
  const { page, searchDebouncing, ...filters } = params;
  const pagedQuery = useQuery({
    enabled: !mobile,
    queryKey: [queryKey, { ...filters, page }],
    queryFn: ({ signal }) => listFn({ ...filters, page }, { signal }),
    placeholderData: keepPreviousData,
  });
  const infiniteQuery = useInfiniteQuery({
    queryKey: [queryKey, 'infinite', filters],
    enabled: mobile,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => listFn({ ...filters, page: pageParam }, { signal }),
    getNextPageParam: lastPage => {
      const pagination = getPagination(lastPage);
      return pagination.has_next ? pagination.page + 1 : undefined;
    },
  });
  const query = mobile ? infiniteQuery : pagedQuery;
  const displayResponse = mobile ? infiniteQuery.data?.pages?.[0] : pagedQuery.data || lastResponse;
  const seen = new Set();
  const data = mobile ? (infiniteQuery.data?.pages || []).flatMap(getList).filter(row => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  }) : getList(displayResponse);
  const pagination = getPagination(displayResponse) || emptyPagination;
  const loading = mobile ? query.isPending : query.isPending && !hasLoadedOnce;
  const backgroundFetching = hasLoadedOnce && query.isFetching;
  const setSuccessResponse = useCallback(() => {
    if (!mobile && query.data && !query.isPlaceholderData) onSuccessResponse?.(query.data);
  }, [mobile, onSuccessResponse, query.data, query.isPlaceholderData]);

  return {
    query,
    data,
    pagination,
    loading,
    infiniteScroll: mobile ? {
      query,
      hasNext: Boolean(infiniteQuery.hasNextPage),
      loadingMore: infiniteQuery.isFetchingNextPage,
      searchDebouncing: Boolean(searchDebouncing),
    } : undefined,
    searchLoading: mobile ? searchDebouncing || (query.isFetching && query.isPending) : hasLoadedOnce && (params?.searchDebouncing || (backgroundFetching && loadingSource?.type === 'search')),
    pageLoadingDirection: backgroundFetching && loadingSource?.type === 'page' ? loadingSource.direction : null,
    limitLoading: backgroundFetching && loadingSource?.type === 'limit',
    setSuccessResponse,
  };
}
