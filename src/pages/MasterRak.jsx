import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';

const lokasiOptions = [
  { value: 'Gudang Utama - Lantai 1', label: 'Gudang Utama - Lantai 1' },
  { value: 'Gudang Utama - Lantai 2', label: 'Gudang Utama - Lantai 2' },
  { value: 'Gudang Sekunder', label: 'Gudang Sekunder' },
  { value: 'Ruang Arsip', label: 'Ruang Arsip' },
];

const dummyData = [
  { id: 1, kode: 'RAK-A01', nama: 'Rak A-01', lokasi: 'Gudang Utama - Lantai 1', kapasitas: 100, terisi: 65 },
  { id: 2, kode: 'RAK-A02', nama: 'Rak A-02', lokasi: 'Gudang Utama - Lantai 1', kapasitas: 100, terisi: 80 },
  { id: 3, kode: 'RAK-B01', nama: 'Rak B-01', lokasi: 'Gudang Utama - Lantai 2', kapasitas: 150, terisi: 45 },
  { id: 4, kode: 'RAK-B02', nama: 'Rak B-02', lokasi: 'Gudang Utama - Lantai 2', kapasitas: 150, terisi: 120 },
  { id: 5, kode: 'RAK-C01', nama: 'Rak C-01', lokasi: 'Gudang Sekunder', kapasitas: 80, terisi: 30 },
];

const columns = [
  { key: 'kode', label: 'Kode Rak' },
  { key: 'nama', label: 'Nama Rak' },
  { key: 'lokasi', label: 'Lokasi' },
  { key: 'kapasitas', label: 'Kapasitas' },
  { key: 'terisi', label: 'Terisi', render: (v, row) => {
    const pct = Math.round((v / row.kapasitas) * 100);
    const color = pct > 80 ? 'bg-destructive' : pct > 50 ? 'bg-amber-500' : 'bg-green-500';
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
    );
  }},
];

const emptyForm = { kode: '', nama: '', lokasi: '', kapasitas: 0 };

export default function MasterRak() {
  const [data, setData] = useState(dummyData);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const filtered = data.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()) || d.kode.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditId(row.id); setModalOpen(true); };
  const handleDelete = (row) => { if (confirm(`Hapus rak "${row.nama}"?`)) { setData(data.filter((d) => d.id !== row.id)); toast.success('Rak berhasil dihapus'); } };
  const handleSave = (e) => {
    e.preventDefault();
    if (editId) { setData(data.map((d) => (d.id === editId ? { ...form, id: editId } : d))); toast.success('Rak berhasil diupdate'); }
    else { setData([...data, { ...form, id: Date.now(), terisi: 0 }]); toast.success('Rak berhasil ditambah'); }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader title="Master Rak Barang" subtitle="Kelola lokasi rak penyimpanan" onAdd={openAdd} addLabel="Tambah Rak" searchValue={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Rak' : 'Tambah Rak'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label>Kode Rak</Label><Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Nama Rak</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /></div>
          <div className="space-y-1.5">
            <Label>Lokasi</Label>
            <Combobox
              options={lokasiOptions}
              value={form.lokasi}
              onValueChange={(val) => setForm({ ...form, lokasi: val })}
              placeholder="Pilih lokasi..."
              searchPlaceholder="Cari lokasi..."
              emptyText="Lokasi tidak ditemukan."
            />
          </div>
          <div className="space-y-1.5"><Label>Kapasitas</Label><Input type="number" value={form.kapasitas} onChange={(e) => setForm({ ...form, kapasitas: Number(e.target.value) })} required /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
