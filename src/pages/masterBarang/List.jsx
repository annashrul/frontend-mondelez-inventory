import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatCurrency } from '@/lib/numberFormat';
import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
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
      <span className={`font-semibold ${val <= row.stok_min ? 'text-red-600' : 'text-green-600'}`}>{formatNumber(val)}</span>
    ),
  },
  {
    key: 'harga',
    label: 'Harga',
    render: (val) => formatCurrency(val),
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


function ProductPhoto({ src, name }) {
  const [failed, setFailed] = useState(false);
  return <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
    {src && !failed ? <img src={src} alt={name} loading="lazy" decoding="async" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      : <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground"><ImageOff className="size-10 opacity-50" aria-hidden="true" /><span className="text-sm">{translateUi('Belum ada gambar')}</span></div>}
  </div>;
}

function renderMobileCard(row, index, actions) {
  const lowStock = Number(row.stok) <= Number(row.stok_min);
  return <article key={row.id || index} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
    <div className="relative">
      <ProductPhoto key={row.image_url || 'empty'} src={row.image_url} name={row.nama} />
      <span className="absolute left-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold shadow-sm">#{formatNumber(index + 1)}</span>
    </div>
    <div className="space-y-4 p-4">
      <div className="space-y-1.5">
        <p className="break-all font-mono text-xs text-muted-foreground">{row.kode}</p>
        <h3 className="break-words text-lg font-semibold leading-snug">{row.nama}</h3>
        <p className="text-base font-semibold text-primary">{formatCurrency(row.harga)}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/50 p-3">
        <div><p className="text-xs text-muted-foreground">{translateUi('Stok')}</p><p className={`mt-1 text-xl font-bold ${lowStock ? 'text-red-600' : 'text-green-600'}`}>{formatNumber(row.stok)} <span className="text-sm font-medium text-muted-foreground">{row.satuan_detail?.nama || '-'}</span></p></div>
        <Badge variant={row.has_embedding ? 'success' : 'outline'} title={row.embedding_model || ''}>{translateUi(row.has_embedding ? 'Siap dicari' : 'Belum ada')}</Badge>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        {[['Kelompok', row.kelompok_detail?.nama], ['Rak', row.rak_detail?.nama], ['Barcode', row.barcode], ['Stok Minimum', formatNumber(row.stok_min)]].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{translateUi(label)}</dt><dd className="mt-1 break-words font-medium [overflow-wrap:anywhere]">{value || '-'}</dd></div>)}
      </dl>
      {actions}
    </div>
  </article>;
}

function renderMobileSkeleton(count) {
  return <div role="status" aria-label={translateUi('Memuat data berikutnya...')} className="space-y-3">{Array.from({ length: count }, (_, index) => <article key={index} aria-hidden="true" className="overflow-hidden rounded-2xl border bg-card shadow-sm">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="space-y-4 p-4"><Skeleton className="h-3 w-24" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-5 w-28" /><Skeleton className="h-20 w-full rounded-xl" /><div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div><Skeleton className="h-9 w-full" /></div>
  </article>)}</div>;
}

export default function MasterBarangList({
  mobile, query, hasNext, loadingMore, searchDebouncing,
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
  return (
    <DataTable
      columns={columns}
      renderMobileCard={renderMobileCard}
      renderMobileSkeleton={renderMobileSkeleton}
      data={data}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      pagination={pagination}
      infiniteScroll={mobile ? { query, hasNext, loadingMore, searchDebouncing } : undefined}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      pageLoadingDirection={pageLoadingDirection}
      limitLoading={limitLoading}
      actionColumnFixed="right"
    />
  );
}
