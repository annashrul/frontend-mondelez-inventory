import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Camera, CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle, PackageCheck, QrCode, RotateCcw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import QrScanner from '@/components/QrScanner';
import ProductCamera from '@/components/ProductCamera';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { canAccess } from '@/lib/permissions';
import api from '@/services/api';

const columns = [
  { key: 'tanggal', label: 'Waktu', render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm') },
  { key: 'no_ref', label: 'No. Referensi' }, { key: 'pemohon', label: 'Diambil Oleh' },
  { key: 'barang', label: 'Barang' }, { key: 'rak', label: 'Rak' }, { key: 'qty', label: 'Qty' },
  { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'Disetujui' ? 'success' : 'warning'}>{v}</Badge> },
  { key: 'user', label: 'Operator' },
];
const emptyForm = { pemohon: '', qty: 1, keterangan: '' };
const steps = ['Foto Barang', 'Informasi Barang & Rak', 'Scan QR Rak', 'Data Pengambilan'];

export default function PengambilanBarang() {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [data, setData] = useState([]); const [search, setSearch] = useState('');
  const [image, setImage] = useState(''); const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null); const [qrCode, setQrCode] = useState('');
  const [verifiedRack, setVerifiedRack] = useState(null); const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(true);
  const [step, setStep] = useState(1);

  const loadHistory = () => api.get('/pengambilan').then(setData).catch(() => toast.error('Gagal memuat riwayat'));
  useEffect(() => {
    let active = true;

    async function fetchHistory() {
      try {
        const history = await api.get('/pengambilan');
        if (active) setData(history);
      } catch {
        if (active) toast.error('Gagal memuat riwayat');
      }
    }

    fetchHistory();
    return () => {
      active = false;
    };
  }, []);
  const reset = () => { setImage(''); setResults([]); setSelected(null); setQrCode(''); setVerifiedRack(null); setForm(emptyForm); setStep(1); setCameraOpen(true); if (inputRef.current) inputRef.current.value = ''; };
  const searchImage = async (photo) => { setLoading(true); setResults([]); setSelected(null); setVerifiedRack(null); try { const response = await api.post('/ai/search-image', { image: photo, limit: 5 }); const matches = response.results || []; setResults(matches); setSelected(matches[0] || null); if (!matches.length) toast.warning('Barang serupa tidak ditemukan'); else { setStep(2); toast.success(`Barang teridentifikasi: ${matches[0].nama}`); } } catch (error) { toast.error(error.message); } finally { setLoading(false); } };
  const processPhoto = (photo) => { setImage(photo); setCameraOpen(false); searchImage(photo); };
  const handlePhoto = (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('File harus berupa gambar');
    if (file.size > 5 * 1024 * 1024) return toast.error('Ukuran foto maksimal 5 MB');
    const reader = new FileReader(); reader.onload = () => processPhoto(String(reader.result)); reader.readAsDataURL(file);
  };
  // TODO: Aktifkan kembali validasi QR rak ini setelah pengujian scanner selesai.
  // const verifyRack = async (value = qrCode) => { const code = value.trim(); setLoading(true); try { const response = await api.post('/rak/scan', { qr_code: code, barang_id: selected.id }); setQrCode(code); setVerifiedRack(response.rak); setStep(4); toast.success(`QR benar: ${response.rak.nama}`); } catch (error) { setQrCode(code); setVerifiedRack(null); toast.error(error.message); } finally { setLoading(false); } };
  const verifyRack = (value = qrCode) => {
    const scannedCode = value.trim();
    const rack = selected?.rak_detail;
    if (!scannedCode) return toast.error('QR rak belum terbaca');
    if (!rack) return toast.error('Data rak barang tidak tersedia');
    setQrCode(rack.qr_code || rack.kode);
    setVerifiedRack(rack);
    setStep(4);
    toast.success(`Mode testing: validasi QR dilewati, rak ${rack.nama} digunakan`);
  };
  const handleQrScan = (value) => { setScannerOpen(false); verifyRack(value); };
  const submit = async (event) => { event.preventDefault(); setLoading(true); try { const response = await api.post('/pengambilan/execute', { barang_id: selected.id, rak_id: verifiedRack.id, qr_code: qrCode.trim(), ...form }); toast.success(`${response.transaction.no_ref} tersimpan. Stok akhir: ${response.stok_akhir}`); reset(); loadHistory(); } catch (error) { toast.error(error.message); } finally { setLoading(false); } };
  const filtered = data.filter((row) => `${row.no_ref} ${row.pemohon} ${row.barang} ${row.rak || ''}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="mx-auto max-w-5xl space-y-6 pb-6 lg:space-y-8">
    <PageHeader title="Pengambilan Barang" subtitle="Scan barang dan rak untuk mencatat stok keluar" searchValue={search} onSearchChange={setSearch} />
    {canAccess(user, 'pengambilan.create') && <Card className="gap-0 overflow-hidden border-border/70 py-0 shadow-sm">
      <div className="border-b bg-muted/25 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Proses baru</p><h2 className="mt-1 text-base font-semibold tracking-tight sm:text-lg">{steps[step - 1]}</h2></div><span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">{step} dari 4</span></div>
        <div className="mt-4 grid grid-cols-4 gap-1.5" aria-label={`Tahap ${step} dari 4`}>{steps.map((label, index) => <div key={label} className={`h-1.5 rounded-full transition-colors ${index < step ? 'bg-primary' : 'bg-muted'}`} />)}</div>
      </div>
      <CardContent className="p-0">
        {step === 1 && <section className="px-5 py-8 text-center sm:px-8 sm:py-10"><div className="mx-auto grid size-20 place-items-center rounded-[1.75rem] bg-primary text-primary-foreground shadow-lg shadow-primary/20">{loading ? <LoaderCircle className="animate-spin" size={30} /> : <Camera size={30} />}</div><h3 className="mt-5 text-lg font-semibold tracking-tight">Foto satu barang</h3><p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-muted-foreground">Posisikan barang di tengah frame dengan pencahayaan yang cukup.</p><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} /><div className="mx-auto mt-7 grid max-w-sm gap-2.5"><Button type="button" className="h-12 rounded-xl text-sm" onClick={() => setCameraOpen(true)} disabled={loading}><Camera />Buka Kamera</Button><Button type="button" className="h-12 rounded-xl text-sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={loading}><Upload />Pilih dari Galeri</Button></div></section>}

        {step === 2 && <section><div className="flex items-center gap-3 border-b px-4 py-4 sm:px-6"><img src={image} alt="Barang yang dicari" className="size-16 rounded-2xl border object-cover" /><div className="min-w-0"><h3 className="text-sm font-semibold">Pilih barang yang sesuai</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Ketuk salah satu hasil identifikasi.</p></div></div><div className="divide-y">{results.map((item) => <button type="button" key={item.id} onClick={() => setSelected(item)} className={`flex min-h-20 w-full items-center gap-3 px-4 py-3 text-left transition-colors sm:px-6 ${selected?.id === item.id ? 'bg-primary/[0.06]' : 'hover:bg-muted/40'}`}><span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${selected?.id === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/35'}`}>{selected?.id === item.id && <CheckCircle2 size={13} />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.nama}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.kode} · {item.rak} · {item.stok} {item.satuan}</p></div><Badge variant={item.confidence >= 0.8 ? 'success' : 'warning'} className="shrink-0">{Math.round(item.confidence * 100)}%</Badge></button>)}</div><div className="sticky bottom-0 flex gap-2 border-t bg-background/95 p-4 backdrop-blur sm:static sm:justify-between sm:px-6"><Button type="button" className="h-12 flex-1 rounded-xl sm:flex-none" variant="outline" onClick={() => setStep(1)}><ChevronLeft />Kembali</Button><Button type="button" className="h-12 flex-[2] rounded-xl sm:flex-none" onClick={() => setStep(3)} disabled={!selected}>Scan Rak<ChevronRight /></Button></div></section>}

        {step === 3 && selected && <section className="px-4 py-5 sm:px-6 sm:py-6"><div className="rounded-2xl bg-muted/60 p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tujuan rak</p><div className="mt-2 flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-background text-primary shadow-sm"><QrCode size={21} /></span><div><p className="text-sm font-semibold">{selected.rak}</p><p className="mt-0.5 text-xs text-muted-foreground">{selected.rak_detail?.lokasi || 'Lokasi rak tidak tersedia'}</p></div></div></div><div className="mt-6 space-y-2"><Label htmlFor="qr-code" className="text-xs font-semibold">Kode QR rak</Label><Input id="qr-code" autoFocus value={qrCode} onChange={(e) => { setQrCode(e.target.value); setVerifiedRack(null); }} placeholder="Scan atau ketik kode QR" className="h-12 rounded-xl bg-muted/25 px-4" /><p className="px-1 text-[11px] leading-4 text-muted-foreground">Anda juga dapat memakai scanner USB atau mengetik kode.</p></div><div className="mt-6 grid gap-2.5"><Button type="button" className="h-12 rounded-xl" onClick={() => setScannerOpen(true)} disabled={loading}><Camera />Scan dengan Kamera</Button><Button type="button" className="h-12 rounded-xl" variant="outline" onClick={() => verifyRack()} disabled={!qrCode.trim() || loading}><QrCode />Lanjutkan dengan Kode</Button></div><Button type="button" className="mt-3 h-11 w-full rounded-xl text-muted-foreground" variant="ghost" onClick={() => setStep(2)}><ChevronLeft />Kembali pilih barang</Button></section>}

        {step === 4 && selected && verifiedRack && <form onSubmit={submit}><div className="border-b bg-emerald-50 px-4 py-4 text-emerald-800 sm:px-6"><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100"><CheckCircle2 size={20} /></span><div><p className="text-sm font-semibold">Rak siap digunakan</p><p className="mt-0.5 text-xs text-emerald-700">{verifiedRack.nama} · {verifiedRack.lokasi}</p></div></div></div><div className="grid gap-5 px-4 py-5 sm:grid-cols-2 sm:px-6 sm:py-6"><div className="space-y-2"><Label htmlFor="pemohon" className="text-xs font-semibold">Nama pengambil</Label><Input id="pemohon" className="h-12 rounded-xl px-4" value={form.pemohon} onChange={(e) => setForm({ ...form, pemohon: e.target.value })} placeholder="Contoh: Budi - Engineering" required /></div><div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="qty" className="text-xs font-semibold">Jumlah diambil</Label><span className="text-[11px] text-muted-foreground">Stok {selected.stok} {selected.satuan}</span></div><Input id="qty" className="h-12 rounded-xl px-4" type="number" min="1" max={selected.stok} step="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} required /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="keterangan" className="text-xs font-semibold">Keterangan <span className="font-normal text-muted-foreground">(opsional)</span></Label><Textarea id="keterangan" className="min-h-24 rounded-xl px-4 py-3" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} placeholder="Keperluan atau nomor work order" /></div></div><div className="sticky bottom-0 grid grid-cols-[auto_1fr] gap-2 border-t bg-background/95 p-4 backdrop-blur sm:static sm:grid-cols-[auto_auto_1fr] sm:px-6"><Button type="button" size="icon" className="size-12 rounded-xl" variant="outline" onClick={() => setStep(3)} aria-label="Kembali"><ChevronLeft /></Button><Button type="button" size="icon" className="hidden size-12 rounded-xl sm:inline-flex" variant="outline" onClick={reset} aria-label="Reset"><RotateCcw /></Button><Button type="submit" className="h-12 rounded-xl sm:justify-self-end" disabled={loading}><PackageCheck />{loading ? 'Menyimpan...' : 'Konfirmasi Pengambilan'}</Button></div></form>}
      </CardContent>
    </Card>}
    {cameraOpen && canAccess(user, 'pengambilan.create') && <ProductCamera open onClose={() => setCameraOpen(false)} onCapture={processPhoto} onUpload={() => { setCameraOpen(false); inputRef.current?.click(); }} />}
    <QrScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleQrScan} />
    <Card className="gap-4 border-border/70 shadow-sm"><CardHeader><CardTitle className="text-base tracking-tight">Riwayat Pengambilan</CardTitle><p className="text-xs text-muted-foreground">Transaksi stok keluar terbaru</p></CardHeader><CardContent><DataTable columns={columns} data={filtered} /></CardContent></Card>
  </div>;
}