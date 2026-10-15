import { PermissionAction } from '@/components/PermissionAccess';
import { translate as translateUi, useTranslation as useUiLanguage } from '@/lib/i18n';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = "Hapus data?",
  description = "Data yang sudah dihapus tidak dapat dikembalikan.",
  itemName,
  loading = false,
  onConfirm,
}) {
  useUiLanguage();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{translateUi(title)}</AlertDialogTitle>
          <AlertDialogDescription>
            {translateUi(description)}
            {itemName && (
              <span className="mt-3 block rounded-md border bg-muted/40 px-3 py-2 font-medium text-foreground">
                {itemName}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{translateUi("Batal")}</AlertDialogCancel>
          <PermissionAction permission="delete"><Button type="button" variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? translateUi("Menghapus...") : translateUi("Hapus")}
          </Button></PermissionAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
