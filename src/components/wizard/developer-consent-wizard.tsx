import * as React from "react";
import { X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeveloperConsentWizardProps {
  onClose: () => void;
  title?: string;
  type?: "developer" | "tpa" | "ltp";
}

export function DeveloperConsentWizard({ onClose, title = "Developer Consent", type = "developer" }: DeveloperConsentWizardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] shadow-2xl flex flex-col rounded-xl border-2 border-[#7A1316] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#7A1316] text-white border-b border-[#630E10]">
          <h2 className="text-base font-black tracking-wide">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row p-8 gap-8 bg-[#FAF7F2]">
          
          {/* Left Panel - Steps */}
          <div className="w-64 flex flex-col gap-4 shrink-0">
            {[
              { num: "1", line1: "GETTING", line2: "STARTED", active: true },
              { num: "2", line1: "REVIEW", line2: "APPLICATION", active: false },
              { num: "3", line1: "CONFIRMATION", line2: "CONSENT", active: false },
            ].map((step, idx) => (
              <div 
                key={idx}
                className={cn(
                  "relative h-[80px] w-full rounded-lg flex flex-col justify-center pl-5 overflow-hidden shadow-2xs transition-all",
                  step.active ? "bg-[#7A1316] text-white border border-[#630E10]" : "bg-[#F5EBE1] text-[#7A1316] border border-[#DCD5C8]"
                )}
              >
                <div className="relative z-10 tracking-widest font-bold">
                  <div className="text-xs leading-tight opacity-90">{step.line1}</div>
                  <div className="text-lg leading-tight font-black">{step.line2}</div>
                </div>
                {/* Large Background Number */}
                <div className="absolute right-2 -bottom-2 text-[90px] font-serif font-bold leading-none opacity-15 select-none">
                  {step.num}
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel - Content */}
          <div className="flex-1 flex flex-col pt-1">
            
            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1 max-w-sm">
                <input 
                  type="text" 
                  placeholder="Enter Your Application No."
                  className="w-full bg-transparent border-0 border-b-2 border-[#7A1316] text-base text-slate-800 placeholder:text-slate-400 focus:ring-0 focus:outline-none pb-1"
                />
                <div className="text-[#7A1316] text-[11px] font-bold mt-1">Application No.</div>
              </div>
              <Button className="h-9 px-6 bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs border border-[#630E10] shadow-2xs mb-1 cursor-pointer">
                SEARCH
              </Button>
            </div>

            <div className="bg-[#FBF3E4] border border-[#DCD5C8] rounded-lg p-5 text-slate-800 text-xs space-y-2.5 leading-relaxed shadow-2xs">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 bg-[#7A1316] text-white rounded-full p-0.5 shrink-0">
                  <Info className="size-3" />
                </div>
                <p>Please enter application number to give consent for appointment as a {type === "tpa" ? "third party assessor" : type === "ltp" ? "structural engineer" : "developer"}.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 bg-[#7A1316] text-white rounded-full p-0.5 shrink-0">
                  <Info className="size-3" />
                </div>
                <p>Click on the Search button to see your respective application details.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
