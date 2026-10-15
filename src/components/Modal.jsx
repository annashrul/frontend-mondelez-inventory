import { PermissionForm } from '@/components/PermissionAccess';
import { useTranslation } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ModalFooter({ className, ...props }) {
  return (
    <div
      data-modal-footer=""
      className={cn(
        "sticky -bottom-5 z-10 flex shrink-0 flex-col-reverse gap-2 border-t bg-background/95 px-2 py-4 backdrop-blur sm:-bottom-6 sm:flex-row sm:justify-end sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  permission,
  children,
  size = "md",
}) {
  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  const { t } = useTranslation();
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={cn(
          sizeClasses[size],
          "flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0",
        )}
      >
        <DialogHeader className="shrink-0 border-b bg-background px-2 py-4 pr-12 sm:px-6">
          <DialogTitle>{t(title)}</DialogTitle>
          {description && <DialogDescription>{t(description)}</DialogDescription>}
        </DialogHeader>
        <div data-modal-scroll="" className="min-h-0 flex-1 overflow-y-auto p-5 [&>form>div:last-child]:sticky [&>form>div:last-child]:-bottom-5 [&>form>div:last-child]:z-10 [&>form>div:last-child]:border-t [&>form>div:last-child]:bg-background/95 [&>form>div:last-child]:py-4 [&>form>div:last-child]:backdrop-blur sm:p-6 sm:[&>form>div:last-child]:-bottom-6">
          <PermissionForm permission={permission}>{children}</PermissionForm>
        </div>
      </DialogContent>
    </Dialog>
  );
}
