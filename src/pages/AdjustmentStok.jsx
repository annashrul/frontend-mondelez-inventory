import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const dummyData = [
  { id: 1, tanggal: '2026-09-10', no_ref: 'ADJ-001', barang: 'Kertas A4 70gsm', tipe: 'Tambah', qty: 10, alasan: 'Koreksi stok fisik', user: 'Admin' },
  { id: 2, tanggal: '2026-09-09', no_ref: 'ADJ-002', barang: 'Pulpen Pilot G-2', tipe: 'Kurang', qty: 5, alasan: 'Barang rusak', user: 'Budi' },
  { id: 3, tanggal: '2026-09-08', no_ref: 'ADJ-003', barang: 'Map Ordner', tipe: 'Tambah', qty: 20, alasan: 'Stok opname', user: 'Admin' },
];

const columns = [
  { key: 'tanggal', label: 'Tanggal', render: (v) => dayjs(v).format('DD/MM/YYYY') },
  { key: 'no_ref', label: 'No. Referensi' },
  { key: 'barang', label: 'Barang' },
  { key: 'tipe', label: 'Tipe', render: (v) => (
    <Badge variant={v === 'Tambah' ? 'success' : 'destructive'}>{v === 'Tambah' ? '+ Tambah' : '- Kurang'}</Badge>
  )},
  { key: 'qty', label: 'Qty' },
  { key: 'alasan', label: 'Alasan' },
  { key: 'user', label: 'User' },
];

const emptyForm = { tanggal: dayjs().format('YYYY-MM-DD'), barang: '', tipe: 'Tambah', qty: 0, alasan: '' };

export default function AdjustmentStok() {
  const [data, setData] = useState(dummyData);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter((d) => d.barang.toLowerCase().includes(search.toLowerCase()) || d.no_ref.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(emptyForm); setModalOpen(true); };
  const handleSave = (e) => {
    e.preventDefault();
    const newAdj = { ...form, id: Date.now(), no_ref: `ADJ-${String(data.length + 1).padStart(3, '0')}`, user: 'Admin' };
    setData([newAdj, ...data]);
    toast.success('Adjustment berhasil disimpan');
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader title="Adjustment Stok" subtitle="Kelola penyesuaian stok barang" onAdd={openAdd} addLabel="Buat Adjustment" searchValue={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Buat Adjustment Stok">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Barang</Label><Input value={form.barang} onChange={(e) => setForm({ ...form, barang: e.target.value })} placeholder="Cari/pilih barang" required /></div>
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
