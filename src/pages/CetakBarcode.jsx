import { useTranslation } from '@/lib/i18n';
import { useSettingsStore } from '@/stores/settingsStore';
import { useEffect, useState } from 'react';
import { Printer, QrCode, Search } from 'lucide-react';
import { toast } from '@/lib/toast';
import QrImage from '@/components/QrImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import api, { getList } from '@/services/api';

function rackLocation(rack) {
  return rack.lokasi_detail?.nama || rack.lokasi || '-';
}

export default function CetakBarcode() {
  const { t } = useTranslation();
  const company = useSettingsStore(state => state.settings);
  const [racks, setRacks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [loadedCodes, setLoadedCodes] = useState(new Set());
  useEffect(() => {
    api.get('/rak', { params: { limit: 100 } }).then(res => setRacks(getList(res)))
      .catch(() => toast.error('Gagal memuat daftar rak'));
  }, []);
  const filtered = racks.filter(rack => `${rack.kode} ${rack.nama} ${rackLocation(rack)}`.toLowerCase().includes(search.toLowerCase()));
  const toggle = rack => setSelected(current => current.some(item => item.id === rack.id)
    ? current.filter(item => item.id !== rack.id) : [...current, rack]);
  const printReady = selected.length > 0 && selected.every(rack => loadedCodes.has(rack.qr_code));

  return (
    <div className="qr-print-view">
      <div className="mb-6 no-print">
        <h1 className="text-2xl font-bold tracking-tight">{t('Cetak QR Rak')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('Satu QR per halaman, diletakkan di tengah kertas A4.')}</p>
      </div>
      <div className="qr-print-layout grid gap-6 lg:grid-cols-3">
        <Card className="h-fit no-print">
          <CardHeader><CardTitle className="text-base">{t('Pilih Rak')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><Input className="pl-9" value={search} onChange={event => setSearch(event.target.value)} placeholder={t('Cari rak atau lokasi...')} /></div>
            <ScrollArea className="h-80 rounded-md border p-2">
              <div className="space-y-1">
                {filtered.map(rack => (
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
            {!selected.length ? (
              <div className="py-20 text-center text-muted-foreground no-print"><QrCode size={48} className="mx-auto mb-2 opacity-50" />{t('Pilih rak untuk membuat label')}</div>
            ) : (
              <div className="qr-print-document grid gap-6 sm:grid-cols-2">
                {selected.map(rack => (
                  <article key={rack.id} className="qr-sheet relative aspect-[210/297] overflow-hidden border bg-white text-black shadow-sm">
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
