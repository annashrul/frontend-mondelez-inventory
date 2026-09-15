import DataTable from '@/components/DataTable';

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama Satuan' },
  { key: 'deskripsi', label: 'Deskripsi' },
];

export default function MasterSatuanList(props) {
  return <DataTable columns={columns} {...props} />;
}
