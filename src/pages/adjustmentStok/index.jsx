import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
import { useCrudPageController } from '@/hooks/useCrudPageController';
import { createCrudService } from '@/services/crudService';
import { useAdjustmentStore } from '@/stores/masterDataStores';
import AdjustmentStokForm from './Form';
import AdjustmentStokList from './List';

const service = createCrudService('adjustment');
const labels = { singular: 'Adjustment', lower: 'adjustment' };

export default function AdjustmentStok() {
  useUiLanguage();
  const page = useCrudPageController({
    store: useAdjustmentStore,
    service,
    queryKey: 'adjustment',
    labels,
  });

  return (
    <div>
      <PageHeader
        title={translateUi("Adjustment Stok")}
        subtitle={translateUi("Kelola penyesuaian stok barang")}
        onAdd={page.openAdd}
        addLabel={translateUi("Buat Adjustment")}
        searchValue={page.search}
        searchLoading={page.searchLoading}
        onSearchChange={page.setSearch}
      />
      <AdjustmentStokList
        infiniteScroll={page.infiniteScroll}
        data={page.data}
        loading={page.loading}
        pagination={page.pagination}
        onPageChange={page.setPage}
        onLimitChange={page.setLimit}
        pageLoadingDirection={page.pageLoadingDirection}
        limitLoading={page.limitLoading}
      />
      <AdjustmentStokForm
        open={page.modalOpen}
        form={page.form}
        saving={page.saving}
        onClose={page.closeModal}
        onSubmit={page.handleSave}
        onFieldChange={page.updateField}
      />
    </div>
  );
}
