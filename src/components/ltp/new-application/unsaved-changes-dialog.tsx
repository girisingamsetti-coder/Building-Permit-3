"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function UnsavedChangesDialog({
  open,
  onContinueEditing,
  onDiscard,
}: {
  open: boolean;
  onContinueEditing: () => void;
  onDiscard: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onContinueEditing()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground">
              <AlertTriangle className="size-4" />
            </div>
            <DialogTitle>Discard application?</DialogTitle>
          </div>
          <DialogDescription>
            You have unsaved changes. Are you sure you want to close? All entered data will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onContinueEditing}>
            Continue Editing
          </Button>
          <Button variant="destructive" onClick={onDiscard}>
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
