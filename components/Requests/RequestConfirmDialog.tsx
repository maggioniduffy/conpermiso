import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PendingAction } from "@/utils/models";

interface Props {
  pendingAction: PendingAction | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResolveConfirmDialog({
  pendingAction,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AlertDialog open={!!pendingAction} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {pendingAction?.status === "APPROVED"
              ? "¿Aprobar solicitud?"
              : "¿Rechazar solicitud?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {pendingAction?.status === "APPROVED"
              ? `"${pendingAction?.name}" quedará disponible en el mapa y se notificará al usuario.`
              : `"${pendingAction?.name}" será rechazada y se notificará al usuario con el motivo.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              pendingAction?.status === "APPROVED"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }
          >
            {pendingAction?.status === "APPROVED"
              ? "Sí, aprobar"
              : "Sí, rechazar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
