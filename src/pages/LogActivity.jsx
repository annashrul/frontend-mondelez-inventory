import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import dayjs from 'dayjs';
import { Activity, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const dummyData = [
  { id: 1, waktu: '2026-09-10 14:30:22', user: 'Admin', aksi: 'Login', modul: 'Auth', detail: 'Login berhasil', ip: '192.168.1.100' },
  { id: 2, waktu: '2026-09-10 14:25:10', user: 'Admin', aksi: 'Tambah', modul: 'Master Barang', detail: 'Tambah barang: Kertas A4 70gsm', ip: '192.168.1.100' },
  { id: 3, waktu: '2026-09-10 13:15:45', user: 'Budi', aksi: 'Edit', modul: 'Master Barang', detail: 'Update stok: Pulpen Pilot G-2', ip: '192.168.1.102' },
  { id: 4, waktu: '2026-09-10 12:00:00', user: 'Sari', aksi: 'Hapus', modul: 'Kelompok Barang', detail: 'Hapus kelompok: Lain-lain', ip: '192.168.1.103' },
  { id: 5, waktu: '2026-09-10 11:30:00', user: 'Budi', aksi: 'Tambah', modul: 'Pengambilan', detail: 'Pengambilan AMB-001', ip: '192.168.1.102' },
  { id: 6, waktu: '2026-09-10 10:00:00', user: 'Admin', aksi: 'Closing', modul: 'Closing', detail: 'Closing shift pagi', ip: '192.168.1.100' },
  { id: 7, waktu: '2026-09-09 16:45:00', user: 'Andi', aksi: 'Login', modul: 'Auth', detail: 'Login gagal - password salah', ip: '192.168.1.105' },
  { id: 8, waktu: '2026-09-09 15:20:00', user: 'Admin', aksi: 'Adjustment', modul: 'Adjustment', detail: 'Adjustment ADJ-003', ip: '192.168.1.100' },
];

const aksiColor = { Login: 'default', Tambah: 'success', Edit: 'warning', Hapus: 'destructive', Closing: 'secondary', Adjustment: 'outline' };

export default function LogActivity() {
  const [search, setSearch] = useState('');
  const [filterAksi, setFilterAksi] = useState('Semua');

  const filtered = dummyData.filter((d) => {
    const ms = d.user.toLowerCase().includes(search.toLowerCase()) || d.detail.toLowerCase().includes(search.toLowerCase());
    const ma = filterAksi === 'Semua' || d.aksi === filterAksi;
    return ms && ma;
  });

  return (
    <div>
      <PageHeader title="Log Activity" subtitle="Riwayat aktivitas pengguna dalam sistem" searchValue={search} onSearchChange={setSearch}>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <Filter size={16} className="text-muted-foreground" />
          {['Semua', 'Login', 'Tambah', 'Edit', 'Hapus', 'Closing'].map((t) => (
            <Button
              key={t}
              variant={filterAksi === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterAksi(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </PageHeader>
      
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="divide-y">
          {filtered.map((log) => (
            <div key={log.id} className="px-5 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Activity size={18} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{log.user}</span>
                  <Badge variant={aksiColor[log.aksi] || 'secondary'}>{log.aksi}</Badge>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{log.modul}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{log.detail}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium">{dayjs(log.waktu).format('DD/MM/YY HH:mm')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{log.ip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
