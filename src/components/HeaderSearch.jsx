import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/stores/appStore';
import { useMasterBarangStore } from '@/stores/masterBarangStore';
import { useTranslation } from '@/lib/i18n';
import { canAccess } from '@/lib/permissions';
import { searchHeaderMenus } from '@/lib/headerSearch';
import useDebounce from '@/hooks/useDebounce';
import { getBarangList } from '@/services/barangService';
import { getList } from '@/services/api';

export default function HeaderSearch() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const menus = useAppStore(state => state.menus);
  const navigate = useNavigate();
  const id = useId();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const search = value.trim();
  const debounced = useDebounce(search, 250);
  const open = focused && !!search;
  const canSearchItems = !!user && canAccess(user, 'barang.read');
  const itemsQuery = useQuery({
    queryKey: ['barang', 'header-search', user?.id, debounced],
    queryFn: ({ signal }) => getBarangList({ search: debounced, limit: 5, page: 1 }, { signal }),
    enabled: open && canSearchItems && !!debounced && search === debounced,
    staleTime: 30_000,
    retry: false,
  });
  const menuResults = searchHeaderMenus(menus, user, search, t);
  const waiting = canSearchItems && (search !== debounced || itemsQuery.isPending);
  const items = canSearchItems && !waiting && !itemsQuery.isError ? getList(itemsQuery.data) : [];
  const results = [
    ...menuResults.map(menu => ({ key: `menu-${menu.key}`, title: t(menu.nama), detail: t('Menu'), path: menu.path })),
    ...items.map(item => ({ key: `item-${item.id}`, title: item.nama, detail: item.kode, item })),
  ];
  const selected = results[active];
  const choose = result => {
    if (result.item) {
      useMasterBarangStore.getState().setSearch(result.item.kode || result.item.nama);
      navigate('/master-barang');
    } else navigate(result.path);
    setValue('');
    setFocused(false);
    setActive(-1);
  };

  return <div className="relative hidden sm:block" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); setActive(-1); }
  }}>
    <Search className="pointer-events-none absolute left-3 top-4 -translate-y-1/2 text-muted-foreground" size={16} />
    <Input type="text" role="combobox" autoComplete="off" aria-autocomplete="list"
      aria-label={t('Cari menu, barang...')} placeholder={t('Cari menu, barang...')}
      aria-expanded={open} aria-controls={open ? id : undefined}
      aria-activedescendant={open && selected ? `${id}-${selected.key}` : undefined}
      value={value} onFocus={() => setFocused(true)}
      onChange={event => { setValue(event.target.value); setFocused(true); setActive(-1); }}
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); setFocused(false); setActive(-1); }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); setFocused(true);
          setActive(index => {
            if (!results.length) return -1;
            if (index < 0) return event.key === 'ArrowDown' ? 0 : results.length - 1;
            return (index + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
          });
        }
        if (event.key === 'Enter' && open && results.length) {
          event.preventDefault(); choose(selected || results[0]);
        }
      }} className="h-8 w-56 border-0 bg-muted pl-9 text-sm focus-visible:ring-1" />
    {open && <div className="absolute left-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg">
      <div id={id} role="listbox" aria-label={t('Hasil pencarian')} className="max-h-80 overflow-y-auto p-1">
        {results.map((result, index) => <button key={result.key} id={`${id}-${result.key}`} type="button" role="option" aria-selected={active === index}
          tabIndex={-1} onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => choose(result)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${active === index ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'}`}>
          {result.item ? <Package size={16} className="shrink-0 text-muted-foreground" /> : <Search size={16} className="shrink-0 text-muted-foreground" />}
          <span className="min-w-0"><span className="block truncate text-sm font-medium">{result.title}</span><span className="block truncate text-xs text-muted-foreground">{result.detail}</span></span>
        </button>)}
      </div>
      {waiting && <div role="status" aria-label={t('Mencari...')} className="space-y-2 px-4 py-3"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/2" /></div>}
      {!waiting && canSearchItems && itemsQuery.isError && <div role="alert" className="px-4 py-3 text-sm text-muted-foreground">{t('Gagal memuat data barang')} <button type="button" className="text-primary underline" onClick={() => itemsQuery.refetch()}>{t('Coba lagi')}</button></div>}
      {!waiting && !results.length && !(canSearchItems && itemsQuery.isError) && <p role="status" className="px-4 py-3 text-sm text-muted-foreground">{t('Tidak ada hasil pencarian')}</p>}
    </div>}
  </div>;
}
