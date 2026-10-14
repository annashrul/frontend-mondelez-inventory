export const settingTabIds = ['umum', 'notifikasi', 'tampilan', 'database', 'keamanan'];
export function settingsTab(params) {
  const selected = params.get('tab');
  return settingTabIds.includes(selected) ? selected : 'umum';
}
export function settingsTabParams(params, tab) {
  const next = new URLSearchParams(params);
  next.set('tab', settingTabIds.includes(tab) ? tab : 'umum');
  return next;
}
