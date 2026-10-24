import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { translate as t, useTranslation } from '@/lib/i18n';
import { formatNumber } from '@/lib/numberFormat';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/Pagination';
const methods = { camera: 'Kamera', gallery: 'Galeri', voice: 'Suara', text: 'Teks', rack: 'Scan Rak' };
const statuses = { found: 'Ditemukan', not_found: 'Tidak ditemukan', error: 'Error' };
export default function SearchAuditPanel() {
  const { locale } = useTranslation();
  const date = offset => new Date(Date.now() + offset * 86400000).toISOString().slice(0,10);
  const [from,setFrom] = useState(() => date(-30));
  const [to,setTo] = useState(() => date(0));
  const [method,setMethod] = useState('');
  const [status,setStatus] = useState('');
  const [page,setPage] = useState(1);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to) && from <= to;
  const query = useQuery({ queryKey: ['search-audit',from,to,method,status,page],
    enabled: valid,
    queryFn: () => api.get('/search-audit', { params: {
      from: new Date(`${from}T00:00:00`).toISOString(),
      to: new Date(new Date(`${to}T00:00:00`).setDate(new Date(`${to}T00:00:00`).getDate()+1)).toISOString(), method,status,page,limit:20,
    } }),
  });
  const update = setter => value => { setter(value); setPage(1); };
  const percent = value => value == null ? '—' : `${formatNumber(value)}%`;
  return <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">{t('Audit Pencarian')}</h2><Button variant="outline" size="sm" disabled={!valid || query.isFetching} onClick={() => query.refetch()}>{t('Muat ulang')}</Button></div>
    <p className="text-xs leading-5 text-muted-foreground">{t('Akurasi dihitung hanya dari penilaian Sesuai/Tidak sesuai. Hasil ditemukan dan skor kemiripan bukan bukti akurasi. Pencarian tanpa penilaian tidak dihitung sebagai salah.')}</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="space-y-1"><Label htmlFor="audit-from">{t('Dari tanggal')}</Label><DatePicker id="audit-from" value={from} onChange={update(setFrom)} className="h-9" /></div>
      <div className="space-y-1"><Label htmlFor="audit-to">{t('Sampai tanggal')}</Label><DatePicker id="audit-to" value={to} onChange={update(setTo)} className="h-9" /></div>
      <div className="space-y-1">
        <Label htmlFor="audit-method">{t('Metode')}</Label>
        <Select value={method || 'all'} onValueChange={value => update(setMethod)(value === 'all' ? '' : value)}>
          <SelectTrigger id="audit-method"><SelectValue>{t(methods[method] || 'Semua')}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('Semua')}</SelectItem>
            {Object.entries(methods).map(([value,label]) => <SelectItem key={value} value={value}>{t(label)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="audit-status">{t('Status')}</Label>
        <Select value={status || 'all'} onValueChange={value => update(setStatus)(value === 'all' ? '' : value)}>
          <SelectTrigger id="audit-status"><SelectValue>{t(statuses[status] || 'Semua')}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('Semua')}</SelectItem>
            {Object.entries(statuses).map(([value,label]) => <SelectItem key={value} value={value}>{t(label)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
    {!valid ? <p role="alert" className="text-sm text-destructive">{t('Rentang audit tidak valid')}</p>
      : query.isPending ? <div role="status" aria-label={t('Memuat audit pencarian')} className="space-y-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>
      : query.isError ? <p role="alert" className="text-sm text-destructive">{query.error.message}</p>
      : <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{query.data.summary.filter(row => !method || row.method === method).map(row => <div key={row.method} className="space-y-2 rounded-xl border p-3 text-xs">
          <h3 className="text-sm font-semibold">{t(methods[row.method])}</h3>
          <dl className="space-y-1">{[
            ['Total pencarian',formatNumber(row.total)], ['Ditemukan',formatNumber(row.found)], ['Tidak ditemukan',formatNumber(row.not_found)], ['Error',formatNumber(row.errors)],
            ['Rasio tidak ditemukan',percent(row.not_found_rate)], ['Akurasi dinilai',percent(row.accuracy_reviewed)], ['Penilaian masuk',`${formatNumber(row.reviewed)} / ${formatNumber(row.total)}`], ['Rata-rata respons',row.avg_duration_ms == null ? '—' : `${formatNumber(row.avg_duration_ms)} ms`],
          ].map(([label,value]) => <div key={label} className="flex justify-between gap-2"><dt className="text-muted-foreground">{t(label)}</dt><dd className="font-medium">{value}</dd></div>)}</dl>
        </div>)}</div>
        <div className="overflow-x-auto rounded-xl border"><Table className="min-w-[1050px]"><TableHeader><TableRow>{['Waktu','Metode','Pencarian','Status','Hasil','Respons','Rekomendasi','Pilihan pengguna','Penilaian'].map(label => <TableHead key={label}>{t(label)}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{!query.data.data.length ? <TableRow><TableCell colSpan={9} className="h-28 text-center text-muted-foreground">{t('Belum ada data audit pencarian')}</TableCell></TableRow> : query.data.data.map(row => <TableRow key={row.id}>
            <TableCell className="text-xs">{new Date(row.created_at).toLocaleString(locale)}<p className="text-muted-foreground">ID: {row.user_id || '—'}</p></TableCell>
            <TableCell>{t(methods[row.method])}</TableCell><TableCell className="max-w-44 break-words whitespace-normal">{row.query_text || '—'}</TableCell>
            <TableCell><Badge variant={row.status === 'found' ? 'success' : 'outline'}>{t(statuses[row.status])}</Badge><p className="mt-1 text-xs text-muted-foreground">{row.error_code || ''}</p></TableCell>
            <TableCell>{formatNumber(row.returned_count)} / {formatNumber(row.result_count)}</TableCell><TableCell>{formatNumber(row.duration_ms)} ms</TableCell>
            <TableCell className="max-w-72 whitespace-normal"><details><summary className="cursor-pointer text-sm">{row.results[0]?.nama || '—'}</summary><ol className="mt-2 space-y-1 text-xs">{row.results.map(item => <li key={item.id}>{item.rank}. {item.nama} ({item.kode})<span className="block text-muted-foreground">{t('Skor kemiripan')}: {item.text_similarity ?? item.confidence ?? '—'}</span></li>)}</ol><p className="mt-2 break-all text-xs text-muted-foreground">{row.model}</p></details></TableCell>
            <TableCell className="max-w-44 whitespace-normal">{row.results.find(item => Number(item.id) === Number(row.selected_item_id))?.nama || '—'}{row.selected_rank && <p className="text-xs text-muted-foreground">#{row.selected_rank}</p>}</TableCell>
            <TableCell>{t(row.relevance === true ? 'Sesuai' : row.relevance === false ? 'Tidak sesuai' : 'Belum dinilai')}</TableCell>
          </TableRow>)}</TableBody></Table></div>
        <p className="text-xs text-muted-foreground">{t('Hasil: jumlah ditampilkan / total cocok. Rasio tidak ditemukan mengecualikan error. Ringkasan mengikuti filter dan seluruh halaman.')}</p>
        <Pagination pagination={query.data.pagination} onPageChange={setPage} />
      </>}
  </section>;
}
