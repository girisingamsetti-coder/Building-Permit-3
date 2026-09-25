"use client";

import * as React from "react";
import {
  ListChecks,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Flame,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MOCK_TASKS, type WorkflowTaskRecord } from "@/data/modules-data";
import { useToast } from "@/hooks/use-toast";

export function TasksView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL");
  const [tasks, setTasks] = React.useState<WorkflowTaskRecord[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = React.useState<WorkflowTaskRecord | null>(null);
  const { toast } = useToast();

  const handleClaim = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "HELD_BY_ME", assigneeName: "You (Claimed)" } : t
      )
    );
    toast({
      title: "Task Claimed",
      description: "File successfully locked to your desk queue.",
    });
  };

  const filtered = React.useMemo(() => {
    return tasks.filter((item) => {
      const matchSearch =
        item.taskNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.siteAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchPriority = priorityFilter === "ALL" || item.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const kpis = React.useMemo(() => {
    return {
      total: tasks.length,
      held: tasks.filter((t) => t.status === "HELD_BY_ME").length,
      dueSoon: tasks.filter((t) => t.status === "DUE_SOON").length,
      overdue: tasks.filter((t) => t.status === "OVERDUE").length,
    };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ListChecks className="size-6" />
            </div>
            Officer Workflow Tasks Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Active workflow queue — claimable desk actions, technical reviews, scrutiny sign-offs, and SLA countdowns.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "ALL" ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("ALL")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium">At Your Desk</CardDescription>
            <CardTitle className="text-2xl font-bold">{kpis.total}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Total active files in queue
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "HELD_BY_ME" ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("HELD_BY_ME")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <UserCheck className="size-3.5" /> Held by You
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">{kpis.held}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Claimed and locked to your desk
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "DUE_SOON" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("DUE_SOON")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" /> Due Soon
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.dueSoon}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Within 48h SLA deadline
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "OVERDUE" ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("OVERDUE")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <Flame className="size-3.5" /> Overdue
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">{kpis.overdue}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Exceeded citizen charter SLA
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search task #, title, application…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-input bg-background px-3 py-1 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-input bg-background px-3 py-1 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="HELD_BY_ME">Held by Me</option>
            <option value="AT_DESK">At Desk</option>
            <option value="DUE_SOON">Due Soon</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Task # / App #</th>
                <th className="py-3 px-4">Action Required</th>
                <th className="py-3 px-4">Applicant & Site</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Due Date / SLA</th>
                <th className="py-3 px-4">Desk Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No tasks found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-foreground font-semibold">{item.taskNumber}</div>
                      <div className="text-muted-foreground text-[11px]">{item.applicationNumber}</div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-foreground">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground">Stage: {item.stage}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-foreground">{item.applicantName}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{item.siteAddress}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.priority === "CRITICAL"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : item.priority === "HIGH"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                        )}
                      >
                        {item.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-foreground font-medium">{item.dueDate}</div>
                      <div
                        className={cn(
                          "text-[10px] font-semibold",
                          item.daysRemaining < 0
                            ? "text-red-600"
                            : item.daysRemaining <= 2
                            ? "text-amber-600"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.daysRemaining < 0
                          ? `${Math.abs(item.daysRemaining)}d Overdue`
                          : `${item.daysRemaining} days left`}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] font-semibold uppercase",
                          item.status === "HELD_BY_ME"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : item.status === "OVERDUE"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.status.replace(/_/g, " ")}
                      </Badge>
                      {item.assigneeName && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">{item.assigneeName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== "HELD_BY_ME" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => handleClaim(item.id, e)}
                            className="h-8 text-xs font-semibold"
                          >
                            Claim
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTask(item)}
                          className="h-8 text-xs gap-1"
                        >
                          <Eye className="size-3.5" /> Open
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <ListChecks className="size-5 text-primary" />
                {selectedTask.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Task #{selectedTask.taskNumber} · Application #{selectedTask.applicationNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workflow Stage:</span>
                  <span className="font-semibold text-foreground">{selectedTask.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Role:</span>
                  <span className="text-foreground">{selectedTask.assignedRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applicant Name:</span>
                  <span className="font-medium text-foreground">{selectedTask.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Site Address:</span>
                  <span className="text-foreground">{selectedTask.siteAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SLA Deadline:</span>
                  <span className="font-bold text-foreground">{selectedTask.dueDate}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
                  Close
                </Button>
                {selectedTask.status !== "HELD_BY_ME" ? (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      handleClaim(selectedTask.id, e);
                      setSelectedTask(null);
                    }}
                  >
                    Claim Task & Open File
                  </Button>
                ) : (
                  <Button size="sm">Proceed to Review File</Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
