import PageHeader from '@/components/PageHeader';
import { useCrudPageController } from '@/hooks/useCrudPageController';
import { levelPenggunaService } from '@/services/levelPenggunaService';
import { useLevelPenggunaStore } from '@/stores/masterDataStores';
import { useAppStore } from '@/stores/appStore';
import LevelPenggunaForm from './Form';
import LevelPenggunaList from './List';

const labels = { singular: 'Level Pengguna', lower: 'level pengguna' };

export default function LevelPengguna() {
  const page = useCrudPageController({
    store: useLevelPenggunaStore,
    service: levelPenggunaService,
    queryKey: 'level-pengguna',
    labels,
    mapPayload: (form) => ({
      ...form,
      action_ids: form.action_ids.map(Number),
    }),
  });

  const menus = useAppStore((state) => state.menus);

  const openEdit = (row) => {
    page.openEdit({
      ...row,
      action_ids: row.action_ids.map(String),
    });
  };

  return (
    <div>
      <PageHeader
        title="Level Pengguna"
        subtitle="Kelola hak akses dan level pengguna"
        onAdd={page.openAdd}
        addLabel="Tambah Level"
        searchValue={page.search}
        searchLoading={page.searchLoading}
        onSearchChange={page.setSearch}
      />
      <LevelPenggunaList
        data={page.data}
        loading={page.loading}
        onEdit={openEdit}
        onDelete={page.handleDelete}
        pagination={page.pagination}
        onPageChange={page.setPage}
        onLimitChange={page.setLimit}
        pageLoadingDirection={page.pageLoadingDirection}
        limitLoading={page.limitLoading}
      />
      <LevelPenggunaForm
        open={page.modalOpen}
        editId={page.editId}
        form={page.form}
        saving={page.saving}
        generatingCode={page.generatingCode}
        onClose={page.closeModal}
        onSubmit={page.handleSave}
        onFieldChange={page.updateField}
        onGenerateCode={page.handleGenerateCode}
        menus={menus}
      />
    </div>
  );
}

