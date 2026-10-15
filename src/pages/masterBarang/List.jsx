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
