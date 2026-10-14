import { translate as translateUi } from '@/lib/i18n';
import { settingsTab, settingsTabParams } from '@/lib/settingsTabs';
import { appearancePayload } from '@/lib/appearanceSettings';
import { useTranslation } from '@/lib/i18n';
import { useSettingsPageData } from '@/hooks/useSettingsPageData';
import SettingsSkeleton from '@/components/SettingsSkeleton';
import { defaultSettings, useSettingsStore } from '@/stores/settingsStore';
import { useAuth } from '@/context/AuthContext';
import { canAccess } from '@/lib/permissions';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, LoaderCircle, Building2, Bell, Palette, Database, Shield } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, parseNumberInput } from '@/lib/utils';

const tabs = [
  { id: 'umum', label: 'Umum', icon: Building2 },
  { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { id: 'tampilan', label: 'Tampilan', icon: Palette },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'keamanan', label: 'Keamanan', icon: Shield },
];

function ToggleRow({ label, desc, on, onToggle }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
      <div>
        <p className="text-sm font-medium">{t(label)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t(desc)}</p>
      </div>
      <Switch checked={on} onCheckedChange={onToggle} />
    </div>
  );
}

function FormInput({ label, value, onChange, type = 'text', rows, min, max, step }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1.5">
      <Label>{t(label)}</Label>
      {rows ? (
        <Textarea value={value} onChange={onChange} rows={rows} />
      ) : type === 'number' ? (
        <Input type={type} min={min} max={max} step={step} value={value ?? ''} onChange={(event) => onChange({ target: { value: parseNumberInput(event.target.value) } })} />
      ) : (
        <Input type={type} value={value} onChange={onChange} />
      )}
    </div>
  );
}
export default function Pengaturan() {
  const { t, locale } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = searchParams.get('tab');
  const activeTab = settingsTab(searchParams);
  const setActiveTab = tab => setSearchParams(current => settingsTabParams(current, tab));
  useEffect(() => {
    if (tabs.some(tab => tab.id === selectedTab)) return;
    setSearchParams(current => {
      return settingsTabParams(current, 'umum');
    }, { replace: true });
  }, [selectedTab, setSearchParams]);
  const { user } = useAuth();
  const {
    settingsQuery, notificationQuery, recipientsQuery, databaseQuery,
    loading, loadError, refreshError, backgroundFetching, retry,
    saveMutation, backupMutation, testEmailMutation,
  } = useSettingsPageData(activeTab, user?.id);
  const [settingsDraft, setS] = useState(null);
  const [notificationDraft, setNotificationSetting] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const s = settingsDraft || settingsQuery.data || defaultSettings;
  const notificationSetting = notificationDraft || notificationQuery.data || {
    level_ids: [], user_ids: [], email_enabled: false, stock_enabled: true, transaction_enabled: true,
  };
  const levels = recipientsQuery.data?.levels || [];
  const users = recipientsQuery.data?.users || [];
  const databaseStatus = databaseQuery.data;
  const saving = saveMutation.isPending;
  const backingUp = backupMutation.isPending;
  const sendingTestEmail = testEmailMutation.isPending;
  const loaded = !loading && !loadError;
  const canSave = canAccess(user, 'pengaturan.update');
  const applySettings = useSettingsStore(state => state.apply);
  const u = (k, v) => setS(current => ({ ...(current || s), [k]: v }));
  const updateNotification = update => setNotificationSetting(current => update(current || notificationSetting));

  useEffect(() => {
    if (settingsQuery.data) applySettings(settingsQuery.data);
  }, [settingsQuery.data, applySettings]);

  const toggleArrayValue = (key, id, checked) => {
    updateNotification((current) => ({
      ...current,
      [key]: checked
        ? [...new Set([...(current[key] || []), id])]
        : (current[key] || []).filter((value) => Number(value) !== Number(id)),
    }));
  };

  const handleSave = async () => {
    if (!loaded || !canSave || saving) return;
    try {
      const section = activeTab;
      const payload = section === 'notifikasi' ? notificationSetting : section === 'tampilan' ? appearancePayload(s) : s;
      await saveMutation.mutateAsync({ section, payload });
      if (section === 'notifikasi') setNotificationSetting(null);
      else setS(null);
      toast.success('Pengaturan berhasil disimpan');
    } catch (error) {
      toast.error(error.message || 'Gagal menyimpan pengaturan');
    }
  };

  const handleBackup = async () => {
    if (!canSave || backingUp) return;
    try {
      await backupMutation.mutateAsync();
      toast.success('Backup database berhasil');
    } catch (error) { toast.error(error.message || 'Backup gagal'); }
  };

  const handleTestEmail = async (event) => {
    event.preventDefault();
    if (!canSave || sendingTestEmail || !notificationSetting.email_enabled) return;
    try {
      const result = await testEmailMutation.mutateAsync(testEmail.trim());
      toast.success(result.message || 'Email uji dikirim. Periksa inbox atau spam.');
    } catch (error) {
      toast.error(error.message || 'Gagal mengirim email uji');
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'umum':
        return (
          <div className="space-y-4">
            <FormInput label={translateUi("Nama Perusahaan")} value={s.nama_perusahaan} onChange={e => u('nama_perusahaan', e.target.value)} />
            <FormInput label={translateUi("Alamat")} value={s.alamat} onChange={e => u('alamat', e.target.value)} rows={2} />
            <FormInput label={translateUi("Telepon")} value={s.telepon} onChange={e => u('telepon', e.target.value)} />
            <FormInput label={translateUi("Email")} value={s.email} onChange={e => u('email', e.target.value)} type="email" />
          </div>
        );
      case 'notifikasi':
        return (
          <div className="space-y-4">
            <ToggleRow label={translateUi("Notifikasi Stok Minimum")} desc="Alert saat stok mendekati batas minimum" on={notificationSetting.stock_enabled} onToggle={stock_enabled => updateNotification(current => ({ ...current, stock_enabled }))} />
            <ToggleRow label={translateUi("Notifikasi Email")} desc="Kirim email saat pengambilan barang ke penerima yang dipilih di bawah" on={notificationSetting.email_enabled} onToggle={email_enabled => updateNotification(current => ({ ...current, email_enabled }))} />
            {notificationSetting.email_enabled && <form onSubmit={handleTestEmail} className="space-y-3 rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">{t("Kirim Email Uji")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("Uji pengiriman ke alamat berikut tanpa membuat transaksi atau mengubah penerima notifikasi. Aktifkan notifikasi email untuk menggunakan pengujian ini.")}</p>
              </div>
              <Label htmlFor="test-email">{t("Email tujuan")}</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input id="test-email" type="email" value={testEmail} onChange={event => setTestEmail(event.target.value)} placeholder={"nama@gmail.com"} autoComplete="email" maxLength={254} required disabled={sendingTestEmail} />
                <Button type="submit" disabled={sendingTestEmail || !testEmail.trim()} className="shrink-0">
                  {sendingTestEmail ? translateUi("Mengirim...") : translateUi("Kirim Email Uji")}
                </Button>
              </div>
            </form>}
            <ToggleRow label={translateUi("Notifikasi Transaksi")} desc="Alert untuk setiap transaksi baru" on={notificationSetting.transaction_enabled} onToggle={transaction_enabled => updateNotification(current => ({ ...current, transaction_enabled }))} />
            <div className="rounded-lg border bg-card">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium">{t("Penerima Notifikasi Pengambilan Barang")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("Pilih level atau user yang menerima notifikasi pengambilan. Jika email aktif, notifikasi juga dikirim ke alamat email pada data pengguna.")}</p>
              </div>
              <div className="grid gap-4 p-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("Berdasarkan Level")}</p>
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
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("User Tambahan")}</p>
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
                          <span className="block truncate text-xs text-muted-foreground">{item.email || t('Email belum diisi')} · {item.level_detail?.nama || '-'} · {t(item.status)}</span>
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
            <p className="text-sm text-muted-foreground">{t('Perubahan diterapkan setelah klik Simpan dan berlaku untuk seluruh pengguna.')}</p>
            <div className="space-y-1.5">
              <Label>{t("Tema")}</Label>
              <Select value={s.tema} onValueChange={v => u('tema', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("Terang")}</SelectItem>
                  <SelectItem value="dark">{t("Gelap")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("Bahasa")}</Label>
              <Select value={s.bahasa} onValueChange={v => u('bahasa', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">{t("Bahasa Indonesia")}</SelectItem>
                  <SelectItem value="en">{t("Bahasa Inggris")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormInput label={translateUi("Item Per Halaman")} value={s.items_per_page} onChange={(event) => u('items_per_page', event.target.value)} type="number" min={5} max={100} step={1} />
            <p className="text-xs text-muted-foreground">{t('Masukkan 5–100 item per halaman.')}</p>
          </div>
        );
      case 'database':
        if (databaseQuery.isPending) return <SettingsSkeleton tab="database" />;
        if (databaseQuery.isError && !databaseStatus) return (
          <div role="alert" className="space-y-3"><p className="text-sm text-muted-foreground">{t('Gagal memuat status database')}</p><Button variant="outline" onClick={() => databaseQuery.refetch()}>{t('Coba lagi')}</Button></div>
        );
        return (
          <div className="space-y-4">
            <div className={cn('p-4 border rounded-lg', databaseStatus?.connected ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20')}>
              <p className={cn('text-sm font-medium', databaseStatus?.connected ? 'text-green-600' : 'text-amber-600')}>{databaseStatus?.connected ? t('✓ Database terhubung - Supabase') : t('Database tidak terhubung')}</p>
            </div>
            <p className="text-xs text-muted-foreground">{databaseStatus?.backup_available === false ? t('pg_dump belum tersedia di server') : databaseStatus?.backup ? translateUi("Backup terakhir: {value0} · {value1}", { value0: t(databaseStatus.backup.status === 'success' ? 'Berhasil' : 'Gagal'), value1: new Date(databaseStatus.backup.timestamp).toLocaleString(locale) }) : t('Belum ada backup')}</p>
            <Button onClick={handleBackup} disabled={!canSave || backingUp || !databaseStatus?.backup_available}>{t(backingUp ? 'Memproses backup...' : 'Backup Sekarang')}</Button>
            <ToggleRow label={translateUi("Auto Backup")} desc="Snapshot database harian, disimpan di server dengan retensi 7 backup" on={s.auto_backup} onToggle={v => u('auto_backup', v)} />
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <FormInput label={translateUi("Session Timeout (menit)")} value={s.session_timeout} onChange={(event) => u('session_timeout', event.target.value)} type="number" />
            <ToggleRow label={translateUi("Two-Factor Auth")} desc="Kirim kode login sekali pakai ke email admin. Pastikan email semua admin aktif sudah diisi." on={s.two_factor} onToggle={v => u('two_factor', v)} />
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("Pengaturan")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("Konfigurasi sistem inventory")}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="sticky top-[calc(3.75rem+env(safe-area-inset-top)+0.75rem)] z-30 h-fit self-start overflow-hidden py-0 sm:py-0 lg:col-span-1 lg:top-20">
          <nav aria-label={t("Pengaturan")} className="flex overflow-x-auto lg:flex-col">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-3 whitespace-nowrap px-4 py-3 text-sm text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-primary/5 text-primary border-b-2 lg:border-b-0 lg:border-r-2 border-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon size={18} />{t(tab.label)}
                </button>
              );
            })}
          </nav>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div className="flex items-center gap-2"><CardTitle>{t(tabs.find(tab => tab.id === activeTab)?.label)}</CardTitle>{(backgroundFetching || (activeTab === 'database' && databaseQuery.isFetching && databaseStatus)) && <LoaderCircle role="status" aria-label={t('Memuat pengaturan...')} className="size-4 animate-spin text-muted-foreground" />}</div>
            <Button onClick={handleSave} size="sm" disabled={saving || !loaded || !canSave}>
              <Save size={16} className="mr-2" />{t(saving ? 'Menyimpan...' : 'Simpan')}
            </Button>
          </CardHeader>
          <CardContent>
            {refreshError && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-lg border p-3"><p className="text-sm text-muted-foreground">{t('Gagal memperbarui pengaturan. Data sebelumnya tetap ditampilkan.')}</p><Button variant="outline" size="sm" onClick={retry}>{t('Coba lagi')}</Button></div>}
            {loadError ? <div role="alert" className="space-y-3"><p className="text-sm text-muted-foreground">{t('Gagal memuat pengaturan')}</p><Button variant="outline" onClick={retry}>{t('Coba lagi')}</Button></div>
              : loading ? <SettingsSkeleton tab={activeTab} />
                : <fieldset disabled={!canSave || saving} className="min-w-0">{renderTab()}</fieldset>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
