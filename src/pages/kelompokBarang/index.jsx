import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
import { useCrudPageController } from '@/hooks/useCrudPageController';
import { createCrudService } from '@/services/crudService';
import { useKelompokBarangStore } from '@/stores/masterDataStores';
import KelompokBarangForm from './Form';
import KelompokBarangList from './List';

const service = createCrudService('kelompok-barang');
const labels = { singular: 'Kelompok', lower: 'kelompok' };

export default function KelompokBarang() {
  useUiLanguage();
  const page = useCrudPageController({
    store: useKelompokBarangStore,
    service,
    queryKey: 'kelompok-barang',
    labels,
  });

  return (
    <div>
      <PageHeader
        title={translateUi("Kelompok Barang")}
        subtitle={translateUi("Kelola kategori/kelompok barang")}
        onAdd={page.openAdd}
        addLabel={translateUi("Tambah Kelompok")}
        searchValue={page.search}
        searchLoading={page.searchLoading}
        onSearchChange={page.setSearch}
      />
      <KelompokBarangList
        infiniteScroll={page.infiniteScroll}
        data={page.data}
        loading={page.loading}
        onEdit={page.openEdit}
        onDelete={page.handleDelete}
        pagination={page.pagination}
        onPageChange={page.setPage}
        onLimitChange={page.setLimit}
        pageLoadingDirection={page.pageLoadingDirection}
        limitLoading={page.limitLoading}
      />
      <KelompokBarangForm
        open={page.modalOpen}
        editId={page.editId}
        form={page.form}
        saving={page.saving}
        generatingCode={page.generatingCode}
        onClose={page.closeModal}
        onSubmit={page.handleSave}
        onFieldChange={page.updateField}
        onGenerateCode={page.handleGenerateCode}
      />
    </div>
  );
}
