export function appearancePayload(settings) {
  if (!['light', 'dark'].includes(settings.tema)) throw new Error('Tema tidak valid');
  if (!['id', 'en'].includes(settings.bahasa)) throw new Error('Bahasa tidak valid');
  if (!Number.isInteger(settings.items_per_page) || settings.items_per_page < 5 || settings.items_per_page > 100) {
    throw new Error('Item per halaman harus bilangan bulat antara 5 dan 100');
  }
  return { tema: settings.tema, bahasa: settings.bahasa, items_per_page: settings.items_per_page };
}
