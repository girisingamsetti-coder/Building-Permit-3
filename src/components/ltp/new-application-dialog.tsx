"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, Layers, Building2, MapPin } from "lucide-react";
import { LtpSubmissionDetails } from "./ltp-submission-details";

export function NewApplicationDialog({
  open,
  onOpenChange,
  onSelectScheme,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelectScheme?: (scheme: "LPS Layout" | "Non-LPS") => void;
}) {
  const [activeDraft, setActiveDraft] = React.useState<{
    baNo: string;
    scheme: "LPS Layout" | "Non-LPS";
  } | null>(null);

  // Reset when dialog closes or opens
  React.useEffect(() => {
    if (!open) {
      setActiveDraft(null);
    }
  }, [open]);

  const handleSelect = (scheme: "LPS Layout" | "Non-LPS") => {
    if (onSelectScheme) {
      onSelectScheme(scheme);
    } else {
      const now = new Date();
      const typeCode = scheme === "LPS Layout" ? "LPS" : "BP";
      const newDraftNo = `D/1168/${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}/${typeCode}/${now.getFullYear()}`;
      setActiveDraft({ baNo: newDraftNo, scheme });
    }
  };

  // If draft is active and parent didn't handle it via onSelectScheme
  if (activeDraft && !onSelectScheme) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF7F2] overflow-hidden">
        <LtpSubmissionDetails
          baNo={activeDraft.baNo}
          proposalStatus="Draft"
          submissionDate={`${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
          isDraft={true}
          initialLpsType={activeDraft.scheme}
          onBack={() => {
            setActiveDraft(null);
            onOpenChange(false);
          }}
        />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl p-6 sm:p-8 gap-6 bg-[#FAF7F2] border-2 border-[#7A1316] rounded-2xl shadow-2xl">
        <DialogTitle className="sr-only">Select application scheme</DialogTitle>
        
        {/* Header */}
        <div className="space-y-1.5 text-left border-b border-[#DCD5C8] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#7A1316]/10 text-[#7A1316] border border-[#7A1316]/20">
              APCRDA Capital City &amp; Zonal Region
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#7A1316]">New application</h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            Choose the scheme for your application. Clicking on either option will immediately load the statutory form, drawings, and scrutiny rules for that application type.
          </p>
        </div>

        {/* 2 Buttons: LPS and Non LPS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Button 1: LPS */}
          <button 
            id="dialog-btn-lps" 
            onClick={() => handleSelect("LPS Layout")}
            className="group relative flex flex-col p-6 rounded-2xl border-2 border-[#7A1316] bg-white hover:bg-[#FBF3E4] hover:shadow-xl transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7A1316]/20"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-3xl font-black text-[#7A1316] group-hover:scale-105 transition-transform">LPS</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#7A1316] text-white">LPS Layout</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">Land Pooling Scheme Layout Application</p>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              For plots situated inside the Amaravati Capital City Land Pooling Scheme. Includes LPS Block No, LPS Survey No, LPS Plot No, and APCRDA pre-approved zoning districts (R3).
            </p>
            <div className="mt-auto pt-4 border-t border-[#DCD5C8] flex items-center justify-between w-full">
              <span className="text-xs font-bold text-[#7A1316] group-hover:underline flex items-center gap-1.5">
                Open LPS Application <ArrowRight className="size-4" />
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Fast-track Scrutiny</span>
            </div>
          </button>

          {/* Button 2: Non LPS */}
          <button 
            id="dialog-btn-non-lps" 
            onClick={() => handleSelect("Non-LPS")}
            className="group relative flex flex-col p-6 rounded-2xl border-2 border-slate-300 hover:border-[#7A1316] bg-white hover:bg-[#FBF3E4] hover:shadow-xl transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7A1316]/20"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-3xl font-black text-slate-800 group-hover:text-[#7A1316] group-hover:scale-105 transition-transform">Non LPS</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-[#7A1316] group-hover:text-white transition-colors">Non-LPS Layout</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">Non-LPS / Revenue Village / Gramkantam</p>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              For general revenue lands, Gramkantam, extended habitation, private layouts, and village settlement plots requiring Mandal, Village, and Survey verification.
            </p>
            <div className="mt-auto pt-4 border-t border-[#DCD5C8] flex items-center justify-between w-full">
              <span className="text-xs font-bold text-[#7A1316] group-hover:underline flex items-center gap-1.5">
                Open Non LPS Application <ArrowRight className="size-4" />
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Standard Revenue Scrutiny</span>
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="rounded-lg border border-[#DCD5C8] bg-[#FBF3E4] p-3 text-xs text-slate-700 leading-relaxed shadow-2xs">
          An application number is issued as soon as you begin, and the file is saved as a draft. You can leave at any point and pick up where you left off — nothing is filed until you submit it.
        </div>
      </DialogContent>
    </Dialog>
  );
}
