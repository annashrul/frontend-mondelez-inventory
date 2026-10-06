import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Upload } from 'lucide-react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';

// Harus sama dengan kelas `inset-[12%]` pada kotak panduan di bawah.
const GUIDE_INSET = 0.12;

export default function ProductCamera({ open, onClose, onCapture, onUpload }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    let stream;
    let video;
    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Kamera tidak tersedia. Buka aplikasi melalui HTTPS atau localhost.');
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (active) setReady(true);
      } catch (cameraError) {
        if (active) setError(cameraError.message || 'Kamera tidak dapat dibuka. Periksa izin kamera.');
      }
    }

    startCamera();
    return () => {
      active = false;
      stream?.getTracks().forEach((track) => track.stop());
      if (video) video.srcObject = null;
    };
  }, [open]);

  const takePhoto = () => {
    const video = videoRef.current;
    const vw = video?.videoWidth;
    const vh = video?.videoHeight;
    if (!vw || !vh) return;

    // Preview memakai `object-cover`: video diperbesar untuk menutupi kontainer
    // lalu dipotong di tengah. Balikkan transformasi itu agar koordinat kotak
    // panduan di layar bisa dipetakan ke koordinat frame video asli.
    const containerW = video.clientWidth || vw;
    const containerH = video.clientHeight || vh;
    const coverScale = Math.max(containerW / vw, containerH / vh);
    const offsetX = (containerW - vw * coverScale) / 2;
    const offsetY = (containerH - vh * coverScale) / 2;

    const boxX = containerW * GUIDE_INSET;
    const boxY = containerH * GUIDE_INSET;
    const boxW = containerW * (1 - GUIDE_INSET * 2);
    const boxH = containerH * (1 - GUIDE_INSET * 2);

    let sx = (boxX - offsetX) / coverScale;
    let sy = (boxY - offsetY) / coverScale;
    let sw = boxW / coverScale;
    let sh = boxH / coverScale;

    // Jaga-jaga agar tetap di dalam frame.
    sx = Math.max(0, Math.min(sx, vw));
    sy = Math.max(0, Math.min(sy, vh));
    sw = Math.max(1, Math.min(sw, vw - sx));
    sh = Math.max(1, Math.min(sh, vh - sy));

    const canvas = document.createElement('canvas');
    const maxSize = 1280;
    const scale = Math.min(1, maxSize / Math.max(sw, sh));
    canvas.width = Math.round(sw * scale);
    canvas.height = Math.round(sh * scale);
    canvas
      .getContext('2d')
      .drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Foto Barang" description="Posisikan satu barang di tengah kamera, lalu ambil foto." size="lg">
      <div className="space-y-4">
        <div className="relative h-[52dvh] max-h-[560px] min-h-72 overflow-hidden rounded-2xl bg-black sm:aspect-video sm:h-auto sm:min-h-0 sm:rounded-lg">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          {!error && <div className="pointer-events-none absolute inset-[12%] rounded-xl border-2 border-white/80" />}
          {error && <div className="absolute inset-0 grid place-items-center p-6 text-center text-white"><div><CameraOff className="mx-auto mb-3" size={40} /><p className="text-sm">{error}</p></div></div>}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
          <Button type="button" className="col-span-2 h-12 sm:h-9" onClick={takePhoto} disabled={!ready || !!error}><Camera size={16} className="mr-2" />Foto Barang</Button>
          <Button type="button" className="h-11 sm:h-9" variant="outline" onClick={onUpload}><Upload size={16} className="mr-2" />Pilih File</Button>
          <Button type="button" className="h-11 sm:h-9" variant="ghost" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </Modal>
  );
}