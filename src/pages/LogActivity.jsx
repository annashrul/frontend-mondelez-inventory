import usePageState from '@/hooks/usePageState';
import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import { useLogActivityData } from '@/hooks/useLogActivityData';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settingsStore';
import { useEffect, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import { Activity, AlertTriangle, CheckCircle2, Clock3, FileSearch, LogIn, Pencil, Plus, ScanLine, Search, Trash2, UserRound } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

function formatDayDivider(value, locale) {
  if (value === 'unknown') return 'Tanggal tidak diketahui';
  const date = dayjs(value);
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  if (value === today) return 'Hari ini';
  if (value === yesterday) return 'Kemarin';
  return date.isValid() ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(date.toDate()) : 'Tanggal tidak diketahui';
}

function actorLabel(log) {
  return log.user_detail?.nama || log.user_detail?.username || translateUi('Sistem');
}

function ipLabel(value) {
  if (!value) return '-';
  return String(value).replace(/^::ffff:/, '');
}

export default function LogActivity() {
  const { locale } = useUiLanguage();
  const pageLimit = useSettingsStore(state => state.settings.items_per_page);
  const { user } = useAuth();
  const [search, setSearch] = usePageState('LogActivity.jsx:search', '');
  const debouncedSearch = useDebounce(search);
  const { query, logs, pagination, loading, loadingMore, hasNext, searchLoading, loadMore } = useLogActivityData({
    search: debouncedSearch, limit: pageLimit, userId: user?.id, searchDebouncing: search !== debouncedSearch,
  });
  const loadMoreRef = useRef(null);
  const { fetchNextPage, isFetching, isError, isPlaceholderData } = query;

  useEffect(() => {
    if (!loadMoreRef.current || isFetching || isError || isPlaceholderData || !hasNext) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchNextPage({ cancelRefetch: false }).catch(() => {});
    }, { rootMargin: '240px' });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, isFetching, isError, isPlaceholderData, hasNext, logs.length]);

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
        group = { key, label: formatDayDivider(key, locale), items: [] };
        groups.push(group);
      }
      group.items.push(log);
    });
    return groups;
  }, [logs, locale]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={translateUi("Log Aktivitas")}
        subtitle={translateUi("Jejak audit aksi pengguna di seluruh modul")}
        searchValue={search}
        searchLoading={searchLoading}
        onSearchChange={setSearch}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-lg">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <FileSearch className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{translateUi("Total ditemukan")}</p>
              <div className="text-2xl font-semibold tracking-tight">{loading ? <Skeleton className="mt-1 h-7 w-16" /> : pagination.total || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <Activity className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{translateUi("Modul di halaman ini")}</p>
              <div className="text-2xl font-semibold tracking-tight">{loading ? <Skeleton className="mt-1 h-7 w-16" /> : summary.modules}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{translateUi("Perlu perhatian")}</p>
              <div className="text-2xl font-semibold tracking-tight">{loading ? <Skeleton className="mt-1 h-7 w-16" /> : summary.failed + summary.destructive}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-clip rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b bg-muted/25 px-3 py-3 sm:px-4">
          <div>
            <h2 className="text-sm font-semibold">{translateUi("Riwayat Aktivitas")}</h2>
            <p className="text-xs text-muted-foreground">{translateUi("Urutan terbaru berada paling atas")}</p>
          </div>
          <Badge variant="outline" className="shrink-0">{pagination.total || logs.length}{translateUi(" aktivitas")}</Badge>
        </div>

        {query.isError && <div role="alert" className="flex items-center justify-between gap-3 border-b p-4"><p className="text-sm text-muted-foreground">{translateUi(query.isFetchNextPageError ? 'Gagal memuat log berikutnya' : 'Gagal memuat log aktivitas')}</p><Button variant="outline" size="sm" disabled={query.isFetching} onClick={() => (query.isFetchNextPageError ? loadMore() : query.refetch()).catch(() => {})}>{translateUi('Coba lagi')}</Button></div>}
        {loading ? (
          <div role="status" aria-label={translateUi("Memuat log aktivitas...")} className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-3 rounded-xl border p-4"><Skeleton className="h-4 w-40" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
            ))}
          </div>
        ) : query.isError && !logs.length ? null : logs.length === 0 ? (
          <div className="grid min-h-56 place-items-center p-8 text-center text-muted-foreground">
            <div>
              <FileSearch className="mx-auto mb-3 size-10" />
              <p className="text-sm font-medium text-foreground">{translateUi("Tidak ada log aktivitas")}</p>
              <p className="mt-1 text-xs">{translateUi("Coba ubah kata kunci pencarian.")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2 sm:p-3">
            {groupedLogs.map((group) => (
              <section key={group.key} className="space-y-2">
                <div className="relative z-20 md:sticky md:top-[calc(3.75rem+env(safe-area-inset-top))] -mx-2 flex items-center gap-3 bg-card px-4 py-2 sm:-mx-3 lg:top-16">
                  <span className="h-px flex-1 bg-border" />
                  <span className="rounded-full border bg-muted/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {translateUi(group.label)}
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
                                <p className="text-[13px] font-semibold leading-5 text-foreground sm:text-sm sm:leading-6">{translateUi(log.detail || '-')}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground sm:flex sm:flex-wrap sm:gap-2 sm:text-xs">
                                <div className="inline-flex min-w-0 items-center gap-1 rounded-lg bg-muted/60 px-2 py-1.5 sm:gap-1.5 sm:rounded-full sm:px-2.5 sm:py-1">
                                  <UserRound className="size-3.5 shrink-0 sm:size-4" />
                                  <span className="shrink-0">{translateUi("Pengguna")}</span>
                                  <span className="truncate font-medium text-foreground">{actorLabel(log)}</span>
                                </div>
                                <div className="inline-flex min-w-0 items-center gap-1 rounded-lg bg-muted/60 px-2 py-1.5 sm:gap-1.5 sm:rounded-full sm:px-2.5 sm:py-1">
                                  <CheckCircle2 className="size-3.5 shrink-0 sm:size-4" />
                                  <span className="shrink-0">{translateUi("IP")}</span>
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
            {loadingMore ? <div role="status" aria-label={translateUi("Memuat aktivitas berikutnya...")} className="w-full space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-5 w-3/4" /></div> : query.isError ? null : hasNext ? translateUi("Gulir untuk memuat lebih banyak") : translateUi("Semua aktivitas sudah ditampilkan")}
          </div>
        )}
      </div>
    </div>
  );
}
