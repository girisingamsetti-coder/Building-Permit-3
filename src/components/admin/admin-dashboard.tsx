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

export function AdminDashboard() {
  const { navigate } = useAppStore();

  return (
    <div className="bg-[#F8F9FB] min-h-screen text-slate-800 font-sans px-2 py-4 pb-20">

      <div className="flex flex-col xl:flex-row gap-3">
        
        {/* Main Content Area (Left 75%) */}
        <div className="flex-1 space-y-4">
          
          {/* Applications Row */}
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">APPLICATIONS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <KpiCard label="Total applications" value="246" icon={<FileStack className="size-4 text-blue-500" />} gradient="bg-gradient-to-tr from-cyan-100/80 via-white to-white" />
              <KpiCard label="In progress" value="190" icon={<Activity className="size-4 text-blue-600" />} gradient="bg-gradient-to-tr from-blue-200/60 via-white to-white" />
              <KpiCard label="Approved" value="21" icon={<CheckCircle2 className="size-4 text-emerald-500" />} gradient="bg-gradient-to-tr from-emerald-100/80 via-white to-white" />
              <KpiCard label="Rejected" value="0" icon={<XCircle className="size-4 text-rose-500" />} gradient="bg-gradient-to-tr from-rose-100/80 via-white to-white" />
            </div>
          </div>

          {/* Workflow Row */}
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">WORKFLOW</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <KpiCard label="Open shortfalls" value="18" icon={<AlertTriangle className="size-4 text-amber-500" />} gradient="bg-gradient-to-tr from-amber-100/80 via-white to-white" />
              <KpiCard label="Overdue tasks" value="0" icon={<Clock className="size-4 text-rose-500" />} gradient="bg-gradient-to-tr from-rose-100/80 via-white to-white" />
              <KpiCard label="Due soon" value="0" icon={<Timer className="size-4 text-amber-500" />} gradient="bg-gradient-to-tr from-amber-100/80 via-white to-white" />
              <KpiCard label="Average time to decide" value="0 d" icon={<PieChart className="size-4 text-indigo-500" />} gradient="bg-gradient-to-tr from-indigo-100/60 via-white to-white" />
            </div>
          </div>

          {/* Revenue Row */}
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">REVENUE</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <KpiCard label="Fees generated" value="₹1.66 Cr" icon={<CircleDollarSign className="size-4 text-amber-500" />} gradient="bg-gradient-to-tr from-purple-100/80 via-white to-white" />
              <KpiCard label="Fees collected" value="₹1.16 Cr" icon={<Wallet className="size-4 text-emerald-500" />} gradient="bg-gradient-to-tr from-emerald-100/80 via-white to-white" />
              <KpiCard label="Pending fee" value="₹50.28 L" icon={<Receipt className="size-4 text-rose-500" />} gradient="bg-gradient-to-tr from-pink-100/80 via-white to-white" />
              <KpiCard label="Payment success rate" value="76.8%" icon={<TrendingUp className="size-4 text-emerald-500" />} gradient="bg-gradient-to-tr from-cyan-100/80 via-white to-white" />
            </div>
          </div>
        </div>

        {/* Right Sidebar (Recent Activity) - 25% width */}
        <div className="hidden xl:block w-72 shrink-0 relative">
          <div className="absolute inset-0">
            <div className="border border-slate-200 bg-white rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
              <h3 className="text-sm font-bold text-slate-800 p-5 pb-3 shrink-0">Recent Activity</h3>
              
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                <div className="relative border-l-2 border-slate-100 ml-2 space-y-6 pb-2 pt-1">
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
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="space-y-4 mt-6">
        
        {/* Analytics & Visual Overview */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">ANALYTICS & VISUAL OVERVIEW</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
              
              <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm relative">
                <h3 className="text-xs font-bold text-slate-800 mb-6">The pipeline, end to end</h3>
                <div className="flex justify-center mt-12 mb-4">
                  <div className="relative size-32">
                    <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="16" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0ea5e9" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="188.4" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="226.08" className="rotate-[90deg] origin-center" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-slate-800">246</span>
                      <span className="text-[10px] font-bold text-slate-500">TOTAL</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div><span className="text-slate-600">With applicant</span></div>
                    <div className="flex gap-4"><span className="font-semibold text-slate-800">187</span><span className="text-slate-400 w-6 text-right">76%</span></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500"></div><span className="text-slate-600">In review desk</span></div>
                    <div className="flex gap-4"><span className="font-semibold text-slate-800">38</span><span className="text-slate-400 w-6 text-right">15%</span></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-slate-600">Closed</span></div>
                    <div className="flex gap-4"><span className="font-semibold text-slate-800">21</span><span className="text-slate-400 w-6 text-right">9%</span></div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 mb-4">Applicant-Side Pipeline</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-slate-800">187</span>
                  <span className="text-xs text-slate-500">files waiting on somebody outside the department</span>
                </div>
                
                <div className="space-y-4">
                  <PipelineBar label="Draft — not yet filed" count="35" color="bg-slate-400" percent={35/187} />
                  <PipelineBar label="Filed, awaiting a drawing" count="20" color="bg-slate-500" percent={20/187} />
                  <PipelineBar label="In automated scrutiny" count="33" color="bg-sky-500" percent={33/187} />
                  <PipelineBar label="Scrutiny failed — correction due" count="19" color="bg-rose-500" percent={19/187} />
                  <PipelineBar label="Documents outstanding" count="40" color="bg-amber-500" percent={40/187} />
                  <PipelineBar label="Awaiting payment" count="18" color="bg-amber-600" percent={18/187} />
                  <PipelineBar label="Payment declined" count="8" color="bg-rose-600" percent={8/187} />
                  <PipelineBar label="Returned on a shortfall" count="14" color="bg-rose-400" percent={14/187} />
                  <PipelineBar label="Answered — awaiting an officer" count="2" color="bg-slate-300" percent={2/187} />
                </div>
              </div>

              <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-slate-800">Applications by status</h3>
                  <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Open the register →</a>
                </div>
                
                <div className="flex justify-center mt-6 mb-8">
                  <div className="relative size-32">
                    <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94a3b8" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="216.03" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="190.91" className="rotate-[50.4deg] origin-center" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="227.75" className="rotate-[136.8deg] origin-center" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0ea5e9" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="195.93" className="rotate-[169.2deg] origin-center" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="235.87" className="rotate-[248.4deg] origin-center" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="229.84" className="rotate-[270deg] origin-center" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-slate-800">246</span>
                      <span className="text-[10px] font-bold text-slate-500">FILES</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <StatusRow label="Draft" count="35" percent="14%" color="bg-slate-400" />
                  <StatusRow label="Preparing (drawings, documents)" count="59" percent="24%" color="bg-purple-500" />
                  <StatusRow label="Awaiting payment" count="23" percent="9%" color="bg-amber-500" />
                  <StatusRow label="Under departmental review" count="55" percent="22%" color="bg-sky-500" />
                  <StatusRow label="With the applicant (shortfall)" count="15" percent="6%" color="bg-rose-500" />
                  <StatusRow label="Approved" count="21" percent="9%" color="bg-emerald-500" />
                </div>
              </div>

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 mb-6">Applications by stage</h3>
              <div className="space-y-4 flex-1">
                <StageBar label="Approved" count="21" color="bg-emerald-500" max={21} />
                <StageBar label="TPA" count="18" color="bg-sky-500" max={21} />
                <StageBar label="With applicant" count="14" color="bg-rose-600" max={21} />
                <StageBar label="ZAD/ZDD" count="9" color="bg-sky-600" max={21} />
                <StageBar label="Director" count="4" color="bg-slate-400" max={21} />
                <StageBar label="Addl Commissioner" count="3" color="bg-slate-300" max={21} />
                <StageBar label="ZJD" count="2" color="bg-slate-200" max={21} />
                <StageBar label="Commissioner" count="2" color="bg-slate-100" max={21} />
              </div>
            </div>

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-slate-800">Fees and collection</h3>
                <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Register →</a>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-600">Collected of raised</span>
                  <span className="font-bold text-slate-800">₹1,15,86,190</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[70%]"></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">70%</div>
              </div>

              <div className="space-y-4 flex-1">
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

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 mb-6">Payment attempts</h3>
              
              <div className="flex items-baseline gap-2 mb-8 mt-2">
                <span className="text-3xl font-bold text-slate-800">76.8%</span>
                <span className="text-xs text-slate-500">settlement rate</span>
              </div>

              <div className="space-y-4 flex-1">
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

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 mb-6">Automated scrutiny</h3>
              
              <div className="flex justify-center mb-6">
                <div className="relative size-28">
                  <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="75.36" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="175.84" className="rotate-[252deg] origin-center" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-slate-800">499</span>
                    <span className="text-[10px] font-bold text-slate-500">RUNS</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-6">
                <StatusRow label="Passed" count="348" percent="70%" color="bg-emerald-500" />
                <StatusRow label="Failed" count="150" percent="30%" color="bg-rose-500" />
                <StatusRow label="Running" count="1" percent="0%" color="bg-slate-400" />
              </div>
              
              <div className="space-y-2 mt-auto border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-amber-600">Correction due</span>
                  <span className="font-bold text-amber-600">19</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-rose-600">Critical findings</span>
                  <span className="font-bold text-rose-600">104</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-800">Major findings</span>
                  <span className="font-bold text-slate-800">221</span>
                </div>
              </div>
            </div>

            <div className="col-span-1 border border-slate-200 bg-white rounded-xl p-4 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-slate-800">Shortfalls</h3>
                <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Register →</a>
              </div>
              
              <div className="space-y-6 mb-8">
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
              
              <div className="space-y-4 mt-auto">
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
              <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm">
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
              <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm">
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
              <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm">
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
              <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm">
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
    <div className={cn("relative overflow-hidden rounded-xl border border-slate-200 p-4 shadow-sm h-24", gradient)}>
      <div className="flex justify-between items-start mb-1 relative z-10">
        <p className="text-[11px] font-semibold text-slate-600">{label}</p>
        <div className="size-6 rounded-md bg-white/70 flex items-center justify-center shadow-sm">{icon}</div>
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
    <div className="relative pl-5">
      <div className={cn("absolute -left-[22px] top-1.5 size-[11px] rounded-full border-2 border-white shadow-sm", dot)}></div>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-[10px] font-bold text-slate-800">{appNo}</span>
        <span className="text-[9px] text-slate-400">{time}</span>
      </div>
      <div className="text-[11px] font-medium text-slate-700 mb-0.5 leading-snug">{title}</div>
      <div className="text-[10px] text-slate-500 mb-1.5 leading-snug pr-2">{desc}</div>
      <div className="text-[9px] text-slate-400">{user}</div>
    </div>
  );
}
