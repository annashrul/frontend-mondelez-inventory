const listKeys = new Set([
  'barang', 'kelompok-barang', 'satuan', 'lokasi', 'rak', 'pengguna',
  'level-pengguna', 'adjustment', 'kartu-stok', 'pengambilan-history',
  'log-activity', 'shift', 'settings-recipients', 'lokasi-options',
]);

// Retain cached rows while marking related lists for refresh on their next visit.
export function invalidateListCache(client, url = '', method = 'get') {
  const path = url.split('?')[0];
  if (!/^(post|put|patch|delete)$/i.test(method)
    || !/^\/(barang|kelompok-barang|satuan|lokasi|rak|pengguna|level-pengguna|adjustment|kartu-stok|pengambilan|shift)(\/|$)/.test(path)
    || ['/rak/scan', '/rak/items'].includes(path)) return;
  void client.invalidateQueries({ predicate: query => listKeys.has(query.queryKey[0]), refetchType: 'none' });
}
