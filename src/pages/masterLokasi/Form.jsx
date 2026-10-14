import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw } from 'lucide-react';

export default function MasterLokasiForm({ open, editId, form, saving, generatingCode, onClose, onSubmit, onFieldChange, onGenerateCode }) {
  useUiLanguage();
  return (
    <Modal isOpen={open} onClose={onClose} title={editId ? translateUi("Edit Lokasi") : translateUi("Tambah Lokasi")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="lokasi-kode">{translateUi("Kode")}</Label>
          <div className="flex gap-2">
            <Input id="lokasi-kode" value={form.kode} onChange={(event) => onFieldChange('kode', event.target.value)} required disabled={saving} />
            <Button type="button" variant="outline" size="icon" className="shrink-0" aria-label={translateUi("Buat Kode")} title={translateUi("Buat Kode")} onClick={onGenerateCode} aria-busy={generatingCode} disabled={saving || generatingCode}>
              <RefreshCw size={16} className={generatingCode ? "animate-spin" : undefined} /></Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lokasi-nama">{translateUi("Nama Lokasi")}</Label>
          <Input id="lokasi-nama" value={form.nama} onChange={(event) => onFieldChange('nama', event.target.value)} required disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lokasi-alamat">{translateUi("Alamat / Posisi")}</Label>
          <Input id="lokasi-alamat" value={form.alamat || ''} onChange={(event) => onFieldChange('alamat', event.target.value)} disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lokasi-deskripsi">{translateUi("Deskripsi")}</Label>
          <Textarea id="lokasi-deskripsi" value={form.deskripsi || ''} onChange={(event) => onFieldChange('deskripsi', event.target.value)} disabled={saving} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{translateUi("Batal")}</Button>
          <Button type="submit" disabled={saving}>{saving ? translateUi("Menyimpan...") : translateUi("Simpan")}</Button>
        </div>
      </form>
    </Modal>
  );
}
