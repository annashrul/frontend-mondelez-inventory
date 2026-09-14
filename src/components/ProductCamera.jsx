import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Upload } from 'lucide-react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';

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
    if (!video?.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    const maxSize = 1280;
    const scale = Math.min(1, maxSize / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.85));
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