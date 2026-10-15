import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import Modal, { ModalFooter } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AsyncCombobox } from '@/components/ui/async-combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getLevelPenggunaOptions } from '@/services/penggunaService';

export default function MasterPenggunaForm({ open, editId, form, saving, onClose, onSubmit, onFieldChange }) {
  useUiLanguage();
  return (
    <Modal permission={editId ? 'update' : 'create'} isOpen={open} onClose={onClose} title={editId ? translateUi("Edit Pengguna") : translateUi("Tambah Pengguna")}>
      <form id="pengguna-form" onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pengguna-username">{translateUi("Username")}</Label>
          <Input
            id="pengguna-username"
            value={form.username}
            onChange={(event) => onFieldChange('username', event.target.value)}
            required
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pengguna-password">{translateUi("Password")}{' '}
            {editId && (
              <span className="font-normal text-muted-foreground">{translateUi("(kosongkan jika tidak diubah)")}</span>
            )}
          </Label>
          <Input
            id="pengguna-password"
            type="password"
            minLength={8}
            value={form.password}
            onChange={(event) => onFieldChange('password', event.target.value)}
            required={!editId}
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pengguna-nama">{translateUi("Nama Lengkap")}</Label>
          <Input
            id="pengguna-nama"
            value={form.nama}
            onChange={(event) => onFieldChange('nama', event.target.value)}
            required
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pengguna-email">{translateUi("Email")}</Label>
          <Input
            id="pengguna-email"
            type="email"
            value={form.email}
            onChange={(event) => onFieldChange('email', event.target.value)}
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{translateUi("Level Pengguna")}</Label>
          <AsyncCombobox
            value={String(form.level_id || '')}
            selectedOption={form.level_id ? { value: String(form.level_id), label: form.level_detail?.nama } : null}
            onValueChange={(val) => onFieldChange('level_id', Number(val))}
            loadOptions={getLevelPenggunaOptions}
            placeholder={translateUi("Pilih level...")}
            searchPlaceholder={translateUi("Cari level...")}
            emptyText={translateUi("Level tidak ditemukan.")}
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{translateUi("Status")}</Label>
          <Select
            value={form.status}
            onValueChange={(val) => onFieldChange('status', val)}
            disabled={saving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aktif">{translateUi("Aktif")}</SelectItem>
              <SelectItem value="Nonaktif">{translateUi("Nonaktif")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
      <ModalFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{translateUi("Batal")}</Button>
        <Button type="submit" form="pengguna-form" disabled={saving || !form.level_id}>
          {saving ? translateUi("Menyimpan...") : translateUi("Simpan")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
