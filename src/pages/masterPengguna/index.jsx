import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
import { useCrudPageController } from '@/hooks/useCrudPageController';
import { penggunaService } from '@/services/penggunaService';
import { usePenggunaStore } from '@/stores/masterDataStores';
import MasterPenggunaForm from './Form';
import MasterPenggunaList from './List';

const labels = { singular: 'Pengguna', lower: 'pengguna' };

export default function MasterPengguna() {
  useUiLanguage();
  const page = useCrudPageController({
    store: usePenggunaStore,
    service: penggunaService,
    queryKey: 'pengguna',
    labels,
    mapPayload: (form, { editId }) => {
      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;
      payload.level_id = Number(payload.level_id);
      return payload;
    },
  });

  return (
    <div>
      <PageHeader
        title={translateUi("Master Pengguna")}
        subtitle={translateUi("Kelola data pengguna sistem")}
        onAdd={page.openAdd}
        addLabel={translateUi("Tambah Pengguna")}
        searchValue={page.search}
        searchLoading={page.searchLoading}
        onSearchChange={page.setSearch}
      />
      <MasterPenggunaList
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
      <MasterPenggunaForm
        open={page.modalOpen}
        editId={page.editId}
        form={page.form}
        saving={page.saving}
        onClose={page.closeModal}
        onSubmit={page.handleSave}
        onFieldChange={page.updateField}
      />
    </div>
  );
}
