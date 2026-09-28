import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FeeWizardProps {
  onClose: () => void;
}

export function FeeWizard({ onClose }: FeeWizardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-5xl bg-[#FAF7F2] rounded-xl border-2 border-[#7A1316] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#7A1316] text-white border-b border-[#630E10]">
          <h2 className="text-base font-black tracking-wide">File Details / Payment Option</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto bg-[#FAF7F2] text-xs">
          {/* Left Panel - File Details */}
          <div className="flex-1 border-r border-[#DCD5C8] p-6 space-y-5 bg-[#FBF3E4]">
            <div className="flex items-center gap-4 bg-[#7A1316] text-white px-3.5 py-1.5 font-bold rounded shadow-2xs">
              <h3 className="uppercase tracking-wider text-xs">File Details</h3>
            </div>

            <RadioGroup defaultValue="file" className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="r-file" className="accent-[#7A1316] text-[#7A1316]" />
                <Label htmlFor="r-file" className="font-bold text-xs text-slate-800 cursor-pointer">File No.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="challan" id="r-challan" className="accent-[#7A1316] text-[#7A1316]" />
                <Label htmlFor="r-challan" className="font-bold text-xs text-slate-800 cursor-pointer">Challan No.</Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-[120px_1fr] items-center gap-y-3.5 pt-1">
              <span className="text-slate-700 font-semibold">File/Challan No.</span>
              <div className="flex gap-2">
                <Input placeholder="Enter File/Challan No." className="h-8 max-w-[300px] bg-white border-[#DCD5C8] text-xs" />
                <Button variant="outline" className="h-8 px-4 font-bold text-xs text-[#7A1316] border-[#7A1316] hover:bg-[#FAF4EB]">GO</Button>
              </div>

              <span className="text-slate-700 font-semibold">Challan No.</span>
              <Select>
                <SelectTrigger className="h-8 max-w-[370px] bg-white border-[#DCD5C8] text-xs">
                  <SelectValue placeholder="Select Challan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No options available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-y-2.5 pt-2 text-xs border-t border-[#DCD5C8]">
              <span className="text-slate-700 font-semibold">Challan Type</span>
              <a href="#" className="text-blue-700 font-bold hover:underline">- View Details</a>

              <span className="text-slate-700 font-semibold">Owner Name</span>
              <span className="text-slate-900 font-medium">Vadduri Veeraiah</span>

              <span className="text-slate-700 font-semibold">Case Type</span>
              <span className="text-slate-900 font-medium">New</span>

              <span className="text-slate-700 font-semibold">Validity Date</span>
              <span className="text-slate-900 font-medium">23/07/2027</span>
            </div>

            {/* Fees Table */}
            <div className="pt-4">
              <div className="bg-white rounded border border-[#DCD5C8] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#F5EBE1] border-b border-[#DCD5C8] text-slate-800">
                    <tr>
                      <th className="font-bold py-2 px-3 text-xs w-[120px]">Type</th>
                      <th className="font-bold py-2 px-2 text-center text-xs">Challan (INR)</th>
                      <th className="font-bold py-2 px-2 text-center text-xs">Penalty (INR)</th>
                      <th className="font-bold py-2 px-2 text-center text-xs">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCD5C8]">
                    <tr>
                      <td className="text-slate-700 font-medium py-2 px-3">Payable (INR)</td>
                      <td className="px-2 py-1.5"><Input readOnly defaultValue="₹ 5,800" className="h-7 text-xs bg-slate-50 text-center font-bold" /></td>
                      <td className="px-2 py-1.5"><Input readOnly defaultValue="₹ 0" className="h-7 text-xs bg-slate-50 text-center" /></td>
                      <td className="px-2 py-1.5"><Input readOnly defaultValue="₹ 5,800" className="h-7 text-xs bg-slate-50 text-center font-bold text-[#7A1316]" /></td>
                    </tr>
                    <tr>
                      <td className="text-slate-700 font-medium py-2 px-3">Paid (INR)</td>
                      <td className="px-2 py-1.5"><Input readOnly defaultValue="₹ 5,800" className="h-7 text-xs bg-slate-50 text-center" /></td>
                      <td className="px-2 py-1.5"><Input readOnly defaultValue="₹ 0" className="h-7 text-xs bg-slate-50 text-center" /></td>
                      <td className="px-2 py-1.5"><Input readOnly defaultValue="₹ 5,800" className="h-7 text-xs bg-slate-50 text-center text-emerald-700 font-bold" /></td>
                    </tr>
                    <tr>
                      <td className="text-slate-700 font-medium py-2 px-3">Balance (INR)</td>
                      <td className="px-2 py-1.5"><Input readOnly defaultValue="₹ 0" className="h-7 text-xs bg-slate-50 text-center" /></td>
                      <td className="px-2 py-1.5"><Input readOnly defaultValue="₹ 0" className="h-7 text-xs bg-slate-50 text-center" /></td>
                      <td className="px-2 py-1.5"><Input readOnly defaultValue="₹ 0" className="h-7 text-xs bg-slate-50 text-center font-bold text-emerald-700" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel - Payment Option */}
          <div className="w-full md:w-1/3 flex flex-col p-6 bg-[#FAF7F2]">
            <div className="flex items-center gap-4 bg-[#7A1316] text-white px-3.5 py-1.5 font-bold rounded mb-6 shadow-2xs">
              <h3 className="uppercase tracking-wider text-xs">Payment Option</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-3.5 pt-4">
              <Button className="w-[200px] h-9 font-bold text-xs bg-[#7A1316] hover:bg-[#8F161A] text-white shadow-2xs border border-[#630E10] cursor-pointer">
                Pay Online
              </Button>
              <Button variant="outline" className="w-[200px] h-9 font-bold text-xs border-[#7A1316] text-[#7A1316] hover:bg-[#FAF4EB] shadow-2xs cursor-pointer">
                Check Payment Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
