import Modal, { ModalFooter } from '@/components/Modal';
import { AsyncCombobox } from '@/components/ui/async-combobox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Wand2 } from 'lucide-react';
import { getKelompokOptions, getRakOptions, getSatuanOptions } from '@/services/barangService';

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

export default function MasterBarangForm({
  open,
  editId,
  form,
  preview,
  imageFile,
  saving,
  generatingCode,
  onClose,
  onSubmit,
  onFieldChange,
  onImageChange,
  onGenerateCode,
}) {
  return (
    <Modal isOpen={open} onClose={onClose} title={editId ? 'Edit Barang' : 'Tambah Barang'} size="xl">
      <form id="barang-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="kode">Kode Barang</Label>
          <div className="flex gap-2">
            <Input id="kode" value={form.kode} onChange={(event) => onFieldChange('kode', event.target.value)} required />
            <Button type="button" variant="outline" className="shrink-0 gap-2" onClick={onGenerateCode} disabled={saving || generatingCode}>
              {generatingCode ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 size={16} />}
              Generate
            </Button>
          </div>
        </div>
        <FormField field="barcode" label="Barcode" value={form.barcode} onChange={onFieldChange} />
        <FormField field="nama" label="Nama Barang" value={form.nama} onChange={onFieldChange} />
        <div className="space-y-1.5">
          <Label>Kelompok Barang</Label>
          <AsyncCombobox
            value={String(form.kelompok_id || '')}
            selectedOption={form.kelompok_id ? { value: String(form.kelompok_id), label: form.kelompok_detail?.nama } : null}
            onValueChange={(val) => onFieldChange('kelompok_id', Number(val))}
            loadOptions={getKelompokOptions}
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
            onValueChange={(val) => onFieldChange('satuan_id', Number(val))}
            loadOptions={getSatuanOptions}
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
            onValueChange={(val) => onFieldChange('rak_id', Number(val))}
            loadOptions={getRakOptions}
            placeholder="Pilih rak..."
            searchPlaceholder="Cari rak..."
            emptyText="Rak tidak ditemukan."
          />
        </div>
        <FormField field="stok" label="Stok" type="number" value={form.stok} onChange={onFieldChange} />
        <FormField field="stok_min" label="Stok Minimum" type="number" value={form.stok_min} onChange={onFieldChange} />
        <FormField field="harga" label="Harga" type="number" value={form.harga} onChange={onFieldChange} />
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="image">Gambar Barang</Label>
          <div className="flex items-center gap-4 rounded-xl border p-3">
            {preview ? (
              <img src={preview} alt="Preview barang" className="size-24 rounded-lg border object-cover" />
            ) : (
              <div className="grid size-24 place-items-center rounded-lg bg-muted text-center text-xs text-muted-foreground">Belum ada gambar</div>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <Input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} disabled={saving} />
              <p className="text-xs text-muted-foreground">JPEG, PNG, atau WebP; maksimal 5 MB. Gambar baru otomatis diproses menjadi embedding AI.</p>
              {form.has_embedding && !imageFile && <Badge variant="success">Embedding tersedia - {form.embedding_model}</Badge>}
              {imageFile && <Badge variant="info">Embedding dibuat saat disimpan</Badge>}
            </div>
          </div>
        </div>
      </form>
      <ModalFooter className="-mx-5 -mb-5 mt-6 sm:-mx-6 sm:-mb-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
        <Button type="submit" form="barang-form" disabled={saving}>{saving ? 'Memproses gambar...' : 'Simpan'}</Button>
      </ModalFooter>
    </Modal>
  );
}
