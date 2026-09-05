"use client";
import * as React from "react";
import { useAppStore } from "@/store/app-store";
import { PageHeader, SectionCard } from "@/components/design-system/layout";
import { Settings, User, Shield, Bell } from "lucide-react";
import { RoleBadge } from "@/components/design-system/badges";

/** Lightweight settings/profile view for officer roles — shows profile info and notification preferences. */
export function OfficerSettings() {
  const user = useAppStore((s) => s.user);

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="Settings"
        description="Your account profile and preferences."
        icon={Settings}
      />
      <SectionCard title="Profile">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium mb-0.5">Full Name</p>
            <p className="font-medium">{user?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium mb-0.5">Role</p>
            {user && <RoleBadge role={user.role} />}
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium mb-0.5">Email</p>
            <p>{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium mb-0.5">Phone</p>
            <p>{user?.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium mb-0.5">Employee ID</p>
            <p className="font-mono">{user?.employeeId ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium mb-0.5">Zone / Office</p>
            <p>{user?.zone ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium mb-0.5">Department</p>
            <p>{user?.department ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground font-medium mb-0.5">Designation</p>
            <p>{user?.designation ?? "—"}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
