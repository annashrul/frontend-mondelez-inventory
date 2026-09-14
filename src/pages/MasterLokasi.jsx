import { useState, useEffect } from 'react';
import TableSkeleton from '@/components/TableSkeleton';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api, { emptyPagination, getList, getPagination } from '@/services/api';

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Lokasi' },
  { key: 'alamat', label: 'Alamat / Posisi' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'jumlah_rak', label: 'Jumlah Rak', render: (v) => <Badge variant="secondary">{v} rak</Badge> },
];

const emptyForm = { kode: '', nama: '', alamat: '', deskripsi: '' };

export default function MasterLokasi() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(emptyPagination);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/lokasi', { params: { search, page, limit } });
      setData(getList(res));
      setPagination(getPagination(res));
    } catch (error) { toast.error(error.message || 'Gagal mengambil data lokasi'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [search, page, limit]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditId(row.id); setModalOpen(true); };

  const handleDelete = async (row) => {
    try {
      await api.delete('/lokasi/' + row.id);
      setData((current) => current.filter((d) => d.id !== row.id));
      toast.success('Lokasi berhasil dihapus');
    } catch (error) { toast.error(error.message || 'Gagal menghapus lokasi'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await api.put('/lokasi/' + editId, form);
        setData((current) => current.map((d) => (d.id === editId ? res : d)));
        toast.success('Lokasi berhasil diupdate');
      } else {
        const res = await api.post('/lokasi', form);
        setData((current) => [...current, res]);
        toast.success('Lokasi berhasil ditambah');
      }
      setModalOpen(false);
    } catch (error) { toast.error(error.message || 'Gagal menyimpan lokasi'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Master Lokasi" subtitle="Kelola data lokasi penyimpanan" onAdd={openAdd} addLabel="Tambah Lokasi" searchValue={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} />
      {loading ? <TableSkeleton /> : (
      <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} pagination={pagination} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Lokasi' : 'Tambah Lokasi'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="lokasi-kode">Kode</Label><Input id="lokasi-kode" value={form.kode} onChange={(e) => setForm((current) => ({ ...current, kode: e.target.value }))} required disabled={saving} /></div>
          <div className="space-y-1.5"><Label htmlFor="lokasi-nama">Nama Lokasi</Label><Input id="lokasi-nama" value={form.nama} onChange={(e) => setForm((current) => ({ ...current, nama: e.target.value }))} required disabled={saving} /></div>
          <div className="space-y-1.5"><Label htmlFor="lokasi-alamat">Alamat / Posisi</Label><Input id="lokasi-alamat" value={form.alamat || ''} onChange={(e) => setForm((current) => ({ ...current, alamat: e.target.value }))} disabled={saving} /></div>
          <div className="space-y-1.5"><Label htmlFor="lokasi-deskripsi">Deskripsi</Label><Textarea id="lokasi-deskripsi" value={form.deskripsi || ''} onChange={(e) => setForm((current) => ({ ...current, deskripsi: e.target.value }))} disabled={saving} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
