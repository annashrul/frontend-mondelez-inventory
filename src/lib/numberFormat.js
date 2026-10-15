import { getAppLocale } from './i18n';

// API values remain numeric; identifiers must never pass through this formatter.
export function formatNumber(value, locale = getAppLocale()) {
  if (value === null || value === undefined || value === '') return '-';
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 20 }).format(number)
    : '-';
}

export function formatCurrency(value, locale = getAppLocale()) {
  if (value === null || value === undefined || value === '') return '-';
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(number)
    : '-';
}

const numericColumns = new Set(['stok', 'stok_min', 'qty', 'saldo', 'kapasitas', 'terisi', 'jumlah_barang', 'jumlah_rak', 'jumlah_user']);
export function formatTableValue(key, value) {
  if (key === 'harga') return formatCurrency(value);
  return numericColumns.has(key) ? formatNumber(value) : value;
}
