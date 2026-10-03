"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  useDashboardScope,
  computeScopedKpis,
  applicationsByStage,
} from "@/components/dashboard/dashboard-scope";
import { BarChart, ColumnChart } from "@/components/dashboard/charts";
import { StatusBadge } from "@/components/design-system/badges";
import {
  FileStack,
  CreditCard,
  FileWarning,
  Clock,
  ArrowRight,
  Building2,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  BarChart3,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Application, ViewKey } from "@/types";

function AppRow({ app, onOpen }: { app: Application; onOpen: () => void }) {
  const daysAgo = Math.floor((Date.now() - new Date(app.lastUpdated).getTime()) / 86400000);
  return (
    <div
      className="group flex items-center gap-3 border-b border-[#E0D2BE]/40 py-2.5 px-4 hover:bg-[#FAF4EB] cursor-pointer transition-colors"
      onClick={onOpen}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#7A1316]">{app.applicationNo}</span>
          <StatusBadge status={app.status} />
        </div>
        <div className="mt-0.5 text-xs text-slate-600 truncate">{app.project.name} — {app.applicant.name}</div>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-[10px] font-medium text-slate-500">{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</span>
        <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{app.currentStageLabel}</span>
      </div>
      <ChevronRight className="size-4 text-slate-400 group-hover:text-[#7A1316] shrink-0 transition-colors" />
    </div>
  );
}

function EmptyChartState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-[120px] text-slate-400 text-xs font-medium">{label}</div>
  );
}

