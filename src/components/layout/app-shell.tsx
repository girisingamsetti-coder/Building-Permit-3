"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mobileNavOpen, setMobileNavOpen, theme, user, ltpActiveMenu, view } = useAppStore();

  const isLtpDashboard = (user?.role === "LTP" && (ltpActiveMenu === "dashboard" || ltpActiveMenu === "draft-application" || ltpActiveMenu === "submitted-applications" || (!ltpActiveMenu && view === "ltp-applications"))) || view === "ltp-dashboard";

  // Apply theme class to <html>
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full animate-in slide-in-from-left duration-200">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Topbar />
        <main className={cn("flex flex-1 flex-col min-h-0", isLtpDashboard ? "overflow-hidden" : "overflow-y-auto")}>
          <div className={cn("w-full flex-1 flex flex-col min-h-0", isLtpDashboard ? "p-0 h-full" : "px-2 pt-1 pb-4 animate-fade-in-up")}>
            {children}
          </div>

        </main>
      </div>
    </div>
  );
}
