import * as React from "react";
import { X, Search, RefreshCw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StatusWizardProps {
  onClose: () => void;
}

export function StatusWizard({ onClose }: StatusWizardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-7xl h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#3f51b5] text-white shrink-0">
          <h2 className="text-lg font-bold">Search Application Status</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden bg-white text-[12px]">
          {/* Left Panel - Filters */}
          <div className="w-[280px] flex-shrink-0 border-r border-gray-300 bg-gray-50 flex flex-col overflow-y-auto">
            <div className="p-4 space-y-4">
              
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-700">File No.</Label>
                <Input className="h-7 bg-white text-[12px] border-gray-300 rounded-sm" />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-700">Name of Applicant</Label>
                <Input className="h-7 bg-white text-[12px] border-gray-300 rounded-sm" />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-700">Architect / LE / SE</Label>
                <Input className="h-7 bg-white text-[12px] border-gray-300 rounded-sm" />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-700">Survey Number</Label>
                <Input className="h-7 bg-white text-[12px] border-gray-300 rounded-sm" />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-700">Permission Type</Label>
                <Select>
                  <SelectTrigger className="h-7 bg-white text-[12px] border-gray-300 rounded-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-700">Case Type</Label>
                <Select>
                  <SelectTrigger className="h-7 bg-white text-[12px] border-gray-300 rounded-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-700">Land Use Zone</Label>
                <Select>
                  <SelectTrigger className="h-7 bg-white text-[12px] border-gray-300 rounded-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No options</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-[1px] bg-gray-300 mx-4" />

            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-700">From Date</Label>
                <Input type="date" className="h-7 bg-white text-[12px] border-gray-300 rounded-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-gray-700">To Date</Label>
                <Input type="date" className="h-7 bg-white text-[12px] border-gray-300 rounded-sm" />
              </div>
            </div>

            <div className="h-[1px] bg-gray-300 mx-4" />

            <div className="p-4 space-y-4 pb-8">
              <div className="flex gap-2 items-center">
                <div className="flex-1 h-14 bg-white border border-gray-300 flex items-center justify-center relative overflow-hidden select-none">
                  {/* Fake Captcha Image */}
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiAvPgo8cGF0aCBkPSJNMCAwbDRsNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIC8+Cjwvc3ZnPg==')]"></div>
                  <span className="text-3xl font-serif text-blue-900 tracking-widest font-bold italic transform skew-x-12 relative z-10 strike-through">
                    KVB4R
                  </span>
                  {/* Scratches/lines over text for captcha effect */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <line x1="10" y1="10" x2="150" y2="40" stroke="#1e3a8a" strokeWidth="2" />
                      <line x1="20" y1="50" x2="140" y2="10" stroke="#1e3a8a" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="icon" className="h-6 w-6 border-gray-400">
                    <RefreshCw className="size-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-6 w-6 border-gray-400">
                    <Volume2 className="size-3" />
                  </Button>
                </div>
              </div>

              <Input placeholder="E N T E R  C A P T C H A" className="h-8 bg-white text-[12px] border-gray-300 rounded-sm text-center tracking-widest placeholder:tracking-widest" />

              <div className="flex justify-center pt-2">
                <Button variant="outline" className="h-8 px-6 text-[#1e3a8a] border-gray-400 font-medium">
                  <Search className="size-3.5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Results Table */}
          <div className="flex-1 flex flex-col overflow-x-auto bg-white">
            <div className="min-w-[800px] flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 border-b border-gray-300">
                    <th className="font-bold py-3 px-4 text-center border-r border-gray-300 min-w-[150px]">File No. / Temporary No.</th>
                    <th className="font-bold py-3 px-4 text-center border-r border-gray-300 min-w-[200px]">Name of Applicant</th>
                    <th className="font-bold py-3 px-4 text-center border-r border-gray-300 min-w-[150px]">Architect/LE/SE Name</th>
                    <th className="font-bold py-3 px-4 text-center border-r border-gray-300 min-w-[100px]">File Status</th>
                    <th className="font-bold py-3 px-2 text-center border-r border-gray-300 text-[11px] leading-tight max-w-[80px]">Application Form</th>
                    <th className="font-bold py-3 px-2 text-center border-r border-gray-300 text-[11px] leading-tight max-w-[80px]">Building Permit Letter</th>
                    <th className="font-bold py-3 px-2 text-center text-[11px] leading-tight max-w-[80px]">Plan Permit Letter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td colSpan={7} className="py-2 px-4 text-gray-500">
                      No data found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination / Footer */}
            <div className="flex items-center justify-between p-2 border-t border-gray-300 bg-gray-50 text-gray-600 shrink-0">
              <div className="flex items-center gap-1 border border-gray-300 bg-white rounded px-2 h-6">
                <span className="font-medium text-black">1</span>
              </div>
              <div className="text-right flex-1">
                Total Proposal(s) :
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
