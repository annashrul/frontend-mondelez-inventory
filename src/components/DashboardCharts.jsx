import { useState } from 'react';
import { ArrowDownUp, ChartNoAxesCombined, ChartPie, Package } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const palette = ['#3b82f6', '#14b8a6', '#f59e0b', '#8b5cf6', '#f43f5e', '#64748b'];
const formatDate = (date, locale, options = {}) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta', ...options }).format(new Date(`${date}T12:00:00+07:00`));

function ChartCard({ title, description, icon: Icon, children }) {
  const { t } = useTranslation();
  return <Card className="min-w-0"><CardHeader className="pb-2"><div className="flex items-center gap-2"><Icon className="size-4 text-muted-foreground" /><CardTitle className="text-base">{t(title)}</CardTitle></div><p className="text-xs text-muted-foreground">{t(description)}</p></CardHeader><CardContent className="min-w-0 space-y-4">{children}</CardContent></Card>;
}

function Timeline({ data, series, bars = false, label }) {
  const { t, locale } = useTranslation();
  const [active, setActive] = useState(null);
  const number = value => Number(value).toLocaleString(locale);
  const totals = series.map(item => data.reduce((sum, day) => sum + day[item.key], 0));
  const width = 480, height = 250, left = 42, right = 16, top = 16, bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const highest = Math.max(1, ...data.flatMap(day => series.map(item => day[item.key])));
  const tick = Math.max(1, Math.ceil(highest / 4));
  const maximum = tick * 4;
  const column = plotWidth / Math.max(data.length, 1);
  const x = index => left + (index + 0.5) * column;
  const y = value => top + plotHeight * (1 - value / maximum);
  const tickIndexes = [...new Set([0, Math.floor((data.length - 1) / 4), Math.floor((data.length - 1) / 2), Math.floor((data.length - 1) * 3 / 4), data.length - 1])].filter(index => index >= 0);
  const selected = data[active];

  return <>
    <div className="flex flex-wrap gap-x-5 gap-y-2">{series.map((item, index) => <div key={item.key} className="flex items-center gap-2 text-xs"><span className="size-2.5 rounded-full" style={{ background: item.color }} /><span className="text-muted-foreground">{t(item.label)}</span><strong>{number(totals[index])}</strong></div>)}</div>
    {totals.every(value => value === 0) ? <div role="status" className="grid h-56 place-items-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{t('Belum ada transaksi pada periode ini')}</div> : <div className="relative">
      <div className="min-h-10 text-xs text-muted-foreground" aria-live="polite">{selected ? <div className="flex flex-wrap gap-x-4 gap-y-1"><strong className="text-foreground">{formatDate(selected.date, locale, { year: 'numeric' })}</strong>{series.map(item => <span key={item.key}>{t(item.label)}: <strong style={{ color: item.color }}>{number(selected[item.key])}</strong></span>)}</div> : t('Arahkan kursor atau fokuskan titik untuk melihat detail')}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible" role="group" aria-label={t(label)}>
        {[0, 1, 2, 3, 4].map(index => <g key={index}><line x1={left} x2={width - right} y1={y(index * tick)} y2={y(index * tick)} stroke="currentColor" className="text-border" strokeDasharray="3 4" /><text x={left - 10} y={y(index * tick) + 4} textAnchor="end" fontSize="16" fill="currentColor" className="text-muted-foreground">{number(index * tick)}</text></g>)}
        {series.map((item, seriesIndex) => bars ? <g key={item.key}>{data.map((day, index) => <rect key={day.date} x={x(index) + (seriesIndex - series.length / 2) * Math.min(16, column * 0.35)} y={y(day[item.key])} width={Math.min(16, column * 0.35) - 1} height={Math.max(0, y(0) - y(day[item.key]))} rx="2" fill={item.color} />)}</g> : <g key={item.key}><path d={`M ${x(0)} ${y(0)} ${data.map((day, index) => `L ${x(index)} ${y(day[item.key])}`).join(' ')} L ${x(data.length - 1)} ${y(0)} Z`} fill={item.color} opacity="0.1" /><polyline points={data.map((day, index) => `${x(index)},${y(day[item.key])}`).join(' ')} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /></g>)}
        {tickIndexes.map(index => <text key={index} x={x(index)} y={height - 8} textAnchor="middle" fontSize="16" fill="currentColor" className="text-muted-foreground">{formatDate(data[index].date, locale)}</text>)}
        {selected && <line x1={x(active)} x2={x(active)} y1={top} y2={y(0)} stroke="currentColor" className="text-muted-foreground" strokeDasharray="4 4" />}
        {data.map((day, index) => <rect key={day.date} x={left + index * column} y={top} width={column} height={plotHeight} fill="transparent" tabIndex={0} role="button" aria-label={`${formatDate(day.date, locale)}: ${series.map(item => `${t(item.label)} ${number(day[item.key])}`).join(', ')}`} className="cursor-crosshair outline-none focus:stroke-ring" onPointerEnter={() => setActive(index)} onPointerLeave={() => setActive(null)} onFocus={() => setActive(index)} onBlur={() => setActive(null)} onClick={() => setActive(index)} />)}
        {!bars && selected && series.map(item => <circle key={item.key} cx={x(active)} cy={y(selected[item.key])} r="4" fill={item.color} stroke="var(--card)" strokeWidth="2" pointerEvents="none" />)}
      </svg>
    </div>}
  </>;
}

