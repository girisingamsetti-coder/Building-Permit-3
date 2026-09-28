import * as React from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DeveloperStatusWizardProps {
  onClose: () => void;
  title?: string;
}

export function DeveloperStatusWizard({ onClose, title = "Developer Registration Status" }: DeveloperStatusWizardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] shadow-2xl border-2 border-[#7A1316] rounded-lg flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#FBF3E4] border-b border-[#DCD5C8]">
          <h2 className="text-base font-bold text-[#7A1316]">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#7A1316]/10 rounded transition-colors text-[#7A1316]">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-6 bg-[#FAF7F2]">
          
          <div className="grid grid-cols-[220px_1fr] items-center gap-4 bg-[#FBF3E4] p-4 rounded-md border border-[#DCD5C8]">
            <div className="flex items-center text-[13px] font-semibold text-[#7A1316]">
              <span className="text-red-600 mr-1">*</span> Certificate/Temp No.
            </div>
            <div className="flex w-full max-w-md">
              <Input 
                placeholder="Enter Certificate No / Temp No." 
                className="h-9 rounded-r-none border-[#DCD5C8] bg-white text-slate-800 focus-visible:ring-0 focus-visible:border-[#7A1316]" 
              />
              <Button 
                className="h-9 rounded-l-none bg-[#7A1316] hover:bg-[#8F161A] text-white px-3"
              >
                <Search className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 rounded-md bg-[#FBF3E4] border border-[#DCD5C8] text-[13px] text-slate-800">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-[#DCD5C8] pb-2">
                <span className="text-slate-500 font-medium">Temporary Certificate No:</span>
                <span className="font-semibold text-[#7A1316]">-</span>
              </div>
              <div className="flex justify-between border-b border-[#DCD5C8] pb-2">
                <span className="text-slate-500 font-medium">Firm Type:</span>
                <span className="font-semibold text-slate-700">-</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-[#DCD5C8] pb-2">
                <span className="text-slate-500 font-medium">Permanent Certificate No:</span>
                <span className="font-semibold text-[#7A1316]">-</span>
              </div>
              <div className="flex justify-between border-b border-[#DCD5C8] pb-2">
                <span className="text-slate-500 font-medium">Registration Status:</span>
                <span className="font-semibold text-amber-700">-</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4 pb-2">
            <Button className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-medium px-8 shadow-sm">
              View Details
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
