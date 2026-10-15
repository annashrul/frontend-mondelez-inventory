import { recordUiActivity } from '@/services/activityEvents';
import { useState, cloneElement, isValidElement } from 'react';
import { PermissionContext, usePermission, useResolvedPermission } from '@/hooks/usePermission';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function PermissionScope({ user, permission, children }) {
  return <PermissionContext.Provider value={{ user, resource: permission.split('.')[0] }}>{children}</PermissionContext.Provider>;
}

export function AccessTooltip({ denied, children, block = false, className, permission }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  if (!denied) return children;
  const message = t('Anda tidak mempunyai akses');
  const Wrapper = block ? 'div' : 'span';
  const Content = block ? 'div' : 'span';
  const label = isValidElement(children) ? children.props['aria-label'] || (typeof children.props.children === 'string' ? children.props.children : null) : null;
  return <TooltipProvider><Tooltip open={open} onOpenChange={setOpen}>
    <TooltipTrigger asChild>
      <Wrapper data-permission-denied="" role="group" aria-label={label ? `${label}: ${message}` : message} aria-disabled="true" tabIndex={0}
        className={cn('relative cursor-not-allowed', block ? 'block min-w-0' : 'inline-flex', className)}
        onClick={event => { event.preventDefault(); event.stopPropagation(); setOpen(true); if (permission) void recordUiActivity({ type: 'access_denied', permission }); }}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpen(value => !value); if (permission) void recordUiActivity({ type: 'access_denied', permission }); }
          if (event.key === 'Escape') setOpen(false);
        }}>
        <Content inert className={cn('pointer-events-none', block ? 'block min-w-0' : 'inline-flex w-full')}>{children}</Content>
      </Wrapper>
    </TooltipTrigger>
    <TooltipContent>{message}</TooltipContent>
  </Tooltip></TooltipProvider>;
}

export function PermissionAction({ permission, children, className }) {
  const allowed = usePermission(permission);
  const resolved = useResolvedPermission(permission);
  return <AccessTooltip denied={!allowed} permission={resolved} className={className}>
    {allowed ? children : cloneElement(children, { disabled: true, 'aria-disabled': true })}
  </AccessTooltip>;
}

export function PermissionForm({ permission, children }) {
  const allowed = usePermission(permission);
  const resolved = useResolvedPermission(permission);
  return <AccessTooltip denied={!allowed} permission={resolved} block>{children}</AccessTooltip>;
}
