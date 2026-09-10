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
  { id: 1, kode: 'LOK-001', nama: 'Gudang Utama - Lantai 1', alamat: 'Gedung A, Lantai 1', deskripsi: 'Gudang utama penyimpanan barang lantai dasar', jumlah_rak: 4 },
  { id: 2, kode: 'LOK-002', nama: 'Gudang Utama - Lantai 2', alamat: 'Gedung A, Lantai 2', deskripsi: 'Gudang utama penyimpanan barang lantai atas', jumlah_rak: 2 },
  { id: 3, kode: 'LOK-003', nama: 'Gudang Sekunder', alamat: 'Gedung B', deskripsi: 'Gudang tambahan untuk overflow barang', jumlah_rak: 1 },
  { id: 4, kode: 'LOK-004', nama: 'Ruang Arsip', alamat: 'Gedung A, Lantai 3', deskripsi: 'Ruang penyimpanan dokumen dan arsip', jumlah_rak: 0 },
];

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Lokasi' },
  { key: 'alamat', label: 'Alamat / Posisi' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'jumlah_rak', label: 'Jumlah Rak', render: (v) => <Badge variant="secondary">{v} rak</Badge> },
];

const emptyForm = { kode: '', nama: '', alamat: '', deskripsi: '' };

export default function MasterLokasi() {
  const [data, setData] = useState(dummyData);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const filtered = data.filter((d) =>
    d.nama.toLowerCase().includes(search.toLowerCase()) ||
    d.kode.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditId(row.id); setModalOpen(true); };
  const handleDelete = (row) => {
    if (confirm(`Hapus lokasi "${row.nama}"?`)) {
      setData(data.filter((d) => d.id !== row.id));
      toast.success('Lokasi berhasil dihapus');
    }
  };
  const handleSave = (e) => {
    e.preventDefault();
    if (editId) {
      setData(data.map((d) => (d.id === editId ? { ...form, id: editId } : d)));
      toast.success('Lokasi berhasil diupdate');
    } else {
      setData([...data, { ...form, id: Date.now(), jumlah_rak: 0 }]);
      toast.success('Lokasi berhasil ditambah');
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader title="Master Lokasi" subtitle="Kelola data lokasi penyimpanan" onAdd={openAdd} addLabel="Tambah Lokasi" searchValue={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Lokasi' : 'Tambah Lokasi'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label>Kode</Label><Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Nama Lokasi</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Alamat / Posisi</Label><Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></div>
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
