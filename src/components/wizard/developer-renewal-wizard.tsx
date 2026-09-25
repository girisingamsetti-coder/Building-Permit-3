import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DeveloperRenewalWizardProps {
  onClose: () => void;
  title?: string;
}

export function DeveloperRenewalWizard({ onClose, title = "Developer Renewal" }: DeveloperRenewalWizardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-white rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto bg-white text-[13px]">
          {/* Left Panel - Registration Details */}
          <div className="flex-[3] border-r border-gray-300 p-4 space-y-4">
            <div className="flex items-center gap-4 bg-[#3b5998] text-white px-3 py-2 font-bold">
              <h3>Registration Details</h3>
            </div>

            <RadioGroup defaultValue="registration" className="flex items-center gap-6 px-2">
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="registration" id="r-reg" />
                <Label htmlFor="r-reg" className="font-bold text-[13px]">Registration No.</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="challan" id="r-chal" />
                <Label htmlFor="r-chal" className="font-bold text-[13px]">Challan No.</Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-[180px_1fr] items-center gap-y-2">
              <div className="text-gray-700 px-2 leading-tight">
                CAO/NCSEA<br/>Registration/Challan<br/>No.
              </div>
              <div className="flex gap-2 items-center">
                <Input placeholder="Enter Registration No." className="h-9 w-[220px]" />
                <Button variant="outline" className="h-9 px-4 font-normal text-black border-gray-300">GO</Button>
              </div>

              <div className="text-gray-700 px-2 py-2.5 bg-gray-100 font-medium">Owner Name</div>
              <div className="px-2 py-2.5 bg-gray-100 font-medium">-</div>

              <div className="text-gray-700 px-2 py-2.5">Challan No.</div>
              <div>
                <Select>
                  <SelectTrigger className="h-9 w-[220px]">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-gray-700 px-2 py-2.5 bg-gray-100 font-medium leading-tight">
                Amount to<br/>Pay(Rs.)
              </div>
              <div className="bg-gray-100 py-2.5 h-full">
                <Input className="h-9 w-[220px] bg-white" />
              </div>
            </div>
          </div>

          {/* Right Panel - Payment Option */}
          <div className="flex-[2] p-4 flex flex-col">
            <div className="flex items-center gap-4 bg-[#3b5998] text-white px-3 py-2 font-bold mb-8">
              <h3>Payment Option</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4 pt-4 bg-gray-50/50 flex-1 border border-gray-100 relative">
              {/* Decorative arrows mimicking the screenshot's carousel/slider look */}
              <div className="absolute top-2 left-2 w-0 h-0 border-t-[5px] border-t-transparent border-r-[8px] border-r-gray-400 border-b-[5px] border-b-transparent"></div>
              <div className="absolute top-2 right-2 w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-gray-400 border-b-[5px] border-b-transparent"></div>

              <Button variant="outline" className="w-[160px] h-9 font-normal text-black border-gray-300">
                Pay
              </Button>
              <Button variant="outline" className="w-[160px] h-9 font-normal text-black border-gray-300">
                Check Payment Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
