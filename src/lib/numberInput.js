export function numberSeparators(locale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
  return { group: parts.find(part => part.type === 'group').value, decimal: parts.find(part => part.type === 'decimal').value };
}

export function parseNumberDraft(text, locale) {
  const { group, decimal } = numberSeparators(locale);
  let raw = text.replace(/\s/g, '');
  raw = raw.split(group).join('').replace(decimal, '.');
  return /^-?\d*(\.\d*)?$/.test(raw) ? raw : null;
}

export function formatNumberDraft(raw, locale) {
  if (!raw || raw === '-') return raw;
  const { group, decimal } = numberSeparators(locale);
  const negative = raw.startsWith('-');
  const [integer, fraction] = raw.replace(/^-/, '').split('.');
  const grouped = (integer.replace(/^0+(?=\d)/, '') || '0').replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `${negative ? '-' : ''}${grouped}${fraction === undefined ? '' : decimal + fraction}`;
}

export function canonicalNumberDraft(raw) {
  return raw === '' || raw === '-' || raw === '.' || raw === '-.' ? '' : raw;
}
