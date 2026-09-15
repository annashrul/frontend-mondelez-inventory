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
  return (
    <Modal isOpen={open} onClose={onClose} title={editId ? 'Edit Pengguna' : 'Tambah Pengguna'}>
      <form id="pengguna-form" onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pengguna-username">Username</Label>
          <Input
            id="pengguna-username"
            value={form.username}
            onChange={(event) => onFieldChange('username', event.target.value)}
            required
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pengguna-password">
            Password{' '}
            {editId && (
              <span className="font-normal text-muted-foreground">
                (kosongkan jika tidak diubah)
              </span>
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
          <Label htmlFor="pengguna-nama">Nama Lengkap</Label>
          <Input
            id="pengguna-nama"
            value={form.nama}
            onChange={(event) => onFieldChange('nama', event.target.value)}
            required
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pengguna-email">Email</Label>
          <Input
            id="pengguna-email"
            type="email"
            value={form.email}
            onChange={(event) => onFieldChange('email', event.target.value)}
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Level Pengguna</Label>
          <AsyncCombobox
            value={String(form.level_id || '')}
            selectedOption={form.level_id ? { value: String(form.level_id), label: form.level_detail?.nama } : null}
            onValueChange={(val) => onFieldChange('level_id', Number(val))}
            loadOptions={getLevelPenggunaOptions}
            placeholder="Pilih level..."
            searchPlaceholder="Cari level..."
            emptyText="Level tidak ditemukan."
            disabled={saving}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(val) => onFieldChange('status', val)}
            disabled={saving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
      <ModalFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Batal
        </Button>
        <Button type="submit" form="pengguna-form" disabled={saving || !form.level_id}>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
