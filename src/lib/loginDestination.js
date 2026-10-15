export function loginDestination(from) {
  const path = from?.pathname;
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.includes('\\') || path === '/login') return '/';
  return path + (from.search || '') + (from.hash || '');
}
