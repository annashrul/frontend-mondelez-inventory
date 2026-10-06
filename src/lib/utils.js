import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Mengubah nilai input type="number" menjadi number|null.
 * String kosong (field dihapus/dikosongkan) menghasilkan null, bukan 0,
 * sehingga field bisa dikosongkan tanpa langsung terisi angka 0.
 */
export function parseNumberInput(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}
