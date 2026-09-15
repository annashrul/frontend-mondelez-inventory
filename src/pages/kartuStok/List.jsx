import dayjs from 'dayjs';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/Pagination';

export default function KartuStokList({
  data,
  loading,
  pagination,
  onPageChange,
  onLimitChange,
  pageLoadingDirection,
  limitLoading,
}) {
  return (
    <>
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
            {loading ? (
              Array.from({ length: Math.min(Math.max(pagination?.limit || 5, 3), 8) }).map((_, index) => (
                <TableRow key={`kartu-skeleton-${index}`} className="hover:bg-transparent">
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-4 w-10" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-4 w-10" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">Belum ada data kartu stok</TableCell>
              </TableRow>
            ) : data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground">{dayjs(row.tanggal).format('DD/MM/YY HH:mm')}</TableCell>
                <TableCell>
                  <Badge
                    variant={row.tipe === 'Masuk' ? 'success' : 'outline'}
                    className={row.tipe === 'Masuk' ? 'gap-1' : 'gap-1 border-red-200 bg-red-50 text-red-600'}
                  >
                    {row.tipe === 'Masuk' ? <ArrowDownCircle size={12} /> : <ArrowUpCircle size={12} />}
                    {row.tipe}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.no_ref}</TableCell>
                <TableCell className="font-medium">{row.barang_detail?.nama || '-'}</TableCell>
                <TableCell className="text-right font-medium text-green-600">{row.tipe === 'Masuk' ? row.qty : '-'}</TableCell>
                <TableCell className="text-right font-medium text-red-500">{row.tipe === 'Keluar' ? row.qty : '-'}</TableCell>
                <TableCell className="text-right font-semibold">{row.saldo}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.keterangan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageLoadingDirection={pageLoadingDirection}
          limitLoading={limitLoading}
        />
      </div>
    </>
  );
}
