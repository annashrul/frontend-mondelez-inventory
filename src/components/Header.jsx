import { Bell, Boxes, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-card/95 border-b h-[calc(3.75rem+env(safe-area-inset-top))] px-4 pt-[env(safe-area-inset-top)] flex items-center justify-between sticky top-0 z-40 shrink-0 backdrop-blur-xl lg:h-14 lg:pt-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Boxes size={20} /></span><div><p className="text-sm font-bold leading-none">Inventory</p><p className="mt-1 text-[10px] text-muted-foreground">Warehouse App</p></div></div>
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
        <Button variant="ghost" size="icon" className="h-9 w-9 relative rounded-full">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
        </Button>
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
