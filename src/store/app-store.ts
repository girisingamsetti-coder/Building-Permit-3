"use client";

import { create } from "zustand";
import type {
  Application,
  NotificationRecord,
  Portal,
  RoleKey,
  User,
  ViewKey,
} from "@/types";
import {
  APPLICATIONS,
  NOTIFICATIONS,
  USERS,
} from "@/data/mock-data";

// Demo credentials (clearly mock — not real auth)
export const DEMO_CREDENTIALS: {
  role: RoleKey;
  email: string;
  password: string;
  label: string;
}[] = [
  { role: "LTP", email: "ltp@demo.gov.in", password: "demo1234", label: "LTP — Applicant Portal" },
  { role: "TPS", email: "tps@demo.gov.in", password: "demo1234", label: "TPS — Town Planning Supervisor" },
  { role: "ZDD", email: "zdd@demo.gov.in", password: "demo1234", label: "ZDD — Zonal Deputy Director" },
  { role: "ZJD", email: "zjd@demo.gov.in", password: "demo1234", label: "ZJD — Zonal Joint Director" },
  { role: "DIRECTOR_DP", email: "director@demo.gov.in", password: "demo1234", label: "Director — Town & Country Planning" },
  { role: "COMMISSIONER", email: "commissioner@demo.gov.in", password: "demo1234", label: "Commissioner" },
  { role: "ADMIN", email: "admin@demo.gov.in", password: "demo1234", label: "System Administrator" },
];

export function portalForRole(role: RoleKey): Portal {
  if (role === "ADMIN") return "ADMIN";
  if (role === "LTP") return "LTP";
  return "OFFICER";
}

export function defaultViewForPortal(portal: Portal): ViewKey {
  if (portal === "LTP") return "ltp-dashboard";
  if (portal === "OFFICER") return "officer-dashboard";
  return "admin-dashboard";
}

interface AppState {
  // auth
  user: User | null;
  isAuthenticated: boolean;
  authStage: "login" | "forgot" | "otp" | "authenticating";
  pendingEmail?: string;
  // routing
  view: ViewKey;
  portal: Portal;
  selectedApplicationId: string | null;
  // data
  applications: Application[];
  notifications: NotificationRecord[];
  // sidebar
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  theme: "light" | "dark";
  // actions
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginAsRole: (role: RoleKey) => void;
  logout: () => void;
  setAuthStage: (s: AppState["authStage"]) => void;
  setPendingEmail: (e: string) => void;
  navigate: (view: ViewKey) => void;
  openApplication: (id: string, view?: ViewKey) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setMobileNavOpen: (v: boolean) => void;
  toggleTheme: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  pushNotification: (n: NotificationRecord) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  authStage: "login",
  pendingEmail: undefined,
  view: "login",
  portal: "LTP",
  selectedApplicationId: null,
  applications: APPLICATIONS,
  notifications: NOTIFICATIONS,
  sidebarCollapsed: false,
  mobileNavOpen: false,
  theme: "light",

  login: (email, password) => {
    const cred = DEMO_CREDENTIALS.find((c) => c.email === email.trim().toLowerCase());
    if (!cred) return { ok: false, error: "No account found with this email." };
    if (password !== cred.password) return { ok: false, error: "Incorrect password. Please try again." };
    const user = USERS.find((u) => u.role === cred.role)!;
    const portal = portalForRole(cred.role);
    set({
      user,
      isAuthenticated: true,
      authStage: "login",
      view: defaultViewForPortal(portal),
      portal,
    });
    return { ok: true };
  },

  loginAsRole: (role) => {
    const user = USERS.find((u) => u.role === role)!;
    const portal = portalForRole(role);
    set({
      user,
      isAuthenticated: true,
      authStage: "login",
      view: defaultViewForPortal(portal),
      portal,
    });
  },

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      authStage: "login",
      view: "login",
      selectedApplicationId: null,
      mobileNavOpen: false,
    }),

  setAuthStage: (authStage) => set({ authStage }),
  setPendingEmail: (pendingEmail) => set({ pendingEmail }),

  navigate: (view) => set({ view, mobileNavOpen: false }),

  openApplication: (id, view) =>
    set({ selectedApplicationId: id, view: view ?? "ltp-application-details" }),

  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  pushNotification: (n) =>
    set((s) => ({ notifications: [n, ...s.notifications] })),
}));

// Selectors
export function useSelectedApplication() {
  return useAppStore((s) => s.applications.find((a) => a.id === s.selectedApplicationId) ?? null);
}
