"use client";
import * as React from "react";
import { PageHeader, SectionCard } from "@/components/design-system/layout";
import { Box, UploadCloud, CheckCircle2, AlertTriangle } from "lucide-react";

export function BimModule() {
  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="BIM Validation & Approval"
        description="Apply and automatically validate BIM models (IFC/Revit) for building permits."
        icon={Box}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <SectionCard title="Upload BIM Model">
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 transition-colors hover:bg-slate-100 hover:border-blue-300 cursor-pointer">
              <UploadCloud className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">Drag & Drop BIM Files Here</h3>
              <p className="text-sm text-slate-500 mt-1 text-center">Supports .ifc, .rvt, and .nwd files up to 500MB.</p>
              <button className="mt-6 px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Browse Files
              </button>
            </div>
          </SectionCard>
          
          <SectionCard title="Recent Validations">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Commercial_Tower_A.ifc</p>
                    <p className="text-xs text-slate-500">Validation passed • 14 rules checked</p>
                  </div>
                </div>
                <button className="text-xs font-medium text-blue-600 hover:underline">View Report</button>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Residential_Block_C.rvt</p>
                    <p className="text-xs text-slate-500">2 Warnings • Setback rules violation</p>
                  </div>
                </div>
                <button className="text-xs font-medium text-blue-600 hover:underline">Review Issues</button>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="col-span-1 space-y-4">
          <SectionCard title="Validation Rules Setup">
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                The automated validation engine currently checks for structural integrity, setback compliance, and floor area ratio (FAR).
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Structural compliance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Setback limits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> FAR & Height restrictions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fire safety code
                </li>
              </ul>
              <button className="w-full mt-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                Configure Rules
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
