import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import Modal from '@/components/Modal';
import { AsyncCombobox } from '@/components/ui/async-combobox';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { parseNumberInput } from '@/lib/utils';
import { getBarangStockOptions } from '@/services/barangService';

export default function AdjustmentStokForm({ open, form, saving, onClose, onSubmit, onFieldChange }) {
  useUiLanguage();
  return (
    <Modal isOpen={open} onClose={onClose} title={translateUi("Buat Adjustment Stok")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>{translateUi("Tanggal")}</Label>
          <DatePicker value={form.tanggal} onChange={(value) => onFieldChange('tanggal', value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{translateUi("Barang")}</Label>
          <AsyncCombobox
            value={String(form.barang_id || '')}
            onValueChange={(value) => onFieldChange('barang_id', Number(value))}
            loadOptions={getBarangStockOptions}
            placeholder={translateUi("Pilih barang...")}
            searchPlaceholder={translateUi("Cari kode atau nama barang...")}
            emptyText={translateUi("Barang tidak ditemukan.")}
          />
          <input type="hidden" value={form.barang_id} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{translateUi("Tipe")}</Label>
            <Select value={form.tipe} onValueChange={(value) => onFieldChange('tipe', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tambah">{translateUi("Tambah", { context: "stock" })}</SelectItem>
                <SelectItem value="Kurang">{translateUi("Kurang")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{translateUi("Jumlah")}</Label>
            <Input type="number" value={form.qty ?? ''} onChange={(event) => onFieldChange('qty', parseNumberInput(event.target.value))} min="1" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{translateUi("Alasan")}</Label>
          <Textarea value={form.alasan} onChange={(event) => onFieldChange('alasan', event.target.value)} required />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{translateUi("Batal")}</Button>
          <Button type="submit" disabled={saving}>{saving ? translateUi("Menyimpan...") : translateUi("Simpan")}</Button>
        </div>
      </form>
    </Modal>
  );
}
