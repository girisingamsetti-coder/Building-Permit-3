import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LtpViewWizardProps {
  onClose: () => void;
}

export function LtpViewWizard({ onClose }: LtpViewWizardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] shadow-2xl flex flex-col border-2 border-[#7A1316] rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#7A1316] text-white border-b border-[#630E10]">
          <h2 className="text-base font-black tracking-wide">Welcome To Profile Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-12 pb-16 bg-[#FAF7F2]">
          <div className="max-w-2xl mx-auto bg-[#FBF3E4] border border-[#DCD5C8] rounded-xl p-6 shadow-xs grid grid-cols-[300px_1fr] gap-x-4 gap-y-3 text-xs">
            
            {/* Row 1 */}
            <div className="bg-[#F5EBE1] border border-[#DCD5C8] px-3 py-2 flex items-center leading-tight font-semibold text-slate-800 rounded">
              <span className="text-red-500 mr-1">*</span> Registration Number / Temporary Registration Number
            </div>
            <div className="py-1">
              <Input placeholder="Enter Registration Number" className="h-8 text-xs bg-white border-[#DCD5C8]" />
            </div>

            {/* Row 2 */}
            <div className="bg-[#F5EBE1] border border-[#DCD5C8] px-3 py-2 flex items-center leading-tight font-semibold text-slate-800 rounded">
              <span className="text-red-500 mr-1">*</span> Mobile Number
            </div>
            <div className="py-1">
              <Input placeholder="Enter Mobile Number" className="h-8 text-xs bg-white border-[#DCD5C8]" />
            </div>

            {/* Empty column + Button */}
            <div className="pt-2 col-span-2 flex justify-end">
              <Button className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold px-6 shadow-2xs h-8 text-xs border border-[#630E10] cursor-pointer">
                Check Status
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
