import PageHeader from '@/components/PageHeader';
import { useCrudPageController } from '@/hooks/useCrudPageController';
import { createCrudService } from '@/services/crudService';
import { useLokasiStore } from '@/stores/masterDataStores';
import MasterLokasiForm from './Form';
import MasterLokasiList from './List';

const service = createCrudService('lokasi');
const labels = { singular: 'Lokasi', lower: 'lokasi' };

export default function MasterLokasi() {
  const page = useCrudPageController({
    store: useLokasiStore,
    service,
    queryKey: 'lokasi',
    labels,
  });

  return (
    <div>
      <PageHeader
        title="Master Lokasi"
        subtitle="Kelola data lokasi penyimpanan"
        onAdd={page.openAdd}
        addLabel="Tambah Lokasi"
        searchValue={page.search}
        searchLoading={page.searchLoading}
        onSearchChange={page.setSearch}
      />
      <MasterLokasiList
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
      <MasterLokasiForm
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
