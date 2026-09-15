import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

const columns = [
  { key: 'kode', label: 'Kode Rak' },
  { key: 'qr_code', label: 'Isi QR', render: (value) => <code className="text-xs">{value}</code> },
  { key: 'nama', label: 'Nama Rak' },
  { key: 'lokasi_detail', label: 'Lokasi', render: (value) => value?.nama || '-' },
  { key: 'kapasitas', label: 'Kapasitas' },
  {
    key: 'terisi',
    label: 'Terisi',
    render: (value, row) => {
      const pct = row.kapasitas > 0 ? Math.min(100, Math.round((value / row.kapasitas) * 100)) : 0;
      const color = pct > 80 ? 'bg-destructive' : pct > 50 ? 'bg-amber-500' : 'bg-green-500';
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
      );
    },
  },
];

export default function MasterRakList({ onShowQr, ...props }) {
  return (
    <DataTable
      columns={columns}
      actions={(row) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => onShowQr?.(row)}
        >
          <QrCode size={13} />
          QR
        </Button>
      )}
      {...props}
    />
  );
}
