import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DataTable({ columns, data, onEdit, onDelete, actions }) {
  const renderActions = (row, mobile = false) => (onEdit || onDelete || actions) && (
    <div className={mobile ? 'flex items-center gap-2 border-t pt-3' : 'flex items-center justify-center gap-1'}>
      {actions && actions(row)}
      {onEdit && <Button variant="outline" size="sm" className={mobile ? 'h-9 flex-1' : 'h-7 text-xs'} onClick={() => onEdit(row)}>Edit</Button>}
      {onDelete && <Button variant="outline" size="sm" className={mobile ? 'h-9 flex-1 text-destructive hover:text-destructive' : 'h-7 text-xs text-destructive hover:text-destructive'} onClick={() => onDelete(row)}>Hapus</Button>}
    </div>
  );

  return (
    <>
    <div className="hidden rounded-lg border bg-card shadow-sm md:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12">No</TableHead>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
            {(onEdit || onDelete || actions) && (
              <TableHead className="text-center w-32">Aksi</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 2} className="h-32 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Inbox className="h-10 w-10" />
                  <p className="text-sm">Belum ada data</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={row.id || index}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
                {(onEdit || onDelete || actions) && (
                  <TableCell className="text-center">
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
      {data.length === 0 ? <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border bg-card text-muted-foreground"><Inbox className="h-10 w-10" /><p className="text-sm">Belum ada data</p></div> : data.map((row, index) => <article key={row.id || index} className="rounded-2xl border bg-card p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">#{index + 1}</span></div><dl className="space-y-2.5">{columns.map((col, colIndex) => <div key={col.key} className={colIndex === 0 ? 'pb-1' : 'grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3'}>{colIndex !== 0 && <dt className="text-xs text-muted-foreground">{col.label}</dt>}<dd className={colIndex === 0 ? 'text-base font-semibold' : 'min-w-0 text-right text-sm font-medium break-words'}>{col.render ? col.render(row[col.key], row) : row[col.key]}</dd></div>)}</dl>{renderActions(row, true)}</article>)}
    </div>
    </>
  );
}
