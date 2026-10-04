/**
 * useModuleAccess – returns the access level for the current user's role
 * on a given module, as configured by the Admin in Settings → Access Control.
 *
 * Access levels:
 *   "full"  – user can perform all actions in this module
 *   "read"  – user can view but action buttons are hidden
 *   "none"  – user has no interactive access (view-only indicator shown)
 *
 * Default (when no config exists): "full"
 */
import { useAppStore } from "@/store/app-store";
import type { ModuleAccessLevel } from "@/types";

export function useModuleAccess(moduleId: string): ModuleAccessLevel {
  const user = useAppStore((s) => s.user);
  const roleAccessConfig = useAppStore((s) => s.systemSettings?.roleAccessConfig);
  const userAccessConfig = useAppStore((s) => s.systemSettings?.userAccessConfig);

  if (!user) return "full";
  // User-specific override takes precedence if configured
  if (user.id && userAccessConfig?.[user.id]?.[moduleId]) {
    return userAccessConfig[user.id][moduleId];
  }
  if (!user.role) return "full";
  return roleAccessConfig?.[user.role]?.[moduleId] ?? "full";
}

/** Returns true if the current user has full or read access (i.e. can at least view) */
export function useCanView(moduleId: string): boolean {
  const level = useModuleAccess(moduleId);
  return level !== "none";
}

/** Returns true if the current user has full access (can perform write actions) */
export function useCanAct(moduleId: string): boolean {
  const level = useModuleAccess(moduleId);
  return level === "full";
}
