"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  isPending,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="p-0 sm:max-w-[360px]">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <p className="px-5 pt-2 pb-1 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        <div className="flex gap-2 px-5 pb-5 pt-3">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-xl text-sm"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            className="flex-1 h-10 rounded-xl text-sm font-semibold"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
