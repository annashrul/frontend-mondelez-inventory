import { useEffect, useState } from 'react';
import { Save, Building2, Bell, Palette, Database, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, parseNumberInput } from '@/lib/utils';
import api, { getList } from '@/services/api';
import { notificationService } from '@/services/notificationService';

const tabs = [
  { id: 'umum', label: 'Umum', icon: Building2 },
  { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { id: 'tampilan', label: 'Tampilan', icon: Palette },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'keamanan', label: 'Keamanan', icon: Shield },
];

function ToggleRow({ label, desc, on, onToggle }) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={onToggle} />
    </div>
  );
}

function FormInput({ label, value, onChange, type = 'text', rows }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {rows ? (
        <Textarea value={value} onChange={onChange} rows={rows} />
      ) : type === 'number' ? (
        <Input type={type} value={value ?? ''} onChange={(event) => onChange({ target: { value: parseNumberInput(event.target.value) } })} />
      ) : (
        <Input type={type} value={value} onChange={onChange} />
      )}
    </div>
  );
}
export default function Pengaturan() {
  const [activeTab, setActiveTab] = useState('umum');
  const [levels, setLevels] = useState([]);
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notificationSetting, setNotificationSetting] = useState({ level_ids: [], user_ids: [] });
  const [s, setS] = useState({
    nama_perusahaan: 'PT. Company Indonesia',
    alamat: 'Jl. Sudirman No. 123, Jakarta',
    telepon: '021-1234567',
    email: 'info@company.com',
    notif_stok_min: true,
    notif_email: false,
    notif_transaksi: true,
    tema: 'light',
    bahasa: 'id',
    items_per_page: 10,
    auto_backup: true,
    session_timeout: 30,
    two_factor: false,
  });
  const u = (k, v) => setS({ ...s, [k]: v });
  const toggleArrayValue = (key, id, checked) => {
    setNotificationSetting((current) => ({
      ...current,
      [key]: checked
        ? [...new Set([...(current[key] || []), id])]
        : (current[key] || []).filter((value) => Number(value) !== Number(id)),
    }));
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      notificationService.getSettings(),
      api.get('/level-pengguna', { params: { limit: 100 } }),
      api.get('/pengguna', { params: { limit: 100 } }),
    ])
      .then(([setting, levelResponse, userResponse]) => {
        if (!active) return;
        setNotificationSetting({
          level_ids: (setting.level_ids || []).map(Number),
          user_ids: (setting.user_ids || []).map(Number),
        });
        setLevels(getList(levelResponse));
        setUsers(getList(userResponse));
      })
      .catch(() => toast.error('Gagal memuat pengaturan notifikasi'));
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    if (activeTab !== 'notifikasi') {
      toast.success('Pengaturan berhasil disimpan');
      return;
    }
    setSaving(true);
    try {
      await notificationService.saveSettings(notificationSetting);
      toast.success('Pengaturan notifikasi berhasil disimpan');
    } catch (error) {
      toast.error(error.message || 'Gagal menyimpan pengaturan notifikasi');
    } finally {
      setSaving(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'umum':
        return (
          <div className="space-y-4">
            <FormInput label="Nama Perusahaan" value={s.nama_perusahaan} onChange={e => u('nama_perusahaan', e.target.value)} />
            <FormInput label="Alamat" value={s.alamat} onChange={e => u('alamat', e.target.value)} rows={2} />
            <FormInput label="Telepon" value={s.telepon} onChange={e => u('telepon', e.target.value)} />
            <FormInput label="Email" value={s.email} onChange={e => u('email', e.target.value)} type="email" />
          </div>
        );
      case 'notifikasi':
        return (
          <div className="space-y-4">
            <ToggleRow label="Notifikasi Stok Minimum" desc="Alert saat stok mendekati batas minimum" on={s.notif_stok_min} onToggle={v => u('notif_stok_min', v)} />
            <ToggleRow label="Notifikasi Email" desc="Kirim notifikasi melalui email" on={s.notif_email} onToggle={v => u('notif_email', v)} />
            <ToggleRow label="Notifikasi Transaksi" desc="Alert untuk setiap transaksi baru" on={s.notif_transaksi} onToggle={v => u('notif_transaksi', v)} />
            <div className="rounded-lg border bg-card">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium">Penerima Notifikasi Pengambilan Barang</p>
                <p className="mt-1 text-xs text-muted-foreground">Pilih level atau user yang akan menerima notifikasi realtime saat operator melakukan transaksi pengambilan.</p>
              </div>
              <div className="grid gap-4 p-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Berdasarkan Level</p>
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <label key={level.id} className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={notificationSetting.level_ids.includes(Number(level.id))}
                          onChange={(event) => toggleArrayValue('level_ids', Number(level.id), event.target.checked)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{level.nama}</span>
                          <span className="block truncate text-xs text-muted-foreground">{level.deskripsi || level.kode}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">User Tambahan</p>
                  <div className="space-y-2">
                    {users.map((item) => (
                      <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={notificationSetting.user_ids.includes(Number(item.id))}
                          onChange={(event) => toggleArrayValue('user_ids', Number(item.id), event.target.checked)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{item.nama || item.username}</span>
                          <span className="block truncate text-xs text-muted-foreground">{item.level_detail?.nama || '-'} - {item.status}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'tampilan':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tema</Label>
              <Select value={s.tema} onValueChange={v => u('tema', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Bahasa</Label>
              <Select value={s.bahasa} onValueChange={v => u('bahasa', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormInput label="Item Per Halaman" value={s.items_per_page} onChange={(event) => u('items_per_page', event.target.value)} type="number" />
          </div>
        );
      case 'database':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 font-medium">✓ Database terhubung - Supabase</p>
            </div>
            <ToggleRow label="Auto Backup" desc="Backup otomatis database setiap hari" on={s.auto_backup} onToggle={v => u('auto_backup', v)} />
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <FormInput label="Session Timeout (menit)" value={s.session_timeout} onChange={(event) => u('session_timeout', event.target.value)} type="number" />
            <ToggleRow label="Two-Factor Auth" desc="Aktifkan verifikasi 2 langkah untuk semua admin" on={s.two_factor} onToggle={v => u('two_factor', v)} />
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">Konfigurasi sistem inventory</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 h-fit overflow-hidden">
          <nav className="flex flex-col">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-primary/5 text-primary border-r-2 border-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon size={18} />{tab.label}
                </button>
              );
            })}
          </nav>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <CardTitle>{tabs.find(t => t.id === activeTab)?.label}</CardTitle>
            <Button onClick={handleSave} size="sm" disabled={saving}>
              <Save size={16} className="mr-2" />{saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </CardHeader>
          <CardContent>{renderTab()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
