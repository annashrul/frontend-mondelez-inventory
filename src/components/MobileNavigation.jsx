import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CreditCard, Home, LogOut, Menu, Package, ShoppingCart, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { canAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const primaryItems = [
  { path: '/', label: 'Beranda', icon: Home, permission: 'dashboard' },
  { path: '/master-barang', label: 'Barang', icon: Package, permission: 'barang.read' },
  { path: '/pengambilan-barang', label: 'Ambil', icon: ShoppingCart, permission: 'pengambilan.read', emphasized: true },
  { path: '/kartu-stok', label: 'Stok', icon: CreditCard, permission: 'kartu.read' },
];

const moreItems = [
  { path: '/kelompok-barang', label: 'Kelompok Barang', permission: 'barang.read' },
  { path: '/master-rak', label: 'Master Rak', permission: 'rak.read' },
  { path: '/master-lokasi', label: 'Master Lokasi', permission: 'rak.read' },
  { path: '/master-satuan', label: 'Master Satuan', permission: 'barang.read' },
  { path: '/adjustment-stok', label: 'Adjustment Stok', permission: 'adjustment.read' },
  { path: '/cetak-barcode', label: 'Cetak Barcode/QR', permission: 'barcode.read' },
  { path: '/closing', label: 'Closing Shift', permission: 'closing.read' },
  { path: '/master-pengguna', label: 'Master Pengguna', permission: 'pengguna.read' },
  { path: '/level-pengguna', label: 'Level Pengguna', permission: 'level.read' },
  { path: '/log-activity', label: 'Log Activity', permission: 'log.read' },
  { path: '/pengaturan', label: 'Pengaturan', permission: 'pengaturan.read' },
];

export default function MobileNavigation() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <button type="button" aria-label="Tutup menu" className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn('fixed inset-x-0 bottom-0 z-[60] max-h-[78dvh] translate-y-full rounded-t-3xl bg-background shadow-2xl transition-transform duration-300 lg:hidden', open && 'translate-y-0')}>
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-muted" />
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3"><Avatar><AvatarFallback className="bg-primary text-primary-foreground">{user?.nama?.charAt(0) || 'U'}</AvatarFallback></Avatar><div><p className="font-semibold">{user?.nama}</p><p className="text-xs text-muted-foreground">{user?.level}</p></div></div>
          <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}><X /></Button>
        </div>
        <nav className="grid grid-cols-2 gap-2 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {moreItems.filter((item) => canAccess(user, item.permission)).map((item) => <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)} className={({ isActive }) => cn('rounded-xl border p-3 text-sm font-medium transition-colors', isActive ? 'border-primary bg-primary/10 text-primary' : 'bg-card')}>{item.label}</NavLink>)}
          <button type="button" onClick={logout} className="flex items-center gap-2 rounded-xl border border-destructive/20 p-3 text-sm font-medium text-destructive"><LogOut size={17} />Keluar</button>
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(4.25rem+env(safe-area-inset-bottom))] grid-cols-5 border-t bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
        {primaryItems.filter((item) => canAccess(user, item.permission)).map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => cn('relative flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground', isActive && 'text-primary')}><span className={cn('grid h-8 w-10 place-items-center rounded-xl', item.emphasized && '-mt-5 h-12 w-12 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25')}><Icon size={item.emphasized ? 22 : 20} /></span><span className="truncate">{item.label}</span></NavLink>; })}
        <button type="button" onClick={() => setOpen(true)} className="flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground"><span className="grid h-8 w-10 place-items-center rounded-xl"><Menu size={20} /></span><span>Lainnya</span></button>
      </nav>
    </>
  );
}