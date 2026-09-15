import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Wand2 } from 'lucide-react';

export default function KelompokBarangForm({ open, editId, form, saving, generatingCode, onClose, onSubmit, onFieldChange, onGenerateCode }) {
  return (
    <Modal isOpen={open} onClose={onClose} title={editId ? 'Edit Kelompok' : 'Tambah Kelompok'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="kelompok-kode">Kode</Label>
          <div className="flex gap-2">
            <Input id="kelompok-kode" value={form.kode} onChange={(event) => onFieldChange('kode', event.target.value)} required disabled={saving} />
            <Button type="button" variant="outline" className="shrink-0 gap-2" onClick={onGenerateCode} disabled={saving || generatingCode}>
              {generatingCode ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 size={16} />}
              Generate
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kelompok-nama">Nama Kelompok</Label>
          <Input id="kelompok-nama" value={form.nama} onChange={(event) => onFieldChange('nama', event.target.value)} required disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kelompok-deskripsi">Deskripsi</Label>
          <Textarea id="kelompok-deskripsi" value={form.deskripsi || ''} onChange={(event) => onFieldChange('deskripsi', event.target.value)} disabled={saving} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </div>
      </form>
    </Modal>
  );
}
