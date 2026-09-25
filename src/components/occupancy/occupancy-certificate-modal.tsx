"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Printer, Download, CheckCircle2, Shield, QrCode, X } from "lucide-react";
import type { OccupancyApplicationRecord } from "@/data/occupancy-data";

export function OccupancyCertificateModal({
  record,
  open,
  onClose,
}: {
  record: OccupancyApplicationRecord;
  open: boolean;
  onClose: () => void;
}) {
  const cert = record.certificate;
  if (!cert) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-100 max-h-[95vh] flex flex-col">
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="size-5 text-emerald-600" />
            <span className="font-semibold text-slate-900">Official Occupancy Certificate</span>
            <Badge className="bg-emerald-600 text-white ml-2">ISSUED</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="size-3.5" /> Print Certificate
            </Button>
            <Button variant="default" size="sm" onClick={handlePrint} className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700">
              <Download className="size-3.5" /> Download PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="size-8 text-slate-500">
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Certificate Paper Sheet */}
        <div className="overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-100 print:p-0 print:bg-white">
          <div className="w-full max-w-[800px] bg-white border border-slate-300 shadow-xl p-8 md:p-12 relative print:shadow-none print:border-none print:p-0">
            {/* Security Top Ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 mb-6" />

            {/* Authority Header */}
            <div className="text-center space-y-1 pb-6 border-b-2 border-slate-900">
              <div className="flex justify-center items-center gap-3 mb-2">
                <div className="size-12 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-50 font-bold text-slate-800 text-xl tracking-tighter">
                  CRDA
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-wider text-slate-950">
                Andhra Pradesh Capital Region Development Authority
              </h1>
              <p className="text-xs uppercase font-medium tracking-widest text-slate-600">
                Department of Town and Country Planning · Municipal Administration
              </p>
              <div className="pt-2">
                <span className="inline-block px-4 py-1 border-y-2 border-blue-900 text-sm font-bold tracking-widest uppercase text-blue-900 bg-blue-50/50">
                  Certificate of Occupancy
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono pt-1">
                Issued under Section 263 of the Municipal Corporation Act &amp; Building Bylaws
              </p>
            </div>

            {/* Reference Table Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 text-xs border-b border-slate-200 bg-slate-50/70 -mx-8 px-8 md:-mx-12 md:px-12">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Certificate No.</span>
                <span className="font-mono font-bold text-slate-900">{cert.certificateNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Issue Date</span>
                <span className="font-semibold text-slate-900">{new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Sanction BPO No.</span>
                <span className="font-mono text-slate-900 font-semibold">{record.orderNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Outward No.</span>
                <span className="font-mono text-slate-900">{cert.outwardNumber}</span>
              </div>
            </div>

            {/* Main Preamble */}
            <div className="py-6 space-y-4 text-xs leading-relaxed text-slate-800">
              <p>
                This is to certify that the construction of the building described below, carried out under Sanctioned Building Permission Order{" "}
                <strong className="font-semibold text-slate-950">{record.orderNumber}</strong> dated{" "}
                <span className="font-semibold">{new Date(record.orderIssuedAt).toLocaleDateString("en-IN")}</span>, has been completed and inspected by the authorized officer on{" "}
                <span className="font-semibold">
                  {record.inspections.at(-1)?.inspectedAt ? new Date(record.inspections.at(-1)!.inspectedAt!).toLocaleDateString("en-IN") : "site verification"}
                </span>{" "}
                and found to be in compliance with the sanctioned plans and statutory building regulations.
              </p>

              {/* Property & Applicant Specification */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded bg-slate-50 border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Owner / Applicant Details</span>
                  <p className="font-bold text-slate-900">{record.owner.name}</p>
                  <p className="text-slate-600">{record.owner.address}</p>
                  <p className="text-slate-600">Contact: {record.owner.contact}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Licensed Technical Person (LTP)</span>
                  <p className="font-bold text-slate-900">{record.ltp.name}</p>
                  <p className="text-slate-600 font-mono">Licence No: {record.ltp.licenceNo}</p>
                  <p className="text-slate-600">Site: {record.project.surveyNo}, {record.project.zone}</p>
                </div>
              </div>

              {/* Verified As-Built Summary Table */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] uppercase font-bold text-slate-700 block tracking-wide">
                  Schedule of Certified Parameters
                </span>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Parameter</th>
                      <th className="p-2 border-r border-slate-300">Sanctioned (BPO)</th>
                      <th className="p-2 border-r border-slate-300">As-Built Verified</th>
                      <th className="p-2">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {record.comparison.slice(0, 6).map((c) => (
                      <tr key={c.key} className="hover:bg-slate-50">
                        <td className="p-2 font-medium text-slate-700 border-r border-slate-200">{c.label}</td>
                        <td className="p-2 tabular-nums text-slate-600 border-r border-slate-200">
                          {c.approved} {c.unit}
                        </td>
                        <td className="p-2 tabular-nums font-semibold text-slate-900 border-r border-slate-200">
                          {c.asBuilt} {c.unit}
                        </td>
                        <td className="p-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="size-3" /> Compliant
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Certified Areas Box */}
              <div className="flex items-center justify-between p-3 border border-emerald-300 bg-emerald-50/60 rounded text-xs text-emerald-950">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Sanctioned Built-up Area</span>
                  <span className="text-sm font-bold tabular-nums">{cert.approvedAreaSqm.toLocaleString()} sq.m</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Completed Area Certified</span>
                  <span className="text-sm font-bold tabular-nums text-emerald-700">{cert.completedAreaSqm.toLocaleString()} sq.m</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Certified Usage</span>
                  <span className="text-sm font-bold">{record.project.type}</span>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wide">
                  Statutory Conditions of Occupancy
                </span>
                <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-700">
                  {cert.conditions.map((condition, idx) => (
                    <li key={idx} className="leading-snug">{condition}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Official Signatures & Seal */}
            <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-3 items-end text-center text-xs">
              <div className="flex flex-col items-center">
                <div className="size-20 border border-slate-300 rounded bg-slate-50 flex flex-col items-center justify-center p-1 text-[9px] text-slate-500">
                  <QrCode className="size-12 text-slate-800 mb-0.5" />
                  <span>Scan to verify</span>
                </div>
                <span className="font-mono text-[9px] text-slate-500 mt-1">{cert.verificationCode}</span>
              </div>

              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="size-16 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400 uppercase font-bold text-center leading-tight">
                  Official<br />Seal
                </div>
                <span className="text-[9px] text-slate-400">Authority Seal</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="font-serif italic text-blue-900 font-bold text-base mb-1 tracking-wider">
                  P. Reddy
                </div>
                <div className="border-t border-slate-900 w-36 pt-1">
                  <p className="font-bold text-slate-900 text-xs">{cert.issuedByName}</p>
                  <p className="text-[10px] text-slate-500">Competent Authority</p>
                  <p className="text-[9px] text-slate-400">APCRDA / Pune Municipal Corp</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer Notice */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-400">
              This is a digitally generated document authenticated under the Digital Signature Act. Verification link: https://bbas.ap.gov.in/verify/{cert.verificationCode}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
