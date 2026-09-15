import PageHeader from '@/components/PageHeader';
import { useCrudPageController } from '@/hooks/useCrudPageController';
import { createCrudService } from '@/services/crudService';
import { useSatuanStore } from '@/stores/masterDataStores';
import MasterSatuanForm from './Form';
import MasterSatuanList from './List';

const service = createCrudService('satuan');
const labels = { singular: 'Satuan', lower: 'satuan' };

export default function MasterSatuan() {
  const page = useCrudPageController({
    store: useSatuanStore,
    service,
    queryKey: 'satuan',
    labels,
  });

  return (
    <div>
      <PageHeader
        title="Master Satuan Barang"
        subtitle="Kelola satuan/unit barang"
        onAdd={page.openAdd}
        addLabel="Tambah Satuan"
        searchValue={page.search}
        searchLoading={page.searchLoading}
        onSearchChange={page.setSearch}
      />
      <MasterSatuanList
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
      <MasterSatuanForm
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
