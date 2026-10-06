import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity, Archive, Boxes, ClipboardList, CreditCard, FolderTree,
  LayoutDashboard, Lock, LogOut, MapPin, Menu, Package, QrCode,
  Ruler, Settings, ShieldCheck, ShoppingCart, Users, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/stores/appStore';
import { canAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import logoUrl from '../../logo.webp';

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
  const groupedMenuItems = menuItems.reduce((groups, item) => {
    const group = item.grup || 'Menu';
    groups[group] = [...(groups[group] || []), item];
    return groups;
  }, {});

  return (
    <>
      {open && <button type="button" aria-label="Tutup menu" className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={cn('no-print fixed inset-y-0 right-0 z-[60] flex w-72 max-w-[85vw] translate-x-full flex-col overflow-hidden border-l bg-card shadow-2xl transition-transform duration-300 lg:hidden', open && 'translate-x-0')}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <span className="grid h-10 max-w-36 place-items-center overflow-hidden">
            <img src={logoUrl} alt="Inventory" className="max-h-10 max-w-36 object-contain" />
          </span>
          <Button type="button" variant="ghost" size="icon" aria-label="Tutup menu" onClick={() => setOpen(false)}><X /></Button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {Object.entries(groupedMenuItems).map(([group, items]) => {
            const visibleItems = items.filter((item) => canAccess(user, item.permission));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group}>
                <div className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-1">
                  {group}
                </div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) => cn(
                        'mb-1 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="shrink-0 border-t p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                  {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.nama || 'User'}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.level || 'Admin'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={logout}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </aside>

      <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid h-[calc(4.25rem+env(safe-area-inset-bottom))] grid-cols-5 border-t bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
        {primaryItems.filter((item) => canAccess(user, item.permission)).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => cn('relative flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground', isActive && 'text-primary')}
            >
              {({ isActive }) => (
                <>
                  {!item.emphasized && (
                    <span className={cn('absolute inset-x-0 top-0 mx-auto h-0.5 w-10 rounded-full bg-primary transition-opacity duration-200', isActive ? 'opacity-100' : 'opacity-0')} />
                  )}
                  <span className={cn(
                    'grid h-8 w-10 place-items-center rounded-xl',
                    item.emphasized && '-mt-5 h-12 w-12 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25',
                    item.emphasized && isActive && 'ring-4 ring-primary/20',
                  )}>
                    <Icon size={item.emphasized ? 22 : 20} />
                  </span>
                  {!item.emphasized && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
        <button type="button" onClick={() => setOpen(true)} className="flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground"><span className="grid h-8 w-10 place-items-center rounded-xl"><Menu size={20} /></span><span>Lainnya</span></button>
      </nav>
    </>
  );
}
