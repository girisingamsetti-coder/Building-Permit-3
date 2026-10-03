import type { Application, User, RoleKey } from "@/types";

export interface DashboardScope {
  user: User;
  role: RoleKey;
  applications: Application[];      // scoped applications
  users: User[];                     // scoped users (officers relevant to the scope)
  projectIds: string[];              // project identifiers in scope (empty = all)
  isGlobal: boolean;                 // true for ADMIN (org-wide)
}

export function normalizeZone(z?: string): string {
  if (!z) return "";
  const s = z.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (s.includes("zone1") || (s.includes("zonei") && !s.includes("zoneii") && !s.includes("zoneiii") && !s.includes("zoneiv"))) return "Zone 1";
  if (s.includes("zone2") || s.includes("zoneii")) return "Zone 2";
  if (s.includes("zone3") || s.includes("zoneiii")) return "Zone 3";
  if (s.includes("1")) return "Zone 1";
  if (s.includes("2")) return "Zone 2";
  if (s.includes("3")) return "Zone 3";
  return z.trim();
}

/**
 * Resolve the dashboard data scope for a given user.
 * Returns the scoped applications + users that the user is authorized to see.
 *
 * This is the SINGLE source of truth for dashboard and role-based data scoping.
 * LTP: own applications only (20-28 apps).
 * TPA: all applications under this TPA (e.g. 71 for TPA-01).
 * Zonal: all applications under the officer's Zone (e.g. 135 for Zone 1).
 * Commissioner / Addl. Commissioner / Admin: consolidated 410 applications.
 */
export function getDashboardScope(user: User | null, allApps: Application[], allUsers: User[] = []): DashboardScope {
  if (!user) {
    return { user: {} as User, role: "LTP", applications: [], users: [], projectIds: [], isGlobal: false };
  }

  // ---- 1. COMMISSIONER, ADDITIONAL_COMMISSIONER, ADMIN: Consolidated data across all 3 Zones ----
  if (user.role === "ADMIN" || user.role === "COMMISSIONER" || user.role === "ADDITIONAL_COMMISSIONER") {
    return {
      user,
      role: user.role,
      applications: allApps,
      users: allUsers,
      projectIds: [],
      isGlobal: true,
    };
  }

  // ---- 2. ZONAL OFFICERS (ZDD, ZJD, ZONAL_HEAD, DIRECTOR): All TPAs and LTPs within their Zone ----
  if (user.role === "ZDD" || user.role === "ZJD" || user.role === "ZONAL_HEAD" || user.role === "DIRECTOR") {
    const userZone = normalizeZone(user.zone || "Zone 1");
    const scopedApps = allApps.filter((a) => {
      const appZone = normalizeZone(a.zone || a.project?.zone);
      return appZone === userZone;
    });

    const scopedUsers = allUsers.filter(
      (u) => !u.zone || normalizeZone(u.zone) === userZone || u.role === "LTP"
    );

    return {
      user,
      role: user.role,
      applications: scopedApps,
      users: scopedUsers,
      projectIds: [],
      isGlobal: false,
    };
  }

  // ---- 3. TPA: All applications from LTPs mapped to this TPA ----
  if (user.role === "TPA") {
    const scopedApps = allApps.filter((a) => {
      if (a.tpaId && (a.tpaId === user.id || a.tpaId === user.employeeId)) return true;
      if (a.tpaName && user.name && a.tpaName.toLowerCase() === user.name.toLowerCase()) return true;
      return false;
    });

    const scopedUsers = allUsers.filter(
      (u) => u.id === user.id || (u.role === "LTP" && scopedApps.some((a) => a.ltpId === u.id))
    );

    return {
      user,
      role: user.role,
      applications: scopedApps,
      users: scopedUsers,
      projectIds: [],
      isGlobal: false,
    };
  }

  // ---- 4. LTP: Own LTP applications only ----
  if (user.role === "LTP") {
    const scopedApps = allApps.filter((a) => {
      if (a.ltpId && (a.ltpId === user.id || a.ltpId === user.employeeId)) return true;
      if (a.ltpName && user.name && a.ltpName.toLowerCase() === user.name.toLowerCase()) return true;
      return false;
    });

    return {
      user,
      role: "LTP",
      applications: scopedApps,
      users: [user],
      projectIds: [],
      isGlobal: false,
    };
  }

  // Fallback
  return {
    user,
    role: user.role,
    applications: allApps,
    users: allUsers,
    projectIds: [],
    isGlobal: false,
  };
}
