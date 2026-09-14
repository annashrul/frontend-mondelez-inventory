import { useState, useEffect } from 'react';
import TableSkeleton from '@/components/TableSkeleton';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import api, { emptyPagination, getList, getPagination } from '@/services/api';

const columns = [
  { key: 'kode', label: 'Kode Rak' },
  { key: 'qr_code', label: 'Isi QR', render: (v) => <code className="text-xs">{v}</code> },
  { key: 'nama', label: 'Nama Rak' },
  { key: 'lokasi_detail', label: 'Lokasi', render: (value) => value?.nama || '-' },
  { key: 'kapasitas', label: 'Kapasitas' },
  { key: 'terisi', label: 'Terisi', render: (v, row) => {
    const pct = row.kapasitas > 0 ? Math.min(100, Math.round((v / row.kapasitas) * 100)) : 0;
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

const emptyForm = { kode: '', qr_code: '', nama: '', lokasi_id: '', kapasitas: 0 };

export default function MasterRak() {
  const [data, setData] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
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
      const [resRak, resLokasi] = await Promise.all([
        api.get('/rak', { params: { search, page, limit } }),
        api.get('/lokasi', { params: { limit: 100 } })
      ]);
      setData(getList(resRak));
      setPagination(getPagination(resRak));
      setLokasiOptions(getList(resLokasi).map((l) => ({ value: String(l.id), label: l.nama })));
    } catch (error) { toast.error(error.message || 'Gagal mengambil data rak'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [search, page, limit]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditId(row.id); setModalOpen(true); };
  const handleDelete = async (row) => {
    try {
      await api.delete('/rak/' + row.id);
      setData((current) => current.filter((d) => d.id !== row.id));
      toast.success('Rak berhasil dihapus');
    } catch (error) { toast.error(error.message || 'Gagal menghapus rak'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await api.put('/rak/' + editId, form);
        setData((current) => current.map((d) => (d.id === editId ? res : d)));
        toast.success('Rak berhasil diupdate');
      } else {
        const res = await api.post('/rak', { ...form, qr_code: form.qr_code || `RAK:${form.kode}` });
        setData((current) => [...current, res]);
        toast.success('Rak berhasil ditambah');
      }
      setModalOpen(false);
    } catch (error) { toast.error(error.message || 'Gagal menyimpan rak'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Master Rak Barang" subtitle="Kelola lokasi rak penyimpanan" onAdd={openAdd} addLabel="Tambah Rak" searchValue={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} />
      {loading ? <TableSkeleton /> : (
      <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} pagination={pagination} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Rak' : 'Tambah Rak'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="rak-kode">Kode Rak</Label><Input id="rak-kode" value={form.kode} onChange={(e) => { const kode = e.target.value.toUpperCase(); setForm((current) => ({ ...current, kode, qr_code: editId ? current.qr_code : `RAK:${kode}` })); }} required disabled={saving} /></div>
          <div className="space-y-1.5"><Label htmlFor="rak-qr">Nilai QR Unik</Label><Input id="rak-qr" value={form.qr_code} onChange={(e) => setForm((current) => ({ ...current, qr_code: e.target.value }))} placeholder="RAK:RAK-A01" required disabled={saving} /><p className="text-xs text-muted-foreground">Satu rak wajib memiliki satu nilai QR unik.</p></div>
          <div className="space-y-1.5"><Label htmlFor="rak-nama">Nama Rak</Label><Input id="rak-nama" value={form.nama} onChange={(e) => setForm((current) => ({ ...current, nama: e.target.value }))} required disabled={saving} /></div>
          <div className="space-y-1.5">
            <Label>Lokasi</Label>
            <Combobox
              options={lokasiOptions}
              value={String(form.lokasi_id || '')}
              onValueChange={(val) => setForm((current) => ({ ...current, lokasi_id: Number(val) }))}
              placeholder="Pilih lokasi..."
              searchPlaceholder="Cari lokasi..."
              emptyText="Lokasi tidak ditemukan."
            />
          </div>
          <div className="space-y-1.5"><Label htmlFor="rak-kapasitas">Kapasitas</Label><Input id="rak-kapasitas" type="number" min="0" value={form.kapasitas} onChange={(e) => setForm((current) => ({ ...current, kapasitas: Number(e.target.value) }))} required disabled={saving} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
