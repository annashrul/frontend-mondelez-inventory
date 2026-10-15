import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import { parseNumberInput } from '@/lib/utils';

export default function MasterRakForm({ open, editId, form, saving, generatingCode, lokasiOptions, onClose, onSubmit, onFieldChange, onGenerateCode }) {
  useUiLanguage();
  return (
    <Modal permission={editId ? 'update' : 'create'} isOpen={open} onClose={onClose} title={editId ? translateUi("Edit Rak") : translateUi("Tambah Rak")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rak-kode">{translateUi("Kode Rak")}</Label>
          <div className="flex gap-2">
            <Input
              id="rak-kode"
              value={form.kode}
              onChange={(event) => {
                const kode = event.target.value.toUpperCase();
                onFieldChange('kode', kode);
                if (!editId) onFieldChange('qr_code', `RAK:${kode}`);
              }}
              required
              disabled={saving}
            />
            <Button type="button" variant="outline" size="icon" className="shrink-0" aria-label={translateUi("Buat Kode")} title={translateUi("Buat Kode")} onClick={onGenerateCode} aria-busy={generatingCode} disabled={saving || generatingCode}>
              <RefreshCw size={16} className={generatingCode ? "animate-spin" : undefined} /></Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rak-qr">{translateUi("Nilai QR Unik")}</Label>
          <Input id="rak-qr" value={form.qr_code} onChange={(event) => onFieldChange('qr_code', event.target.value)} placeholder={"RAK:RAK-A01"} required disabled={saving} />
          <p className="text-xs text-muted-foreground">{translateUi("Satu rak wajib memiliki satu nilai QR unik.")}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rak-nama">{translateUi("Nama Rak")}</Label>
          <Input id="rak-nama" value={form.nama} onChange={(event) => onFieldChange('nama', event.target.value)} required disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label>{translateUi("Lokasi")}</Label>
          <Combobox
            options={lokasiOptions}
            value={String(form.lokasi_id || '')}
            onValueChange={(value) => onFieldChange('lokasi_id', Number(value))}
            placeholder={translateUi("Pilih lokasi...")}
            searchPlaceholder={translateUi("Cari lokasi...")}
            emptyText={translateUi("Lokasi tidak ditemukan.")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rak-kapasitas">{translateUi("Kapasitas")}</Label>
          <Input id="rak-kapasitas" type="number" min="0" value={form.kapasitas ?? ''} onChange={(event) => onFieldChange('kapasitas', parseNumberInput(event.target.value))} required disabled={saving} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{translateUi("Batal")}</Button>
          <Button type="submit" disabled={saving}>{saving ? translateUi("Menyimpan...") : translateUi("Simpan")}</Button>
        </div>
      </form>
    </Modal>
  );
}
