import { useState, useRef } from 'react';
import { QrCode, Printer, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const dummyItems = [
  { id: 1, kode: 'BRG-001', nama: 'Kertas A4 70gsm' },
  { id: 2, kode: 'BRG-002', nama: 'Pulpen Pilot G-2' },
  { id: 3, kode: 'BRG-003', nama: 'Tinta Printer HP' },
  { id: 4, kode: 'BRG-004', nama: 'Map Ordner' },
  { id: 5, kode: 'BRG-005', nama: 'Amplop Coklat F4' },
];

function Preview({ selected, tipe, qty, printRef, onPrint }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Preview ({selected.length} × {qty})</CardTitle>
        <Button onClick={onPrint} disabled={!selected.length} size="sm">
          <Printer size={16} className="mr-2" />Cetak
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={printRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {!selected.length ? (
            <div className="col-span-full py-16 text-center text-muted-foreground">
              <QrCode size={48} className="mx-auto mb-2 opacity-50" /><p>Pilih barang untuk generate label</p>
            </div>
          ) : selected.flatMap((item) =>
            Array.from({ length: qty }, (_, i) => (
              <div key={`${item.id}-${i}`} className="border rounded-lg p-3 text-center">
                <div className="w-20 h-20 bg-muted mx-auto flex items-center justify-center rounded border-2 border-primary">
                  {tipe === 'qrcode' ? (
                    <div className="grid grid-cols-5 gap-0.5 w-14 h-14">
                      {Array.from({ length: 25 }, (_, j) => <div key={j} className={`w-full aspect-square ${Math.random() > 0.5 ? 'bg-primary' : 'bg-background'}`} />)}
                    </div>
                  ) : (
                    <div className="flex items-end gap-px h-12">
                      {Array.from({ length: 20 }, (_, j) => <div key={j} className="bg-primary" style={{ width: Math.random() > 0.5 ? 2 : 1, height: `${40 + Math.random() * 30}%` }} />)}
                    </div>
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-2">{item.kode}</p>
                <p className="text-xs truncate">{item.nama}</p>
                </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CetakBarcode() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [tipe, setTipe] = useState('qrcode');
  const [qty, setQty] = useState(1);
  const printRef = useRef();

  const filtered = dummyItems.filter((i) =>
    i.nama.toLowerCase().includes(search.toLowerCase()) || i.kode.toLowerCase().includes(search.toLowerCase())
  );
  const toggle = (item) => {
    setSelected((p) => p.find((s) => s.id === item.id) ? p.filter((s) => s.id !== item.id) : [...p, item]);
  };
  const handlePrint = () => {
    const w = window.open('', '', 'width=800,height=600');
    w.document.write(`<html><head><title>Cetak Label</title><style>body{font-family:sans-serif;padding:20px}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.i{border:1px solid #ddd;padding:10px;text-align:center;border-radius:6px}.c{font-size:11px;margin-top:4px;font-family:monospace}.n{font-size:10px;color:#666}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.print();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Cetak Barcode / QR Code</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate dan cetak label barcode/QR code</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pilih Barang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari barang..." className="pl-9" />
            </div>
            
            <ScrollArea className="h-72 border rounded-md p-2">
              <div className="space-y-1">
                {filtered.map((item) => {
                  const isChecked = !!selected.find((s) => s.id === item.id);
                  return (
                    <label key={item.id} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isChecked ? 'bg-primary/5' : 'hover:bg-muted'}`}>
                      <Checkbox checked={isChecked} onCheckedChange={() => toggle(item)} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none">{item.nama}</span>
                        <span className="text-xs text-muted-foreground mt-1">{item.kode}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
            
            <div className="pt-4 border-t space-y-4">
              <div className="space-y-2">
                <Label>Tipe Label</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={tipe === 'qrcode' ? 'default' : 'outline'} className="flex-1" onClick={() => setTipe('qrcode')}>QR Code</Button>
                  <Button type="button" variant={tipe === 'barcode' ? 'default' : 'outline'} className="flex-1" onClick={() => setTipe('barcode')}>Barcode</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jumlah per Item</Label>
                <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} min={1} max={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Preview selected={selected} tipe={tipe} qty={qty} printRef={printRef} onPrint={handlePrint} />
      </div>
    </div>
  );
}
              