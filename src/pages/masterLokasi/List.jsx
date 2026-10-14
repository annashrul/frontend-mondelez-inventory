import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Lokasi' },
  { key: 'alamat', label: 'Alamat / Posisi' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'jumlah_rak', label: 'Jumlah Rak', render: (value) => <Badge variant="secondary">{value}{translateUi(" rak")}</Badge> },
];

export default function MasterLokasiList(props) {
  useUiLanguage();
  return <DataTable columns={columns} {...props} />;
}
