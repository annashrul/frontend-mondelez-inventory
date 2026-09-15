import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';

const columns = [
  { key: 'username', label: 'Username' },
  { key: 'nama', label: 'Nama Lengkap' },
  { key: 'email', label: 'Email' },
  { key: 'level_detail', label: 'Level Pengguna', render: (value) => value?.nama || '-' },
  {
    key: 'status',
    label: 'Status',
    render: (v) => (
      <Badge variant={v === 'Aktif' ? 'success' : 'secondary'}>{v}</Badge>
    ),
  },
];

export default function MasterPenggunaList(props) {
  return (
    <DataTable
      columns={columns}
      {...props}
    />
  );
}
