"use client";

import * as React from "react";
import {
  PageHeader,
  SectionCard,
} from "@/components/design-system/layout";
import { PageBackButton } from "@/components/design-system/back-button";
import {
  CircleHelp,
  LayoutDashboard,
  FileStack,
  Activity,
  Users,
  Gauge,
  BarChart3,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import type { ViewKey } from "@/types";
import type { LucideIcon } from "lucide-react";

// ============================================================
// PM — Help & Support
// Plain-language guide to each Project Manager monitoring tool.
// READ-ONLY: no edit / approve / verify / pay actions documented.
// ============================================================

interface HelpTopic {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  view?: ViewKey;
  viewLabel?: string;
}

const TOPICS: HelpTopic[] = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Your starting point — a high-level snapshot of the entire approval pipeline and what needs your attention today.",
    bullets: [
      "View total applications, in-progress count, approval rate and active shortfalls at a glance.",
      "See the most bottlenecked stage and the officers with the heaviest current workload.",
      "Quick-jump cards take you directly to the live SLA, Officer Progress and Shortfalls monitors.",
    ],
    view: "pm-dashboard",
    viewLabel: "Open Dashboard",
  },
  {
    icon: FileStack,
    title: "Application Tracking",
    description:
      "Browse and inspect every application in the system, regardless of which LTP submitted it or which officer is assigned.",
    bullets: [
      "Filter by status, stage, priority or applicant to find a specific case quickly.",
      "Click an application to see its full history, current stage, assigned officer and SLA status — read-only.",
      "Use this to investigate why an application is stuck or to spot patterns across cases.",
    ],
    view: "pm-applications",
    viewLabel: "Open Applications",
  },
  {
    icon: Activity,
    title: "Workflow Monitoring",
    description:
      "A pipeline view of all applications plotted against the 13 workflow stages from creation to final decision.",
    bullets: [
      "See which stage each application is currently sitting in and how long it has been there.",
      "Identify where work is piling up (the bottleneck stage) and who is responsible for moving it forward.",
      "Useful for capacity planning — if a stage is overloaded, raise it with the responsible officer.",
    ],
    view: "pm-workflow",
    viewLabel: "Open Workflow Monitor",
  },
  {
    icon: Users,
    title: "Officer Progress",
    description:
      "Workload, performance and SLA compliance per officer — the page you're using to monitor individual productivity.",
    bullets: [
      "KPI cards show the total officer count, total assigned work, delayed/at-risk applications and average SLA compliance.",
      "The workload table breaks down assigned, completed, pending, delayed, at-risk and average processing days per officer.",
      "Click any officer row or comparison card to drill into their detailed profile, assigned applications and recent actions.",
    ],
    view: "pm-officers",
    viewLabel: "Open Officer Progress",
  },
  {
    icon: Gauge,
    title: "SLA Monitoring",
    description:
      "Application-level SLA tracking — see which cases are on track, at risk, delayed, blocked or critical.",
    bullets: [
      "Each stage has a configured SLA in days (e.g. TPS Technical Scrutiny = 3 days, Commissioner Review = 7 days).",
      "Apps that breach the SLA are flagged as Delayed (1–2 days over) or Critical Delay (more than 2 days over).",
      "Apps with an open shortfall or rejected documents are flagged as Blocked — they need attention from the LTP or officer before they can resume.",
    ],
    view: "pm-sla",
    viewLabel: "Open SLA Monitor",
  },
  {
    icon: BarChart3,
    title: "Progress Reports",
    description:
      "Aggregated reporting view — approval rate, stage-wise pending counts, officer report (with CSV export), bottleneck identification and recent activity feed.",
    bullets: [
      "Approval Rate card shows approved / decisioned * 100 with a live progress bar.",
      "Stage-wise Pending Count table shows the live backlog per workflow stage plus average processing time.",
      "Use the Export CSV button on the Officer Report to download a spreadsheet of per-officer workload + SLA compliance.",
      "Bottleneck Identification surfaces the stage with the most pending applications and explains the reason.",
    ],
    view: "pm-reports",
    viewLabel: "Open Progress Reports",
  },
];

export function PmHelp() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="space-y-6">
      <PageBackButton fallbackView="pm-dashboard" />

      <PageHeader
        title="Help & Support"
        description="Guide to the Project Manager monitoring tools."
        icon={CircleHelp}
      />

      {/* Help Sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <SectionCard
              key={topic.title}
              title={topic.title}
              description={topic.description}
              icon={Icon}
            >
              <div className="space-y-3">
                <ul className="space-y-2 text-sm text-foreground/90">
                  {topic.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      <span className="text-xs leading-relaxed text-muted-foreground">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
                {topic.view && (
                  <button
                    onClick={() => navigate(topic.view!)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    {topic.viewLabel ?? `Open ${topic.title}`}
                    <ArrowRight className="size-3.5" />
                  </button>
                )}
              </div>
            </SectionCard>
          );
        })}
      </div>

      {/* Read-only reminder */}
      <SectionCard
        title="Read-Only Role"
        description="The Project Manager portal is a monitoring layer — not an operational one."
        icon={AlertTriangle}
      >
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            As a Project Manager you have read access to every application,
            officer and shortfall in the system. You can drill into any record
            and export aggregated reports, but you cannot approve, reject,
            return, verify documents, raise shortfalls or trigger payments.
          </p>
          <p>
            To act on a specific application, raise it with the responsible
            officer (visible on the Officer Progress page) or escalate through
            your chain of command. All administrative changes (users, roles,
            workflow config, fees, settings) are managed by the Admin portal.
          </p>
        </div>
      </SectionCard>

      {/* Quick contact / footer */}
      <SectionCard
        title="Need more help?"
        description="If something in this portal doesn't behave the way this guide describes, contact the system administrator."
        icon={CircleHelp}
      >
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Administrators can configure workflow stages, fees, role
            permissions and notification templates — reach out via the Admin
            portal's user list.
          </p>
          <button
            onClick={() => navigate("pm-dashboard")}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors self-start"
          >
            Back to Dashboard <ArrowRight className="size-3.5" />
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
