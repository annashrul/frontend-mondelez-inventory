// Coalesce bursts of writes into one refresh and cancel pending work on unmount.
export function subscribeDashboardRefresh(target, refresh, delay = 150) {
  let timer;
  const onUpdate = () => {
    clearTimeout(timer);
    timer = setTimeout(refresh, delay);
  };
  target.addEventListener('inventory-dashboard-updated', onUpdate);
  return () => {
    clearTimeout(timer);
    target.removeEventListener('inventory-dashboard-updated', onUpdate);
  };
}

export function isDashboardMutation(url = '', method = 'get') {
  const path = url.split('?')[0];
  return /^(post|put|patch|delete)$/i.test(method)
    && /^\/(barang|pengambilan|adjustment|kartu-stok|kelompok-barang|satuan|lokasi|rak|pengguna)(\/|$)/.test(path)
    && !['/rak/scan', '/rak/items'].includes(path);
}
