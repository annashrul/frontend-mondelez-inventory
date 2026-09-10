import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const dummyData = [
  { id: 1, username: 'admin', nama: 'Administrator', email: 'admin@company.com', level: 'Admin', status: 'Aktif' },
  { id: 2, username: 'budi', nama: 'Budi Santoso', email: 'budi@company.com', level: 'Operator', status: 'Aktif' },
  { id: 3, username: 'sari', nama: 'Sari Dewi', email: 'sari@company.com', level: 'Operator', status: 'Aktif' },
  { id: 4, username: 'andi', nama: 'Andi Pratama', email: 'andi@company.com', level: 'Viewer', status: 'Nonaktif' },
];

const columns = [
  { key: 'username', label: 'Username' },
  { key: 'nama', label: 'Nama Lengkap' },
  { key: 'email', label: 'Email' },
  { key: 'level', label: 'Level', render: (v) => {
    const vars = { Admin: 'default', Operator: 'secondary', Viewer: 'outline' };
    return <Badge variant={vars[v] || 'outline'}>{v}</Badge>;
  }},
  { key: 'status', label: 'Status', render: (v) => (
    <Badge variant={v === 'Aktif' ? 'success' : 'destructive'}>{v}</Badge>
  )},
];

const emptyForm = { username: '', nama: '', email: '', password: '', level: 'Operator', status: 'Aktif' };

export default function MasterPengguna() {
  const [data, setData] = useState(dummyData);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const filtered = data.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()) || d.username.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm({ ...row, password: '' }); setEditId(row.id); setModalOpen(true); };
  const handleDelete = (row) => { if (confirm(`Hapus pengguna "${row.nama}"?`)) { setData(data.filter((d) => d.id !== row.id)); toast.success('Pengguna berhasil dihapus'); } };
  const handleSave = (e) => {
    e.preventDefault();
    if (editId) { setData(data.map((d) => (d.id === editId ? { ...form, id: editId } : d))); toast.success('Pengguna berhasil diupdate'); }
    else { setData([...data, { ...form, id: Date.now() }]); toast.success('Pengguna berhasil ditambah'); }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader title="Master Pengguna" subtitle="Kelola data pengguna sistem" onAdd={openAdd} addLabel="Tambah Pengguna" searchValue={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Pengguna' : 'Tambah Pengguna'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Nama Lengkap</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>{editId ? 'Password (kosongkan jika tidak diubah)' : 'Password'}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editId} /></div>
          <div className="space-y-1.5">
            <Label>Level</Label>
            <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Operator">Operator</SelectItem><SelectItem value="Viewer">Viewer</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Aktif">Aktif</SelectItem><SelectItem value="Nonaktif">Nonaktif</SelectItem></SelectContent>
            </Select>
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
