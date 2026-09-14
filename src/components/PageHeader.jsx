import { Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PageHeader({
  title,
  subtitle,
  onAdd,
  addLabel = 'Tambah',
  searchValue,
  onSearchChange,
  onRefresh,
  children,
}) {
  return (
    <div className="mb-5 lg:mb-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:justify-end">
          {onSearchChange && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Cari data..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-11 rounded-xl bg-card pl-9 sm:h-9 sm:rounded-md"
              />
            </div>
          )}
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh" className="min-h-10 sm:min-h-9">
              <RefreshCw size={16} />
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="min-h-10 sm:min-h-9">
              <Plus size={16} />
              {addLabel}
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
