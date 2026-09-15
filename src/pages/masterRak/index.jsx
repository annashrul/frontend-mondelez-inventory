import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import QrImage from '@/components/QrImage';
import { Button } from '@/components/ui/button';
import { useCrudPageController } from '@/hooks/useCrudPageController';
import { createCrudService, getLokasiOptions } from '@/services/crudService';
import { useRakStore } from '@/stores/masterDataStores';
import MasterRakForm from './Form';
import MasterRakList from './List';

const service = createCrudService('rak');
const labels = { singular: 'Rak', lower: 'rak' };

export default function MasterRak() {
  const [qrTarget, setQrTarget] = useState(null);
  const page = useCrudPageController({
    store: useRakStore,
    service,
    queryKey: 'rak',
    labels,
    mapPayload: (form) => ({ ...form, qr_code: form.qr_code || `RAK:${form.kode}` }),
  });
  const lokasiQuery = useQuery({
    queryKey: ['lokasi-options'],
    queryFn: getLokasiOptions,
  });

  return (
    <div>
      <PageHeader
        title="Master Rak Barang"
        subtitle="Kelola lokasi rak penyimpanan"
        onAdd={page.openAdd}
        addLabel="Tambah Rak"
        searchValue={page.search}
        searchLoading={page.searchLoading}
        onSearchChange={page.setSearch}
      />
      <MasterRakList
        data={page.data}
        loading={page.loading}
        onShowQr={setQrTarget}
        onEdit={page.openEdit}
        onDelete={page.handleDelete}
        pagination={page.pagination}
        onPageChange={page.setPage}
        onLimitChange={page.setLimit}
        pageLoadingDirection={page.pageLoadingDirection}
        limitLoading={page.limitLoading}
      />
      <MasterRakForm
        open={page.modalOpen}
        editId={page.editId}
        form={page.form}
        saving={page.saving}
        generatingCode={page.generatingCode}
        lokasiOptions={lokasiQuery.data || []}
        onClose={page.closeModal}
        onSubmit={page.handleSave}
        onFieldChange={page.updateField}
        onGenerateCode={page.handleGenerateCode}
      />
      <Modal
        isOpen={Boolean(qrTarget)}
        onClose={() => setQrTarget(null)}
        title="QR Code Rak"
        description={qrTarget ? `${qrTarget.nama || '-'} - ${qrTarget.lokasi_detail?.nama || 'Lokasi tidak tersedia'}` : undefined}
        size="sm"
      >
        {qrTarget && (
          <div className="space-y-5 text-center">
            <div className="mx-auto w-fit rounded-2xl border bg-white p-4 shadow-sm">
              <QrImage value={qrTarget.qr_code} size={220} className="mx-auto" />
            </div>
            <div>
              <p className="text-base font-semibold">{qrTarget.nama}</p>
              <p className="mt-1 text-sm text-muted-foreground">{qrTarget.lokasi_detail?.nama || '-'}</p>
              <code className="mt-3 inline-block rounded-md bg-muted px-3 py-1.5 text-xs">{qrTarget.qr_code}</code>
            </div>
            <div className="flex justify-end border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setQrTarget(null)}>Tutup</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
