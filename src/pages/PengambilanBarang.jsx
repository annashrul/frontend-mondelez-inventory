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

const dummyData = [
  { id: 1, tanggal: '2026-09-10', no_ref: 'AMB-001', pemohon: 'Dept. HRD', barang: 'Kertas A4 70gsm', qty: 50, status: 'Disetujui', user: 'Budi' },
  { id: 2, tanggal: '2026-09-10', no_ref: 'AMB-002', pemohon: 'Dept. Finance', barang: 'Pulpen Pilot G-2', qty: 12, status: 'Pending', user: 'Sari' },
  { id: 3, tanggal: '2026-09-09', no_ref: 'AMB-003', pemohon: 'Dept. GA', barang: 'Map Ordner', qty: 10, status: 'Disetujui', user: 'Budi' },
  { id: 4, tanggal: '2026-09-09', no_ref: 'AMB-004', pemohon: 'Dept. IT', barang: 'Tinta Printer HP', qty: 2, status: 'Ditolak', user: 'Andi' },
];

const columns = [
  { key: 'tanggal', label: 'Tanggal', render: (v) => dayjs(v).format('DD/MM/YYYY') },
  { key: 'no_ref', label: 'No. Referensi' },
  { key: 'pemohon', label: 'Pemohon' },
  { key: 'barang', label: 'Barang' },
  { key: 'qty', label: 'Qty' },
  { key: 'status', label: 'Status', render: (v) => {
    const vars = { Disetujui: 'success', Pending: 'warning', Ditolak: 'destructive' };
    return <Badge variant={vars[v]}>{v}</Badge>;
  }},
  { key: 'user', label: 'User' },
];

const emptyForm = { tanggal: dayjs().format('YYYY-MM-DD'), pemohon: '', barang: '', qty: 0, keterangan: '' };

export default function PengambilanBarang() {
  const [data, setData] = useState(dummyData);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter((d) => d.barang.toLowerCase().includes(search.toLowerCase()) || d.pemohon.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(emptyForm); setModalOpen(true); };
  const handleSave = (e) => {
    e.preventDefault();
    const newItem = { ...form, id: Date.now(), no_ref: `AMB-${String(data.length + 1).padStart(3, '0')}`, status: 'Pending', user: 'Admin' };
    setData([newItem, ...data]);
    toast.success('Pengambilan berhasil dicatat');
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader title="Pengambilan Barang" subtitle="Catat pengambilan barang dari gudang" onAdd={openAdd} addLabel="Buat Pengambilan" searchValue={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} actions={(row) => row.status === 'Pending' && (
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7 text-xs text-green-600 hover:text-green-700" onClick={() => { setData(data.map(d => d.id === row.id ? {...d, status: 'Disetujui'} : d)); toast.success('Disetujui'); }}>Setujui</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => { setData(data.map(d => d.id === row.id ? {...d, status: 'Ditolak'} : d)); toast.success('Ditolak'); }}>Tolak</Button>
        </div>
      )} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Buat Pengambilan Barang">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Pemohon / Departemen</Label><Input value={form.pemohon} onChange={(e) => setForm({ ...form, pemohon: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Barang</Label><Input value={form.barang} onChange={(e) => setForm({ ...form, barang: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Qty</Label><Input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} min="1" required /></div>
          <div className="space-y-1.5"><Label>Keterangan</Label><Textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