export function UnifiedDashboard() {
  const { navigate, user } = useAppStore();
  const scope = useDashboardScope();
  const kpis = computeScopedKpis(scope.applications);

  const isLTP = user?.role === "LTP";
  const isAdmin = user?.role === "ADMIN" || user?.role === "COMMISSIONER" || user?.role === "ADDITIONAL_COMMISSIONER";

  const stageData = React.useMemo(() => {
    return applicationsByStage(scope.applications).map((d) => ({
      ...d,
      color: "#7A1316",
    }));
  }, [scope.applications]);

  const applicationsView: ViewKey = isLTP ? "ltp-applications" : isAdmin ? "admin-applications" : "officer-applications";

  // ── 1. Top Stat Card 1: Total Applications ──────────────────────────────────
  const totalApplications = kpis.total;
  const approvedCount = kpis.approved;
  const rejectedCount = kpis.rejected;
  const pendingCount = Math.max(0, totalApplications - approvedCount - rejectedCount);

  const approvedPct = totalApplications > 0 ? ((approvedCount / totalApplications) * 100).toFixed(1) : "0.0";
  const pendingPct = totalApplications > 0 ? ((pendingCount / totalApplications) * 100).toFixed(1) : "0.0";
  const rejectedPct = totalApplications > 0 ? ((rejectedCount / totalApplications) * 100).toFixed(1) : "0.0";

  // ── Application Type Breakdown ──
  const applicationTypeData = React.useMemo(() => {
    const counts: Record<string, number> = {
      "Individual Residential": 0,
      "Apartment": 0,
      "Commercial": 0,
      "Multistory Building": 0,
      "Group Development": 0,
      "Other": 0,
    };
    scope.applications.forEach((a) => {
      const name = (a.project?.name || "").toLowerCase();
      const prop = (a.project?.propertyType || "").toLowerCase();
      const type = (a.project?.type || "").toLowerCase();
      if (
        name.includes("bungalow") ||
        name.includes("row house") ||
        name.includes("individual") ||
        name.includes("villa") ||
        name.includes("residence") ||
        (prop === "residential" && (a.project?.builtUpArea || 0) < 600)
      ) {
        counts["Individual Residential"]++;
      } else if (
        name.includes("apartment") ||
        name.includes("residency") ||
        (prop === "residential" && (a.project?.builtUpArea || 0) >= 600 && (a.project?.builtUpArea || 0) < 2500)
      ) {
        counts["Apartment"]++;
      } else if (
        prop === "commercial" ||
        name.includes("commercial") ||
        name.includes("mall") ||
        name.includes("plaza")
      ) {
        counts["Commercial"]++;
      } else if (
        name.includes("multistory") ||
        name.includes("tower") ||
        (a.project?.builtUpArea || 0) >= 2500
      ) {
        counts["Multistory Building"]++;
      } else if (
        name.includes("group") ||
        type.includes("layout") ||
        type.includes("development")
      ) {
        counts["Group Development"]++;
      } else {
        counts["Other"]++;
      }
    });

    return [
      { label: "Individual Residential", value: counts["Individual Residential"], color: "#7A1316" },
      { label: "Apartment", value: counts["Apartment"], color: "#7A1316" },
      { label: "Commercial", value: counts["Commercial"], color: "#7A1316" },
      { label: "Multistory Building", value: counts["Multistory Building"], color: "#7A1316" },
      { label: "Group Development", value: counts["Group Development"], color: "#7A1316" },
      { label: "Other", value: counts["Other"], color: "#7A1316" },
    ];
  }, [scope.applications]);

  // ── 2. Top Stat Card 2: Pending (Breakdown: In Review, Payment, Drawing, Documentation, Shortfall) ──
  const pendingApps = React.useMemo(() => {
    return scope.applications.filter((a) => !["APPROVED", "REJECTED", "DRAFT"].includes(a.status));
  }, [scope.applications]);

  const shortfallPendingCount = React.useMemo(() => {
    return pendingApps.filter((a) =>
      a.status === "SHORTFALL_RAISED" ||
      a.shortfalls.some((sf) => sf.status === "OPEN" || sf.status === "UNDER_REVIEW" || sf.status === "RESPONDED" || sf.status === "REOPENED")
    ).length;
  }, [pendingApps]);

  const paymentPendingCount = React.useMemo(() => {
    return pendingApps.filter((a) =>
      (a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED" || a.currentStage === "PAYMENT" || a.currentStage === "FEE_GENERATED") &&
      !(a.status === "SHORTFALL_RAISED" || a.shortfalls.some((sf) => sf.status === "OPEN" || sf.status === "UNDER_REVIEW" || sf.status === "RESPONDED"))
    ).length;
  }, [pendingApps]);

  const drawingPendingCount = React.useMemo(() => {
    return pendingApps.filter((a) =>
      (a.status === "DRAWING_UPLOADED" || a.status === "SCRUTINY_IN_PROGRESS" || a.status === "SCRUTINY_FAILED" || a.status === "DRAWING_REUPLOAD_REQUIRED" || a.currentStage === "DRAWING_SCRUTINY") &&
      !(a.status === "SHORTFALL_RAISED" || a.shortfalls.some((sf) => sf.status === "OPEN" || sf.status === "UNDER_REVIEW" || sf.status === "RESPONDED")) &&
      !(a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED")
    ).length;
  }, [pendingApps]);

  const inReviewCount = React.useMemo(() => {
    return pendingApps.filter((a) =>
      (a.status === "SCRUTINY_PASSED" ||
       a.currentStage === "ZONAL_HEAD_REVIEW" ||
       a.currentStage === "DIRECTOR_REVIEW" ||
       a.currentStage === "ADDITIONAL_COMMISSIONER_REVIEW" ||
       a.currentStage === "COMMISSIONER_REVIEW" ||
       a.currentStage === "FINAL_DECISION") &&
      !(a.status === "SHORTFALL_RAISED" || a.shortfalls.some((sf) => sf.status === "OPEN" || sf.status === "UNDER_REVIEW" || sf.status === "RESPONDED"))
    ).length;
  }, [pendingApps]);

  const docPendingCount = Math.max(0, pendingCount - inReviewCount - paymentPendingCount - drawingPendingCount - shortfallPendingCount);

  const inReviewPct = pendingCount > 0 ? ((inReviewCount / pendingCount) * 100).toFixed(1) : "0.0";
  const paymentPendingPct = pendingCount > 0 ? ((paymentPendingCount / pendingCount) * 100).toFixed(1) : "0.0";
  const drawingPendingPct = pendingCount > 0 ? ((drawingPendingCount / pendingCount) * 100).toFixed(1) : "0.0";
  const docPendingPct = pendingCount > 0 ? ((docPendingCount / pendingCount) * 100).toFixed(1) : "0.0";
  const shortfallPendingPct = pendingCount > 0 ? ((shortfallPendingCount / pendingCount) * 100).toFixed(1) : "0.0";

  // ── 3. Bottom Card: Drawing Scrutiny ────────────────────────────────────────
  const totalScrutiny = scope.applications.length;
  const scrutinyPassed = scope.applications.filter((a) => a.status === "APPROVED" || a.status === "SCRUTINY_PASSED" || a.scrutinyReport?.status === "PASSED").length;
  const scrutinyFailed = scope.applications.filter((a) => a.status === "SCRUTINY_FAILED" || a.status === "DRAWING_REUPLOAD_REQUIRED" || a.scrutinyReport?.status === "FAILED").length;
  const scrutinyReview = Math.max(0, totalScrutiny - scrutinyPassed - scrutinyFailed);
  const scrutinyPassedPct = totalScrutiny > 0 ? ((scrutinyPassed / totalScrutiny) * 100).toFixed(1) : "0.0";
  const scrutinyReviewPct = totalScrutiny > 0 ? ((scrutinyReview / totalScrutiny) * 100).toFixed(1) : "0.0";
  const scrutinyFailedPct = totalScrutiny > 0 ? ((scrutinyFailed / totalScrutiny) * 100).toFixed(1) : "0.0";

  // ── 4. Bottom Card: Payment Status ──────────────────────────────────────────
  const totalPayments = scope.applications.length;
  const paidCount = scope.applications.filter((a) => a.payment?.status === "SUCCESS" || a.status === "APPROVED" || a.status === "PAYMENT_SUCCESS").length;
  const pendingPayCount = scope.applications.filter((a) =>
    a.status === "PAYMENT_PENDING" || a.status === "FEE_GENERATED" || a.payment?.status === "PENDING" || a.payment?.status === "PROCESSING"
  ).length;
  const exemptCount = Math.max(0, totalPayments - paidCount - pendingPayCount);
  const paidPct = totalPayments > 0 ? ((paidCount / totalPayments) * 100).toFixed(1) : "0.0";
  const pendingPayPct = totalPayments > 0 ? ((pendingPayCount / totalPayments) * 100).toFixed(1) : "0.0";
  const exemptPct = totalPayments > 0 ? ((exemptCount / totalPayments) * 100).toFixed(1) : "0.0";

  // ── 5. Bottom Card: Documents ───────────────────────────────────────────────
  const allDocs = scope.applications.flatMap((a) => a.documents);
  const totalDocs = allDocs.length;
  const docsVerified = allDocs.filter((d) => d.status === "VERIFIED").length;
  const docsPending = allDocs.filter((d) => d.status === "REQUIRED" || d.status === "PENDING_VERIFICATION").length;
  const docsRejected = Math.max(0, totalDocs - docsVerified - docsPending);
  const docsVerifiedPct = totalDocs > 0 ? ((docsVerified / totalDocs) * 100).toFixed(1) : "0.0";
  const docsPendingPct = totalDocs > 0 ? ((docsPending / totalDocs) * 100).toFixed(1) : "0.0";
  const docsRejectedPct = totalDocs > 0 ? ((docsRejected / totalDocs) * 100).toFixed(1) : "0.0";

  // ── 6. Bottom Card: Shortfalls ──────────────────────────────────────────────
  const allShortfalls = scope.applications.flatMap((a) => a.shortfalls);
  const totalShortfalls = allShortfalls.length;
  const sfClosed = allShortfalls.filter((sf) => sf.status === "RESOLVED").length;
  const sfOpen = allShortfalls.filter((sf) => sf.status === "OPEN" || sf.status === "REOPENED").length;
  const sfUnderReview = Math.max(0, totalShortfalls - sfClosed - sfOpen);
  const sfClosedPct = totalShortfalls > 0 ? ((sfClosed / totalShortfalls) * 100).toFixed(1) : "0.0";
  const sfOpenPct = totalShortfalls > 0 ? ((sfOpen / totalShortfalls) * 100).toFixed(1) : "0.0";
  const sfUnderReviewPct = totalShortfalls > 0 ? ((sfUnderReview / totalShortfalls) * 100).toFixed(1) : "0.0";

  return (
    <div className="w-full h-full bg-[#FAF7F2] text-slate-800 font-sans p-2 sm:p-2.5 flex flex-col gap-2 sm:gap-2.5 overflow-hidden">

      {/* 1ST ROW: TOP STAT CARDS (BBAS Official Card Type) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2.5 shrink-0">

        {/* Card 1: Total Applications */}
        <div className="rounded-2xl border-2 border-[#7A1316] bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-[182px]">
          {/* Top: Icon + Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7A1316] text-white shadow-xs">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-[#7A1316]">
                Total Applications - {totalApplications.toLocaleString()}
              </h2>
            </div>
          </div>

          {/* Bottom: Columns (Approved, In Progress, Rejected) */}
          <div className="grid grid-cols-3 divide-x divide-[#DCD5C8] text-center my-2 py-0.5">
            <div className="px-2">
              <div className="text-sm sm:text-base font-bold text-emerald-700">
                {approvedCount.toLocaleString()} ({approvedPct}%)
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-black mt-0.5">
                Approved
              </div>
            </div>
            <div className="px-2">
              <div className="text-sm sm:text-base font-bold text-[#7A1316]">
                {pendingCount.toLocaleString()} ({pendingPct}%)
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-black mt-0.5">
                In Progress
              </div>
            </div>
            <div className="px-2">
              <div className="text-sm sm:text-base font-bold text-rose-700">
                {rejectedCount.toLocaleString()} ({rejectedPct}%)
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-black mt-0.5">
                Rejected
              </div>
            </div>
          </div>

          {/* Action indicator */}
          <div className="pt-0.5">
            <button
              onClick={() => navigate(applicationsView)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1316] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span>Total Applications</span>
              <ChevronDown className="size-3" />
            </button>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="rounded-2xl border-2 border-[#7A1316] bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-[182px]">
          {/* Top: Icon + Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7A1316] text-white shadow-xs">
              <Clock className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-[#7A1316]">
                In Progress - {pendingCount.toLocaleString()}
              </h2>
            </div>
          </div>

          {/* Bottom: 5 Columns ("In Review", Payment, Drawing, Documentation, Shortfall) */}
          <div className="grid grid-cols-5 divide-x divide-[#DCD5C8] text-center my-2 py-0.5">
            <div className="px-0.5 sm:px-1">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {inReviewCount.toLocaleString()} ({inReviewPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-black mt-0.5 leading-tight">
                In Review
              </div>
            </div>
            <div className="px-0.5 sm:px-1">
              <div className="text-xs sm:text-sm font-bold text-[#7A1316]">
                {paymentPendingCount.toLocaleString()} ({paymentPendingPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-black mt-0.5 leading-tight">
                Payment
              </div>
            </div>
            <div className="px-0.5 sm:px-1">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {drawingPendingCount.toLocaleString()} ({drawingPendingPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-black mt-0.5 leading-tight">
                Drawing
              </div>
            </div>
            <div className="px-0.5 sm:px-1">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {docPendingCount.toLocaleString()} ({docPendingPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-black mt-0.5 leading-tight">
                Documentation
              </div>
            </div>
            <div className="px-0.5 sm:px-1">
              <div className="text-xs sm:text-sm font-bold text-amber-800">
                {shortfallPendingCount.toLocaleString()} ({shortfallPendingPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-black mt-0.5 leading-tight">
                Shortfall
              </div>
            </div>
          </div>

          {/* Action indicator */}
          <div className="pt-0.5">
            <button
              onClick={() => navigate(applicationsView)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1316] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span>In Progress</span>
              <ChevronDown className="size-3" />
            </button>
          </div>
        </div>

      </div>

      {/* 2ND ROW: 4 CARDS (Exact Same Card Type As Top 2 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-2.5 shrink-0">

        {/* 1. Drawing Scrutiny */}
        <div className="rounded-2xl border-2 border-[#7A1316] bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-[182px]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7A1316] text-white shadow-xs">
              <Layers className="size-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[#7A1316]">
                Drawing Scrutiny - {totalScrutiny.toLocaleString()}
              </h2>
              <div className="text-[10px] font-medium text-slate-500 -mt-0.5">
                (CAD & BIM Scrutiny)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#DCD5C8] text-center my-2 py-0.5">
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {scrutinyPassed.toLocaleString()} ({scrutinyPassedPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Compliant
              </div>
            </div>
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-[#7A1316]">
                {scrutinyReview.toLocaleString()} ({scrutinyReviewPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Under Review
              </div>
            </div>
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {scrutinyFailed.toLocaleString()} ({scrutinyFailedPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Defects
              </div>
            </div>
          </div>

          <div className="pt-0.5">
            <button
              onClick={() => navigate(applicationsView)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1316] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span>Scrutiny</span>
              <ChevronDown className="size-3" />
            </button>
          </div>
        </div>

        {/* 2. Payment Status */}
        <div className="rounded-2xl border-2 border-[#7A1316] bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-[182px]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7A1316] text-white shadow-xs">
              <CreditCard className="size-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[#7A1316]">
                Payment Status - {totalPayments.toLocaleString()}
              </h2>
              <div className="text-[10px] font-medium text-slate-500 -mt-0.5">
                (Fees & Challans)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#DCD5C8] text-center my-2 py-0.5">
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {paidCount.toLocaleString()} ({paidPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Realized
              </div>
            </div>
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-[#7A1316]">
                {pendingPayCount.toLocaleString()} ({pendingPayPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Pending Pay
              </div>
            </div>
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {exemptCount.toLocaleString()} ({exemptPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Exempted
              </div>
            </div>
          </div>

          <div className="pt-0.5">
            <button
              onClick={() => navigate(applicationsView)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1316] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span>Payments</span>
              <ChevronDown className="size-3" />
            </button>
          </div>
        </div>

        {/* 3. Documents */}
        <div className="rounded-2xl border-2 border-[#7A1316] bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-[182px]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7A1316] text-white shadow-xs">
              <FileStack className="size-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[#7A1316]">
                Documents - {totalDocs.toLocaleString()}
              </h2>
              <div className="text-[10px] font-medium text-slate-500 -mt-0.5">
                (Enclosures & NOCs)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#DCD5C8] text-center my-2 py-0.5">
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {docsVerified.toLocaleString()} ({docsVerifiedPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Verified
              </div>
            </div>
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-[#7A1316]">
                {docsPending.toLocaleString()} ({docsPendingPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Pending Verif
              </div>
            </div>
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {docsRejected.toLocaleString()} ({docsRejectedPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Defective
              </div>
            </div>
          </div>

          <div className="pt-0.5">
            <button
              onClick={() => navigate(applicationsView)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1316] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span>Documents</span>
              <ChevronDown className="size-3" />
            </button>
          </div>
        </div>

        {/* 4. Shortfalls */}
        <div className="rounded-2xl border-2 border-[#7A1316] bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-[182px]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7A1316] text-white shadow-xs">
              <FileWarning className="size-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[#7A1316]">
                Shortfalls - {totalShortfalls.toLocaleString()}
              </h2>
              <div className="text-[10px] font-medium text-slate-500 -mt-0.5">
                (Queries & Compliance)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#DCD5C8] text-center my-2 py-0.5">
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {sfClosed.toLocaleString()} ({sfClosedPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Cleared
              </div>
            </div>
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-[#7A1316]">
                {sfOpen.toLocaleString()} ({sfOpenPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Open Queries
              </div>
            </div>
            <div className="px-1 sm:px-1.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {sfUnderReview.toLocaleString()} ({sfUnderReviewPct}%)
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
                Under Review
              </div>
            </div>
          </div>

          <div className="pt-0.5">
            <button
              onClick={() => navigate(applicationsView)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1316] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span>Shortfalls</span>
              <ChevronDown className="size-3" />
            </button>
          </div>
        </div>

      </div>

      {/* 3RD ROW: Application Status | Stage Breakdown | Recent Activity (Flex-1: expands to fill all remaining height) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-2.5 flex-1 min-h-0">

        {/* Application Type */}
        <div className="rounded-2xl border-2 border-[#7A1316] bg-white shadow-xs p-3 sm:p-4 h-full min-h-0 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#7A1316] text-white">
                <Building2 className="size-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A1316]">Application Type</h3>
            </div>
            <span className="text-[11px] font-bold text-[#7A1316] bg-[#7A1316]/10 px-2 py-0.5 rounded-full">
              {totalApplications.toLocaleString()} total
            </span>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ColumnChart data={applicationTypeData} color="#7A1316" />
          </div>
        </div>

        {/* Stage Wise Breakdown */}
        <div className="rounded-2xl border-2 border-[#7A1316] bg-white shadow-xs p-3 sm:p-4 h-full min-h-0 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#7A1316] text-white">
                <BarChart3 className="size-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A1316]">Stage Breakdown</h3>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-center">
            {stageData.length > 0
              ? <BarChart data={stageData} color="#7A1316" trackClassName="bg-[#E0D2BE]/60" />
              : <EmptyChartState label="No stage data" />}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border-2 border-[#7A1316] bg-white shadow-xs flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 border-b border-[#E0D2BE] shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#7A1316] text-white">
                <Clock className="size-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A1316]">Recent Activity</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(applicationsView)}
              className="h-6 gap-1 text-[11px] font-bold text-[#7A1316] hover:bg-[#7A1316]/10 hover:text-[#7A1316] px-2 rounded-md"
            >
              View all <ArrowRight className="size-3" />
            </Button>
          </div>

          {/* Stats Bar at Top */}
          {scope.applications.length > 0 && (
            <div className="border-b border-[#E0D2BE] px-4 py-1.5 grid grid-cols-3 text-center shrink-0 bg-[#FAF4EB]/80 divide-x divide-[#E0D2BE]/60">
              <div className="px-1">
                <div className="text-xs sm:text-sm font-black text-emerald-700 leading-tight">{kpis.approved}</div>
                <div className="text-[10px] font-semibold text-slate-600">Approved</div>
              </div>
              <div className="px-1">
                <div className="text-xs sm:text-sm font-black text-[#7A1316] leading-tight">{kpis.inProgress}</div>
                <div className="text-[10px] font-semibold text-slate-600">In Progress</div>
              </div>
              <div className="px-1">
                <div className="text-xs sm:text-sm font-black text-rose-700 leading-tight">{kpis.rejected}</div>
                <div className="text-[10px] font-semibold text-slate-600">Rejected</div>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#E0D2BE]/40 rounded-b-2xl">
            {scope.applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                <Building2 className="size-8 opacity-30 text-[#7A1316]" />
                <span className="text-xs font-medium text-slate-500">No applications in your scope</span>
              </div>
            ) : (
              scope.applications
                .slice().sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                .slice(0, 15)
                .map((app) => <AppRow key={app.id} app={app} onOpen={() => navigate(applicationsView)} />)
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
