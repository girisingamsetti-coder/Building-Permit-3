"use client";
import * as React from "react";
import { useAppStore } from "@/store/app-store";
import { Settings, User, Shield, Phone, Mail, Building, Briefcase, Hash } from "lucide-react";
import { RoleBadge } from "@/components/design-system/badges";

/** Lightweight settings/profile view for officer roles — styled in beige & maroon theme. */
export function OfficerSettings() {
  const user = useAppStore((s) => s.user);

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="flex items-center justify-between rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#801824] text-[#FDF6ED] shadow-xs">
            <Settings className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#801824]">Account Settings &amp; Profile</h1>
            <p className="text-xs text-[#5C1A20]">Officer account credentials, role assignment, and jurisdictional details.</p>
          </div>
        </div>
      </div>

      <ProfileCard user={user} />
    </div>
  );
}

function ProfileCard({ user }: { user: any }) {
  return (
    <div className="rounded-xl border-2 border-[#801824]/20 bg-white shadow-xs overflow-hidden">
      <div className="bg-[#F5EBE1] border-b border-[#DCD5C8] px-5 py-4 flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#801824] text-[#FDF6ED] shadow-xs">
          <User className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#801824]">Officer Profile</h2>
          <p className="text-xs text-[#5C1A20]">Personal and administrative details assigned by the authority.</p>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-3.5">
            <p className="text-[11px] uppercase text-[#5C1A20] font-bold mb-1 flex items-center gap-1.5">
              <User className="size-3 text-[#801824]" /> Full Name
            </p>
            <p className="font-bold text-sm text-[#4A1017]">{user?.name ?? "—"}</p>
          </div>

          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-3.5">
            <p className="text-[11px] uppercase text-[#5C1A20] font-bold mb-1 flex items-center gap-1.5">
              <Shield className="size-3 text-[#801824]" /> Role
            </p>
            <div className="pt-0.5">{user && <RoleBadge role={user.role} />}</div>
          </div>

          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-3.5">
            <p className="text-[11px] uppercase text-[#5C1A20] font-bold mb-1 flex items-center gap-1.5">
              <Mail className="size-3 text-[#801824]" /> Email Address
            </p>
            <p className="font-semibold text-xs text-[#4A1017] truncate">{user?.email ?? "—"}</p>
          </div>

          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-3.5">
            <p className="text-[11px] uppercase text-[#5C1A20] font-bold mb-1 flex items-center gap-1.5">
              <Phone className="size-3 text-[#801824]" /> Phone Number
            </p>
            <p className="font-semibold text-xs text-[#4A1017]">{user?.phone ?? "—"}</p>
          </div>

          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-3.5">
            <p className="text-[11px] uppercase text-[#5C1A20] font-bold mb-1 flex items-center gap-1.5">
              <Hash className="size-3 text-[#801824]" /> Employee ID
            </p>
            <p className="font-mono font-bold text-xs text-[#801824]">{user?.employeeId ?? "—"}</p>
          </div>

          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-3.5">
            <p className="text-[11px] uppercase text-[#5C1A20] font-bold mb-1 flex items-center gap-1.5">
              <Building className="size-3 text-[#801824]" /> Zone / Office
            </p>
            <p className="font-semibold text-xs text-[#4A1017]">{user?.zone ?? "—"}</p>
          </div>

          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-3.5">
            <p className="text-[11px] uppercase text-[#5C1A20] font-bold mb-1 flex items-center gap-1.5">
              <Briefcase className="size-3 text-[#801824]" /> Department
            </p>
            <p className="font-semibold text-xs text-[#4A1017]">{user?.department ?? "—"}</p>
          </div>

          <div className="rounded-xl border border-[#EADBCE] bg-[#FAF7F2] p-3.5">
            <p className="text-[11px] uppercase text-[#5C1A20] font-bold mb-1 flex items-center gap-1.5">
              <Briefcase className="size-3 text-[#801824]" /> Designation
            </p>
            <p className="font-semibold text-xs text-[#4A1017]">{user?.designation ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
