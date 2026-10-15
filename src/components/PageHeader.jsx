import { PermissionAction } from '@/components/PermissionAccess';
import { cn } from '@/lib/utils';
import { translate as translateUi } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { LoaderCircle, Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PageHeader({
  title,
  subtitle,
  onAdd,
  addLabel = 'Tambah',
  searchValue,
  onSearchChange,
  searchLoading = false,
  searchActions,
  onRefresh,
  children,
  className,
}) {
  const { t } = useTranslation();
  return (
    <div className={cn("mb-5 lg:mb-6", (onSearchChange || onAdd || searchActions || onRefresh) && "mobile-sticky-toolbar", className)}>
      <div className="page-header-row mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t(title)}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{t(subtitle)}</p>}
        </div>
        <div className="flex w-full items-center gap-2 sm:flex-row sm:items-center lg:w-auto lg:justify-end">
          {onSearchChange && (
            <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder={t('Cari data...')}
                aria-label={t('Cari data...')}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-11 rounded-xl bg-card pl-9 pr-9 sm:h-9 sm:rounded-md"
              />
              {searchLoading && (
                <LoaderCircle className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          )}
          {searchActions}
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} title={translateUi("Refresh")} className="min-h-10 sm:min-h-9">
              <RefreshCw size={16} />
            </Button>
          )}
          {onAdd && (
            <PermissionAction permission="create"><Button onClick={onAdd} aria-label={t(addLabel)} className="size-10 shrink-0 px-0 sm:size-auto sm:min-h-9 sm:px-4">
              <Plus size={16} />
              <span className="hidden sm:inline">{t(addLabel)}</span>
            </Button></PermissionAction>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
