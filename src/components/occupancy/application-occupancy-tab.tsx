"use client";

import * as React from "react";
import type { Application } from "@/types";
import {
  getOccupancyRecordById,
  type OccupancyApplicationRecord,
} from "@/data/occupancy-data";
import { OccupancyPanel } from "./occupancy-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Info, Send, Calendar, CheckCircle2 } from "lucide-react";
import { compareAsBuilt } from "@/lib/occupancy";

export function ApplicationOccupancyTab({ app }: { app: Application }) {
  // Check if this application has an existing occupancy record in the cache
  const existingRecord = getOccupancyRecordById(app.id) || getOccupancyRecordById(app.applicationNo);

  // If already exists, render the rich master panel!
  if (existingRecord) {
    return <OccupancyPanel initialRecord={existingRecord} showBackButton={false} />;
  }

  // If application is not yet approved:
  if (app.status !== "APPROVED") {
    return (
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-muted-foreground" />
            <CardTitle className="text-base">Occupancy Certificate Status</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Occupancy may only be initiated once the building permission order (BPO) is approved and issued.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Building Permission In Progress</p>
              <p className="text-amber-800 dark:text-amber-300">
                Application <span className="font-mono font-medium">{app.applicationNo}</span> is currently at stage{" "}
                <strong>{app.currentStageLabel}</strong> ({app.status}). Work commencement and occupancy intimations will become available upon final sanction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If approved but no occupancy application yet (COMPLETION_PENDING):
  const fallbackRecord: OccupancyApplicationRecord = {
    id: `occ-gen-${app.id}`,
    occupancyNumber: `OC/2026/04/${app.applicationNo.slice(-4)}`,
    applicationId: app.id,
    applicationNumber: app.applicationNo,
    status: "SUBMITTED",
    state: "COMPLETION_PENDING",
    round: 1,
    currentDesk: "Applicant (LTP)",
    orderNumber: `BPO/2026/04/${app.applicationNo.slice(-4)}`,
    orderIssuedAt: app.lastUpdated,
    commencementNumber: `COMM/2026/${app.applicationNo.slice(-4)}`,
    commencementDate: "2026-02-01T00:00:00Z",
    completionDate: "2026-03-20T00:00:00Z",
    completionRemarks: "Construction works completed as per sanctioned plans.",
    submittedAt: new Date().toISOString(),
    submittedByName: app.ltpName,
    owner: {
      name: app.applicant.name,
      contact: app.applicant.contact,
      email: app.applicant.email,
      address: app.applicant.address,
    },
    ltp: {
      name: app.ltpName,
      licenceNo: "COA/2019/84920",
      contact: "+91 98220 99881",
      email: "ltp@architects.in",
    },
    project: {
      name: app.project.name,
      type: app.project.propertyType,
      zone: app.project.zone,
      ward: app.project.ward,
      surveyNo: app.project.surveyNo,
      address: app.project.address,
      approvedAreaSqm: app.project.builtUpArea,
      completedAreaSqm: app.project.builtUpArea,
    },
    documents: [],
    inspections: [],
    approvedFigures: {
      plotAreaSqm: app.project.plotArea,
      builtUpAreaSqm: app.project.builtUpArea,
      coveragePercent: 50.0,
      fsi: 1.5,
      heightM: 15.0,
      floors: 4,
      setbackMinM: 3.0,
      parkingAreaSqm: 200.0,
    },
    comparison: compareAsBuilt(
      {
        plotAreaSqm: app.project.plotArea,
        builtUpAreaSqm: app.project.builtUpArea,
        coveragePercent: 50.0,
        fsi: 1.5,
        heightM: 15.0,
        floors: 4,
        setbackMinM: 3.0,
        parkingAreaSqm: 200.0,
      },
      {}
    ),
    events: [
      {
        id: "ev-init",
        action: "APPROVED",
        toStatus: "APPROVED",
        actorName: "Dr. Pratap Reddy",
        actorRoleKey: "COMMISSIONER",
        stageName: "Decision",
        remarks: "Building permission order issued.",
        occurredAt: app.lastUpdated,
      },
    ],
    history: [],
  };

  return <OccupancyPanel initialRecord={fallbackRecord} showBackButton={false} />;
}