function CategoryChart({ categories }) {
  const { t, locale } = useTranslation();
  const [active, setActive] = useState(null);
  const sorted = [...categories].sort((a, b) => b.total_barang - a.total_barang);
  const sections = sorted.slice(0, 5);
  if (sorted.length > 5) sections.push({ other: true, total_barang: sorted.slice(5).reduce((sum, item) => sum + item.total_barang, 0) });
  const total = sections.reduce((sum, item) => sum + item.total_barang, 0);
  const circumference = 2 * Math.PI * 70;
  const name = item => item.other ? t('Lainnya') : item.nama || t('Tanpa Kelompok');
  const selected = sections[active];
  if (!total) return <div role="status" className="grid h-56 place-items-center text-sm text-muted-foreground">{t('Belum ada data barang')}</div>;
  return <div className="grid items-center gap-5 sm:grid-cols-[200px_minmax(0,1fr)]">
    <div className="relative mx-auto size-48"><svg viewBox="0 0 200 200" className="size-full" role="group" aria-label={t('Distribusi Kelompok Barang')}><circle cx="100" cy="100" r="70" fill="none" stroke="var(--muted)" strokeWidth="25" />{sections.map((item, index) => {
      const length = item.total_barang / total * circumference;
      const current = sections.slice(0, index).reduce((sum, section) => sum + section.total_barang, 0) / total * circumference;
      return <circle key={item.other ? 'other' : item.kelompok_id ?? 'unassigned'} cx="100" cy="100" r="70" fill="none" stroke={palette[index]} strokeWidth={active === index ? 29 : 25} strokeDasharray={`${Math.max(0, length - 2)} ${circumference}`} strokeDashoffset={-current} transform="rotate(-90 100 100)" tabIndex={0} role="button" aria-label={`${name(item)}: ${item.total_barang.toLocaleString(locale)}`} className="cursor-pointer outline-none" onPointerEnter={() => setActive(index)} onPointerLeave={() => setActive(null)} onFocus={() => setActive(index)} onBlur={() => setActive(null)} onClick={() => setActive(index)} />;
    })}</svg><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center"><strong className="text-2xl">{(selected?.total_barang ?? total).toLocaleString(locale)}</strong><span className="mt-1 line-clamp-2 text-xs text-muted-foreground">{selected ? name(selected) : t('Total Barang')}</span></div></div>
    <div className="space-y-1">{sections.map((item, index) => <button type="button" key={item.other ? 'other' : item.kelompok_id ?? 'unassigned'} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-muted focus-visible:outline-ring" onPointerEnter={() => setActive(index)} onPointerLeave={() => setActive(null)} onFocus={() => setActive(index)} onBlur={() => setActive(null)} onClick={() => setActive(index)}><span className="size-2.5 shrink-0 rounded-full" style={{ background: palette[index] }} /><span className="min-w-0 flex-1 truncate" title={name(item)}>{name(item)}</span><strong>{item.total_barang.toLocaleString(locale)}</strong><span className="w-10 text-right text-muted-foreground">{new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(item.total_barang / total)}</span></button>)}</div>
  </div>;
}

export default function DashboardCharts({ analytics }) {
  const { t, locale } = useTranslation();
  if (!analytics) return <p className="text-sm text-muted-foreground">{t('Data grafik belum tersedia')}</p>;
  const daily = analytics.daily || [];
  const popular = analytics.popularItems || [];
  const maximum = Math.max(1, ...popular.map(item => item.total_transaksi));
  return <div className="grid gap-6 lg:grid-cols-2">
    <ChartCard title="Tren Pengambilan Barang" description="Jumlah transaksi pengambilan yang disetujui per hari" icon={ChartNoAxesCombined}><Timeline data={daily} label="Tren Pengambilan Barang" series={[{ key: 'pengambilan', label: 'Disetujui', color: palette[0] }]} /><div className="flex flex-wrap gap-x-4 gap-y-2 border-t pt-3 text-xs text-muted-foreground">{analytics.statuses?.map(item => <span key={item.status}>{t(item.status)}: <strong className="text-foreground">{item.total.toLocaleString(locale)}</strong></span>)}</div></ChartCard>
    <ChartCard title="Pergerakan Stok" description="Jumlah transaksi stok masuk dan keluar per hari" icon={ArrowDownUp}><Timeline data={daily} label="Pergerakan Stok" bars series={[{ key: 'masuk', label: 'Masuk', color: palette[1] }, { key: 'keluar', label: 'Keluar', color: palette[4] }].map(item => ({ ...item, label: t(item.label, { context: 'stock' }) }))} /></ChartCard>
    <ChartCard title="Barang Paling Sering Diambil" description="Lima barang dengan transaksi pengambilan disetujui terbanyak" icon={Package}>{!popular.length ? <div role="status" className="grid h-56 place-items-center text-sm text-muted-foreground">{t('Belum ada transaksi pada periode ini')}</div> : <div className="space-y-4">{popular.map(item => <div key={item.barang_id} className="space-y-2"><div className="flex items-start justify-between gap-3 text-sm"><span className="min-w-0 truncate font-medium" title={item.nama}>{item.nama}</span><span className="shrink-0 text-xs text-muted-foreground">{t('{value0} transaksi', { value0: item.total_transaksi.toLocaleString(locale) })}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted" role="meter" aria-label={item.nama} aria-valuemin={0} aria-valuemax={maximum} aria-valuenow={item.total_transaksi}><div className="h-full rounded-full bg-blue-500" style={{ width: `${item.total_transaksi / maximum * 100}%` }} /></div><p className="text-xs text-muted-foreground">{t('Jumlah diambil')}: {item.total_qty.toLocaleString(locale)} {item.satuan}</p></div>)}</div>}</ChartCard>
    <ChartCard title="Distribusi Kelompok Barang" description="Jumlah barang aktif saat ini menurut kelompok" icon={ChartPie}><CategoryChart categories={analytics.categories || []} /></ChartCard>
  </div>;
}
