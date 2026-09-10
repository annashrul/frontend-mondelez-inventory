import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import dayjs from 'dayjs';
import { ArrowDownCircle, ArrowUpCircle, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const dummyData = [
  { id: 1, tanggal: '2026-09-10 08:30', tipe: 'Masuk', no_ref: 'IN-001', barang: 'Kertas A4 70gsm', qty: 100, saldo: 250, keterangan: 'Pembelian', user: 'Admin' },
  { id: 2, tanggal: '2026-09-10 10:15', tipe: 'Keluar', no_ref: 'OUT-001', barang: 'Kertas A4 70gsm', qty: 50, saldo: 200, keterangan: 'Pengambilan Dept. HRD', user: 'Budi' },
  { id: 3, tanggal: '2026-09-09 14:00', tipe: 'Masuk', no_ref: 'IN-002', barang: 'Pulpen Pilot G-2', qty: 48, saldo: 248, keterangan: 'Pembelian', user: 'Admin' },
  { id: 4, tanggal: '2026-09-09 16:30', tipe: 'Keluar', no_ref: 'OUT-002', barang: 'Pulpen Pilot G-2', qty: 12, saldo: 236, keterangan: 'Pengambilan Dept. Finance', user: 'Sari' },
  { id: 5, tanggal: '2026-09-08 09:00', tipe: 'Masuk', no_ref: 'ADJ-003', barang: 'Map Ordner', qty: 20, saldo: 65, keterangan: 'Adjustment stok', user: 'Admin' },
  { id: 6, tanggal: '2026-09-08 11:20', tipe: 'Keluar', no_ref: 'OUT-003', barang: 'Map Ordner', qty: 10, saldo: 55, keterangan: 'Pengambilan Dept. GA', user: 'Budi' },
];

export default function KartuStok() {
  const [search, setSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState('Semua');

  const filtered = dummyData.filter((d) => {
    const matchSearch = d.barang.toLowerCase().includes(search.toLowerCase()) || d.no_ref.toLowerCase().includes(search.toLowerCase());
    const matchTipe = filterTipe === 'Semua' || d.tipe === filterTipe;
    return matchSearch && matchTipe;
  });

  return (
    <div>
      <PageHeader title="Kartu Stok" subtitle="Riwayat keluar masuk barang" searchValue={search} onSearchChange={setSearch}>
        <div className="flex items-center gap-2 mt-4">
          <Filter size={16} className="text-muted-foreground" />
          {['Semua', 'Masuk', 'Keluar'].map((t) => (
            <Button
              key={t}
              variant={filterTipe === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterTipe(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </PageHeader>
      
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Tanggal</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>No. Ref</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead className="text-right">Masuk</TableHead>
              <TableHead className="text-right">Keluar</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground">{dayjs(row.tanggal).format('DD/MM/YY HH:mm')}</TableCell>
                <TableCell>
                  <Badge variant={row.tipe === 'Masuk' ? 'success' : 'destructive'} className="gap-1">
                    {row.tipe === 'Masuk' ? <ArrowDownCircle size={12} /> : <ArrowUpCircle size={12} />}
                    {row.tipe}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.no_ref}</TableCell>
                <TableCell className="font-medium">{row.barang}</TableCell>
                <TableCell className="text-right text-green-600 font-medium">{row.tipe === 'Masuk' ? row.qty : '-'}</TableCell>
                <TableCell className="text-right text-red-500 font-medium">{row.tipe === 'Keluar' ? row.qty : '-'}</TableCell>
                <TableCell className="text-right font-semibold">{row.saldo}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{row.keterangan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
