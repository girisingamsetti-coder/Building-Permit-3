import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LtpRenewalWizardProps {
  onClose: () => void;
}

export function LtpRenewalWizard({ onClose }: LtpRenewalWizardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] shadow-2xl flex flex-col border-2 border-[#7A1316] rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#7A1316] text-white border-b border-[#630E10]">
          <h2 className="text-base font-black tracking-wide">Welcome To Renewal</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pb-12 bg-[#FAF7F2] flex justify-center">
          
          <div className="flex items-start gap-8 bg-[#FBF3E4] p-6 border border-[#DCD5C8] rounded-xl shadow-xs">
            {/* Left side: Registration Number */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 bg-white border border-[#DCD5C8] rounded p-3">
                <div className="w-[120px] text-xs font-bold text-slate-800 leading-tight">
                  Registration<br/>Number
                </div>
                <Input 
                  placeholder="Enter Registration Number" 
                  className="h-8 w-[280px] text-xs bg-white border-[#DCD5C8]" 
                />
              </div>
            </div>

            {/* Right side: Captcha & Go */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="text-[11px] text-slate-600 font-semibold">Retype characters from picture:</div>
                <div className="flex items-start gap-2">
                  <div className="w-[180px] h-[50px] bg-black flex flex-col justify-center items-center overflow-hidden relative rounded">
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-600 via-orange-400 to-black opacity-50"></div>
                    <div className="text-[32px] font-serif tracking-widest text-orange-400 relative z-10 drop-shadow-md transform scale-y-110 select-none">
                      9V983S
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-0.5">
                    <Button variant="outline" className="h-5 w-6 p-0 border-[#DCD5C8] shadow-2xs">↻</Button>
                    <Button variant="outline" className="h-5 w-6 p-0 border-[#DCD5C8] shadow-2xs">🔊</Button>
                  </div>
                </div>
                <Input 
                  placeholder="E N T E R   C A P T C H A" 
                  className="h-8 w-[180px] text-[11px] tracking-widest text-center mt-1 border-[#DCD5C8] shadow-2xs bg-white" 
                />
              </div>

              {/* GO Button */}
              <div className="pt-6">
                <Button className="h-8 w-16 bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs shadow-2xs border border-[#630E10] px-0 cursor-pointer">
                  GO
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
