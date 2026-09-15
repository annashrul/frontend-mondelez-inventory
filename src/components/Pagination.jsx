import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { emptyPagination } from '@/services/api';

export default function Pagination({ pagination = emptyPagination, onPageChange, onLimitChange, pageLoadingDirection, limitLoading = false }) {
  const page = pagination.page || 1;
  const totalPages = pagination.total_pages || 1;
  const total = pagination.total || 0;
  const limit = pagination.limit || 10;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-card px-2 py-2 text-sm text-muted-foreground sm:flex-row sm:px-3 sm:py-3">
      <div className="hidden sm:block">
        Menampilkan <span className="font-medium text-foreground">{from}-{to}</span> dari{' '}
        <span className="font-medium text-foreground">{total}</span> data
      </div>
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
        {onLimitChange && (
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))} disabled={limitLoading}>
            <SelectTrigger className="hidden h-9 w-[118px] sm:flex">
              <SelectValue />
              {limitLoading && <LoaderCircle className="ml-1 size-3.5 animate-spin text-muted-foreground" />}
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value} / hal
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 sm:size-9"
          onClick={() => onPageChange?.(page - 1)}
          disabled={!pagination.has_prev || pageLoadingDirection === 'prev'}
          aria-label="Halaman sebelumnya"
        >
          {pageLoadingDirection === 'prev' ? <LoaderCircle className="size-4 animate-spin" /> : <ChevronLeft className="size-4" />}
        </Button>
        <span className="min-w-0 flex-1 text-center text-xs font-medium text-foreground sm:min-w-24 sm:flex-none sm:text-sm">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 sm:size-9"
          onClick={() => onPageChange?.(page + 1)}
          disabled={!pagination.has_next || pageLoadingDirection === 'next'}
          aria-label="Halaman berikutnya"
        >
          {pageLoadingDirection === 'next' ? <LoaderCircle className="size-4 animate-spin" /> : <ChevronRight className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
