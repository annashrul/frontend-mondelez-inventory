import dayjs from 'dayjs';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';

const columns = [
  { key: 'tanggal', label: 'Tanggal', render: (value) => dayjs(value).format('DD/MM/YYYY') },
  { key: 'no_ref', label: 'No. Referensi' },
  { key: 'barang_detail', label: 'Barang', render: (value) => value?.nama || '-' },
  {
    key: 'tipe',
    label: 'Tipe',
    render: (value) => value === 'Tambah' ? (
      <Badge variant="success">+ Tambah</Badge>
    ) : (
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600">
        - Kurang
      </Badge>
    ),
  },
  { key: 'qty', label: 'Qty' },
  { key: 'alasan', label: 'Alasan' },
  { key: 'user_detail', label: 'User', render: (value) => value?.nama || '-' },
];

export default function AdjustmentStokList(props) {
  return <DataTable columns={columns} {...props} />;
}
