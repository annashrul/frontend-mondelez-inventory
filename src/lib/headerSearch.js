import { canAccess } from './permissions.js';

export function searchHeaderMenus(menus, user, search, translate) {
  const term = search.trim().toLocaleLowerCase();
  if (!term || !user) return [];
  return menus.filter(menu => menu.aktif !== false && menu.path?.startsWith('/') && !menu.path.startsWith('//')
    && canAccess(user, `${menu.key}.read`)
    && [menu.nama, translate(menu.nama)].some(name => String(name || '').toLocaleLowerCase().includes(term)))
    .slice(0, 5);
}
