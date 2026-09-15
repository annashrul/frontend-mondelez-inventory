import { useEffect } from 'react';
import { Check, Filter } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { useListResourceData } from '@/hooks/useListResourceData';
import useDebounce from '@/hooks/useDebounce';
import { createCrudService } from '@/services/crudService';
import { useKartuStokStore } from '@/stores/listPageStores';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import KartuStokList from './List';

const service = createCrudService('kartu-stok');
const stockTypes = ['Semua', 'Masuk', 'Keluar'];

export default function KartuStok() {
  const store = useKartuStokStore();
  const debouncedSearch = useDebounce(store.search);
  const resource = useListResourceData({
    queryKey: 'kartu-stok',
    params: {
      search: debouncedSearch,
      searchDebouncing: store.search !== debouncedSearch,
      tipe: store.tipe,
      page: store.page,
      limit: store.limit,
    },
    lastResponse: store.lastResponse,
    hasLoadedOnce: store.hasLoadedOnce,
    loadingSource: store.loadingSource,
    listFn: service.list,
    onSuccessResponse: store.setQueryResponse,
  });

  useEffect(() => {
    resource.setSuccessResponse();
  }, [resource.setSuccessResponse]);
  useEffect(() => {
    if (resource.query.error) toast.error(resource.query.error.message || 'Gagal memuat kartu stok');
  }, [resource.query.error]);

  return (
    <div>
      <PageHeader
        title="Kartu Stok"
        subtitle="Riwayat keluar masuk barang"
        searchValue={store.search}
        searchLoading={resource.searchLoading}
        onSearchChange={store.setSearch}
        searchActions={(
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative min-h-10 shrink-0 sm:min-h-9" title="Filter tipe stok">
                <Filter size={16} />
                {store.tipe !== 'Semua' && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Tipe stok</DropdownMenuLabel>
              {stockTypes.map((type) => (
                <DropdownMenuItem key={type} onSelect={() => store.setTipe(type)} className="justify-between">
                  <span>{type}</span>
                  {store.tipe === type && <Check className="size-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
      <KartuStokList
        data={resource.data}
        loading={resource.loading}
        pagination={resource.pagination}
        onPageChange={store.setPage}
        onLimitChange={store.setLimit}
        pageLoadingDirection={resource.pageLoadingDirection}
        limitLoading={resource.limitLoading}
      />
    </div>
  );
}
