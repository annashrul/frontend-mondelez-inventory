import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Camera, CameraOff, LoaderCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';

export default function QrScanner({ open, onClose, onScan }) {
  const onScanRef = useRef(onScan);
  const [videoElement, setVideoElement] = useState(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('Meminta akses kamera...');

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    let controls;
    let video;
    let stream;
    let playbackTimeout;

    const waitForVideoFrame = () => new Promise((resolve, reject) => {
      const finish = () => {
        clearTimeout(playbackTimeout);
        video.removeEventListener('loadeddata', finish);
        video.removeEventListener('playing', finish);
        resolve();
      };
      video.addEventListener('loadeddata', finish, { once: true });
      video.addEventListener('playing', finish, { once: true });
      playbackTimeout = setTimeout(() => {
        video.removeEventListener('loadeddata', finish);
        video.removeEventListener('playing', finish);
        reject(new Error(`Stream kamera aktif, tetapi browser tidak menerima frame video (readyState: ${video.readyState}).`));
      }, 8000);
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) finish();
    });

    async function startScanner() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Akses kamera tidak tersedia. Buka aplikasi melalui HTTPS atau localhost.');
        }

        video = videoElement;

        setStatus('Membuka perangkat kamera...');
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        stream = await navigator.mediaDevices.getUserMedia({
          video: isMobile ? { facingMode: { ideal: 'environment' } } : true,
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStatus('Menunggu gambar dari kamera...');
        video.srcObject = stream;
        const frameReady = waitForVideoFrame();
        await video.play().catch((playError) => {
          if (playError.name !== 'AbortError') throw playError;
        });
        await frameReady;
        if (!active) return;

        setReady(true);
        setStatus('QR akan terbaca otomatis.');
        setError('');

        const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 150 });
        controls = await reader.decodeFromVideoElement(video, (result) => {
          const value = result?.getText()?.trim();
          if (!active || !value) return;
          active = false;
          controls?.stop();
          stream?.getTracks().forEach((track) => track.stop());
          setReady(false);
          onScanRef.current(value);
        });
        if (!active) controls.stop();
      } catch (cameraError) {
        if (!active) return;
        const message = cameraError?.name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Aktifkan izin kamera pada pengaturan browser lalu coba lagi.'
          : cameraError?.name === 'NotFoundError'
            ? 'Kamera tidak ditemukan pada perangkat ini.'
            : cameraError.message || 'Kamera tidak dapat dibuka. Pastikan aplikasi menggunakan HTTPS atau localhost.';
        setError(message);
      }
    }

    startScanner();
    return () => {
      active = false;
      clearTimeout(playbackTimeout);
      controls?.stop();
      stream?.getTracks().forEach((track) => track.stop());
      if (video) video.srcObject = null;
    };
  }, [open, videoElement]);

  const close = () => {
    setError('');
    setReady(false);
    setStatus('Meminta akses kamera...');
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={close}
      title="Scan QR Rak"
      description="Arahkan kamera ke QR yang tertempel pada rak."
      size="md"
    >
      <div className="space-y-3">
        <div className="relative h-[58dvh] min-h-80 w-full overflow-hidden rounded-2xl bg-black sm:aspect-square sm:h-auto sm:max-h-[58dvh] sm:rounded-xl">
          <video ref={setVideoElement} className="h-full w-full object-cover" autoPlay muted playsInline />
          {!ready && !error && <div className="absolute inset-0 z-10 grid place-items-center bg-black text-white"><div className="text-center"><LoaderCircle className="mx-auto mb-3 animate-spin opacity-80" size={30} /><p className="text-[13px] font-medium">{status}</p></div></div>}
          {ready && !error && (
            <div className="pointer-events-none absolute left-[12%] right-[12%] top-1/2 aspect-square -translate-y-1/2 rounded-2xl border border-white/50 shadow-[0_0_0_999px_rgba(0,0,0,0.42)]">
              <span className="absolute -top-0.5 -left-0.5 h-8 w-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
              <span className="absolute -top-0.5 -right-0.5 h-8 w-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
              <span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
              <span className="absolute -right-0.5 -bottom-0.5 h-8 w-8 border-r-4 border-b-4 border-green-400 rounded-br-lg" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
              <div><CameraOff className="mx-auto mb-3" size={40} /><p className="text-sm">{error}</p></div>
            </div>
          )}
        </div>
        <p className="flex min-h-8 items-center justify-center gap-2 px-2 text-center text-xs leading-5 text-muted-foreground">
          <Camera size={14} /> {error ? 'Anda tetap dapat mengetik nilai QR secara manual.' : status}
        </p>
        <Button type="button" className="h-12 w-full rounded-xl sm:h-10 sm:w-auto sm:justify-self-end" variant="outline" onClick={close}>Tutup Scanner</Button>
      </div>
    </Modal>
  );
}