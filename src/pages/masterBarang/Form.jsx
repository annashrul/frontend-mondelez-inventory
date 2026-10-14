import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import Modal, { ModalFooter } from '@/components/Modal';
import { AsyncCombobox } from '@/components/ui/async-combobox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Wand2 } from 'lucide-react';
import { parseNumberInput } from '@/lib/utils';
import { getKelompokOptions, getRakOptions, getSatuanOptions } from '@/services/barangService';

function FormField({ field, label, type = 'text', value, onChange }) {
  useUiLanguage();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(field, type === 'number' ? parseNumberInput(event.target.value) : event.target.value)}
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
  useUiLanguage();
  return (
    <Modal isOpen={open} onClose={onClose} title={editId ? translateUi("Edit Barang") : translateUi("Tambah Barang")} size="xl">
      <form id="barang-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="kode">{translateUi("Kode Barang")}</Label>
          <div className="flex gap-2">
            <Input id="kode" value={form.kode} onChange={(event) => onFieldChange('kode', event.target.value)} required />
            <Button type="button" variant="outline" className="shrink-0 gap-2" onClick={onGenerateCode} disabled={saving || generatingCode}>
              {generatingCode ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 size={16} />}{translateUi("Buat Kode")}</Button>
          </div>
        </div>
        <FormField field="barcode" label={translateUi("Barcode")} value={form.barcode} onChange={onFieldChange} />
        <FormField field="nama" label={translateUi("Nama Barang")} value={form.nama} onChange={onFieldChange} />
        <div className="space-y-1.5">
          <Label>{translateUi("Kelompok Barang")}</Label>
          <AsyncCombobox
            value={String(form.kelompok_id || '')}
            selectedOption={form.kelompok_id ? { value: String(form.kelompok_id), label: form.kelompok_detail?.nama } : null}
            onValueChange={(val) => onFieldChange('kelompok_id', Number(val))}
            loadOptions={getKelompokOptions}
            placeholder={translateUi("Pilih kelompok...")}
            searchPlaceholder={translateUi("Cari kelompok...")}
            emptyText={translateUi("Kelompok tidak ditemukan.")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{translateUi("Satuan")}</Label>
          <AsyncCombobox
            value={String(form.satuan_id || '')}
            selectedOption={form.satuan_id ? { value: String(form.satuan_id), label: form.satuan_detail?.nama } : null}
            onValueChange={(val) => onFieldChange('satuan_id', Number(val))}
            loadOptions={getSatuanOptions}
            placeholder={translateUi("Pilih satuan...")}
            searchPlaceholder={translateUi("Cari satuan...")}
            emptyText={translateUi("Satuan tidak ditemukan.")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{translateUi("Rak")}</Label>
          <AsyncCombobox
            value={String(form.rak_id || '')}
            selectedOption={form.rak_id ? { value: String(form.rak_id), label: form.rak_detail?.nama } : null}
            onValueChange={(val) => onFieldChange('rak_id', Number(val))}
            loadOptions={getRakOptions}
            placeholder={translateUi("Pilih rak...")}
            searchPlaceholder={translateUi("Cari rak...")}
            emptyText={translateUi("Rak tidak ditemukan.")}
          />
        </div>
        <FormField field="stok" label={translateUi("Stok")} type="number" value={form.stok} onChange={onFieldChange} />
        <FormField field="stok_min" label={translateUi("Stok Minimum")} type="number" value={form.stok_min} onChange={onFieldChange} />
        <FormField field="harga" label={translateUi("Harga")} type="number" value={form.harga} onChange={onFieldChange} />
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="image">{translateUi("Gambar Barang")}</Label>
          <div className="flex items-center gap-4 rounded-xl border p-3">
            {preview ? (
              <img src={preview} alt={translateUi("Preview barang")} className="size-24 rounded-lg border object-cover" />
            ) : (
              <div className="grid size-24 place-items-center rounded-lg bg-muted text-center text-xs text-muted-foreground">{translateUi("Belum ada gambar")}</div>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <Input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} disabled={saving} />
              <p className="text-xs text-muted-foreground">{translateUi("JPEG, PNG, atau WebP; maksimal 5 MB. Gambar baru otomatis diproses menjadi embedding AI.")}</p>
              {form.has_embedding && !imageFile && <Badge variant="success">{translateUi("Embedding tersedia - ")}{form.embedding_model}</Badge>}
              {imageFile && <Badge variant="info">{translateUi("Embedding dibuat saat disimpan")}</Badge>}
            </div>
          </div>
        </div>
      </form>
      <ModalFooter className="-mx-5 -mb-5 mt-6 sm:-mx-6 sm:-mb-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{translateUi("Batal")}</Button>
        <Button type="submit" form="barang-form" disabled={saving}>{saving ? translateUi("Memproses gambar...") : translateUi("Simpan")}</Button>
      </ModalFooter>
    </Modal>
  );
}
