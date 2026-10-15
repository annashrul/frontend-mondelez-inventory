import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { translate as translateUi } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export default function InfiniteScrollFooter({ query, hasNext, loadingMore, searchDebouncing, count }) {
  const sentinel = useRef(null);
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
        : loadingMore ? <span role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />{translateUi('Memuat data berikutnya...')}</span>
        : hasNext ? <Button variant="ghost" size="sm" disabled={isFetching || searchDebouncing} onClick={loadMore}>{translateUi('Muat lebih banyak')}</Button>
        : count > 0 ? translateUi('Semua data sudah ditampilkan') : null}
    </div>
  );
}
