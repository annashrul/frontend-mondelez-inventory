import { useState, useEffect, useCallback } from 'react';
import TableSkeleton from '@/components/TableSkeleton';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal, { ModalFooter } from '@/components/Modal';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AsyncCombobox } from '@/components/ui/async-combobox';
import api, { emptyPagination, getList, getPagination } from '@/services/api';

const columns = [
  {
    key: 'image_url',
    label: 'Gambar',
    render: (val, row) => (
      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted text-center text-[10px] leading-tight text-muted-foreground">
        {val ? <img src={val} alt={row.nama} className="size-full object-cover" /> : 'Belum ada'}
      </div>
    ),
  },
  { key: 'kode', label: 'Kode' },
  { key: 'barcode', label: 'Barcode' },
  { key: 'nama', label: 'Nama Barang' },
  { key: 'kelompok_detail', label: 'Kelompok', render: (value) => value?.nama || '-' },
  { key: 'satuan_detail', label: 'Satuan', render: (value) => value?.nama || '-' },
  { key: 'rak_detail', label: 'Rak', render: (value) => value?.nama || '-' },
  {
    key: 'stok', label: 'Stok',
    render: (val, row) => (
      <span className={`font-semibold ${val <= row.stok_min ? 'text-red-600' : 'text-green-600'}`}>{val}</span>
    ),
  },
  {
    key: 'harga', label: 'Harga',
    render: (val) => `Rp ${val?.toLocaleString('id-ID')}`,
  },
  { key: 'has_embedding', label: 'AI', render: (val, row) => <Badge variant={val ? 'success' : 'outline'} title={row.embedding_model || ''}>{val ? 'Siap dicari' : 'Belum ada'}</Badge> },
];

const emptyForm = { kode: '', barcode: '', nama: '', kelompok_id: '', satuan_id: '', rak_id: '', stok: 0, stok_min: 0, harga: 0 };

function FormField({ field, label, type = 'text', value, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type={type}
        value={value}
        onChange={(event) => onChange(field, type === 'number' ? Number(event.target.value) : event.target.value)}
        required
      />
    </div>
  );
}

