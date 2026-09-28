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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-xl border-2 border-[#7A1316] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#7A1316] text-white border-b border-[#630E10]">
          <h2 className="text-base font-black tracking-wide">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto bg-[#FAF7F2] text-xs">
          {/* Left Panel - Registration Details */}
          <div className="flex-[3] border-r border-[#DCD5C8] p-5 space-y-4 bg-[#FBF3E4]">
            <div className="flex items-center gap-4 bg-[#7A1316] text-white px-3 py-1.5 rounded font-bold">
              <h3 className="uppercase tracking-wide text-xs">Registration Details</h3>
            </div>

            <RadioGroup defaultValue="registration" className="flex items-center gap-6 px-2">
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="registration" id="r-reg" className="accent-[#7A1316]" />
                <Label htmlFor="r-reg" className="font-bold text-xs text-slate-800 cursor-pointer">Registration No.</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="challan" id="r-chal" className="accent-[#7A1316]" />
                <Label htmlFor="r-chal" className="font-bold text-xs text-slate-800 cursor-pointer">Challan No.</Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-[180px_1fr] items-center gap-y-2 text-xs">
              <div className="text-slate-700 px-2 leading-tight font-semibold">
                CAO/NCSEA<br/>Registration/Challan No.
              </div>
              <div className="flex gap-2 items-center">
                <Input placeholder="Enter Registration No." className="h-8 w-[220px] bg-white border-[#DCD5C8] text-xs" />
                <Button variant="outline" className="h-8 px-4 font-bold text-xs text-[#7A1316] border-[#7A1316] hover:bg-[#FAF4EB]">GO</Button>
              </div>

              <div className="text-slate-700 px-2 py-2 bg-[#F5EBE1] font-semibold">Owner Name</div>
              <div className="px-2 py-2 bg-[#F5EBE1] font-medium text-slate-800">-</div>

              <div className="text-slate-700 px-2 py-2 font-semibold">Challan No.</div>
              <div>
                <Select>
                  <SelectTrigger className="h-8 w-[220px] bg-white border-[#DCD5C8] text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-slate-700 px-2 py-2 bg-[#F5EBE1] font-semibold leading-tight">
                Amount to Pay(Rs.)
              </div>
              <div className="bg-[#F5EBE1] py-1.5 h-full">
                <Input defaultValue="₹ 0" readOnly className="h-7 w-[220px] bg-white border-[#DCD5C8] text-xs font-bold text-[#7A1316]" />
              </div>
            </div>
          </div>

          {/* Right Panel - Payment Option */}
          <div className="flex-[2] p-6 flex flex-col bg-[#FAF7F2]">
            <div className="flex items-center gap-4 bg-[#7A1316] text-white px-3 py-1.5 rounded font-bold mb-8">
              <h3 className="uppercase tracking-wide text-xs">Payment Option</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4 pt-4 flex-1">
              <Button className="w-[180px] h-9 font-bold text-xs bg-[#7A1316] hover:bg-[#8F161A] text-white border border-[#630E10] shadow-2xs cursor-pointer">
                Pay Renewal Fee
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
