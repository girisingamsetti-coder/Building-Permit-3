"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mobileNavOpen, setMobileNavOpen, theme } = useAppStore();

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
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 animate-fade-in-up">
            {children}
          </div>
          <footer className="mt-auto border-t border-border bg-muted/30 px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-2 text-[11px] text-muted-foreground sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground/70">Municipal Authority — LTP Approval Workflow Portal</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">© 2025 Directorate of Town &amp; Country Planning</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-success" /> All systems operational</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">v2.4.1</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">NIC e-Governance</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
