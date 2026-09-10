import { useState } from 'react';
import { Save, Building2, Bell, Palette, Database, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
      ) : (
        <Input type={type} value={value} onChange={onChange} />
      )}
    </div>
  );
}
export default function Pengaturan() {
  const [activeTab, setActiveTab] = useState('umum');
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
  const handleSave = () => toast.success('Pengaturan berhasil disimpan');

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
            <FormInput label="Item Per Halaman" value={s.items_per_page} onChange={e => u('items_per_page', Number(e.target.value))} type="number" />
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
            <FormInput label="Session Timeout (menit)" value={s.session_timeout} onChange={e => u('session_timeout', Number(e.target.value))} type="number" />
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
            <Button onClick={handleSave} size="sm">
              <Save size={16} className="mr-2" />Simpan
            </Button>
          </CardHeader>
          <CardContent>{renderTab()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
