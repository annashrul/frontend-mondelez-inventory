import { useClosingStore } from '@/stores/listPageStores';
import { PermissionAction } from '@/components/PermissionAccess';
import { usePermission } from '@/hooks/usePermission';
import usePageState from '@/hooks/usePageState';
import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import { useEffect } from 'react';
import { useListResourceData } from '@/hooks/useListResourceData';
import { createCrudService } from '@/services/crudService';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from '@/lib/toast';
import dayjs from 'dayjs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const service = createCrudService('shift');

const columns = [
  { key: 'tanggal', label: 'Tanggal', render: (v) => dayjs(v).format('DD/MM/YYYY') },
  { key: 'shift', label: 'Shift Kerja' },
  { key: 'waktu_mulai', label: 'Waktu Mulai', render: (v) => dayjs(v).format('HH:mm') },
  { key: 'waktu_selesai', label: 'Waktu Selesai', render: (v) => v ? dayjs(v).format('HH:mm') : '-' },
  { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'Selesai' ? 'success' : 'warning'}>{v}</Badge> },
  { key: 'user_detail', label: 'Pengguna', render: (value) => value?.nama || '-' },
];

export default function Closing() {
  useUiLanguage();
  const canClose = usePermission('closing.close');
  const [modalOpen, setModalOpen] = usePageState('Closing.jsx:modalOpen', false);
  const { page, limit, setPage, setLimit } = useClosingStore();
  const { data, pagination, loading, query } = useListResourceData({
    queryKey: 'shift', params: { page, limit }, listFn: service.list,
  });
  useEffect(() => {
    if (query.error) toast.error('Gagal load data');
  }, [query.error]);

  const handleClosing = async () => {
    if (!canClose) return;
    const active = data.find(d => d.status === 'Aktif');
    if (!active) return toast.error('Tidak ada shift aktif');

    try {
      await api.put(`/shift/${active.id}`, { ...active, status: 'Selesai', waktu_selesai: new Date().toISOString() });
      await query.refetch();
      toast.success('Closing shift berhasil');
      setModalOpen(false);
    } catch {
      toast.error('Gagal closing shift');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{translateUi("Closing Shift")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{translateUi("Rekapitulasi akhir shift kerja")}</p>
        </div>
        <PermissionAction permission="closing.close"><Button onClick={() => setModalOpen(true)}>{translateUi("Closing Shift Saat Ini")}</Button></PermissionAction>
      </div>

      <DataTable columns={columns} data={data} loading={loading} pagination={pagination} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />

      <Modal permission="closing.close" isOpen={modalOpen} onClose={() => setModalOpen(false)} title={translateUi("Konfirmasi Closing Shift")}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{translateUi("Apakah Anda yakin ingin melakukan closing pada shift yang sedang aktif? Tindakan ini tidak dapat dibatalkan.")}</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{translateUi("Batal")}</Button>
            <Button type="button" onClick={handleClosing}>{translateUi("Konfirmasi Closing")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
