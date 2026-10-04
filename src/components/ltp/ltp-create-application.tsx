"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { ArrowLeft, ArrowRight, Building2, MapPin } from "lucide-react";
import { LtpSubmissionDetails } from "./ltp-submission-details";

export function LtpCreateApplication({ onClose }: { onClose?: () => void } = {}) {
  const { navigate } = useAppStore();
  const [activeDraft, setActiveDraft] = React.useState<{
    baNo: string;
    scheme: "LPS Layout" | "Non-LPS";
  } | null>(null);

  const handleSelectScheme = (scheme: "LPS Layout" | "Non-LPS") => {
    const now = new Date();
    const typeCode = scheme === "LPS Layout" ? "LPS" : "BP";
    const newDraftNo = `D/1168/${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}/${typeCode}/${now.getFullYear()}`;
    setActiveDraft({
      baNo: newDraftNo,
      scheme,
    });
  };

  if (activeDraft) {
    return (
      <div className="h-full w-full overflow-hidden p-0 bg-[#FAF7F2]">
        <LtpSubmissionDetails
          baNo={activeDraft.baNo}
          proposalStatus="Draft"
          submissionDate={`${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
          isDraft={true}
          initialLpsType={activeDraft.scheme}
          onBack={() => {
            if (onClose) onClose();
            else setActiveDraft(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-3 sm:p-4 flex flex-col font-sans text-slate-800 overflow-hidden">
      {/* Main Card / Outlined Container fitting across contents area */}
      <div className="w-full h-full rounded-xl border-2 border-[#7A1316] bg-white shadow-xs overflow-y-auto flex flex-col flex-1 min-h-0 p-6 sm:p-8 lg:p-10 justify-between gap-6">
        <div className="text-center space-y-2 border-b border-[#DCD5C8] pb-4">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#7A1316]/10 text-[#7A1316] border border-[#7A1316]/20 uppercase tracking-wider">
            APCRDA Building Permission
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#7A1316] tracking-tight">Select Application Scheme</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Please choose whether your site is part of the Amaravati Land Pooling Scheme (LPS) or a Non-LPS layout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto my-auto items-stretch">
          {/* Button 1: LPS */}
          <button
            id="create-app-btn-lps"
            onClick={() => handleSelectScheme("LPS Layout")}
            className="group relative flex flex-col p-6 sm:p-8 rounded-xl border-2 border-[#7A1316] bg-[#FAF7F2] hover:bg-[#FBF3E4] hover:shadow-xl transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7A1316]/20"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-3xl font-black text-[#7A1316] group-hover:scale-105 transition-transform">LPS</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#7A1316] text-white">LPS Layout</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1.5">Land Pooling Scheme Layout Application</p>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              For plots situated inside the Amaravati Capital City Land Pooling Scheme. Includes LPS Block No, LPS Survey No, LPS Plot No, and APCRDA pre-approved zoning districts (R3).
            </p>
            <div className="mt-auto pt-4 border-t border-[#DCD5C8] flex items-center justify-between w-full">
              <span className="text-xs sm:text-sm font-bold text-[#7A1316] group-hover:underline flex items-center gap-1.5">
                Open LPS Application <ArrowRight className="size-4" />
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Fast-track Scrutiny</span>
            </div>
          </button>

          {/* Button 2: Non LPS */}
          <button
            id="create-app-btn-non-lps"
            onClick={() => handleSelectScheme("Non-LPS")}
            className="group relative flex flex-col p-6 sm:p-8 rounded-xl border-2 border-slate-300 hover:border-[#7A1316] bg-white hover:bg-[#FBF3E4] hover:shadow-xl transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7A1316]/20"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-3xl font-black text-slate-800 group-hover:text-[#7A1316] group-hover:scale-105 transition-transform">Non LPS</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-[#7A1316] group-hover:text-white transition-colors">Non-LPS Layout</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1.5">Non-LPS / Revenue Village / Gramkantam</p>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              For general revenue lands, Gramkantam, extended habitation, private layouts, and village settlement plots requiring Mandal, Village, and Survey verification.
            </p>
            <div className="mt-auto pt-4 border-t border-[#DCD5C8] flex items-center justify-between w-full">
              <span className="text-xs sm:text-sm font-bold text-[#7A1316] group-hover:underline flex items-center gap-1.5">
                Open Non LPS Application <ArrowRight className="size-4" />
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Standard Revenue Scrutiny</span>
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="w-full max-w-5xl mx-auto rounded-lg border border-[#DCD5C8] bg-[#FBF3E4] p-3.5 text-xs text-slate-700 leading-relaxed shadow-2xs">
          An application number is issued as soon as you begin, and the file is saved as a draft. You can leave at any point and pick up where you left off — nothing is filed until you submit it.
        </div>

        {/* Cancel button */}
        <div className="flex justify-center pt-1">
          <button
            onClick={() => {
              if (onClose) onClose();
              else navigate("ltp-dashboard");
            }}
            className="text-xs font-semibold text-slate-500 hover:text-[#7A1316] hover:underline cursor-pointer"
          >
            Cancel and return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
