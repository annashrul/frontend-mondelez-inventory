import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Activity, AlertTriangle, CheckCircle2, Clock3, FileSearch, LogIn, Pencil, Plus, ScanLine, Search, Trash2, UserRound } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import api, { emptyPagination, getList, getPagination } from '@/services/api';
import useDebounce from '@/hooks/useDebounce';

function actionMeta(action = '') {
  const value = action.toLowerCase();
  if (value.includes('gagal')) return { icon: AlertTriangle, variant: 'warning', className: 'bg-amber-50 text-amber-700 ring-amber-100' };
  if (value.includes('hapus')) return { icon: Trash2, variant: 'destructive', className: 'bg-red-50 text-red-700 ring-red-100' };
  if (value.includes('edit')) return { icon: Pencil, variant: 'info', className: 'bg-blue-50 text-blue-700 ring-blue-100' };
  if (value.includes('tambah')) return { icon: Plus, variant: 'success', className: 'bg-green-50 text-green-700 ring-green-100' };
  if (value.includes('login')) return { icon: LogIn, variant: 'outline', className: 'bg-slate-50 text-slate-700 ring-slate-100' };
  if (value.includes('scan')) return { icon: ScanLine, variant: 'info', className: 'bg-cyan-50 text-cyan-700 ring-cyan-100' };
  if (value.includes('cari')) return { icon: Search, variant: 'secondary', className: 'bg-violet-50 text-violet-700 ring-violet-100' };
  return { icon: Activity, variant: 'secondary', className: 'bg-muted text-foreground ring-border' };
}

function formatTime(value) {
  const date = dayjs(value);
  return date.isValid() ? date.format('HH:mm:ss') : '-';
}

function formatDateKey(value) {
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD') : 'unknown';
}

function formatDayDivider(value) {
  if (value === 'unknown') return 'Tanggal tidak diketahui';
  const date = dayjs(value);
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  if (value === today) return 'Hari ini';
  if (value === yesterday) return 'Kemarin';
  return date.isValid() ? date.format('DD MMM YYYY') : 'Tanggal tidak diketahui';
}

export default function LogActivity() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/log-activity', { params: { search: debouncedSearch, page, limit } })
      .then((res) => {
        if (!active) return;
        setLogs(getList(res));
        setPagination(getPagination(res));
      })
      .catch(() => {
        if (active) setLogs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [debouncedSearch, page, limit]);

  const summary = useMemo(() => {
    const failed = logs.filter((log) => log.aksi?.toLowerCase().includes('gagal')).length;
    const destructive = logs.filter((log) => log.aksi?.toLowerCase().includes('hapus')).length;
    const modules = new Set(logs.map((log) => log.modul).filter(Boolean)).size;
    return { failed, destructive, modules };
  }, [logs]);

  const groupedLogs = useMemo(() => {
    const groups = [];
    logs.forEach((log) => {
      const key = formatDateKey(log.waktu);
      let group = groups.find((item) => item.key === key);
      if (!group) {
        group = { key, label: formatDayDivider(key), items: [] };
        groups.push(group);
      }
      group.items.push(log);
    });
    return groups;
  }, [logs]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Log Aktivitas"
        subtitle="Jejak audit aksi pengguna di seluruh modul"
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-lg">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <FileSearch className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Total ditemukan</p>
              <p className="text-2xl font-semibold tracking-tight">{pagination.total || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <Activity className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Modul di halaman ini</p>
              <p className="text-2xl font-semibold tracking-tight">{summary.modules}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Perlu perhatian</p>
              <p className="text-2xl font-semibold tracking-tight">{summary.failed + summary.destructive}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/25 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Riwayat Aktivitas</h2>
            <p className="text-xs text-muted-foreground">Urutan terbaru berada paling atas</p>
          </div>
          <Badge variant="outline">{pagination.page || 1} / {pagination.total_pages || 1}</Badge>
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="grid min-h-56 place-items-center p-8 text-center text-muted-foreground">
            <div>
              <FileSearch className="mx-auto mb-3 size-10" />
              <p className="text-sm font-medium text-foreground">Tidak ada log aktivitas</p>
              <p className="mt-1 text-xs">Coba ubah kata kunci pencarian.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-3">
            {groupedLogs.map((group) => (
              <section key={group.key} className="space-y-2">
                <div className="flex items-center gap-3 px-1 py-2">
                  <span className="h-px flex-1 bg-border" />
                  <span className="rounded-full border bg-muted/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="overflow-hidden rounded-lg border bg-background">
                  <div className="divide-y">
                    {group.items.map((log) => {
                      const meta = actionMeta(log.aksi);
                      const Icon = meta.icon;
                      return (
                        <article key={log.id} className="grid gap-3 px-4 py-4 transition-colors hover:bg-muted/25 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
                          <span className={`grid size-10 place-items-center rounded-lg ring-1 ${meta.className}`}>
                            <Icon className="size-5" />
                          </span>
                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={meta.variant}>{log.aksi || '-'}</Badge>
                              <Badge variant="outline">{log.modul || '-'}</Badge>
                            </div>
                            <p className="text-sm font-medium leading-6">{log.detail || '-'}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                <UserRound className="size-3.5" />
                                {log.user_detail?.nama || log.user_detail?.username || 'System'}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="size-3.5" />
                                IP {log.ip || '-'}
                              </span>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground sm:justify-end">
                            <Clock3 className="size-3.5" />
                            {formatTime(log.waktu)}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
    </div>
  );
}
