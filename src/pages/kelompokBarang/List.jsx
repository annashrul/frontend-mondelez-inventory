import { formatNumber } from '@/lib/numberFormat';
import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Kelompok' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'jumlah_barang', label: 'Jumlah Barang', render: (value) => <Badge variant="secondary">{formatNumber(value)}{translateUi(" item")}</Badge> },
];

export default function KelompokBarangList(props) {
  useUiLanguage();
  return <DataTable columns={columns} {...props} />;
}
