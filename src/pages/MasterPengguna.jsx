import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import TableSkeleton from "@/components/TableSkeleton";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api, { emptyPagination, getList, getPagination } from "@/services/api";
const empty = {
  username: "",
  password: "",
  nama: "",
  email: "",
  level_id: "",
  status: "Aktif",
};
const columns = [
  { key: "username", label: "Username" },
  { key: "nama", label: "Nama Lengkap" },
  { key: "email", label: "Email" },
  { key: "level_detail", label: "Level Pengguna", render: (value) => value?.nama || "-" },
  {
    key: "status",
    label: "Status",
    render: (v) => (
      <Badge variant={v === "Aktif" ? "success" : "secondary"}>{v}</Badge>
    ),
  },
];
export default function MasterPengguna() {
  const [data, setData] = useState([]),
    [levels, setLevels] = useState([]),
    [search, setSearch] = useState(""),
    [open, setOpen] = useState(false),
    [form, setForm] = useState(empty),
    [editId, setEditId] = useState(null),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [page, setPage] = useState(1),
    [limit, setLimit] = useState(10),
    [pagination, setPagination] = useState(emptyPagination);
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/pengguna", { params: { search, page, limit } }),
      api.get("/level-pengguna", { params: { limit: 100 } }),
    ])
      .then(([u, l]) => {
        setData(getList(u));
        setPagination(getPagination(u));
        setLevels(getList(l));
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [search, page, limit]);
  const edit = (row) => {
    setEditId(row.id);
    setForm({
      username: row.username,
      password: "",
      nama: row.nama,
      email: row.email || "",
      level_id: String(row.level_id),
      status: row.status,
    });
    setOpen(true);
  };
  const remove = async (row) => {
    try {
      await api.delete(`/pengguna/${row.id}`);
      setData(data.filter((x) => x.id !== row.id));
      toast.success("Pengguna berhasil dihapus");
    } catch (e) {
      toast.error(e.message);
    }
  };
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;
      const row = editId
        ? await api.put(`/pengguna/${editId}`, payload)
        : await api.post("/pengguna", payload);
      setData(
        editId ? data.map((x) => (x.id === editId ? row : x)) : [...data, row],
      );
      setOpen(false);
      toast.success(`Pengguna berhasil ${editId ? "diubah" : "ditambah"}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };
  const options = levels.map((x) => ({
    value: String(x.id),
    label: `${x.kode} — ${x.nama}`,
  }));
  return (
    <div>
      <PageHeader
        title="Master Pengguna"
        subtitle="Kelola pengguna aplikasi"
        onAdd={() => {
          setEditId(null);
          setForm(empty);
          setOpen(true);
        }}
        addLabel="Tambah Pengguna"
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
        title={editId ? "Edit Pengguna" : "Tambah Pengguna"}
      >
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              Password{" "}
              {editId && (
                <span className="font-normal text-muted-foreground">
                  (kosongkan jika tidak diubah)
                </span>
              )}
            </Label>
            <Input
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editId}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Nama Lengkap</Label>
            <Input
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Level Pengguna</Label>
            <Combobox
              options={options}
              value={form.level_id}
              onValueChange={(v) => setForm({ ...form, level_id: v })}
              placeholder="Pilih level..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
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
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button disabled={saving || !form.level_id}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
