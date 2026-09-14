import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { emptyPagination } from '@/services/api';

export default function Pagination({ pagination = emptyPagination, onPageChange, onLimitChange }) {
  const page = pagination.page || 1;
  const totalPages = pagination.total_pages || 1;
  const total = pagination.total || 0;
  const limit = pagination.limit || 10;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card px-3 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>
        Menampilkan <span className="font-medium text-foreground">{from}-{to}</span> dari{' '}
        <span className="font-medium text-foreground">{total}</span> data
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onLimitChange && (
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
            <SelectTrigger className="h-9 w-[100px]">
              <SelectValue />
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
          className="size-9"
          onClick={() => onPageChange?.(page - 1)}
          disabled={!pagination.has_prev}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-24 text-center font-medium text-foreground">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          onClick={() => onPageChange?.(page + 1)}
          disabled={!pagination.has_next}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
