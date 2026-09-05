"use client";
import * as React from "react";
import { useAppStore } from "@/store/app-store";
import { PageHeader, SectionCard, EmptyState } from "@/components/design-system/layout";
import { StatusBadge } from "@/components/design-system/badges";
import { formatDate } from "@/components/design-system/workflow";
import { CreditCard, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function OfficerPayments() {
  const applications = useAppStore((s) => s.applications);
  const [search, setSearch] = React.useState("");

  const appsWithPayments = React.useMemo(() =>
    applications.filter((a) => a.payment && a.payment.status !== "PENDING" || a.fee)
      .filter((a) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return a.applicationNo.toLowerCase().includes(q) || a.applicant.name.toLowerCase().includes(q);
      }),
    [applications, search]
  );

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="Payments"
        description="Payment status across all applications."
        icon={CreditCard}
      />
      <SectionCard>
        <div className="mb-4 relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search applications…"
            className="pl-8 h-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {appsWithPayments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payment records" description="No payment activity found." />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Application</th>
                  <th className="px-3 py-2 font-medium">Applicant</th>
                  <th className="px-3 py-2 font-medium">Fee Amount</th>
                  <th className="px-3 py-2 font-medium">Payment</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appsWithPayments.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/20">
                    <td className="px-3 py-2 font-mono text-[11px]">{a.applicationNo}</td>
                    <td className="px-3 py-2">{a.applicant.name}</td>
                    <td className="px-3 py-2">
                      {a.fee ? `₹${a.fee.total.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {a.payment?.status === "SUCCESS"
                        ? <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">Paid</Badge>
                        : a.payment?.status === "PENDING"
                        ? <Badge className="bg-amber-500/10 text-amber-600 text-[10px]">Pending</Badge>
                        : <Badge variant="outline" className="text-[10px]">—</Badge>}
                    </td>
                    <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
