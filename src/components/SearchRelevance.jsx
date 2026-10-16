import { useState } from 'react';
import api from '@/services/api';
import { toast } from '@/lib/toast';
import { translate as t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
export default function SearchRelevance({ auditId, selected, onReviewed }) {
  const [saving, setSaving] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const review = async value => {
    setSaving(true);
    try {
      await api.patch(`/search-audit/${auditId}/feedback`, { verdict: value, item_id: value === 'correct' ? selected?.id : null });
      setVerdict(value); onReviewed?.();
    } catch (error) { toast.error(error.message); }
    finally { setSaving(false); }
  };
  if (!auditId) return null;
  return <div className="space-y-2 rounded-xl border bg-muted/25 p-3 text-left">
    <p className="text-xs text-muted-foreground">{t('Apakah hasil pencarian sesuai? Pilih barang sebelum menilai sesuai.')}</p>
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant={verdict === 'correct' ? 'default' : 'outline'} disabled={saving || !selected} onClick={() => review('correct')}>{t('Sesuai')}</Button>
      <Button type="button" size="sm" variant={verdict === 'incorrect' ? 'default' : 'outline'} disabled={saving} onClick={() => review('incorrect')}>{t('Tidak sesuai')}</Button>
      {verdict && <span role="status" className="self-center text-xs text-muted-foreground">{t('Penilaian tersimpan')}</span>}
    </div>
  </div>;
}
