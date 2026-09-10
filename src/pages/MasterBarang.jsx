import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';

const dummyData = [
  { id: 1, kode: 'BRG-001', nama: 'Kertas A4 70gsm', kelompok: 'Alat Tulis Kantor', satuan: 'Rim', rak: 'Rak A-01', stok: 150, stok_min: 50, harga: 45000 },
  { id: 2, kode: 'BRG-002', nama: 'Pulpen Pilot G-2', kelompok: 'Alat Tulis Kantor', satuan: 'Pcs', rak: 'Rak A-02', stok: 200, stok_min: 30, harga: 15000 },
  { id: 3, kode: 'BRG-003', nama: 'Tinta Printer HP', kelompok: 'IT Supply', satuan: 'Pcs', rak: 'Rak B-01', stok: 8, stok_min: 10, harga: 250000 },
  { id: 4, kode: 'BRG-004', nama: 'Map Ordner', kelompok: 'Alat Tulis Kantor', satuan: 'Pcs', rak: 'Rak A-03', stok: 45, stok_min: 25, harga: 35000 },
  { id: 5, kode: 'BRG-005', nama: 'Amplop Coklat F4', kelompok: 'Alat Tulis Kantor', satuan: 'Box', rak: 'Rak A-04', stok: 12, stok_min: 20, harga: 55000 },
];

const kelompokOptions = [
  { value: 'Alat Tulis Kantor', label: 'Alat Tulis Kantor' },
  { value: 'IT Supply', label: 'IT Supply' },
  { value: 'Kebersihan', label: 'Kebersihan' },
  { value: 'Elektrikal', label: 'Elektrikal' },
];

const satuanOptions = [
  { value: 'Pcs', label: 'Pcs' },
  { value: 'Box', label: 'Box' },
  { value: 'Rim', label: 'Rim' },
  { value: 'Roll', label: 'Roll' },
  { value: 'Lusin', label: 'Lusin' },
  { value: 'Pack', label: 'Pack' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Liter', label: 'Liter' },
];

const rakOptions = [
  { value: 'Rak A-01', label: 'Rak A-01 — Gudang Utama Lt.1' },
  { value: 'Rak A-02', label: 'Rak A-02 — Gudang Utama Lt.1' },
  { value: 'Rak A-03', label: 'Rak A-03 — Gudang Utama Lt.1' },
  { value: 'Rak A-04', label: 'Rak A-04 — Gudang Utama Lt.1' },
  { value: 'Rak B-01', label: 'Rak B-01 — Gudang Utama Lt.2' },
  { value: 'Rak B-02', label: 'Rak B-02 — Gudang Utama Lt.2' },
  { value: 'Rak C-01', label: 'Rak C-01 — Gudang Sekunder' },
];

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Barang' },
  { key: 'kelompok', label: 'Kelompok' },
  { key: 'satuan', label: 'Satuan' },
  { key: 'rak', label: 'Rak' },
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
];

const emptyForm = { kode: '', nama: '', kelompok: '', satuan: '', rak: '', stok: 0, stok_min: 0, harga: 0 };
export default function MasterBarang() {
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
    if (confirm(`Hapus barang "${row.nama}"?`)) {
      setData(data.filter((d) => d.id !== row.id));
      toast.success('Barang berhasil dihapus');
    }
  };
  const handleSave = (e) => {
    e.preventDefault();
    if (editId) {
      setData(data.map((d) => (d.id === editId ? { ...form, id: editId } : d)));
      toast.success('Barang berhasil diupdate');
    } else {
      setData([...data, { ...form, id: Date.now() }]);
      toast.success('Barang berhasil ditambah');
    }
    setModalOpen(false);
  };

  const F = ({ field, label, type = 'text' }) => (
    <div className="space-y-1.5">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type={type}
        value={form[field]}
        onChange={(e) => setForm({ ...form, [field]: type === 'number' ? Number(e.target.value) : e.target.value })}
        required
      />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Master Barang"
        subtitle="Kelola data barang inventory"
        onAdd={openAdd}
        addLabel="Tambah Barang"
        searchValue={search}
        onSearchChange={setSearch}
      />
      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Barang' : 'Tambah Barang'} size="lg">
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <F field="kode" label="Kode Barang" />
          <F field="nama" label="Nama Barang" />
          <div className="space-y-1.5">
            <Label>Kelompok Barang</Label>
            <Combobox
              options={kelompokOptions}
              value={form.kelompok}
              onValueChange={(val) => setForm({ ...form, kelompok: val })}
              placeholder="Pilih kelompok..."
              searchPlaceholder="Cari kelompok..."
              emptyText="Kelompok tidak ditemukan."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Satuan</Label>
            <Combobox
              options={satuanOptions}
              value={form.satuan}
              onValueChange={(val) => setForm({ ...form, satuan: val })}
              placeholder="Pilih satuan..."
              searchPlaceholder="Cari satuan..."
              emptyText="Satuan tidak ditemukan."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Rak</Label>
            <Combobox
              options={rakOptions}
              value={form.rak}
              onValueChange={(val) => setForm({ ...form, rak: val })}
              placeholder="Pilih rak..."
              searchPlaceholder="Cari rak..."
              emptyText="Rak tidak ditemukan."
            />
          </div>
          <F field="stok" label="Stok" type="number" />
          <F field="stok_min" label="Stok Minimum" type="number" />
          <F field="harga" label="Harga" type="number" />
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
