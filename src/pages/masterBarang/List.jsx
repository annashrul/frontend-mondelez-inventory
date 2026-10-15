import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import { getAppLocale } from '@/lib/i18n';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';

const columns = [
  {
    key: 'image_url',
    label: 'Gambar',
    render: (val, row) => (
      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted text-center text-[10px] leading-tight text-muted-foreground">
        {val ? <img src={val} alt={row.nama} className="size-full object-cover" /> : translateUi("Belum ada")}
      </div>
    ),
  },
  { key: 'kode', label: 'Kode' },
  { key: 'barcode', label: 'Barcode' },
  { key: 'nama', label: 'Nama Barang' },
  { key: 'kelompok_detail', label: 'Kelompok', render: (value) => value?.nama || '-' },
  { key: 'satuan_detail', label: 'Satuan', render: (value) => value?.nama || '-' },
  { key: 'rak_detail', label: 'Rak', render: (value) => value?.nama || '-' },
  {
    key: 'stok',
    label: 'Stok',
    render: (val, row) => (
      <span className={`font-semibold ${val <= row.stok_min ? 'text-red-600' : 'text-green-600'}`}>{val}</span>
    ),
  },
  {
    key: 'harga',
    label: 'Harga',
    render: (val) => `Rp ${val?.toLocaleString(getAppLocale())}`,
  },
  {
    key: 'has_embedding',
    label: 'AI',
    render: (val, row) => (
      <Badge variant={val ? 'success' : 'outline'} title={row.embedding_model || ''}>
        {val ? translateUi("Siap dicari") : translateUi("Belum ada")}
      </Badge>
    ),
  },
];

export default function MasterBarangList({
  mobile, query, hasNext, loadingMore, loadMore, searchDebouncing,
  data,
  loading,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
  onLimitChange,
  pageLoadingDirection,
  limitLoading,
}) {
  useUiLanguage();
  const sentinel = useRef(null);
  const { fetchNextPage, isFetching, isError } = query;
  useEffect(() => {
    if (!mobile || !sentinel.current || !hasNext || isFetching || isError || searchDebouncing) return;
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void fetchNextPage({ cancelRefetch: false }).catch(() => {});
    }, { rootMargin: '240px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [mobile, hasNext, isFetching, isError, searchDebouncing, fetchNextPage, data.length]);
  return (
    <>
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      pagination={mobile ? undefined : pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      pageLoadingDirection={pageLoadingDirection}
      limitLoading={limitLoading}
      actionColumnFixed="right"
    />
    {mobile && !loading && (
      <div ref={sentinel} className="mt-4 flex min-h-12 items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
        {isError ? <><span>{translateUi('Gagal memuat data barang')}</span><Button variant="outline" size="sm" disabled={isFetching} onClick={() => (query.isFetchNextPageError ? loadMore() : query.refetch()).catch(() => {})}>{translateUi('Coba lagi')}</Button></>
          : loadingMore ? <span role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />{translateUi('Memuat barang berikutnya...')}</span>
          : hasNext ? <Button variant="ghost" size="sm" disabled={isFetching || searchDebouncing} onClick={() => loadMore().catch(() => {})}>{translateUi('Muat lebih banyak')}</Button>
          : data.length > 0 ? translateUi('Semua barang sudah ditampilkan') : null}
      </div>
    )}
    </>
  );
}
