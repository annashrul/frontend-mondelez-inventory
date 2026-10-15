import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useListResourceData } from '@/hooks/useListResourceData';

export function useCrudResourceData({
  queryKey,
  mobile = false,
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
  const resource = useListResourceData({
    queryKey, mobile, params, lastResponse, hasLoadedOnce, loadingSource, listFn, onSuccessResponse,
  });

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

  return { ...resource, saveMutation, deleteMutation };
}
