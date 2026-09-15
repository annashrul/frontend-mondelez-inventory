import { useEffect } from 'react';
import { Bell, CheckCheck, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/stores/notificationStore';
import logoUrl from '../../logo.webp';

export default function Header() {
  const { user } = useAuth();
  const { items, unread, load, connect, disconnect, markAllRead, markRead } = useNotificationStore();

  useEffect(() => {
    if (!user) {
      disconnect();
      return undefined;
    }
    load().catch(() => {});
    connect();
    return undefined;
  }, [connect, disconnect, load, user]);

  return (
    <header className="bg-card/95 border-b h-[calc(3.75rem+env(safe-area-inset-top))] px-4 pt-[env(safe-area-inset-top)] flex items-center justify-between sticky top-0 z-40 shrink-0 backdrop-blur-xl lg:h-14 lg:pt-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center lg:hidden">
          <span className="grid  place-items-center overflow-hidden ">
            <img src={logoUrl} alt="Inventory" className="h-10 max-w-36 object-contain" />
          </span>
        </div>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            type="text"
            placeholder="Cari menu, barang..."
            className="pl-9 w-56 h-8 text-sm bg-muted border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden md:block">
          {dayjs().format('dddd, DD MMMM YYYY')}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative rounded-full">
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
                <p className="text-sm font-semibold">Notifikasi</p>
                <p className="text-xs text-muted-foreground">{unread} belum dibaca</p>
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2" onClick={() => markAllRead().catch(() => {})} disabled={!unread}>
                <CheckCheck size={15} />
                Tandai
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada notifikasi</div>
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
                        <span className="truncate text-sm font-medium">{item.title}</span>
                        {!item.read_at && <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[10px]">Baru</Badge>}
                      </span>
                      <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.message}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">{dayjs(item.created_at).format('HH:mm')}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium">{user?.nama || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.level || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
