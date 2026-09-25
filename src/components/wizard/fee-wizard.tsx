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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#3f51b5] text-white">
          <h2 className="text-lg font-bold">File Details / Payment Option</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto bg-white text-[13px]">
          {/* Left Panel - File Details */}
          <div className="flex-1 border-r border-gray-300 p-6 space-y-6">
            <div className="flex items-center gap-4 bg-[#3f51b5] text-white px-3 py-1.5 font-bold mb-4">
              <h3>File Details</h3>
            </div>

            <RadioGroup defaultValue="file" className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="r-file" />
                <Label htmlFor="r-file" className="font-bold text-[13px]">File No.</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="challan" id="r-challan" />
                <Label htmlFor="r-challan" className="font-bold text-[13px]">Challan No.</Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-[120px_1fr] items-center gap-y-4 pt-2">
              <span className="text-gray-700">File/Challan No.</span>
              <div className="flex gap-2">
                <Input placeholder="Enter File/Challan No." className="h-8 max-w-[300px]" />
                <Button variant="outline" className="h-8 px-4 font-normal text-black border-gray-400">GO</Button>
              </div>

              <span className="text-gray-700">Challan No.</span>
              <Select>
                <SelectTrigger className="h-8 max-w-[370px]">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No options available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-y-3 pt-2">
              <span className="text-gray-700">Challan Type</span>
              <a href="#" className="text-blue-600 hover:underline">- View Details</a>

              <span className="text-gray-700">Owner Name</span>
              <span className="text-gray-800">-</span>

              <span className="text-gray-700">Case Type</span>
              <span className="text-gray-800">-</span>

              <span className="text-gray-700">Validity Date</span>
              <span className="text-gray-800">-</span>
            </div>

            {/* Fees Table */}
            <div className="pt-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-700">
                    <th className="font-normal w-[120px] pb-2"></th>
                    <th className="font-normal pb-2 px-2 text-center text-[12px]">Challan (INR)</th>
                    <th className="font-normal pb-2 px-2 text-center text-[12px]">Penalty (INR)</th>
                    <th className="font-normal pb-2 px-2 text-center text-[12px]">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  <tr>
                    <td className="text-gray-700 py-2">Payable (INR)</td>
                    <td className="px-2 py-2"><Input readOnly className="h-8 bg-gray-100" /></td>
                    <td className="px-2 py-2"><Input readOnly className="h-8 bg-gray-100" /></td>
                    <td className="px-2 py-2"><Input readOnly className="h-8 bg-gray-100" /></td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 py-2">Paid (INR)</td>
                    <td className="px-2 py-2"><Input readOnly className="h-8 bg-gray-100" /></td>
                    <td className="px-2 py-2"><Input readOnly className="h-8 bg-gray-100" /></td>
                    <td className="px-2 py-2"><Input readOnly className="h-8 bg-gray-100" /></td>
                  </tr>
                  <tr>
                    <td className="text-gray-700 py-2">Balance (INR)</td>
                    <td className="px-2 py-2"><Input readOnly className="h-8 bg-gray-100" /></td>
                    <td className="px-2 py-2"><Input readOnly className="h-8 bg-gray-100" /></td>
                    <td className="px-2 py-2"><Input readOnly className="h-8 bg-gray-100" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel - Payment Option */}
          <div className="w-full md:w-1/3 flex flex-col p-6">
            <div className="flex items-center gap-4 bg-[#3f51b5] text-white px-3 py-1.5 font-bold mb-8">
              <h3>Payment Option</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4 pt-4">
              <Button variant="outline" className="w-[180px] h-8 font-normal text-black border-gray-400">
                Pay
              </Button>
              <Button variant="outline" className="w-[180px] h-8 font-normal text-black border-gray-400">
                Check Payment Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
