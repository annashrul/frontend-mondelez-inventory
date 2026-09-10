import {
  Package, ShoppingCart, AlertTriangle, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  { label: 'Total Barang', value: '1,248', change: '+12%', up: true, icon: Package, color: 'text-blue-600 bg-blue-100' },
  { label: 'Transaksi Hari Ini', value: '64', change: '+8%', up: true, icon: ShoppingCart, color: 'text-green-600 bg-green-100' },
  { label: 'Stok Menipis', value: '23', change: '+3', up: false, icon: AlertTriangle, color: 'text-amber-600 bg-amber-100' },
  { label: 'Nilai Inventory', value: 'Rp 2.4M', change: '+5%', up: true, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
];

const recentActivities = [
  { id: 1, action: 'Pengambilan Barang', item: 'Kertas A4 70gsm', user: 'Budi', time: '5 menit lalu', qty: -50 },
  { id: 2, action: 'Barang Masuk', item: 'Tinta Printer HP', user: 'Admin', time: '15 menit lalu', qty: 100 },
  { id: 3, action: 'Adjustment Stok', item: 'Amplop Coklat F4', user: 'Sari', time: '1 jam lalu', qty: -5 },
  { id: 4, action: 'Barang Masuk', item: 'Stapler Kenko', user: 'Admin', time: '2 jam lalu', qty: 24 },
  { id: 5, action: 'Pengambilan Barang', item: 'Pulpen Pilot G-2', user: 'Andi', time: '3 jam lalu', qty: -12 },
];

const lowStockItems = [
  { id: 1, name: 'Kertas A4 70gsm', stock: 5, min: 50, unit: 'rim' },
  { id: 2, name: 'Tinta Printer Canon', stock: 2, min: 10, unit: 'pcs' },
  { id: 3, name: 'Map Ordner', stock: 8, min: 25, unit: 'pcs' },
  { id: 4, name: 'Isolasi Bening', stock: 3, min: 20, unit: 'roll' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Selamat datang di Sistem Inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
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
              {recentActivities.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{act.item}</p>
                    <p className="text-xs text-muted-foreground">{act.action} oleh {act.user} • {act.time}</p>
                  </div>
                  <span className={`text-sm font-semibold ${act.qty > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {act.qty > 0 ? '+' : ''}{act.qty}
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
              {lowStockItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Min: {item.min} {item.unit}</p>
                  </div>
                  <Badge variant="destructive">
                    Sisa: {item.stock} {item.unit}
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
