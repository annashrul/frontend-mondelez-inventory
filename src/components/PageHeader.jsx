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
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
              <RefreshCw size={16} />
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus size={16} />
              {addLabel}
            </Button>
          )}
        </div>
      </div>
      {onSearchChange && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            type="text"
            placeholder="Cari data..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
      {children}
    </div>
  );
}
