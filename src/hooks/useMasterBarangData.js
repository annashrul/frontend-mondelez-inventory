import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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
  const query = useQuery({
    queryKey: [...barangQueryKey, { search, page, limit }],
    queryFn: () => getBarangList({ search, page, limit }),
    placeholderData: keepPreviousData,
  });
  const displayResponse = query.data || lastResponse;
  const data = getList(displayResponse);
  const pagination = getPagination(displayResponse) || emptyPagination;
  const loading = query.isPending && !hasLoadedOnce;
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
    if (query.data && !query.isPlaceholderData) onSuccessResponse?.(query.data);
  }, [onSuccessResponse, query.data, query.isPlaceholderData]);

  return {
    query,
    data,
    pagination,
    loading,
    searchLoading: hasLoadedOnce && (searchDebouncing || (backgroundFetching && loadingSource?.type === 'search')),
    pageLoadingDirection: backgroundFetching && loadingSource?.type === 'page' ? loadingSource.direction : null,
    limitLoading: backgroundFetching && loadingSource?.type === 'limit',
    saveMutation,
    deleteMutation,
    setSuccessResponse,
  };
}
