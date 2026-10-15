import { formatNumber } from '@/lib/numberFormat';
import { translate as translateUi, translateStockNote, useTranslation as useUiLanguage } from '@/lib/i18n';
import dayjs from 'dayjs';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InfiniteScrollFooter from '@/components/InfiniteScrollFooter';
import Pagination from '@/components/Pagination';

export default function KartuStokList({
  infiniteScroll,
  data,
  loading,
  pagination,
  onPageChange,
  onLimitChange,
  pageLoadingDirection,
  limitLoading,
}) {
  useUiLanguage();
  return (
    <>
      <div className="hidden rounded-lg border bg-card shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{translateUi("Tanggal")}</TableHead>
              <TableHead>{translateUi("Tipe")}</TableHead>
              <TableHead>{translateUi("No. Ref")}</TableHead>
              <TableHead>{translateUi("Barang")}</TableHead>
              <TableHead className="text-right">{translateUi("Masuk")}</TableHead>
              <TableHead className="text-right">{translateUi("Keluar", { context: 'stock' })}</TableHead>
              <TableHead className="text-right">{translateUi("Saldo")}</TableHead>
              <TableHead>{translateUi("Keterangan")}</TableHead>
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
                <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">{translateUi("Belum ada data kartu stok")}</TableCell>
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
                    {translateUi(row.tipe, { context: "stock" })}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.no_ref}</TableCell>
                <TableCell className="font-medium">{row.barang_detail?.nama || '-'}</TableCell>
                <TableCell className="text-right font-medium text-green-600">{row.tipe === 'Masuk' ? formatNumber(row.qty) : '-'}</TableCell>
                <TableCell className="text-right font-medium text-red-500">{row.tipe === 'Keluar' ? formatNumber(row.qty) : '-'}</TableCell>
                <TableCell className="text-right font-semibold">{formatNumber(row.saldo)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{translateStockNote(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div role="status" aria-label={translateUi('Memuat data berikutnya...')} className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <article key={index} className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex justify-between"><Skeleton className="h-6 w-20" /><Skeleton className="h-4 w-28" /></div>
                <Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" /><Skeleton className="h-4 w-3/4" />
              </article>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="grid min-h-40 place-items-center rounded-2xl border bg-card p-4 text-sm text-muted-foreground">{translateUi('Belum ada data kartu stok')}</div>
        ) : data.map(row => (
          <article key={row.id} className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant={row.tipe === 'Masuk' ? 'success' : 'outline'} className={row.tipe === 'Masuk' ? 'gap-1' : 'gap-1 border-red-200 bg-red-50 text-red-600'}>
                {row.tipe === 'Masuk' ? <ArrowDownCircle size={12} /> : <ArrowUpCircle size={12} />}
                {translateUi(row.tipe, { context: 'stock' })}
              </Badge>
              <span className="text-xs text-muted-foreground">{dayjs(row.tanggal).format('DD/MM/YY HH:mm')}</span>
            </div>
            <div className="min-w-0 space-y-1">
              <h3 className="break-words text-sm font-semibold">{row.barang_detail?.nama || '-'}</h3>
              <p className="break-all font-mono text-xs text-muted-foreground">{row.no_ref}</p>
            </div>
            <dl className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-center">
              <div><dt className="text-xs text-muted-foreground">{translateUi('Masuk')}</dt><dd className="mt-1 break-words text-sm font-semibold text-green-600">{row.tipe === 'Masuk' ? formatNumber(row.qty) : '-'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">{translateUi('Keluar', { context: 'stock' })}</dt><dd className="mt-1 break-words text-sm font-semibold text-red-500">{row.tipe === 'Keluar' ? formatNumber(row.qty) : '-'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">{translateUi('Saldo')}</dt><dd className="mt-1 break-words text-sm font-semibold">{formatNumber(row.saldo)}</dd></div>
            </dl>
            <dl className="space-y-1 border-t pt-3"><dt className="text-xs text-muted-foreground">{translateUi('Keterangan')}</dt><dd className="break-words text-sm">{translateStockNote(row) || '-'}</dd></dl>
          </article>
        ))}
      </div>
      {infiniteScroll && !loading && <InfiniteScrollFooter {...infiniteScroll} count={data.length} />}
      {!infiniteScroll && <div className="mt-4">
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageLoadingDirection={pageLoadingDirection}
          limitLoading={limitLoading}
        />
      </div>}
    </>
  );
}
