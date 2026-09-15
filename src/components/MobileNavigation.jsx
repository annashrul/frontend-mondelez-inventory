import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity, Archive, Boxes, ClipboardList, CreditCard, FolderTree,
  LayoutDashboard, Lock, LogOut, MapPin, Menu, Package, QrCode,
  Ruler, Settings, ShieldCheck, ShoppingCart, Users, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/stores/appStore';
import { canAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const primaryKeys = ['dashboard', 'barang', 'pengambilan', 'kartu'];
const menuIcons = {
  dashboard: LayoutDashboard,
  barang: Package,
  kelompok: FolderTree,
  satuan: Ruler,
  lokasi: MapPin,
  rak: Archive,
  pengguna: Users,
  level: ShieldCheck,
  adjustment: ClipboardList,
  kartu: CreditCard,
  pengambilan: ShoppingCart,
  barcode: QrCode,
  log: Activity,
  closing: Lock,
  pengaturan: Settings,
};

export default function MobileNavigation() {
  const { user, logout } = useAuth();
  const menus = useAppStore((state) => state.menus);
  const [open, setOpen] = useState(false);
  const menuItems = menus.map((menu) => ({
    ...menu,
    path: menu.path || '/',
    label: menu.nama,
    icon: menuIcons[menu.key] || Boxes,
    permission: `${menu.key}.read`,
  }));
  const primaryItems = primaryKeys
    .map((key) => menuItems.find((item) => item.key === key))
    .filter(Boolean)
    .map((item) => ({ ...item, emphasized: item.key === 'pengambilan' }));
  const moreItems = menuItems.filter((item) => !primaryKeys.includes(item.key));
  const groupedMoreItems = moreItems.reduce((groups, item) => {
    const group = item.grup || 'Menu';
    groups[group] = [...(groups[group] || []), item];
    return groups;
  }, {});

  return (
    <>
      {open && <button type="button" aria-label="Tutup menu" className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn('no-print fixed inset-x-0 bottom-0 z-[60] max-h-[86dvh] translate-y-full overflow-hidden rounded-t-[2rem] border-t bg-background shadow-2xl transition-transform duration-300 lg:hidden', open && 'translate-y-0')}>
        <div className="border-b px-5 pb-3 pt-2">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-10"><AvatarFallback className="bg-primary text-primary-foreground">{user?.nama?.charAt(0) || 'U'}</AvatarFallback></Avatar>
              <div className="min-w-0"><p className="truncate font-semibold">Menu navigasi</p><p className="truncate text-xs text-muted-foreground">{user?.nama || 'Pengguna'}</p></div>
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Tutup menu" onClick={() => setOpen(false)}><X /></Button>
          </div>
        </div>
        <nav className="max-h-[calc(86dvh-8rem)] space-y-5 overflow-y-auto px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {Object.entries(groupedMoreItems).map(([group, items]) => {
            const visibleItems = items.filter((item) => canAccess(user, item.permission));
            if (visibleItems.length === 0) return null;
            return (
              <section key={group}>
                <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{group}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) => cn('group flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors', isActive ? 'border-primary bg-primary/10 text-primary' : 'bg-card hover:border-primary/40')}
                      >
                        {({ isActive }) => (
                          <>
                            <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors', isActive && 'bg-primary text-primary-foreground')}><Icon size={17} /></span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span>
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </section>
            );
          })}
          <button type="button" onClick={logout} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"><LogOut size={17} />Keluar</button>
        </nav>
      </aside>

      <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid h-[calc(4.25rem+env(safe-area-inset-bottom))] grid-cols-5 border-t bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
        {primaryItems.filter((item) => canAccess(user, item.permission)).map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => cn('relative flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground', isActive && 'text-primary')}><span className={cn('grid h-8 w-10 place-items-center rounded-xl', item.emphasized && '-mt-5 h-12 w-12 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25')}><Icon size={item.emphasized ? 22 : 20} /></span><span className="truncate">{item.label}</span></NavLink>; })}
        <button type="button" onClick={() => setOpen(true)} className="flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground"><span className="grid h-8 w-10 place-items-center rounded-xl"><Menu size={20} /></span><span>Lainnya</span></button>
      </nav>
    </>
  );
}
