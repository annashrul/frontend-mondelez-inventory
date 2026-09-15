import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Activity, AlertTriangle, CheckCircle2, Clock3, FileSearch, LoaderCircle, LogIn, Pencil, Plus, ScanLine, Search, Trash2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
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

function actorLabel(log) {
  return log.user_detail?.nama || log.user_detail?.username || 'System';
}

function ipLabel(value) {
  if (!value) return '-';
  return String(value).replace(/^::ffff:/, '');
}

export default function LogActivity() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLogs([]);
    setPage(1);
    setHasNext(true);
    api.get('/log-activity', { params: { search: debouncedSearch, page: 1, limit: 20 } })
      .then((res) => {
        if (!active) return;
        setLogs(getList(res));
        const nextPagination = getPagination(res);
        setPagination(nextPagination);
        setHasNext(nextPagination.has_next);
      })
      .catch(() => {
        if (active) setLogs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [debouncedSearch]);

  useEffect(() => {
    if (!loadMoreRef.current || loading || loadingMore || !hasNext) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setLoadingMore(true);
      api.get('/log-activity', { params: { search: debouncedSearch, page: page + 1, limit: 20 } })
        .then((res) => {
          const nextPagination = getPagination(res);
          setLogs((current) => [...current, ...getList(res)]);
          setPage(nextPagination.page || page + 1);
          setPagination(nextPagination);
          setHasNext(nextPagination.has_next);
        })
        .catch(() => toast.error('Gagal memuat log berikutnya'))
        .finally(() => setLoadingMore(false));
    }, { rootMargin: '240px' });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [debouncedSearch, hasNext, loading, loadingMore, logs.length, page]);

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

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b bg-muted/25 px-3 py-3 sm:px-4">
          <div>
            <h2 className="text-sm font-semibold">Riwayat Aktivitas</h2>
            <p className="text-xs text-muted-foreground">Urutan terbaru berada paling atas</p>
          </div>
          <Badge variant="outline" className="shrink-0">{pagination.total || logs.length} aktivitas</Badge>
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
          <div className="space-y-1 p-2 sm:p-3">
            {groupedLogs.map((group) => (
              <section key={group.key} className="space-y-2">
                <div className="sticky top-[calc(3.75rem+env(safe-area-inset-top))] z-30 -mx-3 flex items-center gap-3 bg-card/95 px-4 py-2 backdrop-blur lg:top-14">
                  <span className="h-px flex-1 bg-border" />
                  <span className="rounded-full border bg-muted/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                    {group.items.map((log) => {
                      const meta = actionMeta(log.aksi);
                      const Icon = meta.icon;
                      return (
                        <article key={log.id} className="overflow-hidden rounded-2xl border bg-background shadow-sm transition-colors hover:bg-muted/20">
                          <div className="grid gap-3 p-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-4">
                            <span className={`grid size-10 place-items-center rounded-xl ring-1 sm:size-11 ${meta.className}`}>
                              <Icon className="size-[18px] sm:size-5" />
                            </span>
                            <div className="min-w-0 space-y-2 sm:space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                  <Badge variant={meta.variant} className="text-[11px]">{log.aksi || '-'}</Badge>
                                  <Badge variant="outline" className="max-w-[46vw] truncate text-[11px]">{log.modul || '-'}</Badge>
                                </div>
                                <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground sm:gap-1.5 sm:px-2.5 sm:text-xs">
                                  <Clock3 className="size-3 sm:size-3.5" />
                                  {formatTime(log.waktu)}
                                </div>
                              </div>

                              <div className="rounded-xl bg-muted/45 px-3 py-2.5 sm:bg-transparent sm:px-0 sm:py-0">
                                <p className="text-[13px] font-semibold leading-5 text-foreground sm:text-sm sm:leading-6">{log.detail || '-'}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground sm:flex sm:flex-wrap sm:gap-2 sm:text-xs">
                                <div className="inline-flex min-w-0 items-center gap-1 rounded-lg bg-muted/60 px-2 py-1.5 sm:gap-1.5 sm:rounded-full sm:px-2.5 sm:py-1">
                                  <UserRound className="size-3.5 shrink-0 sm:size-4" />
                                  <span className="shrink-0">User</span>
                                  <span className="truncate font-medium text-foreground">{actorLabel(log)}</span>
                                </div>
                                <div className="inline-flex min-w-0 items-center gap-1 rounded-lg bg-muted/60 px-2 py-1.5 sm:gap-1.5 sm:rounded-full sm:px-2.5 sm:py-1">
                                  <CheckCircle2 className="size-3.5 shrink-0 sm:size-4" />
                                  <span className="shrink-0">IP</span>
                                  <span className="truncate font-medium text-foreground">{ipLabel(log.ip)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        )}
        {logs.length > 0 && (
          <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center border-t px-4 py-3 text-xs text-muted-foreground">
            {loadingMore ? <><LoaderCircle className="mr-2 size-4 animate-spin" /> Memuat aktivitas berikutnya...</> : hasNext ? 'Gulir untuk memuat lebih banyak' : 'Semua aktivitas sudah ditampilkan'}
          </div>
        )}
      </div>
    </div>
  );
}
