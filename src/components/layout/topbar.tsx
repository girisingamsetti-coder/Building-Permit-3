"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, DEMO_CREDENTIALS, useVisibleApplications } from "@/store/app-store";
import { ROLES, USERS } from "@/data/mock-data";
import {
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Users,
  CheckCheck,
  MessageSquare,
  ShieldCheck,
  Zap,
  X,
  FileText,
  FileStack,
  ScrollText,
  AlertTriangle,
  CreditCard,
  Building2,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { timeAgo } from "@/components/design-system/workflow";
import { RoleBadge } from "@/components/design-system/badges";
import { useToast } from "@/hooks/use-toast";
import type { NotificationType, RoleKey, ViewKey } from "@/types";

const NOTIF_ICON: Record<NotificationType, string> = {
  APPLICATION_SUBMITTED: "FileStack",
  SCRUTINY_FAILED: "XCircle",
  SCRUTINY_PASSED: "CheckCircle2",
  DOCUMENTS_REQUIRED: "FolderClosed",
  DOCUMENT_UPLOADED: "Upload",
  DOCUMENT_VERIFIED: "FileCheck2",
  DOCUMENT_REJECTED: "XCircle",
  DOCUMENT_SHORTFALL: "FileWarning",
  FEE_GENERATED: "ReceiptIndianRupee",
  PAYMENT_SUCCESSFUL: "BadgeCheck",
  SHORTFALL_RAISED: "AlertTriangle",
  SHORTFALL_RESPONDED: "MessageSquare",
  SHORTFALL_RESOLVED: "CheckCircle2",
  APPLICATION_FORWARDED: "Forward",
  APPLICATION_APPROVED: "CheckCircle2",
  APPLICATION_REJECTED: "XCircle",
  APPLICATION_RETURNED: "Undo2",
  FINAL_DECISION: "Gavel",
  SYSTEM: "Settings",
};

const SMS_STATUS_CLS: Record<string, string> = {
  SENT: "bg-info/15 text-info",
  DELIVERED: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  PENDING: "bg-muted text-muted-foreground",
};

// ============================================================
// SEARCH RESULT TYPES
// ============================================================
interface SearchResult {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  meta?: string;
  applicationId?: string;
  view: ViewKey;
}

// ============================================================
// SEARCH LOGIC
// ============================================================
function useGlobalSearch(query: string): { results: SearchResult[]; loading: boolean } {
  const apps = useVisibleApplications();
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const q = query.trim().toLowerCase();
      const found: SearchResult[] = [];

      // 1. Applications
      apps.forEach((app) => {
        const matches =
          app.applicationNo.toLowerCase().includes(q) ||
          app.project.name.toLowerCase().includes(q) ||
          app.applicant.name.toLowerCase().includes(q) ||
          app.project.type.toLowerCase().includes(q) ||
          app.status.toLowerCase().includes(q) ||
          app.currentStageLabel.toLowerCase().includes(q);
        if (matches) {
          found.push({
            category: "Applications",
            icon: FileStack,
            title: app.applicationNo,
            subtitle: app.project.name,
            meta: `Applicant: ${app.applicant.name}`,
            applicationId: app.id,
            view: "ltp-application-details" as ViewKey,
          });
        }
      });

      // 2. Documents
      apps.forEach((app) => {
        app.documents.forEach((doc) => {
          if (
            doc.name.toLowerCase().includes(q) ||
            doc.code.toLowerCase().includes(q)
          ) {
            found.push({
              category: "Documents",
              icon: FileText,
              title: doc.name,
              subtitle: app.applicationNo,
              meta: `${app.project.name} · ${doc.status}`,
              applicationId: app.id,
              view: "ltp-documents" as ViewKey,
            });
          }
        });
      });

      // 3. Scrutiny Reports
      apps.forEach((app) => {
        if (app.scrutinyReport) {
          const r = app.scrutinyReport;
          const drawing = app.drawings.find((d) => d.version === r.drawingVersion);
          if (
            r.reportNo.toLowerCase().includes(q) ||
            (drawing?.fileName.toLowerCase().includes(q) ?? false) ||
            app.applicationNo.toLowerCase().includes(q) ||
            app.project.name.toLowerCase().includes(q)
          ) {
            found.push({
              category: "Scrutiny Reports",
              icon: ScrollText,
              title: r.reportNo,
              subtitle: app.applicationNo,
              meta: `${app.project.name} · ${r.status}`,
              applicationId: app.id,
              view: "ltp-scrutiny" as ViewKey,
            });
          }
        }
      });

      // 4. Shortfalls
      apps.forEach((app) => {
        app.shortfalls.forEach((sf) => {
          if (
            sf.shortfallId.toLowerCase().includes(q) ||
            sf.title.toLowerCase().includes(q) ||
            sf.description.toLowerCase().includes(q) ||
            sf.type.toLowerCase().includes(q) ||
            app.applicationNo.toLowerCase().includes(q)
          ) {
            found.push({
              category: "Shortfalls",
              icon: AlertTriangle,
              title: sf.shortfallId,
              subtitle: app.applicationNo,
              meta: `${sf.title} · ${sf.status}`,
              applicationId: app.id,
              view: "ltp-shortfalls" as ViewKey,
            });
          }
        });
      });

      // 5. Payments
      apps.forEach((app) => {
        if (app.payment) {
          const p = app.payment;
          if (
            (p.transactionId || "").toLowerCase().includes(q) ||
            (p.referenceNo || "").toLowerCase().includes(q) ||
            (p.receiptNo || "").toLowerCase().includes(q) ||
            app.applicationNo.toLowerCase().includes(q) ||
            app.project.name.toLowerCase().includes(q)
          ) {
            found.push({
              category: "Payments",
              icon: CreditCard,
              title: p.receiptNo || p.transactionId || p.referenceNo || "—",
              subtitle: app.applicationNo,
              meta: `${app.project.name} · ${p.status}`,
              applicationId: app.id,
              view: "ltp-payment" as ViewKey,
            });
          }
        }
      });

      // 6. Officers
      USERS.forEach((officer) => {
        if (
          officer.name.toLowerCase().includes(q) ||
          officer.role.toLowerCase().includes(q) ||
          (officer.employeeId || "").toLowerCase().includes(q)
        ) {
          found.push({
            category: "Officers",
            icon: ShieldCheck,
            title: officer.name,
            subtitle: ROLES[officer.role].fullName,
            meta: officer.zone || officer.department || "",
            view: "officer-applications" as ViewKey,
          });
        }
      });

      // Sort: exact matches first, then prefix, then partial
      found.sort((a, b) => {
        const aExact = a.title.toLowerCase() === q ? 0 : a.title.toLowerCase().startsWith(q) ? 1 : 2;
        const bExact = b.title.toLowerCase() === q ? 0 : b.title.toLowerCase().startsWith(q) ? 1 : 2;
        return aExact - bExact;
      });

      setResults(found);
      setLoading(false);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, apps]);

  return { results, loading };
}

