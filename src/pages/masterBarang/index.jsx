import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import { toast } from '@/lib/toast';
import useIsMobile from '@/hooks/useIsMobile';
import useDebounce from '@/hooks/useDebounce';
import { useMasterBarangData } from '@/hooks/useMasterBarangData';
import { useMasterBarangStore } from '@/stores/masterBarangStore';
import { generateBarangCode, generateBarangBarcode } from '@/services/barangService';
import MasterBarangForm from './Form';
import MasterBarangList from './List';

export default function MasterBarang() {
  useUiLanguage();
  const {
    search,
    page,
    limit,
    modalOpen,
    form,
    editId,
    hasLoadedOnce,
    lastResponse,
    loadingSource,
    setSearch,
    setPage,
    setLimit,
    setQueryResponse,
    updateField,
    openAdd: openAddStore,
    openEdit: openEditStore,
    closeModal: closeModalStore,
  } = useMasterBarangStore();
  const mobile = useIsMobile();
  const debouncedSearch = useDebounce(search);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const generateCodeMutation = useMutation({
    mutationFn: generateBarangCode,
    onSuccess: (response) => updateField('kode', response.kode),
    onError: (error) => toast.error(error.message || 'Gagal generate kode barang'),
  });

  const generateBarcodeMutation = useMutation({
    mutationFn: generateBarangBarcode,
    onSuccess: response => updateField('barcode', response.barcode),
    onError: error => toast.error(error.message || 'Gagal generate barcode barang'),
  });

  const resetImage = () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setImageFile(null);
    setPreview('');
  };
  const openAdd = () => {
    resetImage();
    openAddStore();
  };
  const openEdit = (row) => {
    resetImage();
    openEditStore(row);
    setPreview(row.image_url || '');
  };
  const closeModal = () => {
    resetImage();
    closeModalStore();
  };

  const {
    query: barangQuery,
    hasNext,
    loadingMore,
    data,
    pagination,
    loading,
    searchLoading,
    pageLoadingDirection,
    limitLoading,
    saveMutation,
    deleteMutation,
    setSuccessResponse,
  } = useMasterBarangData({
    mobile,
    search: debouncedSearch,
    searchDebouncing: search !== debouncedSearch,
    page,
    limit,
    form,
    editId,
    imageFile,
    lastResponse,
    hasLoadedOnce,
    loadingSource,
    onSuccessResponse: setQueryResponse,
    onSaveSuccess: () => {
      toast.success(`Barang berhasil ${editId ? 'diupdate' : 'ditambah'}`);
      closeModal();
    },
    onDeleteSuccess: () => toast.success('Barang berhasil dihapus'),
  });

  useEffect(() => {
    setSuccessResponse();
  }, [setSuccessResponse]);

  useEffect(() => {
    if (barangQuery.error) toast.error(barangQuery.error.message || 'Gagal mengambil data master');
  }, [barangQuery.error]);
  useEffect(() => {
    if (saveMutation.error) toast.error(saveMutation.error.message || 'Gagal menyimpan barang');
  }, [saveMutation.error]);
  useEffect(() => {
    if (deleteMutation.error) toast.error(deleteMutation.error.message || 'Gagal menghapus barang');
  }, [deleteMutation.error]);

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Gunakan gambar JPEG, PNG, atau WebP');
    if (file.size > 5 * 1024 * 1024) return toast.error('Ukuran gambar maksimal 5 MB');
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDelete = async (row) => {
    await deleteMutation.mutateAsync(row).catch(() => {});
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saveMutation.isPending || generateCodeMutation.isPending || generateBarcodeMutation.isPending) return;
    await saveMutation.mutateAsync().catch(() => {});
  };

  return (
    <div>
      <PageHeader
        title={translateUi("Master Barang")}
        subtitle={translateUi("Kelola data barang inventory")}
        onAdd={openAdd}
        addLabel={translateUi("Tambah Barang")}
        searchValue={search}
        searchLoading={searchLoading}
        onSearchChange={setSearch}
      />
      <MasterBarangList
        mobile={mobile}
        query={barangQuery}
        hasNext={hasNext}
        loadingMore={loadingMore}
        searchDebouncing={search !== debouncedSearch}
        data={data}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        pageLoadingDirection={pageLoadingDirection}
        limitLoading={limitLoading}
      />
      <MasterBarangForm
        open={modalOpen}
        editId={editId}
        form={form}
        preview={preview}
        imageFile={imageFile}
        saving={saveMutation.isPending}
        generatingCode={generateCodeMutation.isPending}
        generatingBarcode={generateBarcodeMutation.isPending}
        onClose={closeModal}
        onSubmit={handleSave}
        onFieldChange={updateField}
        onImageChange={handleImage}
        onGenerateCode={() => generateCodeMutation.mutate()}
        onGenerateBarcode={() => generateBarcodeMutation.mutate()}
      />
    </div>
  );
}
