"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { LtpCreateApplication } from "@/components/ltp/ltp-create-application";
import { FilePlus2 } from "lucide-react";

interface NewApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewApplicationDialog({ open, onOpenChange }: NewApplicationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-full p-0 gap-0 overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Dialog header */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-6 py-4 shrink-0">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <FilePlus2 className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold text-slate-900 leading-none">
              New Application
            </DialogTitle>
            <p className="mt-0.5 text-xs text-slate-500">
              Submit a new building permission application
            </p>
          </div>
        </div>

        {/* Scrollable wizard content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <LtpCreateApplication onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
