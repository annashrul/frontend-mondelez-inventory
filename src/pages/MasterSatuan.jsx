import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const dummyData = [
  { id: 1, kode: 'STN-001', nama: 'Pcs', deskripsi: 'Satuan per buah/piece' },
  { id: 2, kode: 'STN-002', nama: 'Box', deskripsi: 'Satuan per kotak' },
  { id: 3, kode: 'STN-003', nama: 'Rim', deskripsi: 'Satuan rim (500 lembar)' },
  { id: 4, kode: 'STN-004', nama: 'Roll', deskripsi: 'Satuan per gulungan' },
  { id: 5, kode: 'STN-005', nama: 'Lusin', deskripsi: 'Satuan per 12 buah' },
  { id: 6, kode: 'STN-006', nama: 'Pack', deskripsi: 'Satuan per pak' },
  { id: 7, kode: 'STN-007', nama: 'Kg', deskripsi: 'Satuan per kilogram' },
  { id: 8, kode: 'STN-008', nama: 'Liter', deskripsi: 'Satuan per liter' },
];

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Satuan' },
  { key: 'deskripsi', label: 'Deskripsi' },
];

const emptyForm = { kode: '', nama: '', deskripsi: '' };

export default function MasterSatuan() {
  const [data, setData] = useState(dummyData);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const filtered = data.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditId(row.id); setModalOpen(true); };
  const handleDelete = (row) => { if (confirm(`Hapus satuan "${row.nama}"?`)) { setData(data.filter((d) => d.id !== row.id)); toast.success('Satuan berhasil dihapus'); } };
  const handleSave = (e) => {
    e.preventDefault();
    if (editId) { setData(data.map((d) => (d.id === editId ? { ...form, id: editId } : d))); toast.success('Satuan berhasil diupdate'); }
    else { setData([...data, { ...form, id: Date.now() }]); toast.success('Satuan berhasil ditambah'); }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader title="Master Satuan Barang" subtitle="Kelola satuan/unit barang" onAdd={openAdd} addLabel="Tambah Satuan" searchValue={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Satuan' : 'Tambah Satuan'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label>Kode</Label><Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Nama Satuan</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /></div>
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
