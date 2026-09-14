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
  children,
  size = "md",
}) {
  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

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
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 [&>form>div:last-child]:sticky [&>form>div:last-child]:-bottom-5 [&>form>div:last-child]:z-10 [&>form>div:last-child]:border-t [&>form>div:last-child]:bg-background/95 [&>form>div:last-child]:py-4 [&>form>div:last-child]:backdrop-blur sm:p-6 sm:[&>form>div:last-child]:-bottom-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
