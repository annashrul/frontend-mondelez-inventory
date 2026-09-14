export const ROLE_ACCESS = {
  Admin: ['*'],
  Operator: ['dashboard', 'barang.read', 'rak.read', 'pengambilan.read', 'pengambilan.create', 'kartu.read', 'barcode.read', 'closing.read', 'closing.create'],
  Owner: ['dashboard', 'barang.read', 'rak.read', 'pengguna.read', 'level.read', 'adjustment.read', 'kartu.read', 'pengambilan.read', 'barcode.read', 'log.read', 'closing.read', 'pengaturan.read'],
};

export function normalizeRole(role) {
  const value = String(role || '').toLowerCase();
  if (value === 'admin') return 'Admin';
  if (value === 'owner') return 'Owner';
  return 'Operator';
}

export function canAccess(user, permission) {
  const permissions = ROLE_ACCESS[normalizeRole(user?.level)] || [];
  return permissions.includes('*') || permissions.includes(permission);
}
