import { useCallback } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emptyPagination, getList, getPagination } from '@/services/api';

export function useCrudResourceData({
  queryKey,
  params,
  form,
  editId,
  lastResponse,
  hasLoadedOnce,
  loadingSource,
  listFn,
  createFn,
  updateFn,
  deleteFn,
  mapPayload = (value) => value,
  onSuccessResponse,
  onSaveSuccess,
  onDeleteSuccess,
}) {
  const queryClient = useQueryClient();
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

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = mapPayload(form, { editId });
      return editId ? updateFn(editId, payload) : createFn(payload);
    },
    onSuccess: async () => {
      onSaveSuccess?.();
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (row) => deleteFn(row.id, row),
    onSuccess: async () => {
      onDeleteSuccess?.();
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

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
    saveMutation,
    deleteMutation,
    setSuccessResponse,
  };
}
