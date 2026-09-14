import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AsyncCombobox } from '@/components/ui/async-combobox';
import api, { emptyPagination, getList, getPagination } from '@/services/api';

const columns = [
  { key: 'tanggal', label: 'Tanggal', render: (v) => dayjs(v).format('DD/MM/YYYY') },
  { key: 'no_ref', label: 'No. Referensi' },
  { key: 'barang_detail', label: 'Barang', render: (value) => value?.nama || '-' },
 { key: 'tipe', label: 'Tipe', render: (v) => (
    <Badge variant={v === 'Tambah' ? 'success' : 'destructive'}>{v === 'Tambah' ? '+ Tambah' : '- Kurang'}</Badge>
  )},
  { key: 'qty', label: 'Qty' },
  { key: 'alasan', label: 'Alasan' },
  { key: 'user_detail', label: 'User', render: (value) => value?.nama || '-' },
];

const emptyForm = { tanggal: dayjs().format('YYYY-MM-DD'), barang_id: '', tipe: 'Tambah', qty: 0, alasan: '' };

export default function AdjustmentStok() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(emptyPagination);

  useEffect(() => {
    api.get('/adjustment', { params: { page, limit } }).then((res) => {
      setData(getList(res));
      setPagination(getPagination(res));
    }).catch(() => toast.error('Gagal'));
  }, [page, limit]);

  const filtered = data.filter((d) => d.barang_detail?.nama.toLowerCase().includes(search.toLowerCase()) || d.no_ref.toLowerCase().includes(search.toLowerCase()));

  const loadBarangOptions = async (query) => {
    try {
      const barang = await api.get('/barang', { params: { search: query } });
      return getList(barang).map((item) => ({
        value: String(item.id),
        label: `${item.kode} - ${item.nama} (Stok: ${item.stok} ${item.satuan_detail?.nama})`,
      }));
    } catch {
      toast.error('Gagal memuat daftar barang');
      return [];
    }
  };

  const openAdd = () => { setForm(emptyForm); setModalOpen(true); };
  const handleSave = async (e) => {
    e.preventDefault();
    const newAdj = { ...form, no_ref: `ADJ-${String(data.length + 1).padStart(3, '0')}` };
    try {
      const res = await api.post('/adjustment', newAdj);
      setData([res, ...data]);
      toast.success('Adjustment berhasil disimpan');
      setModalOpen(false);
    } catch { toast.error('Gagal menyimpan'); }
  };

  return (
    <div>
      <PageHeader title="Adjustment Stok" subtitle="Kelola penyesuaian stok barang" onAdd={openAdd} addLabel="Buat Adjustment" searchValue={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} pagination={pagination} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Buat Adjustment Stok">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label>Tanggal</Label><DatePicker value={form.tanggal} onChange={(v) => setForm({ ...form, tanggal: v })} /></div>
          <div className="space-y-1.5">
            <Label>Barang</Label>
            <AsyncCombobox
              value={String(form.barang_id || '')}
              onValueChange={(value) => setForm({ ...form, barang_id: Number(value) })}
              loadOptions={loadBarangOptions}
              placeholder="Pilih barang..."
              searchPlaceholder="Cari kode atau nama barang..."
              emptyText="Barang tidak ditemukan."
            />
            <input type="hidden" value={form.barang_id} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipe</Label>
              <Select value={form.tipe} onValueChange={(v) => setForm({ ...form, tipe: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Tambah">Tambah</SelectItem><SelectItem value="Kurang">Kurang</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Qty</Label><Input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} min="1" required /></div>
          </div>
          <div className="space-y-1.5"><Label>Alasan</Label><Textarea value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })} required /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
