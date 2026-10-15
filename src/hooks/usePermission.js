import { createContext, useContext } from 'react';
import { canAccess } from '@/lib/permissions';

export const PermissionContext = createContext(null);

export function useResolvedPermission(permission) {
  const scope = useContext(PermissionContext);
  return !permission || permission.includes('.') || !scope ? permission : `${scope.resource}.${permission}`;
}

export function usePermission(permission) {
  const scope = useContext(PermissionContext);
  if (!permission || !scope) return true;
  return canAccess(scope.user, permission.includes('.') ? permission : `${scope.resource}.${permission}`);
}
