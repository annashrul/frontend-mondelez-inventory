import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import dayjs from 'dayjs';
import api from '@/services/api';

export default function LogActivity() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/log-activity').then(setLogs).catch(() => {});
  }, []);

  const filtered = logs.filter(l => l.aksi.toLowerCase().includes(search.toLowerCase()) || l.modul.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log Aktivitas Sistem</h1>
        <p className="text-sm text-muted-foreground mt-1">Riwayat aktivitas pengguna dalam sistem</p>
      </div>
      
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Cari log..." className="pl-8 bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-4">
        {filtered.map(log => (
          <Card key={log.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">{log.aksi}</p>
                <p className="text-xs text-muted-foreground mt-1">{log.deskripsi}</p>
              </div>
              <div className="text-left sm:text-right text-xs text-muted-foreground">
                <p>Oleh: {log.user}</p>
                <p>{dayjs(log.tanggal).format('DD MMM YYYY, HH:mm:ss')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center p-8 text-muted-foreground">Tidak ada log aktivitas.</div>}
      </div>
    </div>
  );
}