import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrImage({ value, size = 128, className = '' }) {
  const [source, setSource] = useState('');
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { width: size, margin: 1, errorCorrectionLevel: 'M' }).then((url) => active && setSource(url));
    return () => { active = false; };
  }, [value, size]);
  return source ? <img src={source} width={size} height={size} className={className} alt={`QR ${value}`} /> : null;
}