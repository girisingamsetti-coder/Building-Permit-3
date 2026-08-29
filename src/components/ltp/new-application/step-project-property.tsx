"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin } from "lucide-react";

export interface ProjectPropertyData {
  projectName: string;
  builtUpArea: string;
  plotArea: string;
  numFloors: string;
  numUnits: string;
  surveyNo: string;
  plotNo: string;
  ward: string;
  zone: string;
  locality: string;
  district: string;
  state: string;
  pincode: string;
}

export function ProjectPropertyStep({
  data,
  update,
  errors,
}: {
  data: ProjectPropertyData;
  update: <K extends keyof ProjectPropertyData>(k: K, v: ProjectPropertyData[K]) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      {/* ===== Project Information ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-primary" />
          <h4 className="text-sm font-semibold">Project Information</h4>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label="Project Name" required error={errors.projectName}>
            <Input className="h-11" value={data.projectName} onChange={(e) => update("projectName", e.target.value)} placeholder="e.g. Greenfield Residency" />
          </Field>
          <Field label="Project Type">
            <Select defaultValue="NEW">
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">New Construction</SelectItem>
                <SelectItem value="ADDITION">Addition / Alteration</SelectItem>
                <SelectItem value="REDEVELOPMENT">Redevelopment</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Building Use">
            <Select defaultValue="RESIDENTIAL">
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                <SelectItem value="INSTITUTIONAL">Institutional</SelectItem>
                <SelectItem value="MIXED">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Built-up Area (sq.m)" required error={errors.builtUpArea}>
            <Input className="h-11" type="number" value={data.builtUpArea} onChange={(e) => update("builtUpArea", e.target.value)} placeholder="e.g. 1780" />
          </Field>
          <Field label="Plot Area (sq.m)" required error={errors.plotArea}>
            <Input className="h-11" type="number" value={data.plotArea} onChange={(e) => update("plotArea", e.target.value)} placeholder="e.g. 1250" />
          </Field>
          <Field label="Number of Floors">
            <Input className="h-11" type="number" value={data.numFloors} onChange={(e) => update("numFloors", e.target.value)} placeholder="e.g. 7" />
          </Field>
          <Field label="Number of Units">
            <Input className="h-11" type="number" value={data.numUnits} onChange={(e) => update("numUnits", e.target.value)} placeholder="e.g. 14" />
          </Field>
        </div>
      </div>

      <Separator />

      {/* ===== Property Information ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <h4 className="text-sm font-semibold">Property Information</h4>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label="Survey Number" required error={errors.surveyNo}>
            <Input className="h-11" value={data.surveyNo} onChange={(e) => update("surveyNo", e.target.value)} placeholder="e.g. Hissa 14/2" />
          </Field>
          <Field label="Plot Number">
            <Input className="h-11" value={data.plotNo} onChange={(e) => update("plotNo", e.target.value)} placeholder="e.g. Plot 14" />
          </Field>
          <Field label="Ward" required error={errors.ward}>
            <Select value={data.ward} onValueChange={(v) => update("ward", v)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select ward" /></SelectTrigger>
              <SelectContent>
                {["Ward 09 — Aundh", "Ward 14 — Baner", "Ward 11 — Kalyani Nagar", "Ward 19 — Bavdhan", "Ward 22 — Kothrud", "Ward 27 — Wakad", "Ward 31 — Hadapsar"].map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Zone" required error={errors.zone}>
            <Select value={data.zone} onValueChange={(v) => update("zone", v)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select zone" /></SelectTrigger>
              <SelectContent>
                {["Zone I — East", "Zone II — South", "Zone III — North", "Zone IV — West"].map((z) => (
                  <SelectItem key={z} value={z}>{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Village / Locality">
            <Input className="h-11" value={data.locality} onChange={(e) => update("locality", e.target.value)} placeholder="e.g. Baner" />
          </Field>
          <Field label="District">
            <Input className="h-11" value={data.district} onChange={(e) => update("district", e.target.value)} placeholder="e.g. Pune" />
          </Field>
          <Field label="State">
            <Input className="h-11" value={data.state} onChange={(e) => update("state", e.target.value)} placeholder="e.g. Maharashtra" />
          </Field>
          <Field label="PIN Code">
            <Input className="h-11" value={data.pincode} onChange={(e) => update("pincode", e.target.value)} placeholder="e.g. 411045" />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      <div className="min-h-[16px]">
        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </div>
    </div>
  );
}
