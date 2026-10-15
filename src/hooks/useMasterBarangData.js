import { useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { emptyPagination, getList, getPagination } from '@/services/api';
import { createBarang, deleteBarang, getBarangList, updateBarang } from '@/services/barangService';

const barangQueryKey = ['barang'];

function buildBarangPayload(form, imageFile) {
  if (!imageFile) return form;

  const payload = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (!['image_path', 'image_url', 'embedding_model', 'has_embedding', 'created_at', 'updated_at', 'id'].includes(key)) {
      payload.append(key, value ?? '');
    }
  });
  payload.append('image', imageFile);
  return payload;
}

export function useMasterBarangData({
  search,
  searchDebouncing = false,
  mobile = false,
  page,
  limit,
  form,
  editId,
  imageFile,
  lastResponse,
  hasLoadedOnce,
  loadingSource,
  onSuccessResponse,
  onSaveSuccess,
  onDeleteSuccess,
}) {
  const queryClient = useQueryClient();
  const pagedQuery = useQuery({
    enabled: !mobile,
    queryKey: [...barangQueryKey, { search, page, limit }],
    queryFn: ({ signal }) => getBarangList({ search, page, limit }, { signal }),
    placeholderData: keepPreviousData,
  });
  const infiniteQuery = useInfiniteQuery({
    queryKey: [...barangQueryKey, 'infinite', { search, limit }],
    enabled: mobile,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => getBarangList({ search, page: pageParam, limit }, { signal }),
    getNextPageParam: (lastPage) => {
      const pagination = getPagination(lastPage);
      return pagination.has_next ? pagination.page + 1 : undefined;
    },
  });
  const query = mobile ? infiniteQuery : pagedQuery;
  const displayResponse = mobile ? infiniteQuery.data?.pages?.[0] : pagedQuery.data || lastResponse;
  const seen = new Set();
  const data = mobile
    ? (infiniteQuery.data?.pages || []).flatMap(getList).filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    })
    : getList(displayResponse);
  const pagination = { ...(getPagination(displayResponse) || emptyPagination), limit: limit || emptyPagination.limit };
  const loading = mobile ? infiniteQuery.isPending : query.isPending && !hasLoadedOnce;
  const backgroundFetching = hasLoadedOnce && query.isFetching;

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = buildBarangPayload(form, imageFile);
      return editId ? updateBarang(editId, payload) : createBarang(payload);
    },
    onSuccess: async () => {
      onSaveSuccess?.();
      await queryClient.invalidateQueries({ queryKey: barangQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (row) => deleteBarang(row.id),
    onSuccess: async () => {
      onDeleteSuccess?.();
      await queryClient.invalidateQueries({ queryKey: barangQueryKey });
    },
  });

  const setSuccessResponse = useCallback(() => {
    if (!mobile && query.data && !query.isPlaceholderData) onSuccessResponse?.(query.data);
  }, [mobile, onSuccessResponse, query.data, query.isPlaceholderData]);

  return {
    query,
    data,
    pagination,
    loading,
    hasNext: Boolean(infiniteQuery.hasNextPage),
    loadingMore: infiniteQuery.isFetchingNextPage,
    loadMore: () => infiniteQuery.fetchNextPage({ cancelRefetch: false }),
    searchLoading: mobile ? searchDebouncing || (query.isFetching && query.isPending) : hasLoadedOnce && (searchDebouncing || (backgroundFetching && loadingSource?.type === 'search')),
    pageLoadingDirection: backgroundFetching && loadingSource?.type === 'page' ? loadingSource.direction : null,
    limitLoading: backgroundFetching && loadingSource?.type === 'limit',
    saveMutation,
    deleteMutation,
    setSuccessResponse,
  };
}
