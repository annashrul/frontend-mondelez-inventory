import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Level' },
  { key: 'deskripsi', label: 'Deskripsi' },
  {
    key: 'permissions',
    label: 'Hak Akses',
    render: (v) => <Badge variant="outline">{(v || []).length}{translateUi(" permission")}</Badge>,
  },
  {
    key: 'jumlah_user',
    label: 'Jumlah User',
    render: (v) => <Badge variant="secondary">{v}{translateUi(" user")}</Badge>,
  },
];

export default function LevelPenggunaList(props) {
  useUiLanguage();
  return (
    <DataTable
      columns={columns}
      {...props}
    />
  );
}