export default function MasterBarang() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(emptyPagination);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resBarang = await api.get('/barang', { params: { search, page, limit } });
      setData(getList(resBarang));
      setPagination(getPagination(resBarang));
    } catch (err) {
      toast.error(err.message || 'Gagal mengambil data master');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [search, page, limit]);

  const resetImage = () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); setImageFile(null); setPreview(''); };
  const openAdd = () => { resetImage(); setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (row) => { resetImage(); setForm(row); setPreview(row.image_url || ''); setEditId(row.id); setModalOpen(true); };
  const closeModal = () => { resetImage(); setModalOpen(false); };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Gunakan gambar JPEG, PNG, atau WebP');
    if (file.size > 5 * 1024 * 1024) return toast.error('Ukuran gambar maksimal 5 MB');
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDelete = async (row) => {
    try {
      await api.delete(`/barang/${row.id}`);
      setData(data.filter((d) => d.id !== row.id));
      toast.success('Barang berhasil dihapus');
    } catch (e) {
      toast.error(e.message || 'Gagal menghapus barang');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = imageFile ? new FormData() : form;
      if (imageFile) {
        Object.entries(form).forEach(([key, value]) => {
          if (!['image_path', 'image_url', 'embedding_model', 'has_embedding', 'created_at', 'updated_at', 'id'].includes(key)) payload.append(key, value ?? '');
        });
        payload.append('image', imageFile);
      }
      if (editId) {
        const res = await api.put(`/barang/${editId}`, payload);
        setData(data.map((d) => (d.id === editId ? res : d)));
        toast.success('Barang berhasil diupdate');
      } else {
        const res = await api.post('/barang', payload);
        setData([...data, res]);
        toast.success('Barang berhasil ditambah');
      }
      closeModal();
    } catch (e) {
      toast.error(e.message || 'Gagal menyimpan barang');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const loadKelompok = useCallback(async (query) => {
    const rows = await api.get('/kelompok-barang', { params: { search: query, limit: 100 } });
    return getList(rows).map((item) => ({ value: String(item.id), label: `${item.kode} — ${item.nama}` }));
  }, []);
  const loadSatuan = useCallback(async (query) => {
    const rows = await api.get('/satuan', { params: { search: query, limit: 100 } });
    return getList(rows).map((item) => ({ value: String(item.id), label: `${item.kode} — ${item.nama}` }));
  }, []);
  const loadRak = useCallback(async (query) => {
    const rows = await api.get('/rak', { params: { search: query, limit: 100 } });
    return getList(rows).map((item) => ({ value: String(item.id), label: `${item.kode} — ${item.nama} · ${item.lokasi_detail?.nama}` }));
  }, []);

  return (
    <div>
      <PageHeader
        title="Master Barang"
        subtitle="Kelola data barang inventory"
        onAdd={openAdd}
        addLabel="Tambah Barang"
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
      />
      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} pagination={pagination} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} actionColumnFixed="right" />
      )}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editId ? 'Edit Barang' : 'Tambah Barang'} size="xl">
        <form id="barang-form" onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
          <FormField field="kode" label="Kode Barang" value={form.kode} onChange={updateField} />
          <FormField field="barcode" label="Barcode" value={form.barcode} onChange={updateField} />
          <FormField field="nama" label="Nama Barang" value={form.nama} onChange={updateField} />
          <div className="space-y-1.5">
            <Label>Kelompok Barang</Label>
            <AsyncCombobox
              value={String(form.kelompok_id || '')}
              selectedOption={form.kelompok_id ? { value: String(form.kelompok_id), label: form.kelompok_detail?.nama } : null}
              onValueChange={(val) => updateField('kelompok_id', Number(val))}
              loadOptions={loadKelompok}
              placeholder="Pilih kelompok..."
              searchPlaceholder="Cari kelompok..."
              emptyText="Kelompok tidak ditemukan."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Satuan</Label>
            <AsyncCombobox
              value={String(form.satuan_id || '')}
              selectedOption={form.satuan_id ? { value: String(form.satuan_id), label: form.satuan_detail?.nama } : null}
              onValueChange={(val) => updateField('satuan_id', Number(val))}
              loadOptions={loadSatuan}
              placeholder="Pilih satuan..."
              searchPlaceholder="Cari satuan..."
              emptyText="Satuan tidak ditemukan."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Rak</Label>
            <AsyncCombobox
              value={String(form.rak_id || '')}
              selectedOption={form.rak_id ? { value: String(form.rak_id), label: form.rak_detail?.nama } : null}
              onValueChange={(val) => updateField('rak_id', Number(val))}
              loadOptions={loadRak}
              placeholder="Pilih rak..."
              searchPlaceholder="Cari rak..."
              emptyText="Rak tidak ditemukan."
            />
          </div>
          <FormField field="stok" label="Stok" type="number" value={form.stok} onChange={updateField} />
          <FormField field="stok_min" label="Stok Minimum" type="number" value={form.stok_min} onChange={updateField} />
          <FormField field="harga" label="Harga" type="number" value={form.harga} onChange={updateField} />
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="image">Gambar Barang</Label>
            <div className="flex items-center gap-4 rounded-xl border p-3">
              {preview ? <img src={preview} alt="Preview barang" className="size-24 rounded-lg border object-cover" /> : <div className="grid size-24 place-items-center rounded-lg bg-muted text-center text-xs text-muted-foreground">Belum ada gambar</div>}
              <div className="min-w-0 flex-1 space-y-2">
                <Input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} disabled={saving} />
                <p className="text-xs text-muted-foreground">JPEG, PNG, atau WebP; maksimal 5 MB. Gambar baru otomatis diproses menjadi embedding AI.</p>
                {form.has_embedding && !imageFile && <Badge variant="success">Embedding tersedia · {form.embedding_model}</Badge>}
                {imageFile && <Badge variant="info">Embedding dibuat saat disimpan</Badge>}
              </div>
            </div>
          </div>
        </form>
        <ModalFooter className="-mx-5 -mb-5 mt-6 sm:-mx-6 sm:-mb-6">
          <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>Batal</Button>
          <Button type="submit" form="barang-form" disabled={saving}>{saving ? 'Memproses gambar...' : 'Simpan'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
