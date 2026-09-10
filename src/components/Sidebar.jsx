import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, Users, ShieldCheck,
  ClipboardList, CreditCard, ShoppingCart, Settings, QrCode,
  Archive, Ruler, Activity, Lock, LogOut, ChevronLeft, ChevronRight, Boxes, MapPin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { type: 'divider', label: 'Master Data' },
  { path: '/master-barang', label: 'Master Barang', icon: Package },
  { path: '/kelompok-barang', label: 'Kelompok Barang', icon: FolderTree },
  { path: '/master-rak', label: 'Master Rak', icon: Archive },
  { path: '/master-lokasi', label: 'Master Lokasi', icon: MapPin },
  { path: '/master-satuan', label: 'Master Satuan', icon: Ruler },
  { type: 'divider', label: 'Pengguna' },
  { path: '/master-pengguna', label: 'Master Pengguna', icon: Users },
  { path: '/level-pengguna', label: 'Level Pengguna', icon: ShieldCheck },
  { type: 'divider', label: 'Transaksi' },
  { path: '/adjustment-stok', label: 'Adjustment Stok', icon: ClipboardList },
  { path: '/kartu-stok', label: 'Kartu Stok', icon: CreditCard },
  { path: '/pengambilan-barang', label: 'Pengambilan Barang', icon: ShoppingCart },
  { type: 'divider', label: 'Lainnya' },
  { path: '/cetak-barcode', label: 'Cetak Barcode/QR', icon: QrCode },
  { path: '/log-activity', label: 'Log Activity', icon: Activity },
  { path: '/closing', label: 'Closing Shift', icon: Lock },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();

  const SidebarLink = ({ item }) => {
    const Icon = item.icon;
    const link = (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-all duration-200 text-sm font-medium',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            collapsed && 'justify-center px-2'
          )
        }
        end={item.path === '/'}
      >
        <Icon size={20} className="shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }
    return link;
  };

  return (
    <TooltipProvider>
      <aside className={cn(
        'fixed left-0 top-0 h-screen bg-card border-r transition-all duration-300 z-50 flex flex-col shadow-sm',
        collapsed ? 'w-[68px]' : 'w-64'
      )}>
        <div className="flex items-center justify-between px-4 h-14 border-b shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Boxes className="w-6 h-6 text-primary" />
              <span className="font-bold text-base">Inventory</span>
            </div>
          )}
          {collapsed && <Boxes className="w-6 h-6 text-primary mx-auto" />}
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <nav className="py-2 px-2">
            {menuItems.map((item, index) => {
              if (item.type === 'divider') {
                return !collapsed ? (
                  <div key={index} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-1 px-3">
                    {item.label}
                  </div>
                ) : (
                  <Separator key={index} className="my-2 mx-1" />
                );
              }
              return <SidebarLink key={item.path} item={item} />;
            })}
          </nav>
        </ScrollArea>
        <div className="border-t p-3 shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.nama || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.level || 'Admin'}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={logout}>
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full text-muted-foreground hover:text-destructive" onClick={logout}>
                  <LogOut size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

