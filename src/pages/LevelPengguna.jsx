import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const dummyData = [
  { id: 1, kode: 'LVL-001', nama: 'Admin', deskripsi: 'Akses penuh ke semua fitur', hak_akses: 'Semua Menu', jumlah_user: 1 },
  { id: 2, kode: 'LVL-002', nama: 'Operator', deskripsi: 'Akses operasional harian', hak_akses: 'Transaksi, Master Barang', jumlah_user: 2 },
  { id: 3, kode: 'LVL-003', nama: 'Viewer', deskripsi: 'Hanya bisa melihat data', hak_akses: 'Lihat Data', jumlah_user: 1 },
  { id: 4, kode: 'LVL-004', nama: 'Supervisor', deskripsi: 'Supervisi dan approval', hak_akses: 'Approval, Report', jumlah_user: 0 },
];

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Level' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'hak_akses', label: 'Hak Akses', render: (v) => <Badge variant="outline">{v}</Badge> },
  { key: 'jumlah_user', label: 'Jumlah User', render: (v) => <Badge variant="secondary">{v} user</Badge> },
];

const emptyForm = { kode: '', nama: '', deskripsi: '', hak_akses: '' };

export default function LevelPengguna() {
  const [data, setData] = useState(dummyData);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const filtered = data.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditId(row.id); setModalOpen(true); };
  const handleDelete = (row) => { if (confirm(`Hapus level "${row.nama}"?`)) { setData(data.filter((d) => d.id !== row.id)); toast.success('Level berhasil dihapus'); } };
  const handleSave = (e) => {
    e.preventDefault();
    if (editId) { setData(data.map((d) => (d.id === editId ? { ...form, id: editId } : d))); toast.success('Level berhasil diupdate'); }
    else { setData([...data, { ...form, id: Date.now(), jumlah_user: 0 }]); toast.success('Level berhasil ditambah'); }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader title="Level Pengguna" subtitle="Kelola level akses pengguna" onAdd={openAdd} addLabel="Tambah Level" searchValue={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Level' : 'Tambah Level'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label>Kode</Label><Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Nama Level</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Deskripsi</Label><Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Hak Akses</Label><Input value={form.hak_akses} onChange={(e) => setForm({ ...form, hak_akses: e.target.value })} placeholder="Pisahkan dengan koma" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
