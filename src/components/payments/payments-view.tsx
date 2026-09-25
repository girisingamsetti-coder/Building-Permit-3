"use client";

import * as React from "react";
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Receipt,
  Download,
  Building,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
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
import { MOCK_PAYMENTS_REGISTER, type PaymentRegisterRecord } from "@/data/modules-data";
import { useToast } from "@/hooks/use-toast";

export function PaymentsView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentRegisterRecord | null>(null);
  const [isReconciling, setIsReconciling] = React.useState(false);
  const { toast } = useToast();

  const payments = MOCK_PAYMENTS_REGISTER;

  const handleReconcile = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
      toast({
        title: "Reconciliation Complete",
        description: "All bank gateway settlement logs synchronized. No discrepancy found.",
      });
    }, 1200);
  };

  const filtered = React.useMemo(() => {
    return payments.filter((item) => {
      const matchSearch =
        item.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gatewayRef.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const kpis = React.useMemo(() => {
    return {
      received: payments.filter((p) => p.status === "SUCCESS").reduce((acc, curr) => acc + curr.amount, 0),
      countReceived: payments.filter((p) => p.status === "SUCCESS").length,
      inFlight: payments.filter((p) => p.status === "PROCESSING" || p.status === "INITIATED").length,
      failed: payments.filter((p) => p.status === "FAILED" || p.status === "TIMEOUT").length,
    };
  }, [payments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CreditCard className="size-6" />
            </div>
            Payments & Fee Collection Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ULB revenue ledger — Challan generation, payment gateways, head-wise fee breakdowns, and daily reconciliation.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleReconcile}
          disabled={isReconciling}
          className="gap-2 text-xs h-9"
        >
          <RefreshCw className={cn("size-3.5", isReconciling && "animate-spin")} />
          {isReconciling ? "Reconciling Bank..." : "Gateway Reconciliation"}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "SUCCESS" ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("SUCCESS")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Total Realised Revenue
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{kpis.received.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            {kpis.countReceived} successful challan transactions
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "PROCESSING" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("PROCESSING")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" /> Awaiting Confirmation
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.inFlight}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Money in transit / bank webhook pending
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all border shadow-sm hover:shadow-md",
            statusFilter === "FAILED" ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/30" : "bg-card"
          )}
          onClick={() => setStatusFilter("FAILED")}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-medium flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <AlertTriangle className="size-3.5" /> Failed or Timed Out
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">{kpis.failed}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-[11px] text-muted-foreground">
            Dropped sessions or gateway errors
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search txn #, challan #, payer name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="size-3.5" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-input bg-background px-3 py-1 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success / Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Txn # / Challan #</th>
                <th className="py-3 px-4">App # & Payer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Gateway Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-foreground font-semibold">{item.transactionId}</div>
                      <div className="text-muted-foreground text-[11px]">{item.challanNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{item.payerName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{item.applicationNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-bold text-foreground">₹{item.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">{item.feeBreakdown.length} line items</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {item.paymentMode.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {item.gatewayRef}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          item.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : item.status === "PROCESSING"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        )}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPayment(item)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Receipt className="size-3.5" /> Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Receipt className="size-5 text-emerald-600" />
                  E-Receipt & Challan Breakup
                </DialogTitle>
                <Badge
                  className={cn(
                    "text-xs px-2.5 py-0.5",
                    selectedPayment.status === "SUCCESS" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                  )}
                >
                  {selectedPayment.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs font-mono">
                Challan #{selectedPayment.challanNumber} · Txn #{selectedPayment.transactionId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payer / Applicant:</span>
                  <span className="font-semibold text-foreground">{selectedPayment.payerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Application Number:</span>
                  <span className="font-mono text-foreground">{selectedPayment.applicationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Mode:</span>
                  <span className="font-medium text-foreground">{selectedPayment.paymentMode.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gateway Ref:</span>
                  <span className="font-mono text-foreground">{selectedPayment.gatewayRef}</span>
                </div>
                {selectedPayment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid Timestamp:</span>
                    <span className="font-medium text-foreground">{selectedPayment.paidAt}</span>
                  </div>
                )}
              </div>

              {/* Head-wise fee breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-foreground">Statutory Fee Breakdown:</h4>
                <div className="border rounded-lg divide-y">
                  {selectedPayment.feeBreakdown.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <span className="text-muted-foreground">{item.head}</span>
                      <span className="font-semibold text-foreground">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="p-2.5 flex items-center justify-between bg-muted/30 font-bold text-sm">
                    <span>Total Remitted</span>
                    <span className="text-emerald-600">₹{selectedPayment.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedPayment(null)}>
                  Close
                </Button>
                <Button size="sm" className="gap-1.5">
                  <Download className="size-3.5" /> Download Tax Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
