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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-4xl bg-[#f4f7f9] shadow-2xl flex flex-col rounded overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row p-8 gap-12">
          
          {/* Left Panel - Steps */}
          <div className="w-64 flex flex-col gap-6 shrink-0">
            {[
              { num: "1", line1: "GETTING", line2: "STARTED", active: true },
              { num: "2", line1: "REVIEW", line2: "APPLICATION", active: false },
              { num: "3", line1: "CONFIRMATION", line2: "CONSENT", active: false },
            ].map((step, idx) => (
              <div 
                key={idx}
                className={cn(
                  "relative h-[85px] w-[240px] flex flex-col justify-center pl-6 overflow-hidden shadow-sm transition-all",
                  step.active ? "bg-[#187ebb] text-white" : "bg-[#91c0e0] text-white/90"
                )}
              >
                <div className="relative z-10 tracking-widest font-bold">
                  <div className="text-[14px] leading-tight opacity-90">{step.line1}</div>
                  <div className="text-[22px] leading-tight">{step.line2}</div>
                </div>
                {/* Large Background Number */}
                <div className="absolute right-2 -bottom-2 text-[100px] font-serif font-bold leading-none opacity-20 select-none">
                  {step.num}
                </div>
                {/* Cutout style effect on the active number */}
                {step.active && (
                  <div className="absolute right-4 -bottom-4 text-[110px] font-serif font-bold text-white leading-none select-none">
                    {step.num}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Panel - Content */}
          <div className="flex-1 flex flex-col pt-2">
            
            <div className="flex items-end gap-6 mb-8">
              <div className="flex-1 max-w-sm">
                <input 
                  type="text" 
                  placeholder="Enter Your Application No."
                  className="w-full bg-transparent border-0 border-b-2 border-[#1fa79e] text-lg text-gray-700 placeholder:text-gray-400 focus:ring-0 focus:outline-none pb-1"
                />
                <div className="text-[#1fa79e] text-[11px] font-bold mt-1">Application No.</div>
              </div>
              <Button variant="outline" className="h-10 px-8 text-[#2980b9] font-medium border-gray-300 shadow-sm mb-4">
                SEARCH
              </Button>
            </div>

            <div className="bg-[#dcf0f7] border border-[#bce8f1] rounded p-5 text-[#31708f] text-[15px] space-y-3 leading-relaxed">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 bg-[#31708f] text-white rounded-full p-0.5 shrink-0">
                  <Info className="size-3" />
                </div>
                <p>Please enter application number to give consent for appointment as a {type === "tpa" ? "third party assessor" : type === "ltp" ? "structural engineer" : "developer"}.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 bg-[#31708f] text-white rounded-full p-0.5 shrink-0">
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
