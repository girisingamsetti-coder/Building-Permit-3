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
      <div className="relative w-full max-w-4xl bg-white shadow-2xl border border-gray-300 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 border-b border-gray-300">
          <h2 className="text-base font-bold text-black">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors text-black">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-8">
          
          <div className="grid grid-cols-[200px_1fr] items-center gap-4">
            <div className="bg-gray-50 h-9 px-3 flex items-center text-[13px] text-gray-800 border-r-4 border-transparent">
              <span className="text-red-500 mr-1">*</span> Certificate/Temp No.
            </div>
            <div className="flex w-full max-w-md">
              <Input 
                placeholder="Enter Certificate No / Temp No." 
                className="h-9 rounded-r-none border-gray-300 focus-visible:ring-0 focus-visible:border-gray-400" 
              />
              <Button 
                variant="outline" 
                className="h-9 rounded-l-none border-l-0 border-gray-300 px-3 hover:bg-gray-50"
              >
                <Search className="size-4 text-[#20639b]" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-12 px-4 text-[13px] text-black">
            <div className="space-y-4">
              <div>Temporary Certificate No</div>
              <div>Firm Type</div>
            </div>
            <div className="space-y-4">
              <div>Permanent Certificate No</div>
              <div>Registration Status</div>
            </div>
          </div>

          <div className="flex justify-center pt-8 pb-4">
            <Button variant="outline" className="border-gray-300 text-gray-600 font-normal px-6">
              View Details
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
