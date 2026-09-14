import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api, { emptyPagination, getList, getPagination } from '@/services/api';

const columns = [
  { key: 'tanggal', label: 'Tanggal', render: (v) => dayjs(v).format('DD/MM/YYYY') },
  { key: 'shift', label: 'Shift' },
  { key: 'waktu_mulai', label: 'Waktu Mulai', render: (v) => dayjs(v).format('HH:mm') },
  { key: 'waktu_selesai', label: 'Waktu Selesai', render: (v) => v ? dayjs(v).format('HH:mm') : '-' },
  { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'Selesai' ? 'success' : 'warning'}>{v}</Badge> },
  { key: 'user_detail', label: 'User', render: (value) => value?.nama || '-' },
];

export default function Closing() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(emptyPagination);

  useEffect(() => {
    api.get('/shift', { params: { page, limit } }).then((res) => {
      setData(getList(res));
      setPagination(getPagination(res));
    }).catch(() => toast.error('Gagal load data'));
  }, [page, limit]);

  const filtered = data.filter((d) => d.shift.toLowerCase().includes(search.toLowerCase()) || d.status.toLowerCase().includes(search.toLowerCase()));

  const handleClosing = async () => {
    const active = data.find(d => d.status === 'Aktif');
    if (!active) return toast.error('Tidak ada shift aktif');

    try {
      const res = await api.put(`/shift/${active.id}`, { ...active, status: 'Selesai', waktu_selesai: new Date().toISOString() });
      setData(data.map(d => d.id === active.id ? res : d));
      toast.success('Closing shift berhasil');
      setModalOpen(false);
    } catch (e) {
      toast.error('Gagal closing shift');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Closing Shift</h1>
          <p className="text-sm text-muted-foreground mt-1">Rekapitulasi akhir shift kerja</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Closing Shift Saat Ini</Button>
      </div>

      <DataTable columns={columns} data={filtered} pagination={pagination} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Konfirmasi Closing Shift">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin melakukan closing pada shift yang sedang aktif? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="button" onClick={handleClosing}>Konfirmasi Closing</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
