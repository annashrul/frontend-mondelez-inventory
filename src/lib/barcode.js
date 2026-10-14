export function generateInternalBarcode() {
  const digits = crypto.getRandomValues(new Uint8Array(10));
  const body = '20' + Array.from(digits, value => value % 10).join('');
  const sum = [...body].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0);
  return body + String((10 - sum % 10) % 10);
}
