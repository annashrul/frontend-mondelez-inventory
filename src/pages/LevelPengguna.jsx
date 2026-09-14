import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Level' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'hak_akses', label: 'Hak Akses', render: (v) => <Badge variant="outline">{v}</Badge> },
  { key: 'jumlah_user', label: 'Jumlah User', render: (v) => <Badge variant="secondary">{v} user</Badge> },
];

const emptyForm = { kode: '', nama: '', deskripsi: '', hak_akses: '' };

export default function LevelPengguna() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    api.get('/level-pengguna').then(setData).catch(()=>toast.error('Gagal'));
  }, []);

  const filtered = data.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditId(row.id); setModalOpen(true); };
  const handleDelete = async (row) => {
    if (confirm(`Hapus level "${row.nama}"?`)) {
      try {
        await api.delete(`/level-pengguna/${row.id}`);
        setData(data.filter((d) => d.id !== row.id));
        toast.success('Level berhasil dihapus');
      } catch (e) { toast.error('Gagal menhapus'); }
    }
  };
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await api.put(`/level-pengguna/${editId}`, form);
        setData(data.map((d) => (d.id === editId ? res : d)));
        toast.success('Level berhasil diupdate');
      } else {
        const res = await api.post('/level-pengguna', { ...form, jumlah_user: 0 });
        setData([...data, res]);
        toast.success('Level berhasil ditambah');
      }
      setModalOpen(false);
    } catch (e) { toast.error('Gagal menyimpan'); }
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
