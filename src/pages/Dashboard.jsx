import { useState, useEffect } from 'react';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res);
      } catch (e) {
        console.error('Gagal load stats');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Barang', value: stats?.totalBarang, change: '+12%', up: true, icon: Package, color: 'text-blue-600 bg-blue-100' },
    { label: 'Transaksi Hari Ini', value: stats?.totalTransaksi, change: '+8%', up: true, icon: ShoppingCart, color: 'text-green-600 bg-green-100' },
    { label: 'Stok Menipis', value: stats?.stokMenipis, change: '+3%', up: false, icon: AlertTriangle, color: 'text-amber-600 bg-amber-100' },
    { label: 'Nilai Inventory', value: `Rp ${(stats?.nilaiInventory || 0).toLocaleString('id-ID')}`, change: '+5%', up: true, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Selamat datang di Sistem Inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const [textColor, bgColor] = stat.color.split(' ');
          return (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${bgColor}`}>
                    <Icon size={20} className={textColor} />
                  </div>
                  <Badge variant={stat.up ? 'success' : 'destructive'} className="text-[11px]">
                    {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-muted-foreground" />
              <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {stats?.aktivitasTerbaru?.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{act.barang}</p>
                    <p className="text-xs text-muted-foreground">{act.keterangan} oleh {act.user} • {act.tanggal.split('T')[0]}</p>
                  </div>
                  <span className={`text-sm font-semibold ${act.tipe === 'Masuk' ? 'text-green-600' : 'text-red-500'}`}>
                    {act.tipe === 'Masuk' ? '+' : '-'}{act.qty}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <CardTitle className="text-base">Stok Menipis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {stats?.lowStockItems?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{item.nama}</p>
                    <p className="text-xs text-muted-foreground">Min: {item.stok_min} {item.satuan}</p>
                  </div>
                  <Badge variant="destructive">
                    Sisa: {item.stok} {item.satuan}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}