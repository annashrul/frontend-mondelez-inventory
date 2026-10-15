import useSkeletonCount from '@/hooks/useSkeletonCount';
import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { translate as translateUi } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export default function InfiniteScrollFooter({ query, hasNext, loadingMore, searchDebouncing, count, limit }) {
  const sentinel = useRef(null);
  const skeletonRows = useSkeletonCount(limit);
  const { fetchNextPage, isFetching, isError } = query;
  useEffect(() => {
    if (!sentinel.current || !hasNext || isFetching || isError || searchDebouncing) return;
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void fetchNextPage({ cancelRefetch: false }).catch(() => {});
    }, { rootMargin: '240px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasNext, isFetching, isError, searchDebouncing, fetchNextPage, count]);

  const loadMore = () => fetchNextPage({ cancelRefetch: false }).catch(() => {});
  return (
    <div ref={sentinel} className="mt-4 flex min-h-12 items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
      {isError ? <><span>{translateUi('Gagal memuat data')}</span><Button variant="outline" size="sm" disabled={isFetching || searchDebouncing} onClick={() => query.isFetchNextPageError ? loadMore() : query.refetch().catch(() => {})}>{translateUi('Coba lagi')}</Button></>
        : loadingMore ? <div role="status" aria-label={translateUi('Memuat data berikutnya...')} className="w-full space-y-3">
            {Array.from({ length: skeletonRows }, (_, index) => (
              <div key={index} aria-hidden="true" className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-4 w-24" /></div>
                <Skeleton className="h-5 w-2/3" />
                <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-28" /></div>
                <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
              </div>
            ))}
          </div>
        : hasNext ? <Button variant="ghost" size="sm" disabled={isFetching || searchDebouncing} onClick={loadMore}>{translateUi('Muat lebih banyak')}</Button>
        : count > 0 ? translateUi('Semua data sudah ditampilkan') : null}
    </div>
  );
}
