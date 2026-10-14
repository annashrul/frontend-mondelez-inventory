import api, { getList, getPagination } from '@/services/api';

export async function getQrRacks({ signal }) {
  const racks = [];
  let page = 1;
  let hasNext;
  do {
    const response = await api.get('/rak', { params: { page, limit: 100 }, signal });
    racks.push(...getList(response));
    hasNext = getPagination(response).has_next;
    page++;
  } while (hasNext);
  return racks;
}
