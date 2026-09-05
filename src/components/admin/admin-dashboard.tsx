"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { DonutChart, BarChart } from "@/components/dashboard/charts";
import {
  FileStack,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  AlertTriangle,
  Clock,
  Timer,
  PieChart,
  CircleDollarSign,
  Wallet,
  Receipt,
  TrendingUp,
  History,
  FileWarning,
  Server,
  Database,
  Smartphone,
  CreditCard,
  HardDrive
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AdminDashboard() {
  const { navigate } = useAppStore();

  return (
    <div className="bg-[#F8F9FB] min-h-screen text-slate-800 font-sans px-2 pt-1 pb-20">

      <div className="flex flex-col xl:grid xl:grid-cols-4 gap-3">

        {/* Main Content Area (Left 75%) */}
        <div className="xl:col-span-3 space-y-1">

          {/* Applications Row */}
          <div className="space-y-1.5">
            <div className="border border-slate-200 bg-white rounded-xl px-4 py-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">APPLICATIONS</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <KpiCard label="Total applications" value="246" icon={<FileStack className="size-4 text-blue-500" />} gradient="bg-gradient-to-tr from-cyan-100/80 via-white to-white" />
              <KpiCard label="In progress" value="190" icon={<Activity className="size-4 text-blue-600" />} gradient="bg-gradient-to-tr from-blue-200/60 via-white to-white" />
              <KpiCard label="Approved" value="21" icon={<CheckCircle2 className="size-4 text-emerald-500" />} gradient="bg-gradient-to-tr from-emerald-100/80 via-white to-white" />
              <KpiCard label="Rejected" value="0" icon={<XCircle className="size-4 text-rose-500" />} gradient="bg-gradient-to-tr from-rose-100/80 via-white to-white" />
            </div>
          </div>

          {/* Workflow Row */}
          <div className="space-y-1.5">
            <div className="border border-slate-200 bg-white rounded-xl px-4 py-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">WORKFLOW</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <KpiCard label="Open shortfalls" value="18" icon={<AlertTriangle className="size-4 text-amber-500" />} gradient="bg-gradient-to-tr from-amber-100/80 via-white to-white" />
              <KpiCard label="Overdue tasks" value="0" icon={<Clock className="size-4 text-rose-500" />} gradient="bg-gradient-to-tr from-rose-100/80 via-white to-white" />
              <KpiCard label="Due soon" value="0" icon={<Timer className="size-4 text-amber-500" />} gradient="bg-gradient-to-tr from-amber-100/80 via-white to-white" />
              <KpiCard label="Average time to decide" value="0 d" icon={<PieChart className="size-4 text-indigo-500" />} gradient="bg-gradient-to-tr from-indigo-100/60 via-white to-white" />
            </div>
          </div>

          {/* Revenue Row */}
          <div className="space-y-1.5">
            <div className="border border-slate-200 bg-white rounded-xl px-4 py-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">REVENUE</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <KpiCard label="Fees generated" value="₹1.66 Cr" icon={<CircleDollarSign className="size-4 text-amber-500" />} gradient="bg-gradient-to-tr from-purple-100/80 via-white to-white" />
              <KpiCard label="Fees collected" value="₹1.16 Cr" icon={<Wallet className="size-4 text-emerald-500" />} gradient="bg-gradient-to-tr from-emerald-100/80 via-white to-white" />
              <KpiCard label="Pending fee" value="₹50.28 L" icon={<Receipt className="size-4 text-rose-500" />} gradient="bg-gradient-to-tr from-pink-100/80 via-white to-white" />
              <KpiCard label="Payment success rate" value="76.8%" icon={<TrendingUp className="size-4 text-emerald-500" />} gradient="bg-gradient-to-tr from-cyan-100/80 via-white to-white" />
            </div>
          </div>
        </div>

        {/* Right Sidebar (Recent Activity) - 25% width */}
        <div className="hidden xl:block xl:col-span-1 relative">
          <div className="absolute inset-0">
            <div className="border border-slate-200 bg-white rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-4 pb-3 shrink-0 border-b border-slate-100 mb-2">
                <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                    <input type="text" placeholder="Search..." className="!h-6 w-28 pl-6 pr-2 !py-0 text-[10px] rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 transition-colors" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="!h-6 w-28 px-2 !py-0 text-[10px] rounded-full border border-slate-200 bg-slate-50 focus:ring-0 focus:border-blue-400">
                      <SelectValue placeholder="Activity" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="all" className="text-xs rounded-md">Activity</SelectItem>
                      <SelectItem value="scrutiny" className="text-xs rounded-md">Scrutiny</SelectItem>
                      <SelectItem value="applications" className="text-xs rounded-md">Applications</SelectItem>
                      <SelectItem value="payments" className="text-xs rounded-md">Payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-2">
                <div className="relative border-l-2 border-slate-100 ml-2 space-y-2.5 pb-1 pt-0">
                  <ActivityItem
                    appNo="BP/2026/000226"
                    time="17h ago"
                    title="Scrutiny passed — elevation — 158 V2"
                    desc="Version 2 passed 12 of 14 checks, with 2 advisory note(s) that do not block progress."
                    user="System"
                    dot="bg-blue-500"
                  />
                  <ActivityItem
                    appNo="BP/2026/000226"
                    time="17h ago"
                    title="Scrutiny passed — floor plan — 158 V2"
                    desc="Version 2 passed 12 of 14 checks, with 2 advisory note(s) that do not block progress."
                    user="System"
                    dot="bg-blue-500"
                  />
                  <ActivityItem
                    appNo="BP/2026/000226"
                    time="17h ago"
                    title="Scrutiny started"
                    desc="2 drawings sent to the mock engine."
                    user="Ravi Kumar"
                    dot="bg-blue-500"
                  />
                  <ActivityItem
                    appNo="BP/2026/000226"
                    time="17h ago"
                    title="Drawing revised to version 2"
                    desc="elevation — 158 — elevation_158_rev1.pdf"
                    user="Ravi Kumar"
                    dot="bg-blue-500"
                  />
                  <ActivityItem
                    appNo="BP/2026/000226"
                    time="17h ago"
                    title="Drawing revised to version 2"
                    desc="floor plan — 158 — floor_plan_158_rev1.pdf"
                    user="Ravi Kumar"
                    dot="bg-blue-500"
                  />
                  <ActivityItem
                    appNo="BP/2026/000201"
                    time="18h ago"
                    title="Application filed"
                    desc="New building permit application submitted."
                    user="Ravi Kumar"
                    dot="bg-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="space-y-4 mt-1">

        {/* Analytics & Visual Overview */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-3 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer relative flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 mb-2">Pipeline</h3>
              <div className="flex-1">
                <PipelineRingChart />
              </div>
            </div>

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-3 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 mb-1">Applications by stage</h3>
              <div className="flex-1 flex flex-col">
                <RoseStageChart />
              </div>
            </div>

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-3 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-800">Applicant-Side Pipeline</h3>
                <span className="text-lg font-bold text-slate-800">187</span>
              </div>

              <div className="flex-1 flex flex-col justify-end space-y-1.5">
                <PipelineBar label="Draft — not yet filed" count="35" color="bg-slate-400" percent={35 / 187} />
                <PipelineBar label="Filed, awaiting a drawing" count="20" color="bg-slate-500" percent={20 / 187} />
                <PipelineBar label="In automated scrutiny" count="33" color="bg-sky-500" percent={33 / 187} />
                <PipelineBar label="Scrutiny failed — correction due" count="19" color="bg-rose-500" percent={19 / 187} />
                <PipelineBar label="Documents outstanding" count="40" color="bg-amber-500" percent={40 / 187} />
                <PipelineBar label="Awaiting payment" count="18" color="bg-amber-600" percent={18 / 187} />
                <PipelineBar label="Payment declined" count="8" color="bg-rose-600" percent={8 / 187} />
                <PipelineBar label="Returned on a shortfall" count="14" color="bg-rose-400" percent={14 / 187} />
                <PipelineBar label="Answered — awaiting an officer" count="2" color="bg-slate-300" percent={2 / 187} />
              </div>
            </div>

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-3 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-slate-800">Applications by status</h3>
                <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Open the register →</a>
              </div>

              <div className="flex justify-center mt-1 mb-2 px-4">
                <PolarStatusChart />
              </div>

              <div className="space-y-1">
                <StatusRow label="Draft" count="35" percent="14%" color="bg-slate-400" />
                <StatusRow label="Preparing (drawings, documents)" count="59" percent="24%" color="bg-purple-500" />
                <StatusRow label="Awaiting payment" count="23" percent="9%" color="bg-amber-500" />
                <StatusRow label="Under departmental review" count="55" percent="22%" color="bg-sky-500" />
                <StatusRow label="With the applicant (shortfall)" count="15" percent="6%" color="bg-rose-500" />
                <StatusRow label="Approved" count="21" percent="9%" color="bg-emerald-500" />
              </div>
            </div>
            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-slate-800">Fees and collection</h3>
                <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Register →</a>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-600">Collected of raised</span>
                  <span className="font-bold text-slate-800">₹1,15,86,190</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[70%]"></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">70%</div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Demands issued</div>
                    <div className="text-xs text-slate-500">7 shortfall</div>
                  </div>
                  <div className="font-bold text-slate-800">103</div>
                </div>
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                  <div className="text-sm font-semibold text-slate-800">Outstanding</div>
                  <div className="font-bold text-amber-600">₹50,27,520</div>
                </div>
                <div className="flex justify-between items-baseline">
                  <div className="text-sm font-semibold text-slate-800">Receipts issued</div>
                  <div className="font-bold text-slate-800">73</div>
                </div>
              </div>
            </div>

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 mb-6">Payment attempts</h3>

              <div className="flex items-baseline gap-2 mb-4 mt-1">
                <span className="text-3xl font-bold text-slate-800">76.8%</span>
                <span className="text-xs text-slate-500">settlement rate</span>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-800">Settled</span>
                  <span className="font-bold text-emerald-500">73</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-800">Declined</span>
                  <span className="font-bold text-rose-500">22</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-800">In flight</span>
                  <span className="font-bold text-sky-500">7</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-800">Cancelled</span>
                  <span className="font-bold text-slate-400">0</span>
                </div>
              </div>
            </div>

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 mb-6">Automated scrutiny</h3>

              <div className="flex-1 flex justify-center items-center mb-4">
                {(() => {
                  const size = 128;
                  const thickness = 22;
                  const radius = (size - thickness) / 2;
                  const circumference = 2 * Math.PI * radius;
                  const GAP = 10; // wide gap for visible white space between rounded caps
                  const segments = [
                    { label: "Passed",  value: 348, color: "#10b981" },
                    { label: "Failed",  value: 150, color: "#ef4444" },
                    { label: "Running", value: 1,   color: "#94a3b8" },
                  ];
                  const total = segments.reduce((s, d) => s + d.value, 0);
                  let offset = 0;
                  return (
                    <div className="relative" style={{ width: size, height: size }}>
                      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                        {/* Track */}
                        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
                        {segments.map((seg, i) => {
                          const dash = Math.max(0, (seg.value / total) * circumference - GAP);
                          const gap = circumference - dash;
                          const el = (
                            <circle
                              key={i}
                              cx={size/2} cy={size/2} r={radius}
                              fill="none"
                              stroke={seg.color}
                              strokeWidth={thickness}
                              strokeDasharray={`${dash} ${gap}`}
                              strokeDashoffset={-offset}
                              strokeLinecap="round"
                              className="transition-all duration-200 cursor-pointer hover:brightness-110"
                            />
                          );
                          offset += (seg.value / total) * circumference;
                          return el;
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-slate-800">499</span>
                        <span className="text-[10px] font-bold text-slate-500">RUNS</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-1.5">
                <StatusRow label="Passed" count="348" percent="70%" color="bg-emerald-500" />
                <StatusRow label="Failed" count="150" percent="30%" color="bg-rose-500" />
                <StatusRow label="Running" count="1" percent="0%" color="bg-slate-400" />
              </div>

            </div>

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-slate-800">Shortfalls</h3>
                <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Register →</a>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Document</span>
                    <span className="font-bold text-slate-800">11</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 w-[61%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Fee</span>
                    <span className="font-bold text-slate-800">7</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[39%]"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-auto">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-800">Open</span>
                  <span className="font-bold text-amber-600">18</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-800">Resolved</span>
                  <span className="font-bold text-emerald-500">14</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-800">Awaiting verdict</span>
                  <span className="font-bold text-sky-500">2</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-800">Unnotified</span>
                  <span className="font-bold text-rose-500">16</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Tables */}
        <div className="space-y-3 pt-4 border-t border-slate-200 mt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">DEPARTMENT REVIEW DESKS & TABLES</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">

            {/* Department Desks Summary */}
            <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-800">Department Desks Summary</h3>
                <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Open queue →</a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                      <th className="py-2.5 font-semibold">DESK</th>
                      <th className="py-2.5 font-semibold text-center">WORKED BY</th>
                      <th className="py-2.5 font-semibold text-right">FILES</th>
                      <th className="py-2.5 font-semibold text-right">TASKS</th>
                      <th className="py-2.5 font-semibold text-right">UNCLAIMED</th>
                      <th className="py-2.5 font-semibold text-right">DUE SOON</th>
                      <th className="py-2.5 font-semibold text-right">OVERDUE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <DeskRow desk="TPA (TPA_REVIEW)" by="TPA (4 officers)" files="18" tasks="18" un="12" />
                    <DeskRow desk="ZAD/ZDD (ZAD_ZDD_REVIEW)" by="ZAD, ZDD (7 officers)" files="9" tasks="9" un="6" />
                    <DeskRow desk="ZJD (ZJD_REVIEW)" by="ZJD (4 officers)" files="2" tasks="2" un="1" />
                    <DeskRow desk="Director (DIRECTOR_DP_REVIEW)" by="DIRECTOR_DP (3 officers)" files="4" tasks="4" un="3" />
                    <DeskRow desk="Addl Commissioner (ADDL_COMMISSIONER_REVIEW)" by="ADDL_COMMISSIONER (3 officers)" files="3" tasks="3" un="1" />
                    <DeskRow desk="Commissioner (COMMISSIONER_REVIEW)" by="COMMISSIONER (3 officers)" files="2" tasks="2" un="1" />
                    <DeskRow desk="With applicant (LTP_SHORTFALL_ACTION)" by="LTP (8 officers)" files="14" tasks="14" un="14" />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Licensed Technical Persons */}
            <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer">
              <h3 className="text-xs font-bold text-slate-800 mb-4">Licensed Technical Persons (LTP)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                      <th className="py-2.5 font-semibold">LICENSED TECHNICAL PERSON</th>
                      <th className="py-2.5 font-semibold text-right">FILES</th>
                      <th className="py-2.5 font-semibold text-right">DRAFTS</th>
                      <th className="py-2.5 font-semibold text-right">APPROVED</th>
                      <th className="py-2.5 font-semibold text-right">REJECTED</th>
                      <th className="py-2.5 font-semibold text-center whitespace-nowrap">OPEN SHORTFALLS</th>
                      <th className="py-2.5 font-semibold text-right">LAST FILED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <LtpRow name="Ravi Kumar" co="Kumar & Associates - LTP/2026/0001" f="64" d="11" a="4" r="—" s="4" l="16h ago" />
                    <LtpRow name="Naveen Chowdary" co="Aakriti Architects - LTP/2026/0003" f="61" d="7" a="6" r="—" s="4" l="20h ago" />
                    <LtpRow name="Sunitha Varma" co="Skyline Design Studio - LTP/2026/0002" f="60" d="9" a="5" r="—" s="6" l="20h ago" />
                    <LtpRow name="Kavitha Murthy" co="Meridian Planners - LTP/2026/0004" f="59" d="6" a="8" r="—" s="5" l="20h ago" />
                    <LtpRow name="All Access Admin" co="—" f="2" d="2" a="—" r="—" s="—" l="Never" />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Officer Workload */}
            <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer">
              <h3 className="text-xs font-bold text-slate-800 mb-6">Officer Workload</h3>
              <div className="space-y-4">
                <WorkloadBar name="Unclaimed — LTP (LTP)" val={14} max={14} color="bg-slate-300" />
                <WorkloadBar name="Unclaimed — TPA (TPA)" val={12} max={14} color="bg-slate-300" />
                <WorkloadBar name="Unclaimed — ZAD (ZAD)" val={6} max={14} color="bg-slate-300" />
                <WorkloadBar name="Priya Sharma (TPA)" val={5} max={14} color="bg-blue-600" />
                <WorkloadBar name="Unclaimed — DIRECTOR_DP (DIRECTOR_DP)" val={3} max={14} color="bg-slate-300" />
                <WorkloadBar name="Meena Iyer (ZAD)" val={2} max={14} color="bg-blue-600" />
                <WorkloadBar name="Vikram Singh (ADDL_COMMISSIONER)" val={2} max={14} color="bg-blue-600" />
              </div>
            </div>

            {/* User Accounts by Role */}
            <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-800">User Accounts by Role</h3>
                <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Manage users →</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                      <th className="py-2.5 font-semibold">ROLE</th>
                      <th className="py-2.5 font-semibold text-right">ACCOUNTS</th>
                      <th className="py-2.5 font-semibold text-right">ACTIVE</th>
                      <th className="py-2.5 font-semibold text-right whitespace-nowrap">SEEN THIS WEEK</th>
                      <th className="py-2.5 font-semibold text-center whitespace-nowrap">NEVER SIGNED IN</th>
                      <th className="py-2.5 font-semibold text-right whitespace-nowrap">OPEN FILES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <RoleRow role="Viewer / Auditor (VIEWER)" a="4" act="3" s="2" n="2" o="—" />
                    <RoleRow role="Licensed Technical Person (LTP)" a="5" act="6" s="3" n="3" o="—" />
                    <RoleRow role="Town Planning Assistant (TPA)" a="5" act="4" s="3" n="2" o="6" />
                    <RoleRow role="Zonal Assistant Director (ZAD)" a="4" act="4" s="2" n="2" o="1" />
                    <RoleRow role="Zonal Deputy Director (ZDD)" a="3" act="3" s="2" n="1" o="2" />
                    <RoleRow role="Zonal Joint Director (ZJD)" a="4" act="4" s="2" n="2" o="1" />
                    <RoleRow role="Finance Officer (FINANCE_OFFICER)" a="3" act="3" s="2" n="1" o="—" />
                    <RoleRow role="Director (Development Plan) (DIRECTOR_DP)" a="3" act="3" s="3" n="—" o="1" />
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, gradient }: { label: string; value: string; icon: React.ReactNode; gradient: string }) {
  return (
    <div className={cn("group relative overflow-hidden rounded-xl border border-slate-200 p-4 shadow-sm h-[105px] transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer", gradient)}>
      <div className="flex justify-between items-start mb-1 relative z-10">
        <p className="text-[11px] font-semibold text-slate-600">{label}</p>
        <div className="size-6 rounded-md bg-white/70 flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-110">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-900 relative z-10 tabular-nums">{value}</p>
    </div>
  );
}

function PipelineBar({ label, count, color, percent }: { label: string; count: string; color: string; percent: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-medium text-slate-700">{label} <span className="float-right font-semibold text-slate-800">{count}</span></div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percent * 100}%` }}></div>
      </div>
    </div>
  );
}

function StatusRow({ label, count, percent, color }: { label: string; count: string; percent: string; color: string }) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <div className="flex items-center gap-1.5">
        <div className={cn("w-2 h-2 rounded-full", color)}></div>
        <span className="text-slate-600 truncate max-w-[140px] font-medium">{label}</span>
      </div>
      <div className="flex gap-4">
        <span className="font-semibold text-slate-800 tabular-nums">{count}</span>
        <span className="text-slate-400 w-6 text-right tabular-nums">{percent}</span>
      </div>
    </div>
  );
}

function StageBar({ label, count, color, max }: { label: string; count: string; color: string; max: number }) {
  const percent = (parseInt(count) / max) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-end">
        <div className="text-[11px] font-medium text-slate-700">{label}</div>
        <div className="text-[11px] font-semibold text-slate-800 tabular-nums">{count}</div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function DeskRow({ desk, by, files, tasks, un }: { desk: string; by: string; files: string; tasks: string; un: string }) {
  const parts1 = desk.split(" (");
  const parts2 = by.split(" (");
  return (
    <tr>
      <td className="py-2.5 max-w-[180px] font-medium text-slate-800">{parts1[0]} <span className="text-slate-400 font-normal">({parts1[1]}</span></td>
      <td className="py-2.5 text-center text-slate-500">{parts2[0]} <span className="text-slate-400 font-normal text-[9px]">({parts2[1]}</span></td>
      <td className="py-2.5 text-right font-medium text-slate-800">{files}</td>
      <td className="py-2.5 text-right font-medium text-slate-800">{tasks}</td>
      <td className="py-2.5 text-right font-medium text-amber-600">{un}</td>
      <td className="py-2.5 text-right text-slate-400">—</td>
      <td className="py-2.5 text-right text-slate-400">—</td>
    </tr>
  );
}

function LtpRow({ name, co, f, d, a, r, s, l }: { name: string; co: string; f: string; d: string; a: string; r: string; s: string; l: string }) {
  return (
    <tr>
      <td className="py-2.5 max-w-[200px]">
        <div className="font-medium text-slate-800">{name}</div>
        <div className="text-[9px] text-slate-500 truncate">{co}</div>
      </td>
      <td className="py-2.5 text-right font-medium text-slate-800 tabular-nums">{f}</td>
      <td className="py-2.5 text-right text-sky-600 font-medium tabular-nums">{d}</td>
      <td className="py-2.5 text-right text-emerald-600 font-medium tabular-nums">{a}</td>
      <td className="py-2.5 text-right text-slate-400 tabular-nums">{r}</td>
      <td className="py-2.5 text-center">
        {s !== "—" ? <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-amber-500 text-[10px] font-bold text-amber-600">{s}</span> : <span className="text-slate-400">—</span>}
      </td>
      <td className="py-2.5 text-right text-slate-500 text-[9px] whitespace-nowrap">{l}</td>
    </tr>
  );
}

function RoleRow({ role, a, act, s, n, o }: { role: string; a: string; act: string; s: string; n: string; o: string }) {
  const parts = role.split(" (");
  return (
    <tr>
      <td className="py-2.5 max-w-[200px] text-slate-800 font-medium">{parts[0]} <span className="text-slate-400 font-normal text-[9px]">({parts[1]}</span></td>
      <td className="py-2.5 text-right font-medium text-slate-800 tabular-nums">{a}</td>
      <td className="py-2.5 text-right font-medium text-slate-800 tabular-nums">{act}</td>
      <td className="py-2.5 text-right text-slate-600 tabular-nums">{s}</td>
      <td className="py-2.5 text-center">
        {n !== "—" ? <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-amber-500 text-[10px] font-bold text-amber-600">{n}</span> : <span className="text-slate-400">—</span>}
      </td>
      <td className="py-2.5 text-right font-medium text-slate-800 tabular-nums">{o}</td>
    </tr>
  );
}

function WorkloadBar({ name, val, max, color }: { name: string; val: number; max: number; color: string }) {
  const percent = (val / max) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-end">
        <div className="text-[11px] text-slate-800 font-medium">{name}</div>
        <div className="text-[11px] font-semibold text-slate-800">{val}</div>
      </div>
      <div className="h-[4px] w-full bg-slate-100 overflow-hidden rounded-none">
        <div className={cn("h-full rounded-none", color)} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function ActivityItem({ appNo, time, title, desc, user, dot }: { appNo: string; time: string; title: string; desc: string; user: string; dot: string }) {
  return (
    <div className="relative pl-5 group transition-colors hover:bg-slate-50/80 rounded-md p-1 -ml-1 cursor-pointer">
      <div className={cn("absolute -left-[22px] top-1.5 size-[11px] rounded-full border-2 border-white shadow-sm", dot)}></div>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-xs font-bold text-slate-800">{appNo}</span>
        <span className="text-[10px] text-slate-400">{time}</span>
      </div>
      <div className="text-sm font-medium text-slate-700 mb-0.5 leading-snug">{title}</div>
      <div className="text-xs text-slate-500 mb-1.5 leading-snug pr-2">{desc}</div>
      <div className="text-[10px] text-slate-400">{user}</div>
    </div>
  );
}

function PolarStatusChart() {
  const data = [
    { value: 35, id: "grad0", colorFrom: "#dbeafe", colorTo: "#3b82f6" }, // Draft — blue
    { value: 59, id: "grad1", colorFrom: "#ede9fe", colorTo: "#8b5cf6" }, // Preparing — violet
    { value: 23, id: "grad2", colorFrom: "#fef9c3", colorTo: "#eab308" }, // Awaiting payment — amber
    { value: 55, id: "grad3", colorFrom: "#e0f2fe", colorTo: "#0284c7" }, // Under review — sky
    { value: 15, id: "grad4", colorFrom: "#ffe4e6", colorTo: "#f43f5e" }, // With applicant — rose
    { value: 21, id: "grad5", colorFrom: "#d1fae5", colorTo: "#10b981" }, // Approved — emerald
  ];

  const maxVal = Math.max(...data.map(d => d.value));
  const minRadius = 25;
  const maxRadius = 90;
  const availableRadius = maxRadius - minRadius;
  const totalSlices = data.length;
  const sliceAngle = Math.PI / totalSlices;
  const cx = 100;
  const cy = 95;

  return (
    <svg viewBox="0 0 200 135" className="w-full h-auto drop-shadow-sm overflow-visible">
      <defs>
        {/* Radial gradients: light at center (cx,cy), dark at outer edge */}
        {data.map((d) => {
          const r = minRadius + Math.max(0.15, (d.value / maxVal)) * availableRadius;
          return (
            <radialGradient
              key={d.id}
              id={d.id}
              cx={cx}
              cy={cy}
              r={r}
              fx={cx}
              fy={cy}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={d.colorFrom} />
              <stop offset="100%" stopColor={d.colorTo} />
            </radialGradient>
          );
        })}
      </defs>

      {/* Background baseline */}
      <line x1="5" y1={cy} x2="195" y2={cy} stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

      {data.map((d, i) => {
        const startAngle = Math.PI - i * sliceAngle;
        const endAngle = Math.PI - (i + 1) * sliceAngle;
        const r = minRadius + Math.max(0.15, (d.value / maxVal)) * availableRadius;

        const ox1 = cx + r * Math.cos(startAngle);
        const oy1 = cy - r * Math.sin(startAngle);
        const ox2 = cx + r * Math.cos(endAngle);
        const oy2 = cy - r * Math.sin(endAngle);
        const ix1 = cx + minRadius * Math.cos(startAngle);
        const iy1 = cy - minRadius * Math.sin(startAngle);
        const ix2 = cx + minRadius * Math.cos(endAngle);
        const iy2 = cy - minRadius * Math.sin(endAngle);

        const path = `M ${ix1} ${iy1} L ${ox1} ${oy1} A ${r} ${r} 0 0 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${minRadius} ${minRadius} 0 0 0 ${ix1} ${iy1} Z`;

        return (
          <path
            key={i}
            d={path}
            fill={`url(#${d.id})`}
            stroke="white"
            strokeWidth="1"
            strokeLinejoin="round"
            className="cursor-pointer transition-all duration-200 hover:brightness-110 hover:drop-shadow-lg"
          />
        );
      })}

      {/* Center circle */}
      <circle cx={cx} cy={cy} r={16} fill="white" stroke="#f1f5f9" strokeWidth="3" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">246</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="5" fontWeight="700" fill="#94a3b8" letterSpacing="0.05em">FILES</text>
    </svg>
  );
}
function RoseStageChart() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const data = [
    { label: "Approved", value: 21, color: "#10b981", colorFrom: "#d1fae5", id: "stage0" },
    { label: "TPA", value: 18, color: "#3b82f6", colorFrom: "#dbeafe", id: "stage1" },
    { label: "With applicant", value: 14, color: "#f43f5e", colorFrom: "#ffe4e6", id: "stage2" },
    { label: "ZAD/ZDD", value: 9, color: "#8b5cf6", colorFrom: "#ede9fe", id: "stage3" },
    { label: "Director", value: 4, color: "#0ea5e9", colorFrom: "#e0f2fe", id: "stage4" },
    { label: "Addl Comr.", value: 3, color: "#eab308", colorFrom: "#fef9c3", id: "stage5" },
    { label: "ZJD", value: 2, color: "#f97316", colorFrom: "#ffedd5", id: "stage6" },
    { label: "Commissioner", value: 2, color: "#d946ef", colorFrom: "#fae8ff", id: "stage7" },
  ];

  const maxVal = Math.max(...data.map(d => d.value));
  const minR = 18;
  const maxR = 78;
  const cx = 90;
  const cy = 90;
  const sliceAngle = (2 * Math.PI) / data.length;

  return (
    <div className="flex flex-col items-center justify-between gap-2 h-full">
      <div className="flex-1 flex items-center justify-center">
        <svg viewBox="0 0 180 180" className="w-full max-w-[260px] h-auto">
          <defs>
          {data.map((d) => {
            const r = minR + (d.value / maxVal) * (maxR - minR);
            return (
              <radialGradient key={d.id} id={d.id} cx={cx} cy={cy} r={r} fx={cx} fy={cy} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={d.colorFrom} />
                <stop offset="100%" stopColor={d.color} />
              </radialGradient>
            );
          })}
          </defs>
          {data.map((d, i) => {
          const r = minR + (d.value / maxVal) * (maxR - minR);
          const startAngle = i * sliceAngle - Math.PI / 2;
          const endAngle = startAngle + sliceAngle;
          const gapAngle = 0.04;

          const x1 = cx + r * Math.cos(startAngle + gapAngle);
          const y1 = cy + r * Math.sin(startAngle + gapAngle);
          const x2 = cx + r * Math.cos(endAngle - gapAngle);
          const y2 = cy + r * Math.sin(endAngle - gapAngle);
          const xi1 = cx + minR * Math.cos(startAngle + gapAngle);
          const yi1 = cy + minR * Math.sin(startAngle + gapAngle);
          const xi2 = cx + minR * Math.cos(endAngle - gapAngle);
          const yi2 = cy + minR * Math.sin(endAngle - gapAngle);

          const path = `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${xi2} ${yi2} A ${minR} ${minR} 0 0 0 ${xi1} ${yi1} Z`;

          const midAngle = (startAngle + endAngle) / 2;
          const labelR = r * 0.65 + minR * 0.35;
          const lx = cx + labelR * Math.cos(midAngle);
          const ly = cy + labelR * Math.sin(midAngle);

          return (
            <g
              key={i}
              className="cursor-pointer transition-all duration-200 origin-center"
              style={{ filter: hoveredIndex === i ? 'brightness(1.15) drop-shadow(0 2px 6px rgba(0,0,0,0.25))' : hoveredIndex !== null ? 'opacity(0.6)' : 'none', transform: hoveredIndex === i ? 'scale(1.03)' : 'scale(1)' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <path d={path} fill={`url(#${d.id})`} stroke="white" strokeWidth="1" />
              {d.value >= 9 && (
                <text x={lx} y={ly + 3} textAnchor="middle" fontSize="7" fontWeight="600" fill="white" opacity="0.9">
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
        {/* Center circle */}
        <circle cx={cx} cy={cy} r={minR - 2} fill="white" stroke="#f1f5f9" strokeWidth="2" />
        </svg>
      </div>

      {/* Inline legend with hover highlight */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 w-full px-2">
        {data.map((d, i) => (
          <div
            key={d.label}
            className="flex items-center gap-1.5 transition-all duration-200 cursor-pointer rounded px-1"
            style={{ opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.4, fontWeight: hoveredIndex === i ? 800 : undefined }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-2 h-2 rounded-full shrink-0 transition-all duration-200" style={{ backgroundColor: d.color, transform: hoveredIndex === i ? 'scale(1.4)' : 'scale(1)' }} />
            <span className="text-[9px] font-bold text-slate-700 truncate">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineRingChart() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const cx = 100, cy = 100;
  const R = 64;
  const rW = 18;
  const guideR = R + rW / 2 + 6;

  const segments = [
    { label: "With applicant", value: 187, pct: 76, color: "#f59e0b", colorFrom: "#fef3c7", num: "01", id: "pipe0" },
    { label: "In review desk", value: 38, pct: 15, color: "#0ea5e9", colorFrom: "#e0f2fe", num: "02", id: "pipe1" },
    { label: "Closed", value: 21, pct: 9, color: "#64748b", colorFrom: "#f1f5f9", num: "03", id: "pipe2" },
  ];

  const GAP_DEG = 4;
  const total = 360;
  let currentAngle = -90;

  type SegmentData = typeof segments[0] & {
    startAngle: number; endAngle: number; midAngle: number;
    junctionAngle: number;
  };

  const placed: SegmentData[] = segments.map((s) => {
    const sweep = s.pct / 100 * (total - segments.length * GAP_DEG);
    const startAngle = currentAngle + GAP_DEG / 2;
    const endAngle = startAngle + sweep;
    const midAngle = (startAngle + endAngle) / 2;
    const junctionAngle = endAngle + GAP_DEG / 2;
    currentAngle = endAngle + GAP_DEG / 2;
    return { ...s, startAngle, endAngle, midAngle, junctionAngle };
  });

  function polarToXY(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(startDeg: number, endDeg: number, r: number) {
    const s = polarToXY(startDeg, r);
    const e = polarToXY(endDeg, r);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 h-full">
      {/* Chart */}
      <svg viewBox="0 0 200 200" className="w-full h-auto max-w-[260px] mx-auto overflow-visible">
        <defs>
          {segments.map((s) => (
            <radialGradient key={s.id} id={s.id} cx={cx} cy={cy} r={R + rW / 2} fx={cx} fy={cy} gradientUnits="userSpaceOnUse">
              <stop offset="65%" stopColor={s.colorFrom} />
              <stop offset="100%" stopColor={s.color} />
            </radialGradient>
          ))}
        </defs>
        {/* Outer guide circle */}
        <circle cx={cx} cy={cy} r={guideR} fill="none" stroke="#e2e8f0" strokeWidth="1" />

        {/* Thick colored segments */}
        {placed.map((s, i) => (
          <path
            key={s.num}
            d={arcPath(s.startAngle, s.endAngle, R)}
            fill="none"
            stroke={`url(#${s.id})`}
            strokeWidth={hoveredIndex === i ? rW + 4 : rW}
            strokeLinecap="round"
            className="cursor-pointer transition-all duration-200"
            style={{ filter: hoveredIndex === i ? 'brightness(1.15) drop-shadow(0 2px 8px rgba(0,0,0,0.3))' : hoveredIndex !== null ? 'opacity(0.6)' : 'none' }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* Numbered junction dots */}
        {placed.map((s) => {
          const pos = polarToXY(s.junctionAngle, guideR);
          return (
            <g key={`dot-${s.num}`}>
              <circle cx={pos.x} cy={pos.y} r={8} fill={s.color} />
              <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fontSize="6" fontWeight="700" fill="white">
                {s.num}
              </text>
            </g>
          );
        })}

        {/* Center */}
        <circle cx={cx} cy={cy} r={R - rW / 2 - 3} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a">246</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="5.5" fontWeight="600" fill="#94a3b8" letterSpacing="0.5">TOTAL</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="4.5" fontWeight="400" fill="#cbd5e1" letterSpacing="0.5">PIPELINE</text>
      </svg>

      {/* Legend at bottom */}
      <div className="w-full space-y-1.5 px-1">
        {placed.map((s, i) => (
          <div
            key={s.num}
            className="flex items-center justify-center gap-4 cursor-pointer rounded px-1 transition-all duration-200"
            style={{ opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.4 }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[8px] font-bold shrink-0 transition-all duration-200"
                style={{ backgroundColor: s.color, transform: hoveredIndex === i ? 'scale(1.3)' : 'scale(1)' }}
              >{s.num}</span>
              <span className="text-[10px] font-bold" style={{ color: hoveredIndex === i ? s.color : '#1e293b' }}>{s.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-800">{s.value}</span>
              <span className="text-[9px] text-slate-400 font-medium">{s.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
