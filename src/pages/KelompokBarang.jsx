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
  { key: 'nama', label: 'Nama Kelompok' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'jumlah_barang', label: 'Jumlah Barang', render: (v) => <Badge variant="secondary">{v} item</Badge> },
];

const emptyForm = { kode: '', nama: '', deskripsi: '' };

export default function KelompokBarang() {
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
      const res = await api.get('/kelompok-barang', { params: { search, page, limit } });
      setData(getList(res));
      setPagination(getPagination(res));
    } catch (error) {
      toast.error(error.message || 'Gagal mengambil data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [search, page, limit]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditId(row.id); setModalOpen(true); };

  const handleDelete = async (row) => {
    try {
      await api.delete(`/kelompok-barang/${row.id}`);
      setData((current) => current.filter((d) => d.id !== row.id));
      toast.success('Kelompok berhasil dihapus');
    } catch (error) {
      toast.error(error.message || 'Gagal menghapus kelompok');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await api.put(`/kelompok-barang/${editId}`, form);
        setData((current) => current.map((d) => (d.id === editId ? res : d)));
        toast.success('Kelompok berhasil diupdate');
      } else {
        const res = await api.post('/kelompok-barang', form);
        setData((current) => [...current, res]);
        toast.success('Kelompok berhasil ditambah');
      }
      setModalOpen(false);
    } catch (error) { toast.error(error.message || 'Gagal menyimpan kelompok'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Kelompok Barang" subtitle="Kelola kategori/kelompok barang" onAdd={openAdd} addLabel="Tambah Kelompok" searchValue={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} />
      {loading ? ( <TableSkeleton /> ) : (
      <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} pagination={pagination} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Kelompok' : 'Tambah Kelompok'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="kelompok-kode">Kode</Label><Input id="kelompok-kode" value={form.kode} onChange={(e) => setForm((current) => ({ ...current, kode: e.target.value }))} required disabled={saving} /></div>
          <div className="space-y-1.5"><Label htmlFor="kelompok-nama">Nama Kelompok</Label><Input id="kelompok-nama" value={form.nama} onChange={(e) => setForm((current) => ({ ...current, nama: e.target.value }))} required disabled={saving} /></div>
          <div className="space-y-1.5"><Label htmlFor="kelompok-deskripsi">Deskripsi</Label><Textarea id="kelompok-deskripsi" value={form.deskripsi || ''} onChange={(e) => setForm((current) => ({ ...current, deskripsi: e.target.value }))} disabled={saving} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
