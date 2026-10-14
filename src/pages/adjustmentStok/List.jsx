import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
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
      <Badge variant="success">{translateUi("+ Tambah", { context: "stock" })}</Badge>
    ) : (
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600">{translateUi("- Kurang")}</Badge>
    ),
  },
  { key: 'qty', label: 'Jumlah' },
  { key: 'alasan', label: 'Alasan' },
  { key: 'user_detail', label: 'Pengguna', render: (value) => value?.nama || '-' },
];

export default function AdjustmentStokList(props) {
  useUiLanguage();
  return <DataTable columns={columns} {...props} />;
}
