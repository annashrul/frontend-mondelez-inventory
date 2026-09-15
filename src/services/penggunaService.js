import api, { getList } from '@/services/api';
import { createCrudService } from './crudService';

export const penggunaService = createCrudService('pengguna');

export async function getLevelPenggunaOptions() {
  const rows = await api.get('/level-pengguna', { params: { limit: 100 } });
  return getList(rows).map((item) => ({ value: String(item.id), label: item.nama }));
}
