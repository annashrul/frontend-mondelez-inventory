import { useCallback } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { emptyPagination, getList, getPagination } from '@/services/api';

export function useListResourceData({
  queryKey,
  params,
  lastResponse,
  hasLoadedOnce,
  loadingSource,
  listFn,
  onSuccessResponse,
}) {
  const query = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => listFn(params),
    placeholderData: keepPreviousData,
  });
  const displayResponse = query.data || lastResponse;
  const data = getList(displayResponse);
  const pagination = getPagination(displayResponse) || emptyPagination;
  const loading = query.isPending && !hasLoadedOnce;
  const backgroundFetching = hasLoadedOnce && query.isFetching;
  const setSuccessResponse = useCallback(() => {
    if (query.data && !query.isPlaceholderData) onSuccessResponse?.(query.data);
  }, [onSuccessResponse, query.data, query.isPlaceholderData]);

  return {
    query,
    data,
    pagination,
    loading,
    searchLoading: hasLoadedOnce && (params?.searchDebouncing || (backgroundFetching && loadingSource?.type === 'search')),
    pageLoadingDirection: backgroundFetching && loadingSource?.type === 'page' ? loadingSource.direction : null,
    limitLoading: backgroundFetching && loadingSource?.type === 'limit',
    setSuccessResponse,
  };
}
