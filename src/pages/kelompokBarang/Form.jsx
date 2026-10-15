import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw } from 'lucide-react';

export default function KelompokBarangForm({ open, editId, form, saving, generatingCode, onClose, onSubmit, onFieldChange, onGenerateCode }) {
  useUiLanguage();
  return (
    <Modal permission={editId ? 'update' : 'create'} isOpen={open} onClose={onClose} title={editId ? translateUi("Edit Kelompok") : translateUi("Tambah Kelompok")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="kelompok-kode">{translateUi("Kode")}</Label>
          <div className="flex gap-2">
            <Input id="kelompok-kode" value={form.kode} onChange={(event) => onFieldChange('kode', event.target.value)} required disabled={saving} />
            <Button type="button" variant="outline" size="icon" className="shrink-0" aria-label={translateUi("Buat Kode")} title={translateUi("Buat Kode")} onClick={onGenerateCode} aria-busy={generatingCode} disabled={saving || generatingCode}>
              <RefreshCw size={16} className={generatingCode ? "animate-spin" : undefined} /></Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kelompok-nama">{translateUi("Nama Kelompok")}</Label>
          <Input id="kelompok-nama" value={form.nama} onChange={(event) => onFieldChange('nama', event.target.value)} required disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kelompok-deskripsi">{translateUi("Deskripsi")}</Label>
          <Textarea id="kelompok-deskripsi" value={form.deskripsi || ''} onChange={(event) => onFieldChange('deskripsi', event.target.value)} disabled={saving} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{translateUi("Batal")}</Button>
          <Button type="submit" disabled={saving}>{saving ? translateUi("Menyimpan...") : translateUi("Simpan")}</Button>
        </div>
      </form>
    </Modal>
  );
}
