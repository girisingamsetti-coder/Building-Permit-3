"use client";

import * as React from "react";
import { NewApplicationDialog } from "@/components/ltp/new-application-dialog";

export function NewApplicationModal({
  open,
  onOpenChange,
  onSelectScheme,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectScheme?: (scheme: "LPS Layout" | "Non-LPS") => void;
}) {
  return (
    <NewApplicationDialog
      open={open}
      onOpenChange={onOpenChange}
      onSelectScheme={onSelectScheme}
    />
  );
}
