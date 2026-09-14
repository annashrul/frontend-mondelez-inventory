import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import TableSkeleton from "@/components/TableSkeleton";
import Modal, { ModalFooter } from "@/components/Modal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ShieldCheck } from "lucide-react";
import api, { emptyPagination, getList, getPagination } from "@/services/api";

const emptyForm = { kode: "", nama: "", deskripsi: "", action_ids: [] };
const columns = [
  { key: "kode", label: "Kode" },
  { key: "nama", label: "Nama Level" },
  { key: "deskripsi", label: "Deskripsi" },
  {
    key: "permissions",
    label: "Hak Akses",
    render: (v) => <Badge variant="outline">{v.length} permission</Badge>,
  },
  {
    key: "jumlah_user",
    label: "Jumlah User",
    render: (v) => <Badge variant="secondary">{v} user</Badge>,
  },
];
export default function LevelPengguna() {
  const [data, setData] = useState([]),
    [menus, setMenus] = useState([]),
    [search, setSearch] = useState(""),
    [open, setOpen] = useState(false),
    [form, setForm] = useState(emptyForm),
    [permissionSearch, setPermissionSearch] = useState(""),
    [editId, setEditId] = useState(null),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [page, setPage] = useState(1),
    [limit, setLimit] = useState(10),
    [pagination, setPagination] = useState(emptyPagination);
  const load = async () => {
    setLoading(true);
    try {
      const [levels, catalog] = await Promise.all([
        api.get("/level-pengguna", { params: { search, page, limit } }),
        api.get("/menus"),
      ]);
      setData(getList(levels));
      setPagination(getPagination(levels));
      setMenus(catalog);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [search, page, limit]);
  const allIds = menus.flatMap((m) => m.actions.map((a) => String(a.id))),
    selected = form.action_ids.map(String);
  const permissionTerm = permissionSearch.trim().toLowerCase();
  const visibleMenus = menus
    .map((menu) => {
      const menuMatches = `${menu.nama} ${menu.grup}`.toLowerCase().includes(permissionTerm);
      const actions = menuMatches
        ? menu.actions
        : menu.actions.filter((action) =>
            `${action.nama} ${action.key} ${action.permission}`.toLowerCase().includes(permissionTerm),
          );
      return { ...menu, actions };
    })
    .filter((menu) => !permissionTerm || menu.actions.length > 0);
  const setIds = (ids) => setForm({ ...form, action_ids: ids });
  const toggle = (ids, on) =>
    setIds(
      on
        ? [...new Set([...selected, ...ids.map(String)])]
        : selected.filter((x) => !ids.map(String).includes(x)),
    );
  const edit = (row) => {
    setEditId(row.id);
    setForm({
      kode: row.kode,
      nama: row.nama,
      deskripsi: row.deskripsi || "",
      action_ids: row.action_ids.map(String),
    });
    setPermissionSearch("");
    setOpen(true);
  };
  const remove = async (row) => {
    try {
      await api.delete(`/level-pengguna/${row.id}`);
      setData(data.filter((x) => x.id !== row.id));
      toast.success("Level berhasil dihapus");
    } catch (e) {
      toast.error(e.message);
    }
  };
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const row = editId
        ? await api.put(`/level-pengguna/${editId}`, form)
        : await api.post("/level-pengguna", form);
      setData(
        editId ? data.map((x) => (x.id === editId ? row : x)) : [...data, row],
      );
      setOpen(false);
      toast.success(`Level berhasil ${editId ? "diubah" : "ditambah"}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      <PageHeader
        title="Level Pengguna"
        subtitle="Kelola level dan hak akses dinamis"
        onAdd={() => {
          setEditId(null);
          setForm(emptyForm);
          setPermissionSearch("");
          setOpen(true);
        }}
        addLabel="Tambah Level"
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
      />
      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          onEdit={edit}
          onDelete={remove}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(value) => { setLimit(value); setPage(1); }}
        />
      )}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Level" : "Tambah Level"}
        size="xl"
      >
        <form id="level-form" onSubmit={save} className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <section className="space-y-4">
            <div className="rounded-lg border bg-muted/15 p-4">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold leading-tight">Identitas Level</h3>
                  <p className="text-xs text-muted-foreground">{editId ? "Mode edit" : "Level baru"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="level-kode">Kode level</Label>
                  <Input
                    id="level-kode"
                    placeholder="SUPERVISOR"
                    value={form.kode}
                    onChange={(e) => setForm({ ...form, kode: e.target.value })}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="level-nama">Nama level</Label>
                  <Input
                    id="level-nama"
                    placeholder="Supervisor Gudang"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="level-deskripsi">Deskripsi</Label>
                  <Textarea
                    id="level-deskripsi"
                    className="min-h-28 resize-none"
                    placeholder="Tanggung jawab level"
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
           
          </section>

          <section className="min-w-0 space-y-3">
            <div className="rounded-lg border bg-background">
              <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold leading-tight">Hak Akses</h3>
                  <p className="text-xs text-muted-foreground">{selected.length} permission dipilih</p>
                </div>
                <label className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium">
                  <Checkbox
                    checked={
                      allIds.length > 0 &&
                      allIds.every((x) => selected.includes(x)) ? true : selected.length > 0 ? "indeterminate" : false
                    }
                    onCheckedChange={(v) => setIds(v ? allIds : [])}
                    disabled={saving}
                  />
                  Pilih semua
                </label>
              </div>
              <div className="border-b p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    className="pl-9"
                    placeholder="Cari permission..."
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="max-h-[52vh] overflow-y-auto p-3">
                {visibleMenus.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Permission tidak ditemukan
                  </div>
                ) : (
                  <div className="grid gap-3 xl:grid-cols-2">
                    {visibleMenus.map((menu) => {
                      const ids = menu.actions.map((a) => String(a.id)),
                        checked = ids.length > 0 && ids.every((x) => selected.includes(x)),
                        partial = ids.some((x) => selected.includes(x));
                      return (
                        <article key={menu.id} className="overflow-hidden rounded-lg border bg-card">
                          <div className="flex min-h-14 items-center justify-between gap-3 border-b bg-muted/25 px-3 py-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{menu.nama}</p>
                              <p className="truncate text-xs text-muted-foreground">{menu.grup}</p>
                            </div>
                            <Checkbox
                              checked={checked ? true : partial ? "indeterminate" : false}
                              onCheckedChange={(v) => toggle(ids, v)}
                              disabled={saving}
                            />
                          </div>
                          <div className="grid gap-1 p-2">
                            {menu.actions.map((action) => (
                              <label
                                key={action.id}
                                className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                              >
                                <Checkbox
                                  checked={selected.includes(String(action.id))}
                                  onCheckedChange={(v) => toggle([action.id], v)}
                                  disabled={saving}
                                />
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" form="level-form" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </ModalFooter>
      </Modal>
    </div>
  );
}
