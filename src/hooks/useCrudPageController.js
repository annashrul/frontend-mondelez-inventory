import { useEffect } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import useDebounce from '@/hooks/useDebounce';
import { useCrudResourceData } from '@/hooks/useCrudResourceData';

export function useCrudPageController({
  store,
  service,
  queryKey,
  labels,
  mapPayload,
}) {
  const state = store();
  const debouncedSearch = useDebounce(state.search);
  const resource = useCrudResourceData({
    queryKey,
    params: {
      search: debouncedSearch,
      searchDebouncing: state.search !== debouncedSearch,
      page: state.page,
      limit: state.limit,
    },
    form: state.form,
    editId: state.editId,
    lastResponse: state.lastResponse,
    hasLoadedOnce: state.hasLoadedOnce,
    loadingSource: state.loadingSource,
    listFn: service.list,
    createFn: service.create,
    updateFn: service.update,
    deleteFn: service.remove,
    mapPayload,
    onSuccessResponse: state.setQueryResponse,
    onSaveSuccess: () => {
      toast.success(`${labels.singular} berhasil ${state.editId ? 'diupdate' : 'ditambah'}`);
      state.closeModal();
    },
    onDeleteSuccess: () => toast.success(`${labels.singular} berhasil dihapus`),
  });

  useEffect(() => {
    resource.setSuccessResponse();
  }, [resource.setSuccessResponse]);
  useEffect(() => {
    if (resource.query.error) toast.error(resource.query.error.message || `Gagal mengambil data ${labels.lower}`);
  }, [labels.lower, resource.query.error]);
  useEffect(() => {
    if (resource.saveMutation.error) toast.error(resource.saveMutation.error.message || `Gagal menyimpan ${labels.lower}`);
  }, [labels.lower, resource.saveMutation.error]);
  useEffect(() => {
    if (resource.deleteMutation.error) toast.error(resource.deleteMutation.error.message || `Gagal menghapus ${labels.lower}`);
  }, [labels.lower, resource.deleteMutation.error]);
  const generateCodeMutation = useMutation({
    mutationFn: () => service.generateCode(),
    onSuccess: (response) => {
      state.updateField('kode', response.kode);
      if (queryKey === 'rak') state.updateField('qr_code', `RAK:${response.kode}`);
    },
    onError: (error) => toast.error(error.message || `Gagal generate kode ${labels.lower}`),
  });

  const handleDelete = async (row) => {
    await resource.deleteMutation.mutateAsync(row).catch(() => {});
  };
  const handleSave = async (event) => {
    event.preventDefault();
    if (resource.saveMutation.isPending) return;
    await resource.saveMutation.mutateAsync().catch(() => {});
  };

  return {
    ...state,
    ...resource,
    debouncedSearch,
    handleDelete,
    handleSave,
    saving: resource.saveMutation.isPending,
    generatingCode: generateCodeMutation.isPending,
    handleGenerateCode: () => generateCodeMutation.mutate(),
  };
}
