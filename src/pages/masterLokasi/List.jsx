import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Lokasi' },
  { key: 'alamat', label: 'Alamat / Posisi' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'jumlah_rak', label: 'Jumlah Rak', render: (value) => <Badge variant="secondary">{value} rak</Badge> },
];

export default function MasterLokasiList(props) {
  return <DataTable columns={columns} {...props} />;
}
