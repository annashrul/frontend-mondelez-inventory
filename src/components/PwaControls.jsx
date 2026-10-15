import { useState } from 'react';
import { Download, RefreshCw, WifiOff, X } from 'lucide-react';
import { usePwaStore } from '@/stores/pwaStore';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export default function PwaControls() {
  const { t } = useTranslation();
  const { installPrompt, iosInstall, installDismissed, updateAvailable, updateDismissed, applyUpdate, offline } = usePwaStore();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const showUpdate = updateAvailable && !updateDismissed;
  const showInstall = (installPrompt || iosInstall) && !installDismissed;
  if (!offline && !showUpdate && !showInstall) return null;

  const install = async () => {
    if (!installPrompt || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      usePwaStore.setState({ installPrompt: null, installDismissed: true });
    } catch { setFailed(true); }
    finally { setBusy(false); }
  };
  const update = async () => {
    if (!applyUpdate || busy) return;
    setBusy(true);
    setFailed(false);
    try { await applyUpdate(); }
    catch { setFailed(true); setBusy(false); }
  };
  const Icon = offline ? WifiOff : showUpdate ? RefreshCw : Download;
  return (
    <aside role="status" aria-live="polite" className="fixed inset-x-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-[60] rounded-xl border bg-card p-4 text-card-foreground shadow-lg sm:left-auto sm:w-96 lg:bottom-6 print:hidden">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold">{t(offline ? 'Anda sedang offline' : showUpdate ? 'Versi baru tersedia' : 'Instal Mondelez Inventory')}</p>
          <p className="text-xs leading-5 text-muted-foreground">{t(offline ? 'Hubungkan internet untuk memuat data dan menyimpan transaksi.' : showUpdate ? 'Selesaikan pekerjaan Anda, lalu perbarui aplikasi.' : iosInstall && !installPrompt ? 'Di Safari, buka Bagikan lalu pilih Tambah ke Layar Utama.' : 'Akses aplikasi langsung dari layar utama perangkat Anda.')}</p>
          {failed && <p className="text-xs text-destructive">{t('Gagal memproses. Silakan coba lagi.')}</p>}
          {!offline && showUpdate && <Button size="sm" disabled={busy} onClick={update}>{t('Perbarui aplikasi')}</Button>}
          {!offline && !showUpdate && installPrompt && <Button size="sm" disabled={busy} onClick={install}>{t('Instal aplikasi')}</Button>}
        </div>
        {!offline && <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={t('Tutup')} onClick={() => usePwaStore.setState(showUpdate ? { updateDismissed: true } : { installDismissed: true })}><X className="size-4" /></Button>}
      </div>
    </aside>
  );
}
