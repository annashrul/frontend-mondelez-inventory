import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import api from '@/services/api';

const columns = [
  { key: 'username', label: 'Username' },
  { key: 'nama', label: 'Nama Lengkap' },
  { key: 'email', label: 'Email' },
  { key: 'level', label: 'Level Pengguna' },
  { key: 'status', label: 'Status' },
];

const emptyForm = { username: '', nama: '', email: '', level: '', status: 'Aktif' };

export default function MasterPengguna() {
  const [data, setData] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/pengguna'), api.get('/level-pengguna')])
      .then(([resP, resL]) => {
        setData(resP);
        setLevelOptions(resL.map((l) => ({ value: l.nama, label: l.nama })));
      })
      .catch(() => toast.error('Gagal load pengguna'));
  }, []);

  const filtered = data.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()) || d.username.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditId(row.id); setModalOpen(true); };

  const handleDelete = async (row) => {
    if (confirm(`Hapus pengguna "${row.nama}"?`)) {
      try {
        await api.delete('/pengguna/' + row.id);
        setData(data.filter((d) => d.id !== row.id));
        toast.success('Dihapus');
      } catch (e) { toast.error('Gagal hapus'); }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await api.put('/pengguna/' + editId, form);
        setData(data.map((d) => (d.id === editId ? res : d)));
        toast.success('Diupdate');
      } else {
        const res = await api.post('/pengguna', form);
        setData([...data, res]);
        toast.success('Ditambah');
      }
      setModalOpen(false);
    } catch (e) { toast.error('Gagal simpan'); }
  };

  return (
    <div>
      <PageHeader title="Master Pengguna" subtitle="Kelola pengguna aplikasi" onAdd={openAdd} addLabel="Tambah Pengguna" searchValue={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Pengguna' : 'Tambah Pengguna'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Nama Lengkap</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="space-y-1.5">
            <Label>Level Pengguna</Label>
            <Combobox options={levelOptions} value={form.level} onValueChange={(val) => setForm({ ...form, level: val })} placeholder="Pilih level..." emptyText="Level tidak ditemukan." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}