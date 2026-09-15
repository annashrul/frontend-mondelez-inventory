import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';

const columns = [
  {
    key: 'image_url',
    label: 'Gambar',
    render: (val, row) => (
      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted text-center text-[10px] leading-tight text-muted-foreground">
        {val ? <img src={val} alt={row.nama} className="size-full object-cover" /> : 'Belum ada'}
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
    render: (val) => `Rp ${val?.toLocaleString('id-ID')}`,
  },
  {
    key: 'has_embedding',
    label: 'AI',
    render: (val, row) => (
      <Badge variant={val ? 'success' : 'outline'} title={row.embedding_model || ''}>
        {val ? 'Siap dicari' : 'Belum ada'}
      </Badge>
    ),
  },
];

export default function MasterBarangList({
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
  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      pageLoadingDirection={pageLoadingDirection}
      limitLoading={limitLoading}
      actionColumnFixed="right"
    />
  );
}
