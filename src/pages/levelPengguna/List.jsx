import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Level' },
  { key: 'deskripsi', label: 'Deskripsi' },
  {
    key: 'permissions',
    label: 'Hak Akses',
    render: (v) => <Badge variant="outline">{(v || []).length} permission</Badge>,
  },
  {
    key: 'jumlah_user',
    label: 'Jumlah User',
    render: (v) => <Badge variant="secondary">{v} user</Badge>,
  },
];

export default function LevelPenggunaList(props) {
  return (
    <DataTable
      columns={columns}
      {...props}
    />
  );
}
