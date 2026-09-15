import api, { getList } from '@/services/api';

export function createCrudService(endpoint) {
  return {
    list: (params) => api.get(`/${endpoint}`, { params }),
    create: (payload) => api.post(`/${endpoint}`, payload),
    update: (id, payload) => api.put(`/${endpoint}/${id}`, payload),
    remove: (id) => api.delete(`/${endpoint}/${id}`),
    generateCode: () => api.get(`/${endpoint}/kode-otomatis`),
  };
}

export async function getLokasiOptions() {
  const rows = await api.get('/lokasi', { params: { limit: 100 } });
  return getList(rows).map((item) => ({ value: String(item.id), label: item.nama }));
}
