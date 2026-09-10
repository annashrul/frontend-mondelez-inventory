import { useState } from 'react';
import { Lock, Clock, CheckCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const shiftHistory = [
  { id: 1, shift: 'Pagi', tanggal: '2026-09-10', waktu_closing: '14:00', user: 'Admin', total_transaksi: 32, status: 'Selesai' },
  { id: 2, shift: 'Siang', tanggal: '2026-09-09', waktu_closing: '22:00', user: 'Budi', total_transaksi: 28, status: 'Selesai' },
  { id: 3, shift: 'Pagi', tanggal: '2026-09-09', waktu_closing: '14:00', user: 'Admin', total_transaksi: 35, status: 'Selesai' },
];

export default function Closing() {
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClosing = () => {
    if (!confirm('Apakah Anda yakin ingin melakukan closing shift?')) return;
    setLoading(true);
    setTimeout(() => {
      toast.success('Closing shift berhasil!');
      setLoading(false);
      setCatatan('');
    }, 1500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Closing Shift</h1>
        <p className="text-sm text-muted-foreground mt-1">Tutup shift dan catat pergantian</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg"><Lock size={20} className="text-primary" /></div>
                <div><CardTitle className="text-base">Shift Aktif</CardTitle><p className="text-xs text-muted-foreground mt-0.5">Shift saat ini berjalan</p></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shift</span><span className="font-medium">Pagi</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Mulai</span><span className="font-medium">06:00</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Operator</span><span className="font-medium">Admin</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Transaksi</span><span className="font-semibold text-primary">32 transaksi</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Durasi</span><span className="font-medium">{dayjs().format('HH:mm')}</span></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Catatan Closing</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Tambahkan catatan untuk shift ini..." rows={4} className="mb-4" />
              <Button onClick={handleClosing} disabled={loading} className="w-full">
                <Lock size={16} className="mr-2" />{loading ? 'Memproses...' : 'Closing Shift Sekarang'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-muted-foreground" /><CardTitle className="text-base">Riwayat Closing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {shiftHistory.map((h) => (
                  <div key={h.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><CheckCircle size={20} className="text-green-600" /></div>
                      <div>
                        <p className="font-medium text-sm">Shift {h.shift} - {dayjs(h.tanggal).format('DD/MM/YYYY')}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><User size={12} />{h.user} • Closing {h.waktu_closing}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold mb-1">{h.total_transaksi} trx</p>
                      <Badge variant="success">{h.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
