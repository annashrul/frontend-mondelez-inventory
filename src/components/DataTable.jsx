import { useState } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import Pagination from '@/components/Pagination';
import { cn } from '@/lib/utils';

function fixedColumnClass(fixed, header = false) {
  if (!fixed) return '';
  return cn(
    'sticky z-10 bg-card',
    header && 'z-20 bg-muted',
    fixed === 'left' && 'left-0 border-r shadow-[4px_0_8px_-8px_hsl(var(--foreground))]',
    fixed === 'right' && 'right-0 border-l shadow-[-4px_0_8px_-8px_hsl(var(--foreground))]',
  );
}

export default function DataTable({ columns, data, loading = false, onEdit, onDelete, actions, pagination, onPageChange, onLimitChange, pageLoadingDirection, limitLoading, deleteLabel, actionColumnFixed }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const rowOffset = pagination ? ((pagination.page || 1) - 1) * (pagination.limit || 10) : 0;
  const targetName = deleteTarget ? deleteLabel?.(deleteTarget) || deleteTarget.nama || deleteTarget.kode || deleteTarget.username || deleteTarget.no_ref : '';
  const confirmDelete = async () => {
    if (!deleteTarget || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };
  const renderActions = (row, mobile = false) => (onEdit || onDelete || actions) && (
    <div className={mobile ? 'flex items-center gap-2 border-t pt-3' : 'flex items-center justify-center gap-1'}>
      {actions && actions(row)}
      {onEdit && <Button variant="outline" size="sm" className={mobile ? 'h-9 flex-1' : 'h-7 text-xs'} onClick={() => onEdit(row)}>Edit</Button>}
      {onDelete && <Button variant="outline" size="sm" className={mobile ? 'h-9 flex-1 text-destructive hover:text-destructive' : 'h-7 text-xs text-destructive hover:text-destructive'} onClick={() => setDeleteTarget(row)}>Hapus</Button>}
    </div>
  );
  const hasActions = Boolean(onEdit || onDelete || actions);
  const totalColumns = columns.length + 1 + (hasActions ? 1 : 0);
  const skeletonRows = Math.min(Math.max(pagination?.limit || 5, 3), 8);

  return (
    <>
    <div className="hidden overflow-x-auto rounded-lg border bg-card shadow-sm md:block">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className={cn('text-center w-12', fixedColumnClass('left', true))}>No</TableHead>
            {columns.map((col) => (
              <TableHead key={col.key} className={fixedColumnClass(col.fixed, true)}>{col.label}</TableHead>
            ))}
            {(onEdit || onDelete || actions) && (
              <TableHead className={cn('text-center w-32', fixedColumnClass(actionColumnFixed, true))}>Aksi</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                <TableCell className={fixedColumnClass('left')}>
                  <Skeleton className="mx-auto h-4 w-5" />
                </TableCell>
                {columns.map((col, colIndex) => (
                  <TableCell key={`${col.key}-${rowIndex}`} className={fixedColumnClass(col.fixed)}>
                    <Skeleton className={cn('h-4', colIndex === 0 ? 'w-28' : colIndex % 3 === 0 ? 'w-40' : 'w-24')} />
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className={cn('text-center', fixedColumnClass(actionColumnFixed))}>
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="h-7 w-14" />
                      <Skeleton className="h-7 w-16" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} className="h-32 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Inbox className="h-10 w-10" />
                  <p className="text-sm">Belum ada data</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={row.id || index}>
                <TableCell className={cn('text-muted-foreground', fixedColumnClass('left'))}>{rowOffset + index + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.key} className={fixedColumnClass(col.fixed)}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
                {(onEdit || onDelete || actions) && (
                  <TableCell className={cn('text-center', fixedColumnClass(actionColumnFixed))}>
                    {renderActions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    <div className="space-y-3 md:hidden">
      {loading ? Array.from({ length: Math.min(skeletonRows, 5) }).map((_, index) => (
        <article key={`mobile-skeleton-${index}`} className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-12 rounded-full" />
            {hasActions && <Skeleton className="h-8 w-24" />}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            {columns.slice(1, 5).map((col) => (
              <div key={col.key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="ml-auto h-4 w-28" />
              </div>
            ))}
          </div>
        </article>
      )) : data.length === 0 ? <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border bg-card text-muted-foreground"><Inbox className="h-10 w-10" /><p className="text-sm">Belum ada data</p></div> : data.map((row, index) => <article key={row.id || index} className="rounded-2xl border bg-card p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">#{rowOffset + index + 1}</span></div><dl className="space-y-2.5">{columns.map((col, colIndex) => <div key={col.key} className={colIndex === 0 ? 'pb-1' : 'grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3'}>{colIndex !== 0 && <dt className="text-xs text-muted-foreground">{col.label}</dt>}<dd className={colIndex === 0 ? 'text-base font-semibold' : 'min-w-0 text-right text-sm font-medium break-words'}>{col.render ? col.render(row[col.key], row) : row[col.key]}</dd></div>)}</dl>{renderActions(row, true)}</article>)}
    </div>
    {pagination && (
      <div className="mt-4">
        <Pagination pagination={pagination} onPageChange={onPageChange} onLimitChange={onLimitChange} pageLoadingDirection={pageLoadingDirection} limitLoading={limitLoading} />
      </div>
    )}
    <DeleteConfirmDialog
      open={Boolean(deleteTarget)}
      onOpenChange={(open) => {
        if (!open && !deleting) setDeleteTarget(null);
      }}
      itemName={targetName}
      loading={deleting}
      onConfirm={confirmDelete}
    />
    </>
  );
}
