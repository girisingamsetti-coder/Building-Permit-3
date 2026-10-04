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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-7xl h-[90vh] bg-[#FAF7F2] rounded-xl border-2 border-[#7A1316] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#7A1316] text-white shrink-0 border-b border-[#630E10]">
          <h2 className="text-base font-black tracking-wide">Search Application Status</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden bg-[#FAF7F2] text-xs">
          {/* Left Panel - Filters */}
          <div className="w-[280px] flex-shrink-0 border-r border-[#DCD5C8] bg-[#FBF3E4] flex flex-col overflow-y-auto">
            <div className="p-4 space-y-3.5">
              
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-800">File No.</Label>
                <Input className="h-7 bg-white text-xs border-[#DCD5C8] rounded focus:border-[#7A1316]" />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-800">Name of Applicant</Label>
                <Input className="h-7 bg-white text-xs border-[#DCD5C8] rounded focus:border-[#7A1316]" />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-800">Architect / LE / SE</Label>
                <Input className="h-7 bg-white text-xs border-[#DCD5C8] rounded focus:border-[#7A1316]" />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-800">Survey Number</Label>
                <Input className="h-7 bg-white text-xs border-[#DCD5C8] rounded focus:border-[#7A1316]" />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-800">Permission Type</Label>
                <Select>
                  <SelectTrigger className="h-7 bg-white text-xs border-[#DCD5C8] rounded">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-800">Case Type</Label>
                <Select>
                  <SelectTrigger className="h-7 bg-white text-xs border-[#DCD5C8] rounded">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-800">Land Use Zone</Label>
                <Select>
                  <SelectTrigger className="h-7 bg-white text-xs border-[#DCD5C8] rounded">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No options</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-px bg-[#DCD5C8] mx-4" />

            <div className="p-4 space-y-3.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-800">From Date</Label>
                <Input type="date" className="h-7 bg-white text-xs border-[#DCD5C8] rounded focus:border-[#7A1316]" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-800">To Date</Label>
                <Input type="date" className="h-7 bg-white text-xs border-[#DCD5C8] rounded focus:border-[#7A1316]" />
              </div>
            </div>

            <div className="h-px bg-[#DCD5C8] mx-4" />

            <div className="p-4 space-y-3.5 pb-8">
              <div className="flex gap-2 items-center">
                <div className="flex-1 h-12 bg-white border border-[#DCD5C8] rounded flex items-center justify-center relative overflow-hidden select-none">
                  <span className="text-2xl font-serif text-[#7A1316] tracking-widest font-black italic transform skew-x-12 relative z-10">
                    KVB4R
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="icon" className="h-5 w-5 border-[#DCD5C8] hover:bg-[#FAF4EB]">
                    <RefreshCw className="size-2.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-5 w-5 border-[#DCD5C8] hover:bg-[#FAF4EB]">
                    <Volume2 className="size-2.5" />
                  </Button>
                </div>
              </div>

              <Input placeholder="E N T E R  C A P T C H A" className="h-7 bg-white text-xs border-[#DCD5C8] rounded text-center tracking-widest" />

              <div className="flex justify-center pt-2">
                <Button className="h-8 px-6 bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold text-xs shadow-2xs border border-[#630E10] cursor-pointer">
                  <Search className="size-3.5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Results Table */}
          <div className="flex-1 flex flex-col overflow-x-auto bg-[#FAF7F2]">
            <div className="min-w-[800px] flex-1 p-4">
              <div className="bg-white rounded-lg border border-[#DCD5C8] overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8]">
                      <th className="w-40 font-bold py-2.5 px-3 text-center border-r border-[#DCD5C8] whitespace-nowrap">File No. / Temporary No.</th>
                      <th className="w-52 max-w-[220px] font-bold py-2.5 px-3 text-center border-r border-[#DCD5C8]">Name of Applicant</th>
                      <th className="w-44 max-w-[180px] font-bold py-2.5 px-3 text-center border-r border-[#DCD5C8]">Architect/LE/SE Name</th>
                      <th className="w-28 font-bold py-2.5 px-3 text-center border-r border-[#DCD5C8] whitespace-nowrap">File Status</th>
                      <th className="w-24 font-bold py-2.5 px-2 text-center border-r border-[#DCD5C8] text-[11px] leading-tight whitespace-nowrap">Application Form</th>
                      <th className="w-24 font-bold py-2.5 px-2 text-center border-r border-[#DCD5C8] text-[11px] leading-tight whitespace-nowrap">Building Permit Letter</th>
                      <th className="w-24 font-bold py-2.5 px-2 text-center text-[11px] leading-tight whitespace-nowrap">Plan Permit Letter</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#DCD5C8]">
                      <td colSpan={7} className="py-8 px-4 text-center text-slate-500 font-medium">
                        No records found. Please enter search criteria.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination / Footer */}
            <div className="flex items-center justify-between p-2.5 border-t border-[#DCD5C8] bg-[#FBF3E4] text-slate-700 shrink-0 text-xs">
              <div className="flex items-center gap-1 border border-[#DCD5C8] bg-white rounded px-2 h-6 font-bold text-[#7A1316]">
                <span>1</span>
              </div>
              <div className="text-right flex-1 font-semibold">
                Total Proposal(s) : 0
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
