import { useState } from 'react';
import DashboardCharts from '@/components/DashboardCharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translate as translateUi, translateStockNote } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, LoaderCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { t, locale } = useTranslation();
  const [days, setDays] = useState(30);
  const { stats, loading, query } = useDashboardData(days);

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
        {[1, 2, 3, 4, 5, 6].map(item => <Skeleton key={item} className="h-80 w-full" />)}
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Barang', value: (stats?.totalBarang || 0).toLocaleString(locale), icon: Package, color: 'text-blue-600 bg-blue-100' },
    { label: 'Transaksi Hari Ini', value: (stats?.totalTransaksi || 0).toLocaleString(locale), icon: ShoppingCart, color: 'text-green-600 bg-green-100' },
    { label: 'Stok Menipis', value: (stats?.stokMenipis || 0).toLocaleString(locale), icon: AlertTriangle, color: 'text-amber-600 bg-amber-100' },
    { label: 'Nilai Inventory', value: `Rp ${(stats?.nilaiInventory || 0).toLocaleString(locale)}`, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{translateUi("Dashboard")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('Selamat datang di Sistem Inventory')}</p>
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

                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{t(stat.label)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {query.isError && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border p-4"><p className="text-sm text-muted-foreground">{t('Gagal memuat dashboard')}</p><Button variant="outline" size="sm" onClick={() => query.refetch()}>{t('Coba lagi')}</Button></div>}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold">{t('Analisis Inventory')}</h2><p className="mt-1 text-xs text-muted-foreground">{t('Tren transaksi berdasarkan tanggal WIB')}</p></div>
          <div className="flex items-center gap-2">
            {query.isFetching && <LoaderCircle role="status" aria-label={t('Memuat grafik...')} className="size-4 animate-spin text-muted-foreground" />}
            <Select value={String(days)} onValueChange={value => setDays(Number(value))}>
              <SelectTrigger className="w-40" aria-label={t('Periode grafik')}><SelectValue>{t('{value0} hari terakhir', { value0: days })}</SelectValue></SelectTrigger>
              <SelectContent>{[7, 30, 90].map(value => <SelectItem key={value} value={String(value)}>{t('{value0} hari terakhir', { value0: value })}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {query.isPlaceholderData ? <div role="status" aria-label={t('Memuat grafik...')} className="grid gap-6 lg:grid-cols-2">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-80 w-full" />)}</div> : <DashboardCharts analytics={stats?.analytics} />}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-muted-foreground" />
              <CardTitle className="text-base">{translateUi("Aktivitas Terbaru")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {!stats?.aktivitasTerbaru?.length && <p className="py-6 text-sm text-muted-foreground">{t('Belum ada aktivitas')}</p>}
              {stats?.aktivitasTerbaru?.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{act.barang}</p>
                    <p className="text-xs text-muted-foreground">{translateStockNote(act)}{translateUi(" oleh ")}{act.user} • {new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(act.tanggal))}</p>
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
              <CardTitle className="text-base">{translateUi("Stok Menipis")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {!stats?.lowStockItems?.length && <p className="py-6 text-sm text-muted-foreground">{t('Tidak ada barang dengan stok menipis')}</p>}
              {stats?.lowStockItems?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{item.nama}</p>
                    <p className="text-xs text-muted-foreground">{translateUi("Min: ")}{item.stok_min} {item.satuan_detail?.nama}</p>
                  </div>
                  <Badge variant="destructive">{translateUi("Sisa: ")}{item.stok} {item.satuan_detail?.nama}
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
