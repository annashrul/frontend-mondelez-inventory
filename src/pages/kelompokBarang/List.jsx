import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Kelompok' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'jumlah_barang', label: 'Jumlah Barang', render: (value) => <Badge variant="secondary">{value} item</Badge> },
];

export default function KelompokBarangList(props) {
  return <DataTable columns={columns} {...props} />;
}
