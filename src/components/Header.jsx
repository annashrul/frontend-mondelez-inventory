import { Skeleton } from '@/components/ui/skeleton';
import { translate as translateUi } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProfilePreferences from '@/components/ProfilePreferences';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/stores/notificationStore';
import { useThemeLogo } from '@/hooks/useThemeLogo';

export default function Header() {
  const logoUrl = useThemeLogo();
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const { items, unread, loading, loadingMore, hasMore, error, load, loadMore, connect, disconnect, markAllRead, markRead } = useNotificationStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [listElement, setListElement] = useState(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!notificationsOpen || !listElement || loading || loadingMore || error || !hasMore || !sentinelRef.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore().catch(() => {});
    }, { root: listElement, rootMargin: '80px' });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [notificationsOpen, listElement, loading, loadingMore, error, hasMore, loadMore, items.length]);

  const handleNotificationScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (hasMore && !loading && !loadingMore && !error && scrollHeight - scrollTop - clientHeight <= 80) {
      loadMore().catch(() => {});
    }
  };

  useEffect(() => {
    if (!user) {
      disconnect();
      return undefined;
    }
    load().catch(() => {});
    connect();
    return disconnect;
  }, [connect, disconnect, load, user]);

  return (
    <header className="bg-card/95 border-b h-[calc(3.75rem+env(safe-area-inset-top))] px-4 pt-[env(safe-area-inset-top)] flex items-center justify-between sticky top-0 z-40 shrink-0 backdrop-blur-xl lg:h-16 lg:pt-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center lg:hidden">
          <span className="grid  place-items-center overflow-hidden ">
            <img src={logoUrl} alt={translateUi("Inventaris")} className="h-10 max-w-36 object-contain" />
          </span>
        </div>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            type="text"
            placeholder={translateUi("Cari menu, barang...")}
            className="pl-9 w-56 h-8 text-sm bg-muted border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden md:block">
          {new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'Asia/Jakarta' }).format(new Date())}
        </span>
        <DropdownMenu onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative rounded-full" aria-label={t("Notifikasi")}>
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 z-10 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[11px] font-bold leading-none text-white ring-2 ring-background">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{t("Notifikasi")}</p>
                <p className="text-xs text-muted-foreground">{t('{value0} belum dibaca', { value0: unread })}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2" onClick={() => markAllRead().catch(() => {})} disabled={!unread}>
                <CheckCheck size={15} />{translateUi("Tandai")}</Button>
            </div>
            <div ref={setListElement} onScroll={handleNotificationScroll} className="max-h-96 overflow-y-auto" aria-busy={loading || loadingMore}>
              {items.length === 0 && !loading && !error ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">{t("Belum ada notifikasi")}</div>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => markRead(item.id).catch(() => {})}
                    className="flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                  >
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.read_at ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{t(item.title)}</span>
                        {!item.read_at && <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[10px]">{t("Baru")}</Badge>}
                      </span>
                      <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{t(item.message)}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">{dayjs(item.created_at).format('HH:mm')}</span>
                    </span>
                  </button>
                ))
              )}
              {(loading || loadingMore) && (
                <div role="status" aria-label={t('Memuat notifikasi...')}>
                  {Array.from({ length: loading ? 3 : 2 }, (_, index) => (
                    <div key={index} aria-hidden="true" className="flex gap-3 border-b px-4 py-3 last:border-b-0">
                      <Skeleton className="mt-1 size-2 shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {error && (
                <div role="alert" className="px-4 py-3 text-center text-xs">
                  <p className="text-muted-foreground">{t("Gagal memuat notifikasi")}</p>
                  <Button variant="ghost" size="sm" onClick={() => (error === 'more' ? loadMore() : load()).catch(() => {})}>{t("Coba lagi")}</Button>
                </div>
              )}
              {hasMore && !error && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}
              {!hasMore && items.length > 0 && !loading && !loadingMore && (
                <div className="px-4 py-3 text-center text-xs text-muted-foreground">{t("Semua notifikasi sudah ditampilkan")}</div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        <ProfilePreferences user={user} />
      </div>
    </header>
  );
}
