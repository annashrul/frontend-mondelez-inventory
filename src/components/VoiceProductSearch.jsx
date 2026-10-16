import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useEffect, useRef, useState } from 'react';
import { Mic, Search, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAppLocale, translate as t } from '@/lib/i18n';

const errors = {
  'not-allowed': 'Izin mikrofon ditolak. Izinkan mikrofon di pengaturan browser lalu coba lagi.',
  'service-not-allowed': 'Pencarian suara tidak diizinkan oleh browser ini.',
  'audio-capture': 'Mikrofon tidak tersedia. Periksa mikrofon perangkat Anda.',
  'no-speech': 'Suara belum terdengar. Silakan coba lagi.',
  network: 'Koneksi pencarian suara bermasalah. Periksa internet lalu coba lagi.',
  'language-not-supported': 'Bahasa pencarian suara tidak didukung oleh browser ini.',
};

export default function VoiceProductSearch({ value, onChange, onSearch, disabled, onListeningChange }) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    onListeningChange(listening);
    return () => onListeningChange(false);
  }, [listening, onListeningChange]);
  const [language, setLanguage] = useState(() => getAppLocale());
  const [alternatives, setAlternatives] = useState([]);
  const session = useRef(null);
  const callbacks = useRef({ onChange, onSearch });
  useEffect(() => { callbacks.current = { onChange, onSearch }; }, [onChange, onSearch]);

  const cancel = () => {
    const current = session.current;
    session.current = null;
    if (current) {
      clearTimeout(current.timer);
      current.recognition.abort();
    }
  };
  useEffect(() => {
    const hide = () => {
      if (document.hidden) { cancel(); setListening(false); }
    };
    document.addEventListener('visibilitychange', hide);
    return () => { document.removeEventListener('visibilitychange', hide); cancel(); };
  }, []);

  const close = () => {
    cancel();
    setListening(false);
    setOpen(false);
  };

  const start = () => {
    setOpen(true);
    setMessage('');
    setAlternatives([]);
    if (disabled || session.current) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage('Browser ini belum mendukung pencarian suara. Ketik nama barang di bawah.');
      return;
    }
    try {
      const recognition = new Recognition();
      const current = { recognition, timer: null, received: false, failed: false };
      session.current = current;
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 5;
      recognition.onresult = event => {
        if (session.current !== current || current.received || current.failed) return;
        const results = Array.from(event.results);
        const clean = text => text.replace(/\s+/g, ' ').trim().slice(0, 200);
        const transcript = clean(results.map(result => result[0]?.transcript || '').join(' '));
        callbacks.current.onChange(transcript);
        // Never commit an interim suffix just because an earlier segment is final.
        if (results.length && results.every(result => result.isFinal) && transcript) {
          const candidates = [transcript];
          for (let segment = 0; segment < results.length; segment++) {
            for (const alternative of Array.from(results[segment]).slice(1)) {
              candidates.push(clean(results.map((result, index) =>
                index === segment ? alternative.transcript : result[0]?.transcript || ''
              ).join(' ')));
            }
          }
          setAlternatives([...new Set(candidates)].filter(Boolean).slice(0, 5));
          current.received = true;
          cancel();
          setListening(false);
        }
      };
      recognition.onerror = event => {
        if (session.current !== current) return;
        current.failed = true;
        setMessage(errors[event.error] || 'Gagal mengenali suara. Silakan coba lagi.');
        cancel();
        setListening(false);
      };
      recognition.onend = () => {
        if (session.current !== current) return;
        clearTimeout(current.timer);
        session.current = null;
        setListening(false);
        if (!current.received && !current.failed) setMessage(errors['no-speech']);
      };
      setListening(true);
      recognition.start();
      current.timer = setTimeout(() => {
        if (session.current !== current) return;
        cancel();
        setListening(false);
        setMessage(errors['no-speech']);
      }, 20000);
    } catch {
      cancel();
      setListening(false);
      setMessage('Gagal membuka mikrofon. Silakan coba lagi.');
    }
  };

  return <div className="space-y-3">
    <Button type="button" variant="outline" className="h-12 w-full rounded-xl text-sm" onClick={start} disabled={disabled || listening}>
      <Mic />{t('Cari Barang by Suara')}
    </Button>
    <Dialog open={open} onOpenChange={next => { if (!next) close(); }}>
      <DialogContent className="gap-5 sm:max-w-lg sm:rounded-3xl" onOpenAutoFocus={event => event.preventDefault()}>
      <DialogTitle className="pr-8 text-xl">{t('Cari Barang by Suara')}</DialogTitle>
      <DialogDescription>{t('Sebutkan nama atau kode barang, lalu periksa hasil ucapan Anda.')}</DialogDescription>
      <div className="flex flex-col items-center gap-5 py-5">
        <button type="button" aria-label={t(listening ? 'Berhenti' : 'Ulangi')} onClick={listening ? () => { cancel(); setListening(false); } : start} disabled={disabled} className={`relative grid size-24 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-primary disabled:opacity-50 ${listening ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-muted text-foreground'}`}>
          {listening && <><span aria-hidden="true" className="absolute inset-0 rounded-full bg-red-500/20 motion-safe:animate-ping" /><span aria-hidden="true" className="absolute -inset-3 rounded-full border border-red-500/25 motion-safe:animate-pulse" /></>}
          <Mic aria-hidden="true" className={`relative size-10 ${listening ? 'motion-safe:animate-pulse' : ''}`} />
        </button>
        <div aria-hidden="true" className="flex h-7 items-center gap-1.5">
          {[14, 24, 18, 28, 18, 24, 14].map((height, index) => <span key={index} className={`w-1 rounded-full ${listening ? 'bg-red-500 voice-search-wave' : 'bg-muted-foreground/25'}`} style={{ height: listening ? height : 4, animationDelay: `${index * 90}ms` }} />)}
        </div>
        <p className="min-h-7 text-center text-lg font-medium break-words" aria-live="polite">{value || t('Ucapkan nama barang')}</p>
      </div>
      <p role="status" aria-live="polite" className="text-xs leading-5 text-muted-foreground">{t(listening ? 'Mendengarkan... Sebutkan nama atau kode barang.' : 'Periksa hasil ucapan, lalu tekan Cari Barang. Pilih bahasa sesuai nama barang yang diucapkan.')}</p>
      {message && <p role="alert" className="text-xs leading-5 text-destructive">{t(message)}</p>}
      <div className="space-y-1.5">
        <Label htmlFor="voice-product-language">{t('Bahasa ucapan')}</Label>
        <select id="voice-product-language" value={language} onChange={event => setLanguage(event.target.value)} disabled={disabled || listening} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          <option value="id-ID">Bahasa Indonesia</option>
          <option value="en-US">English</option>
        </select>
      </div>
      {alternatives.length > 1 && <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{t('Alternatif hasil ucapan')}</p>
        <div className="flex flex-wrap gap-2">{alternatives.map(text => <Button key={text} type="button" variant={value === text ? 'default' : 'outline'} size="sm" className="h-auto whitespace-normal text-left" disabled={disabled || listening} onClick={() => onChange(text)}>{text}</Button>)}</div>
      </div>}
      <Label htmlFor="voice-product-query">{t('Nama atau kode barang')}</Label>
      <Input id="voice-product-query" value={value} onChange={event => onChange(event.target.value)} disabled={disabled || listening} maxLength={200} placeholder={t('Contoh: modular chain')} />
      <div className="flex gap-2">
        {listening ? <Button type="button" variant="outline" onClick={() => { cancel(); setListening(false); }}><Square />{t('Berhenti')}</Button>
          : <Button type="button" variant="outline" onClick={start} disabled={disabled}><Mic />{t('Ulangi')}</Button>}
        <Button type="button" className="flex-1" disabled={disabled || listening || !value.trim()} onClick={() => { close(); void onSearch(value); }}><Search />{t('Cari Barang')}</Button>
      </div>
      </DialogContent>
    </Dialog>
  </div>;
}