// ============================================================
// SEARCH DROPDOWN COMPONENT
// ============================================================
function SearchDropdown({
  query,
  results,
  loading,
  onSelect,
  onClose,
}: {
  query: string;
  results: SearchResult[];
  loading: boolean;
  onSelect: (result: SearchResult) => void;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Group results by category
  const grouped = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((r) => {
      (groups[r.category] ??= []).push(r);
    });
    return groups;
  }, [results]);

  // Flatten for keyboard navigation
  const flatResults = React.useMemo(() => Object.values(grouped).flat(), [grouped]);

  // Reset active index when results change
  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keyboard navigation
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && flatResults[activeIndex]) {
        e.preventDefault();
        onSelect(flatResults[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [flatResults, activeIndex, onSelect, onClose]);

  if (!query || query.trim().length < 2) return null;

  // Limit results per category
  const MAX_PER_CATEGORY: Record<string, number> = {
    Applications: 5,
    Documents: 3,
    "Scrutiny Reports": 3,
    Shortfalls: 3,
    Payments: 3,
    Officers: 3,
  };

  let runningIndex = 0;

  return (
    <div
      ref={scrollRef}
      className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[400px] overflow-y-auto rounded-lg border border-border bg-popover shadow-gov-lg"
    >
      {loading ? (
        <div className="p-4 text-center text-sm text-muted-foreground">Searching…</div>
      ) : flatResults.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No results found for &ldquo;{query}&rdquo;
          <p className="mt-1 text-xs">Try: application number, project, applicant, document or report number.</p>
        </div>
      ) : (
        <div className="p-2">
          {Object.entries(grouped).map(([category, items]) => {
            const limited = items.slice(0, MAX_PER_CATEGORY[category] ?? 3);
            return (
              <div key={category} className="mb-1">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
                {limited.map((result) => {
                  const idx = runningIndex++;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={`${category}-${idx}`}
                      onClick={() => onSelect(result)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                        isActive ? "bg-accent" : "hover:bg-muted/50"
                      )}
                    >
                      <result.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{result.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{result.subtitle}</p>
                        {result.meta && <p className="truncate text-[10px] text-muted-foreground">{result.meta}</p>}
                      </div>
                    </button>
                  );
                })}
                {items.length > (MAX_PER_CATEGORY[category] ?? 3) && (
                  <p className="px-2 py-0.5 text-[10px] text-muted-foreground">+{items.length - (MAX_PER_CATEGORY[category] ?? 3)} more</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN TOPBAR
// ============================================================
export function Topbar() {
  const {
    user,
    portal,
    notifications,
    mobileNavOpen,
    setMobileNavOpen,
    toggleTheme,
    theme,
    navigate,
    markAllNotificationsRead,
    markNotificationRead,
    openApplication,
    loginAsRole,
    logout,
  } = useAppStore();
  const { toast } = useToast();
  const unread = notifications.filter((n) => !n.read).length;

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const { results, loading } = useGlobalSearch(searchQuery);

  // "/" keyboard shortcut to focus search
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close search
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSelect(result: SearchResult) {
    setSearchOpen(false);
    setSearchQuery("");
    if (result.applicationId) {
      openApplication(result.applicationId, result.view);
    } else {
      navigate(result.view);
    }
    toast({ title: `Opening ${result.title}`, description: result.subtitle });
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-5">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <Menu className="size-5" />
      </Button>

      {/* Search — now functional */}
      <div ref={searchContainerRef} className="relative hidden flex-1 max-w-md sm:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSearchOpen(false);
              searchInputRef.current?.blur();
            }
          }}
          placeholder="Search applications, officers, documents…"
          className="h-9 w-full rounded-md border border-input bg-muted/40 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary/40"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchOpen(false);
              searchInputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
        {searchOpen && (
          <SearchDropdown
            query={searchQuery}
            results={results}
            loading={loading}
            onSelect={handleSearchSelect}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Role switcher (demo) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden md:inline-flex gap-2">
              <Zap className="size-3.5 text-amber-500" />
              <span className="text-xs">Demo Role</span>
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-2 text-xs">
              <Users className="size-3.5" /> Switch demo role
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {DEMO_CREDENTIALS.map((c) => (
              <DropdownMenuItem
                key={c.role}
                onClick={() => {
                  loginAsRole(c.role);
                  toast({
                    title: `Signed in as ${ROLES[c.role].fullName}`,
                    description: `Demo role switched to ${c.label}`,
                  });
                }}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{ROLES[c.role].fullName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{c.email}</p>
                </div>
                <RoleBadge role={c.role} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Toggle theme"
          className="text-muted-foreground"
        >
          {theme === "light" ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />}
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="size-4.5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 sm:w-96">
            <div className="flex items-center justify-between border-b border-border p-3">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <p className="text-sm font-semibold">Notifications</p>
                {unread > 0 && (
                  <Badge className="bg-destructive text-white text-[10px]">{unread} new</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground"
                onClick={markAllNotificationsRead}
                disabled={unread === 0}
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </Button>
            </div>
            <ScrollArea className="h-[360px]">
              <ul className="divide-y divide-border">
                {notifications.length === 0 && (
                  <li className="p-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </li>
                )}
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.applicationId) openApplication(n.applicationId);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50",
                        !n.read && "bg-primary/[0.03]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                          n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                        )}
                      >
                        <Bell className="size-3.5" />
                      </span>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-sm leading-tight", !n.read && "font-semibold")}>
                            {n.title}
                          </p>
                          {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] text-muted-foreground">{timeAgo(n.timestamp)}</span>
                          {n.smsSent && (
                            <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium", SMS_STATUS_CLS[n.smsStatus ?? "PENDING"])}>
                              <MessageSquare className="size-2.5" /> SMS {n.smsStatus?.toLowerCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => navigate("ltp-notifications")}
              >
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 pr-2 transition-colors hover:bg-muted">
              <UserAvatar color={user?.avatarColor} name={user?.name} />
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground">{ROLES[user?.role ?? "LTP"].title}</p>
              </div>
              <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <RoleBadge role={user?.role ?? "LTP"} />
                {user?.zone && <span className="text-[10px] text-muted-foreground">{user.zone}</span>}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("ltp-profile")}>
              <User className="size-4" /> Profile
            </DropdownMenuItem>
            {portal === "ADMIN" && (
              <DropdownMenuItem onClick={() => navigate("admin-settings")}>
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function UserAvatar({ color, name }: { color?: string; name?: string }) {
  const initials = (name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    slate: "bg-slate-500",
  };
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-full text-[11px] font-semibold text-white",
        colorMap[color ?? "slate"]
      )}
    >
      {initials}
    </div>
  );
}
