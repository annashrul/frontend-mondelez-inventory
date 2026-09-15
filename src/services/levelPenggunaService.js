import api from '@/services/api';
import { createCrudService } from './crudService';

export const levelPenggunaService = createCrudService('level-pengguna');

export async function getMenus() {
  const data = await api.get('/menus');
  return data;
}
