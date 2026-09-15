import { useState, useEffect } from 'react';
import Modal, { ModalFooter } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { LoaderCircle, Search, ShieldCheck, Wand2 } from 'lucide-react';

export default function LevelPenggunaForm({
  open,
  editId,
  form,
  saving,
  generatingCode,
  onClose,
  onSubmit,
  onFieldChange,
  onGenerateCode,
  menus,
}) {
  const [permissionSearch, setPermissionSearch] = useState('');

  // Reset search when modal opens
  useEffect(() => {
    if (open) {
      setPermissionSearch('');
    }
  }, [open]);

  const allIds = menus.flatMap((m) => m.actions.map((a) => String(a.id)));
  const selected = (form.action_ids || []).map(String);
  const permissionTerm = permissionSearch.trim().toLowerCase();

  const visibleMenus = menus
    .map((menu) => {
      const menuMatches = `${menu.nama} ${menu.grup}`.toLowerCase().includes(permissionTerm);
      const actions = menuMatches
        ? menu.actions
        : menu.actions.filter((action) =>
            `${action.nama} ${action.key} ${action.permission}`.toLowerCase().includes(permissionTerm)
          );
      return { ...menu, actions };
    })
    .filter((menu) => !permissionTerm || menu.actions.length > 0);

  const toggle = (ids, on) => {
    const stringIds = ids.map(String);
    const newSelected = on
      ? Array.from(new Set([...selected, ...stringIds]))
      : selected.filter((x) => !stringIds.includes(x));
    onFieldChange('action_ids', newSelected);
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={editId ? 'Edit Level' : 'Tambah Level'} size="xl">
      <form id="level-form" onSubmit={onSubmit} className="flex flex-col gap-6 lg:flex-row">
        <section className="flex-[2] space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="level-kode">Kode</Label>
            <div className="flex gap-2">
              <Input id="level-kode" value={form.kode} onChange={(e) => onFieldChange('kode', e.target.value)} required disabled={saving} />
              <Button type="button" variant="outline" className="shrink-0 gap-2" onClick={onGenerateCode} disabled={saving || generatingCode}>
                {generatingCode ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 size={16} />}
                Generate
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="level-nama">Nama Level</Label>
            <Input id="level-nama" value={form.nama} onChange={(e) => onFieldChange('nama', e.target.value)} required disabled={saving} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="level-deskripsi">Deskripsi</Label>
            <Textarea id="level-deskripsi" value={form.deskripsi || ''} onChange={(e) => onFieldChange('deskripsi', e.target.value)} rows={4} disabled={saving} />
          </div>
        </section>

        <section className="flex-[3] flex flex-col overflow-hidden rounded-xl border">
          <div className="flex h-full flex-col bg-muted/10">
            <div className="space-y-3 border-b bg-background p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4 text-primary" /> Hak Akses
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">{selected.length} dipilih</span>
                  <Button
                    type="button" variant="secondary" size="sm" className="h-7 text-xs"
                    disabled={saving || allIds.length === 0}
                    onClick={() => {
                      if (selected.length === allIds.length) {
                        onFieldChange('action_ids', []);
                      } else {
                        onFieldChange('action_ids', allIds);
                      }
                    }}
                  >
                    {selected.length === allIds.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={permissionSearch} onChange={(e) => setPermissionSearch(e.target.value)} className="pl-9" placeholder="Cari permission..." disabled={saving} />
              </div>
            </div>
            
            <div className="max-h-[52vh] overflow-y-auto p-3">
              {visibleMenus.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Permission tidak ditemukan</div>
              ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                  {visibleMenus.map((menu) => {
                    const ids = menu.actions.map((a) => String(a.id));
                    const checked = ids.length > 0 && ids.every((x) => selected.includes(x));
                    const partial = ids.some((x) => selected.includes(x));
                    return (
                      <article key={menu.id} className="overflow-hidden rounded-lg border bg-card">
                        <div className="flex min-h-14 items-center justify-between gap-3 border-b bg-muted/25 px-3 py-2.5">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{menu.nama}</p>
                            <p className="truncate text-xs text-muted-foreground">{menu.grup}</p>
                          </div>
                          <Checkbox checked={checked ? true : partial ? 'indeterminate' : false} onCheckedChange={(v) => toggle(ids, v)} disabled={saving} />
                        </div>
                        <div className="grid gap-1 p-2">
                          {menu.actions.map((action) => (
                            <label key={action.id} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted">
                              <Checkbox checked={selected.includes(String(action.id))} onCheckedChange={(v) => toggle([action.id], v)} disabled={saving} />
                              <span className="min-w-0 flex-1 truncate">{action.nama}</span>
                            </label>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </form>
      
      <ModalFooter className="-mx-5 -mb-5 mt-6 sm:-mx-6 sm:-mb-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
        <Button type="submit" form="level-form" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
      </ModalFooter>
    </Modal>
  );
}
