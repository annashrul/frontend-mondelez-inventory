import { useTranslation } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsSkeleton({ tab }) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t('Memuat pengaturan...')} className="space-y-4">
      {tab === 'notifikasi' ? (
        <>
          {[1, 2, 3].map(item => <Skeleton key={item} className="h-20 w-full" />)}
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2].map(group => <div key={group} className="space-y-3"><Skeleton className="h-4 w-32" />{[1, 2, 3].map(item => <Skeleton key={item} className="h-16 w-full" />)}</div>)}
          </div>
        </>
      ) : tab === 'database' ? (
        <><Skeleton className="h-14 w-full" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-9 w-36" /><Skeleton className="h-20 w-full" /></>
      ) : (
        Array.from({ length: tab === 'umum' ? 4 : tab === 'tampilan' ? 3 : 2 }, (_, index) => (
          <div key={index} className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className={tab === 'umum' && index === 1 ? 'h-20 w-full' : 'h-9 w-full'} /></div>
        ))
      )}
    </div>
  );
}
