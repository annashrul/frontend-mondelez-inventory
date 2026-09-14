import { useEffect, useState } from 'react';
import { Printer, QrCode, Search } from 'lucide-react';
import { toast } from 'sonner';
import QrImage from '@/components/QrImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import api, { getList } from '@/services/api';

export default function CetakBarcode() {
  const [racks, setRacks] = useState([]); const [selected, setSelected] = useState([]); const [search, setSearch] = useState('');
  useEffect(() => { api.get('/rak', { params: { limit: 100 } }).then((res) => setRacks(getList(res))).catch(() => toast.error('Gagal memuat daftar rak')); }, []);
  const filtered = racks.filter((rack) => `${rack.kode} ${rack.nama} ${rack.lokasi}`.toLowerCase().includes(search.toLowerCase()));
  const toggle = (rack) => setSelected((current) => current.some((item) => item.id === rack.id) ? current.filter((item) => item.id !== rack.id) : [...current, rack]);
  const print = () => { window.print(); };
  return <div>
    <div className="mb-6 no-print"><h1 className="text-2xl font-bold tracking-tight">Cetak QR Rak</h1><p className="text-sm text-muted-foreground mt-1">Satu rak memiliki satu QR unik untuk validasi pengambilan barang</p></div>
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="h-fit no-print"><CardHeader><CardTitle className="text-base">Pilih Rak</CardTitle></CardHeader><CardContent className="space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari rak atau lokasi..." /></div><ScrollArea className="h-80 border rounded-md p-2"><div className="space-y-1">{filtered.map((rack) => <label key={rack.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"><Checkbox checked={selected.some((item) => item.id === rack.id)} onCheckedChange={() => toggle(rack)} /><span><span className="block text-sm font-medium">{rack.nama}</span><span className="block text-xs text-muted-foreground">{rack.kode} · {rack.lokasi}</span></span></label>)}</div></ScrollArea></CardContent></Card>
      <Card className="lg:col-span-2 print:border-0 print:shadow-none"><CardHeader className="flex flex-row items-center justify-between no-print"><CardTitle className="text-base">Preview Label ({selected.length})</CardTitle><Button onClick={print} disabled={!selected.length}><Printer size={16} className="mr-2" />Cetak QR Rak</Button></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{!selected.length ? <div className="col-span-full py-20 text-center text-muted-foreground"><QrCode size={48} className="mx-auto mb-2 opacity-50" />Pilih rak untuk membuat label</div> : selected.map((rack) => <div key={rack.id} className="border-2 border-black rounded-md p-4 text-center break-inside-avoid"><QrImage value={rack.qr_code} size={150} className="mx-auto" /><p className="font-bold text-lg mt-2">{rack.nama}</p><p className="text-xs">{rack.lokasi}</p><p className="font-mono text-xs mt-2">{rack.qr_code}</p></div>)}</div></CardContent></Card>
    </div>
  </div>;
}
