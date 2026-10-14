import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrImage({ value, size = 128, className = '', onLoad }) {
  useUiLanguage();
  const [source, setSource] = useState('');
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { width: size, margin: 1, errorCorrectionLevel: 'M' }).then((url) => active && setSource(url));
    return () => { active = false; };
  }, [value, size]);
  return source ? <img src={source} width={size} height={size} className={className} onLoad={onLoad} alt={translateUi("QR {value0}", { value0: value })} /> : null;
}