"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle2 } from "lucide-react";

const DOC_CHECKLIST = [
  { code: "DOC_712", name: "7/12 Land Extract", required: true },
  { code: "DOC_PROP_CARD", name: "Property Card / Mutation", required: true },
  { code: "DOC_ARCH", name: "Architectural Drawings (stamped)", required: true },
  { code: "DOC_STRUCT", name: "Structural Drawings & Stability Certificate", required: true },
  { code: "DOC_FIRE_NOC", name: "NOC from Fire Department", required: true },
  { code: "DOC_ENV", name: "Environmental Clearance", required: false },
  { code: "DOC_AUTH", name: "Society / Landowner Authorization", required: true },
  { code: "DOC_AFFIDAVIT", name: "Affidavit — Ownership", required: true },
];

export function DocumentsStep({
  uploadedDocs,
  onToggle,
}: {
  uploadedDocs: Record<string, { fileName: string; fileSize: string }>;
  onToggle: (code: string, name: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Upload the required documents based on your application type. Documents will be
        verified by the TPA after submission — uploaded does not mean verified.
      </p>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Document</th>
              <th className="px-3 py-2 font-medium w-16">Req.</th>
              <th className="px-3 py-2 font-medium w-24">Status</th>
              <th className="px-3 py-2 font-medium text-right w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DOC_CHECKLIST.map((d) => {
              const isUploaded = !!uploadedDocs[d.code];
              return (
                <tr key={d.code} className="hover:bg-muted/30">
                  <td className="px-3 py-2.5">
                    <p className="text-xs font-medium">{d.name}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">{d.code}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    {d.required ? (
                      <Badge className="bg-destructive/10 text-destructive text-[8px]">Req.</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[8px]">Opt.</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {isUploaded ? (
                      <Badge className="bg-info/10 text-info text-[8px] gap-0.5">
                        <CheckCircle2 className="size-2.5" /> Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[8px] text-muted-foreground">Pending</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {isUploaded ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[11px] text-destructive"
                        onClick={() => onToggle(d.code, d.name)}
                      >
                        <X className="size-3" /> Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[11px]"
                        onClick={() => onToggle(d.code, d.name)}
                      >
                        <Upload className="size-3" /> Upload
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
