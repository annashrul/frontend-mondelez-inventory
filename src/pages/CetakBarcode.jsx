import PageHeader from '@/components/PageHeader';
import usePageState from '@/hooks/usePageState';
import { useTranslation } from '@/lib/i18n';
import { useSettingsStore } from '@/stores/settingsStore';
import { useState } from 'react';
import { Printer, QrCode, LoaderCircle } from 'lucide-react';
import { useQrRackData } from '@/hooks/useQrRackData';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import QrImage from '@/components/QrImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

function rackLocation(rack) {
  return rack.lokasi_detail?.nama || rack.lokasi || '-';
}

export default function CetakBarcode() {
  const { t } = useTranslation();
  const company = useSettingsStore(state => state.settings);
  const { user } = useAuth();
  const { query, racks, loading } = useQrRackData(user?.id);
  const [selectedIds, setSelectedIds] = usePageState('CetakBarcode.jsx:selectedIds', []);
  const selected = selectedIds.map(id => racks.find(rack => String(rack.id) === id)).filter(Boolean);
  const [search, setSearch] = usePageState('CetakBarcode.jsx:search', '');
  const [loadedCodes, setLoadedCodes] = useState(new Set());
  const filtered = racks.filter(rack => `${rack.kode} ${rack.nama} ${rackLocation(rack)}`.toLowerCase().includes(search.toLowerCase()));
  const toggle = rack => setSelectedIds(current => current.includes(String(rack.id))
    ? current.filter(id => id !== String(rack.id)) : [...current, String(rack.id)]);
  const printReady = selected.length > 0 && selected.every(rack => loadedCodes.has(rack.qr_code));

  return (
    <div className="qr-print-view">
      <PageHeader
        title={t('Cetak QR Rak')}
        subtitle={t('Satu QR per halaman, diletakkan di tengah kertas A4.')}
        searchValue={search}
        onSearchChange={setSearch}
        className="no-print"
      />
      <div className="qr-print-layout grid gap-6 lg:grid-cols-3">
        <Card className="h-fit no-print">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">{t('Pilih Rak')}</CardTitle>{query.isFetching && !loading && <LoaderCircle role="status" aria-label={t('Memuat daftar rak...')} className="size-4 animate-spin text-muted-foreground" />}</CardHeader>
          <CardContent className="space-y-4">
            {query.isError && <div role="alert" className="space-y-2"><p className="text-sm text-muted-foreground">{t('Gagal memuat daftar rak')}</p><Button variant="outline" size="sm" disabled={query.isFetching} onClick={() => query.refetch()}>{t('Coba lagi')}</Button></div>}
            <ScrollArea className="h-80 rounded-md border p-2">
              <div className="space-y-1">
                {loading ? <div role="status" aria-label={t('Memuat daftar rak...')} className="space-y-3 p-2">{Array.from({ length: 5 }, (_, index) => <div key={index} className="flex items-center gap-3"><Skeleton className="size-4 shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div>)}</div> : !filtered.length && !query.isError ? <p className="p-4 text-center text-sm text-muted-foreground">{t('Tidak ada rak yang cocok')}</p> : filtered.map(rack => (
                  <label key={rack.id} className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted">
                    <Checkbox checked={selected.some(item => item.id === rack.id)} onCheckedChange={() => toggle(rack)} />
                    <span><span className="block text-sm font-medium">{rack.nama}</span><span className="block text-xs text-muted-foreground">{rack.kode} · {rackLocation(rack)}</span></span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="qr-preview-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between no-print">
            <CardTitle className="text-base">{t('Preview Label (')}{selected.length})</CardTitle>
            <Button onClick={() => window.print()} disabled={!printReady}><Printer size={16} />{t('Cetak QR Rak')}</Button>
          </CardHeader>
          <CardContent className="qr-preview-content">
            {loading ? <div role="status" aria-label={t('Memuat daftar rak...')} className="grid gap-6 sm:grid-cols-2 no-print">{[1, 2].map(item => <Skeleton key={item} className="aspect-[210/297] w-full" />)}</div> : !selected.length ? (
              <div className="py-20 text-center text-muted-foreground no-print"><QrCode size={48} className="mx-auto mb-2 opacity-50" />{t('Pilih rak untuk membuat label')}</div>
            ) : (
              <div className="qr-print-document grid gap-6 sm:grid-cols-2">
                {selected.map(rack => (
                  <article key={rack.id} className="qr-sheet relative aspect-[210/297] overflow-hidden border bg-card text-card-foreground shadow-sm">
                    <div className="absolute inset-x-[8%] top-[12%] text-center">
                      <p className="font-semibold">{company.nama_perusahaan}</p>
                      <p className="mt-1 break-words text-xs">{[company.alamat, company.telepon, company.email].filter(Boolean).join(' · ')}</p>
                    </div>
                    <div className="qr-sheet-code absolute left-1/2 top-1/2 aspect-square w-[42%] -translate-x-1/2 -translate-y-1/2">
                      <QrImage value={rack.qr_code} size={480} className="h-full w-full" onLoad={() => setLoadedCodes(current => new Set(current).add(rack.qr_code))} />
                    </div>
                    <div className="absolute inset-x-[8%] top-[70%] text-center">
                      <p className="break-words text-lg font-bold">{rack.nama}</p>
                      <p className="mt-1 break-words text-sm">{rackLocation(rack)}</p>
                      <p className="mt-2 break-all font-mono text-xs">{rack.qr_code}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
