import { useTranslation } from '@/lib/i18n';
import { useSettingsStore } from '@/stores/settingsStore';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, Users, ShieldCheck,
  ClipboardList, CreditCard, ShoppingCart, Settings, QrCode,
  Archive, Ruler, Activity, Lock, LogOut, ChevronLeft, ChevronRight, Boxes, MapPin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { canAccess } from '@/lib/permissions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useThemeLogo } from '@/hooks/useThemeLogo';

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

function getMenuItems(menus) {
  return menus.map((menu) => ({
    ...menu,
    path: menu.path || '/',
    label: menu.nama,
    icon: menuIcons[menu.key] || Boxes,
    permission: `${menu.key}.read`,
  }));
}

function SidebarLink({ item, collapsed }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const link = (
    <NavLink
      to={item.path}
      aria-label={t(item.label)}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          collapsed ? 'mx-auto w-10 justify-center px-0' : 'w-full px-3'
        )
      }
      end={item.path === '/'}
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="truncate">{t(item.label)}</span>}
    </NavLink>
  );
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">{link}</div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>{t(item.label)}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const logoUrl = useThemeLogo();
  const { t } = useTranslation();
  const company = useSettingsStore(state => state.settings.nama_perusahaan);
  const { user, logout } = useAuth();
  const menus = useAppStore((state) => state.menus);
  const menuItems = getMenuItems(menus);

  return (
    <TooltipProvider delayDuration={150}>
      <aside className={cn(
        'no-print fixed left-0 top-0 hidden h-dvh bg-card border-r transition-all duration-300 z-50 lg:flex flex-col shadow-sm',
        collapsed ? 'w-[68px]' : 'w-64'
      )}>
        <div className={cn(
          'relative flex h-16 items-center border-b shrink-0',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}>
          {!collapsed && (
            <div className="flex items-center">
              <span className="grid h-10 max-w-36 place-items-center overflow-hidden">
                <img title={company} src={logoUrl} alt={company} className="max-h-10 max-w-36 object-contain" />
              </span>
            </div>
          )}
          {collapsed && (
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm">{"M"}</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 shrink-0',
              collapsed && 'absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-card shadow-sm'
            )}
            aria-label={t(collapsed ? "Buka sidebar" : "Tutup sidebar")}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
        <ScrollArea className="min-h-0 w-full flex-1">
          <nav className={cn('space-y-1 py-3', collapsed ? 'px-2' : 'px-3')}>
            {menuItems.filter((item) => canAccess(user, item.permission)).map((item, index, visibleItems) => {
              const previous = visibleItems[index - 1];
              const showGroup = !previous || previous.grup !== item.grup;
              return (
                <div key={item.id || item.key}>
                  {showGroup && (!collapsed ? (
                    <div className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-1">
                      {t(item.grup)}
                    </div>
                  ) : index > 0 ? <Separator className="mx-auto my-3 w-8" /> : null)}
                  <SidebarLink item={item} collapsed={collapsed} />
                </div>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="border-t p-3 shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {user?.nama?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.nama || t("Pengguna")}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.level || t("Administrator")}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" aria-label={t("Logout")} onClick={logout}>
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="mx-auto flex h-10 w-10 text-muted-foreground hover:text-destructive" aria-label={t("Logout")} onClick={logout}>
                  <LogOut size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("Logout")}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

