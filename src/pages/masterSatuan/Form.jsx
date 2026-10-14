import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Wand2 } from 'lucide-react';

export default function MasterSatuanForm({ open, editId, form, saving, generatingCode, onClose, onSubmit, onFieldChange, onGenerateCode }) {
  useUiLanguage();
  return (
    <Modal isOpen={open} onClose={onClose} title={editId ? translateUi("Edit Satuan") : translateUi("Tambah Satuan")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="satuan-kode">{translateUi("Kode")}</Label>
          <div className="flex gap-2">
            <Input id="satuan-kode" value={form.kode} onChange={(event) => onFieldChange('kode', event.target.value)} required disabled={saving} />
            <Button type="button" variant="outline" className="shrink-0 gap-2" onClick={onGenerateCode} disabled={saving || generatingCode}>
              {generatingCode ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 size={16} />}{translateUi("Buat Kode")}</Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="satuan-nama">{translateUi("Nama Satuan")}</Label>
          <Input id="satuan-nama" value={form.nama} onChange={(event) => onFieldChange('nama', event.target.value)} required disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="satuan-deskripsi">{translateUi("Deskripsi")}</Label>
          <Textarea id="satuan-deskripsi" value={form.deskripsi || ''} onChange={(event) => onFieldChange('deskripsi', event.target.value)} disabled={saving} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{translateUi("Batal")}</Button>
          <Button type="submit" disabled={saving}>{saving ? translateUi("Menyimpan...") : translateUi("Simpan")}</Button>
        </div>
      </form>
    </Modal>
  );
}
