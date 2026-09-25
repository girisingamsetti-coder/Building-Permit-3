import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LtpViewWizardProps {
  onClose: () => void;
}

export function LtpViewWizard({ onClose }: LtpViewWizardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col border border-gray-300 rounded-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300">
          <h2 className="text-[15px] font-bold text-black">Welcome To Profile Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-300 rounded transition-colors text-black">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-12 pb-16 bg-white">
          <div className="max-w-2xl grid grid-cols-[300px_1fr] gap-x-4 gap-y-2">
            
            {/* Row 1 */}
            <div className="bg-gray-50 px-3 py-1.5 flex items-center leading-tight">
              <span className="text-red-500 mr-1">*</span> Registration Number /Temporary<br/>Registration Number
            </div>
            <div className="py-1">
              <Input placeholder="Enter Registration Number" className="h-9 text-[13px] border-gray-300" />
            </div>

            {/* Row 2 */}
            <div className="bg-gray-50 px-3 py-1.5 flex items-center leading-tight">
              <span className="text-red-500 mr-1">*</span> Mobile Number
            </div>
            <div className="py-1">
              <Input placeholder="Enter Mobile Number" className="h-9 text-[13px] border-gray-300" />
            </div>

            {/* Empty column + Button */}
            <div className="bg-gray-50/50 h-[50px] mt-2 border-t border-gray-100 col-span-2 grid grid-cols-[300px_1fr] gap-x-4">
              <div></div>
              <div className="pt-2">
                <Button variant="outline" className="border-gray-300 text-[#2980b9] font-normal px-6 shadow-sm h-9">
                  Check Status
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
