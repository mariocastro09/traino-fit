import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";

type Request = { message: string; resolve: (confirmed: boolean) => void };

let show: ((request: Request) => void) | null = null;

// Drop-in replacement for window.confirm(): `if (await confirmDialog("…"))`.
// Needs one <ConfirmDialogHost /> mounted on the page.
export function confirmDialog(message: string) {
  return new Promise<boolean>((resolve) => {
    if (show) show({ message, resolve });
    else resolve(window.confirm(message));
  });
}

export function ConfirmDialogHost() {
  const [request, setRequest] = useState<Request | null>(null);

  useEffect(() => {
    show = setRequest;
    return () => {
      show = null;
    };
  }, []);

  const answer = (confirmed: boolean) => {
    request?.resolve(confirmed);
    setRequest(null);
  };

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && answer(false)}>
      <DialogContent role="alertdialog" className="max-w-sm w-[calc(100%-2rem)]">
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogDescription className="text-light/70">{request?.message}</DialogDescription>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => answer(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={() => answer(true)}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
