import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const dummyData = [
  { id: 1, kode: 'KLP-001', nama: 'Alat Tulis Kantor', deskripsi: 'Perlengkapan tulis menulis', jumlah_barang: 45 },
  { id: 2, kode: 'KLP-002', nama: 'IT Supply', deskripsi: 'Perlengkapan IT', jumlah_barang: 18 },
  { id: 3, kode: 'KLP-003', nama: 'Kebersihan', deskripsi: 'Alat dan bahan kebersihan', jumlah_barang: 22 },
  { id: 4, kode: 'KLP-004', nama: 'Elektrikal', deskripsi: 'Peralatan listrik', jumlah_barang: 15 },
];

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Kelompok' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'jumlah_barang', label: 'Jumlah Barang', render: (v) => <Badge variant="secondary">{v} item</Badge> },
];

const emptyForm = { kode: '', nama: '', deskripsi: '' };

export default function KelompokBarang() {
  const [data, setData] = useState(dummyData);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const filtered = data.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditId(row.id); setModalOpen(true); };
  const handleDelete = (row) => {
    if (confirm(`Hapus kelompok "${row.nama}"?`)) {
      setData(data.filter((d) => d.id !== row.id));
      toast.success('Kelompok berhasil dihapus');
    }
  };
  const handleSave = (e) => {
    e.preventDefault();
    if (editId) {
      setData(data.map((d) => (d.id === editId ? { ...form, id: editId } : d)));
      toast.success('Kelompok berhasil diupdate');
    } else {
      setData([...data, { ...form, id: Date.now(), jumlah_barang: 0 }]);
      toast.success('Kelompok berhasil ditambah');
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader title="Kelompok Barang" subtitle="Kelola kategori/kelompok barang" onAdd={openAdd} addLabel="Tambah Kelompok" searchValue={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Kelompok' : 'Tambah Kelompok'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label>Kode</Label><Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Nama Kelompok</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Deskripsi</Label><Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
