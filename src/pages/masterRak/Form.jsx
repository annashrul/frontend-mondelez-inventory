import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Wand2 } from 'lucide-react';

export default function MasterRakForm({ open, editId, form, saving, generatingCode, lokasiOptions, onClose, onSubmit, onFieldChange, onGenerateCode }) {
  return (
    <Modal isOpen={open} onClose={onClose} title={editId ? 'Edit Rak' : 'Tambah Rak'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rak-kode">Kode Rak</Label>
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
            <Button type="button" variant="outline" className="shrink-0 gap-2" onClick={onGenerateCode} disabled={saving || generatingCode}>
              {generatingCode ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 size={16} />}
              Generate
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rak-qr">Nilai QR Unik</Label>
          <Input id="rak-qr" value={form.qr_code} onChange={(event) => onFieldChange('qr_code', event.target.value)} placeholder="RAK:RAK-A01" required disabled={saving} />
          <p className="text-xs text-muted-foreground">Satu rak wajib memiliki satu nilai QR unik.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rak-nama">Nama Rak</Label>
          <Input id="rak-nama" value={form.nama} onChange={(event) => onFieldChange('nama', event.target.value)} required disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label>Lokasi</Label>
          <Combobox
            options={lokasiOptions}
            value={String(form.lokasi_id || '')}
            onValueChange={(value) => onFieldChange('lokasi_id', Number(value))}
            placeholder="Pilih lokasi..."
            searchPlaceholder="Cari lokasi..."
            emptyText="Lokasi tidak ditemukan."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rak-kapasitas">Kapasitas</Label>
          <Input id="rak-kapasitas" type="number" min="0" value={form.kapasitas} onChange={(event) => onFieldChange('kapasitas', Number(event.target.value))} required disabled={saving} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </div>
      </form>
    </Modal>
  );
}
