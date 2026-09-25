import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LtpRenewalWizardProps {
  onClose: () => void;
}

export function LtpRenewalWizard({ onClose }: LtpRenewalWizardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col border border-gray-300 rounded-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300">
          <h2 className="text-[15px] font-bold text-black">Welcome To Renewal</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors text-black">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pb-12 bg-white flex justify-center">
          
          <div className="flex items-start gap-8 bg-gray-50/50 p-6 border border-gray-100">
            {/* Left side: Registration Number */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2">
                <div className="w-[120px] text-[13px] font-medium leading-tight">
                  Registration<br/>Number
                </div>
                <Input 
                  placeholder="Enter Registration Number" 
                  className="h-9 w-[280px] text-[13px] bg-white border-gray-300" 
                />
              </div>
            </div>

            {/* Right side: Captcha & Go */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="text-[11px] text-gray-500 font-medium">Retype characters from picture:</div>
                <div className="flex items-start gap-2">
                  <div className="w-[200px] h-[60px] bg-black flex flex-col justify-center items-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-600 via-orange-400 to-black opacity-50"></div>
                    <div className="text-[40px] font-serif tracking-widest text-orange-400 relative z-10 drop-shadow-md transform scale-y-110 select-none">
                      9V983S
                    </div>
                    {/* Scratch lines effect */}
                    <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(15deg,transparent,transparent_3px,#000_3px,#000_6px)] z-20 pointer-events-none"></div>
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <Button variant="outline" className="h-6 w-8 p-0 border-gray-400 shadow-sm">↻</Button>
                    <Button variant="outline" className="h-6 w-8 p-0 border-gray-400 shadow-sm">🔊</Button>
                  </div>
                </div>
                <Input 
                  placeholder="E N T E R   C A P T C H A" 
                  className="h-9 w-[200px] text-[11px] tracking-widest text-center mt-1 border-gray-300 shadow-sm" 
                />
              </div>

              {/* GO Button */}
              <div className="pt-6">
                <Button variant="outline" className="h-9 w-14 border-gray-300 shadow-sm text-[#2980b9] font-medium px-0">
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
