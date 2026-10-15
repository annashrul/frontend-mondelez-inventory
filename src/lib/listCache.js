const listKeys = new Set([
  'barang', 'kelompok-barang', 'satuan', 'lokasi', 'rak', 'pengguna',
  'level-pengguna', 'adjustment', 'kartu-stok', 'pengambilan-history',
  'log-activity', 'shift', 'settings-recipients', 'lokasi-options',
]);

export function invalidateActivityCache(client, url = '') {
  const path = url.split('?')[0];
  if (!path || ['/log-activity', '/log-activity/events', '/auth/session', '/settings/runtime', '/health'].includes(path)) return;
  void client.invalidateQueries({ queryKey: ['log-activity'], refetchType: 'none' });
}

// Retain cached rows while marking related lists for refresh on their next visit.
export function invalidateListCache(client, url = '', method = 'get') {
  const path = url.split('?')[0];
  invalidateActivityCache(client, url);
  if (!/^(post|put|patch|delete)$/i.test(method)
    || !/^\/(barang|kelompok-barang|satuan|lokasi|rak|pengguna|level-pengguna|adjustment|kartu-stok|pengambilan|shift)(\/|$)/.test(path)
    || ['/rak/scan', '/rak/items'].includes(path)) return;
  void client.invalidateQueries({ predicate: query => listKeys.has(query.queryKey[0]), refetchType: 'none' });
}
