"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, DEMO_CREDENTIALS } from "@/store/app-store";
import { ROLES } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ChevronDown,
  Flower2,
  User,
  X,
  Users,
  HardHat,
  Ruler,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FeeWizard } from "@/components/wizard/fee-wizard";
import { StatusWizard } from "@/components/wizard/status-wizard";
import { DeveloperRegistrationWizard } from "@/components/wizard/developer-registration-wizard";
import { DeveloperStatusWizard } from "@/components/wizard/developer-status-wizard";
import { DeveloperRenewalWizard } from "@/components/wizard/developer-renewal-wizard";
import { RegisteredDeveloperWizard } from "@/components/wizard/registered-developer-wizard";
import { DeveloperConsentWizard } from "@/components/wizard/developer-consent-wizard";
import { LtpRegistrationWizard } from "@/components/wizard/ltp-registration-wizard";
import { LtpRenewalWizard } from "@/components/wizard/ltp-renewal-wizard";
import { LtpViewWizard } from "@/components/wizard/ltp-view-wizard";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import type { RoleKey } from "@/types";

export function AuthScreen() {
  const { authStage, setAuthStage, pendingEmail, setPendingEmail } = useAppStore();

  if (authStage === "forgot") return <ForgotPassword onBack={() => setAuthStage("login")} />;
  if (authStage === "otp")
    return (
      <OtpScreen
        email={pendingEmail ?? ""}
        onBack={() => setAuthStage("login")}
      />
    );

  return <LoginForm />;
}

// ============================================================
// SHARED BRANDING
// ============================================================
function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm",
          compact ? "size-9" : "size-10"
        )}
      >
        <Building2 className={compact ? "size-5" : "size-5.5"} />
      </div>
      <div className="leading-tight">
        <p className={cn("font-semibold tracking-tight", compact ? "text-sm" : "text-base")}>
          LTP Approval
        </p>
        <p className="text-[11px] text-muted-foreground">
          Building Permit Management System
        </p>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN
// ============================================================
function LoginForm() {
  const { login, loginAsRole, setAuthStage, setPendingEmail } = useAppStore();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("admin@demo.gov.in");
  const [password, setPassword] = React.useState("demo1234");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [error, setError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [pwError, setPwError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [demoRole, setDemoRole] = React.useState<string>("");
  const [showLoginBox, setShowLoginBox] = React.useState(false);
  const [version, setVersion] = React.useState<"v1" | "v2" | "v3">("v1");
  const [mounted, setMounted] = React.useState(false);
  const [showFeeWizard, setShowFeeWizard] = React.useState(false);
  const [showStatusWizard, setShowStatusWizard] = React.useState(false);
  const [showDevRegWizard, setShowDevRegWizard] = React.useState(false);
  const [showDevStatusWizard, setShowDevStatusWizard] = React.useState<string | null>(null);
  const [showDevRenewalWizard, setShowDevRenewalWizard] = React.useState<string | null>(null);
  const [showRegDevWizard, setShowRegDevWizard] = React.useState<"developer" | "tpa" | "ltp" | null>(null);
  const [showConsentWizard, setShowConsentWizard] = React.useState<{type: "developer" | "tpa" | "ltp", title: string} | null>(null);
  const [showLtpRegWizard, setShowLtpRegWizard] = React.useState(false);
  const [showLtpRenewalWizard, setShowLtpRenewalWizard] = React.useState(false);
  const [showLtpViewWizard, setShowLtpViewWizard] = React.useState(false);
  const useAltBg = version === "v2";
  const infoRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (version === "v3" && infoRef.current) {
      setTimeout(() => {
        infoRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [version]);

  const QUICK_CARDS = [
    {
      title: "Citizen Service",
      icon: Users,
      desc: "Pay a fee or follow a file — no login needed.",
      links: ["Pay your fees here", "Search your application status"]
    },
    {
      title: "Developer & TPAs",
      icon: HardHat,
      desc: "Register, renew and check developers and Town Planning Assistants.",
      links: ["Developer Registration", "Developer Registration Status", "Developer Renewal", "List of Registered Developer", "Developer Consent Link", "TPAs Consent Link", "List of Registered TPAs"]
    },
    {
      title: "LTP",
      icon: Ruler,
      desc: "Licensed Technical Persons register, renew and be found.",
      links: ["New Registration", "List of Registered LTPs", "LTP Renewal", "Payment and Renewal", "LTP View", "LTP Consent Link"]
    }
  ];

  function validate(): boolean {
    let ok = true;
    setEmailError("");
    setPwError("");
    if (!email.trim()) {
      setEmailError("Please enter your registered email address.");
      ok = false;
    }
    if (!password) {
      setPwError("Please enter your password.");
      ok = false;
    }
    return ok;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? "Incorrect email or password.");
        return;
      }
      toast({
        title: "Welcome back",
        description: "You have signed in to LTP Approval.",
      });
    }, 600);
  }

  function handleDemoRoleSelect(value: string) {
    setDemoRole(value);
    const role = value as RoleKey;
    const cred = DEMO_CREDENTIALS.find((c) => c.role === role);
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
      toast({
        title: "Demo credentials loaded",
        description: `${ROLES[role].fullName} — click Sign In to continue.`,
      });
    }
  }

  return (
    <div className={cn("relative w-full bg-white", version === "v3" ? "h-screen overflow-y-auto overflow-x-hidden" : "h-screen overflow-hidden")}>
      <div
        className={cn(
          "relative flex min-h-screen w-full flex-col justify-center font-sans overflow-hidden transition-all duration-700 shrink-0",
        useAltBg ? "items-end pr-8 md:pr-24 lg:pr-32" : "items-start pl-8 md:pl-24 lg:pl-32",
        "bg-cover bg-center"
      )}
      style={{ backgroundImage: useAltBg ? "url('/BBBAS%202.png')" : "url('/bg-city.png')" }}
    >
      {/* Government Banner Header */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-6 md:px-20 lg:px-28 py-2 bg-[#fdf8ef]/95 shadow-md z-20 border-b border-orange-200 backdrop-blur-md">

        {/* Left: Narayana */}
        <div className="flex items-center gap-3">
          <img src="/narayana.png" alt="Sri Ponguru Narayana" className="h-14 md:h-20 w-auto object-contain drop-shadow-md" />
          <div className="hidden md:flex flex-col">
            <span className="text-[14px] font-bold text-[#8c1c13]">Sri Ponguru Narayana</span>
            <span className="text-[11px] text-gray-800 font-semibold">Hon'ble Minister for MA&UD</span>
            <span className="text-[11px] text-gray-800 font-semibold">Andhra Pradesh Government</span>
          </div>
        </div>

        {/* Center: APCRDA & AP Govt */}
        <div className="flex items-center gap-6 md:gap-12">
          <img src="/APCRDA.png" alt="APCRDA" className="h-12 md:h-16 w-auto object-contain" />
          <div className="text-3xl md:text-5xl font-bold text-[#8c1c13] tracking-widest uppercase drop-shadow-sm">BBAS</div>
          <img src="/apgovt.png" alt="AP Govt" className="h-16 md:h-20 w-auto object-contain" />
        </div>

        {/* Right: CBN */}
        <div className="flex items-center gap-3 text-right">
          <div className="hidden md:flex flex-col">
            <span className="text-[14px] font-bold text-[#8c1c13]">Sri Nara Chandrababu Naidu</span>
            <span className="text-[11px] text-gray-800 font-semibold">Hon'ble Chief Minister</span>
            <span className="text-[11px] text-gray-800 font-semibold">Andhra Pradesh Government</span>
          </div>
          <img src="/cbn.png" alt="Sri Nara Chandrababu Naidu" className="h-14 md:h-20 w-auto object-contain drop-shadow-md" />
        </div>

        {/* Extra Login Button attached to header bottom edge */}
        {!showLoginBox && (
          <div className="absolute -bottom-12 right-0 md:right-8">
            <Button
              onClick={() => setShowLoginBox(true)}
              className="bg-[#8c1c13] hover:bg-red-900 text-white font-bold px-8 py-6 rounded-t-none rounded-b-xl shadow-lg tracking-wider text-sm transition-transform hover:scale-105"
            >
              LOGIN
            </Button>
          </div>
        )}
      </div>

      {/* Quick Action Cards */}
      <div className={cn(
        "absolute top-[40%] -translate-y-1/2 w-full flex flex-wrap lg:flex-nowrap gap-6 z-10 transition-all duration-700 pointer-events-none",
        useAltBg ? "justify-end px-4 md:px-8 lg:px-12" : "justify-start px-8 md:px-24 lg:px-32",
        version === "v3" ? "lg:pr-40" : "",
        showLoginBox ? "pointer-events-none" : ""
      )}>
        {QUICK_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className={cn(
                "w-full max-w-[320px] rounded-[24px] flex flex-col backdrop-blur-xl transition-all duration-700 shadow-xl pointer-events-auto",
                version === "v3" ? "px-6 pb-6 pt-3 gap-3" : "p-6 gap-4",
                "border border-[#d4af37]",
                useAltBg 
                  ? "bg-white/90 text-gray-900" 
                  : "bg-transparent text-white",
                (!mounted || showLoginBox) ? "opacity-0 translate-y-12" : "opacity-100 translate-y-0"
              )}
              style={{ transitionDelay: showLoginBox ? "0ms" : (mounted ? `${idx * 250}ms` : `${600 + idx * 300}ms`) }}
            >
              {version === "v3" ? (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="size-10 rounded-full flex items-center justify-center border-[1.5px] border-[#d4af37] text-[#d4af37] shrink-0 bg-transparent">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-xl font-bold leading-tight">{card.title}</h3>
                  </div>
                  <div>
                    <p className={cn("text-[13px] leading-relaxed", useAltBg ? "text-gray-600" : "text-white/60")}>{card.desc}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className={cn(
                    "size-12 rounded-full flex items-center justify-center mb-2",
                    useAltBg ? "bg-red-50 text-[#8c1c13]" : "bg-white/10 text-white/80"
                  )}>
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{card.title}</h3>
                    <p className={cn("text-[13px] leading-relaxed", useAltBg ? "text-gray-600" : "text-white/60")}>{card.desc}</p>
                  </div>
                </>
              )}
              <div className="flex-1 mt-4 space-y-2">
                {card.links.map((link, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    onClick={(e) => {
                      if (link === "Pay your fees here") {
                        e.preventDefault();
                        setShowFeeWizard(true);
                      } else if (link === "Search your application status") {
                        e.preventDefault();
                        setShowStatusWizard(true);
                      } else if (link === "Developer Registration") {
                        e.preventDefault();
                        setShowDevRegWizard(true);
                      } else if (link === "Developer Registration Status") {
                        e.preventDefault();
                        setShowDevStatusWizard(link);
                      } else if (link === "Developer Renewal") {
                        e.preventDefault();
                        setShowDevRenewalWizard("Developer Renewal");
                      } else if (link === "Payment and Renewal") {
                        e.preventDefault();
                        setShowDevRenewalWizard("Payment and Renewal");
                      } else if (link === "List of Registered Developer") {
                        e.preventDefault();
                        setShowRegDevWizard("developer");
                      } else if (link === "List of Registered TPAs") {
                        e.preventDefault();
                        setShowRegDevWizard("tpa");
                      } else if (link === "List of Registered LTPs") {
                        e.preventDefault();
                        setShowRegDevWizard("ltp");
                      } else if (link === "Developer Consent Link") {
                        e.preventDefault();
                        setShowConsentWizard({ type: "developer", title: link });
                      } else if (link === "TPAs Consent Link") {
                        e.preventDefault();
                        setShowConsentWizard({ type: "tpa", title: link });
                      } else if (link === "New Registration") {
                        e.preventDefault();
                        setShowLtpRegWizard(true);
                      } else if (link === "LTP Renewal") {
                        e.preventDefault();
                        setShowLtpRenewalWizard(true);
                      } else if (link === "LTP View") {
                        e.preventDefault();
                        setShowLtpViewWizard(true);
                      } else if (link === "LTP Consent Link") {
                        e.preventDefault();
                        setShowConsentWizard({ type: "ltp", title: link });
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between group text-[13px] font-medium transition-colors border-b pb-2.5 last:border-0 last:pb-0",
                      useAltBg 
                        ? "text-gray-700 hover:text-[#8c1c13] border-gray-200" 
                        : "text-white/80 hover:text-white border-white/10"
                    )}
                  >
                    <span>{link}</span>
                    <ArrowRight className="size-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Glassmorphism Card */}
      {showLoginBox && (
        <div className={cn(
          "relative z-10 w-full max-w-[420px] mb-24 rounded-[24px] p-8 backdrop-blur-xl animate-in fade-in slide-in-from-right-8 duration-500",
          useAltBg ? "bg-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-gray-300" : "bg-black/25 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20"
        )}>
          {/* Close Button */}
          <button
            onClick={() => setShowLoginBox(false)}
            className={cn(
              "absolute top-4 right-4 p-2 rounded-full text-white transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg active:translate-y-[0px] active:scale-95 shadow-md z-20",
              "bg-gradient-to-r from-[#8c1c13] to-[#bf2b1d] hover:from-[#5e1914] hover:to-[#8c1c13] border border-[#5e1914]"
            )}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className={cn(
              "font-serif text-[22px] tracking-[0.1em] uppercase drop-shadow-sm",
              useAltBg ? "text-[#5e1914]" : "text-white drop-shadow-md"
            )}>
              BBAS AMARAVATI
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email / ID */}
            <div className="space-y-1">
              <div className="relative">
                <User className={cn("absolute left-4 top-1/2 size-[18px] -translate-y-1/2", useAltBg ? "text-gray-400" : "text-white/60")} strokeWidth={1.5} />
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                    setError("");
                  }}
                  placeholder="Citizen ID or Email"
                  className={cn(
                    "h-[50px] pl-12 rounded-[12px] text-[15px] transition-all",
                    useAltBg ? "bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus-visible:ring-gray-300 focus-visible:border-gray-400 shadow-sm" : "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-1 focus-visible:ring-white/30",
                    emailError && (useAltBg ? "border-red-500 focus-visible:ring-red-500/30" : "border-red-400 focus-visible:ring-red-400/30")
                  )}
                  aria-invalid={!!emailError}
                />
              </div>
              {emailError && <p className="pl-1 text-[11px] text-red-300">{emailError}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="relative">
                <Lock className={cn("absolute left-4 top-1/2 size-[18px] -translate-y-1/2", useAltBg ? "text-gray-400" : "text-white/60")} strokeWidth={1.5} />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPwError("");
                    setError("");
                  }}
                  placeholder="Password"
                  className={cn(
                    "h-[50px] pl-12 pr-12 rounded-[12px] text-[15px] transition-all",
                    useAltBg ? "bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus-visible:ring-gray-300 focus-visible:border-gray-400 shadow-sm" : "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-1 focus-visible:ring-white/30",
                    pwError && (useAltBg ? "border-red-500 focus-visible:ring-red-500/30" : "border-red-400 focus-visible:ring-red-400/30")
                  )}
                  aria-invalid={!!pwError}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className={cn("absolute right-4 top-1/2 -translate-y-1/2 transition-colors", useAltBg ? "text-gray-400 hover:text-gray-600" : "text-white/50 hover:text-white/90")}
                >
                  {showPw ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
              {pwError && <p className="pl-1 text-[11px] text-red-300">{pwError}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2 pb-2">
              <label htmlFor="remember" className={cn("flex cursor-pointer items-center gap-2 text-[13px] select-none transition-colors", useAltBg ? "text-[#5e1914] font-medium" : "text-white/80 hover:text-white")}>
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  className={cn("rounded-sm", useAltBg ? "border-gray-400 data-[state=checked]:bg-[#5e1914] data-[state=checked]:text-white" : "border-white/40 data-[state=checked]:bg-white/20 data-[state=checked]:text-white")}
                />
                Remember Me
              </label>
              <button
                type="button"
                onClick={() => {
                  setPendingEmail(email);
                  setAuthStage("forgot");
                }}
                className={cn("text-[13px] underline-offset-4 hover:underline transition-all", useAltBg ? "text-[#5e1914]" : "text-white/80 hover:text-white")}
              >
                Forgot Password?
              </button>
            </div>

            {/* General Error */}
            {error && (
              <div className={cn(
                "rounded-md px-3 py-2 text-[12px] text-center backdrop-blur-sm transition-all",
                useAltBg
                  ? "bg-red-50 border border-red-200 text-red-600"
                  : "bg-red-500/20 border border-red-500/30 text-red-200"
              )}>
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className={cn(
                "h-[50px] w-full rounded-[12px] text-[15px] font-bold transition-all uppercase tracking-wider",
                useAltBg
                  ? "bg-gradient-to-r from-[#9a7b4f] via-[#dcb871] to-[#9a7b4f] text-[#3a100a] shadow-md hover:shadow-lg border-none"
                  : "border border-[#FDE047]/60 bg-gradient-to-b from-[#FDE047]/20 to-black/40 text-[#FDE047] shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] hover:bg-black/50"
              )}
              disabled={loading}
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : "LOG IN"}
            </Button>

          </form>

        </div>
      )}

      {/* Version Selector */}
      <div className={cn(
        "absolute z-30 flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-lg transition-all",
        version === "v3" ? "bottom-6 right-6 fixed" : "bottom-6 right-6"
      )}>
        {(["v1", "v2", "v3"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVersion(v)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase",
              version === v ? "bg-white text-black shadow-sm" : "text-white hover:bg-white/20"
            )}
          >
            {v}
          </button>
        ))}
      </div>
      
      </div>

      {/* V3 Extra Information Sections */}
      {version === "v3" && (
        <div ref={infoRef} className="flex flex-col bg-white">
          {/* What is BIM? Section */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-12 md:p-24 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">What is BIM?</h2>
              <h3 className="text-xl font-semibold text-slate-500 mb-6">Building information modelling</h3>
              <p className="text-sm text-slate-600 leading-relaxed text-justify">
                Building Information Modelling (BIM) is the process of developing a virtual, three-dimensional, information-rich model to design, construct, and maintain a building project. BIM is much more than software used to produce a pretty 3D graphic. Because a variety of information can be embedded into the model, BIM can also be used to manage the project's Building Approval, construction schedule (4D), to track project costs (5D), and, once constructed, facility management (6D).
              </p>
            </div>
            <div className="min-h-[400px] w-full bg-[url('/bim_sketch.jpg')] bg-contain bg-no-repeat bg-center border-l border-b border-slate-200"></div>
          </div>

          {/* What is BBAS? Section */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="min-h-[400px] w-full bg-[url('/bbas_sketch.jpg')] bg-cover bg-center border-r border-b border-slate-200 order-2 md:order-1"></div>
            <div className="p-12 md:p-24 flex flex-col justify-center order-1 md:order-2">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">What is BBAS?</h2>
              <h3 className="text-xl font-semibold text-slate-500 mb-6">BIM Based building approval system</h3>
              <p className="text-sm text-slate-600 leading-relaxed text-justify mb-4">
                BIM Based Building Approval System (BBAS) is a 3D BIM consolidated Single Model (Architectural+Structural+MEP model) that can be scrutinized in the process flow and one can track the file through its tracking system.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed text-justify">
                BBAS is a GIS based 3D model approval system and it is a core system that is responsible for providing permissions with various development permits at one platform. All NOC's (such as fire/ high-rise/environmental clearance and so on) are integrated in this BBAS system.
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="relative bg-[url('/bg-city.png')] bg-cover bg-center border-t border-slate-200 overflow-hidden">
            {/* glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xl pointer-events-none" />
            <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 py-12 px-6">
              <div className="flex flex-col items-center">
                <img src="/APCRDA.png" alt="APCRDA Logo" className="h-[100px] w-auto mb-2" />
              </div>
              
              <div className="flex gap-16 md:gap-24">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-4 text-sm">Portal map</h4>
                    <ul className="space-y-3 text-[13px] text-slate-600">
                      <li><button className="hover:text-blue-600">Home</button></li>
                      <li><button className="hover:text-blue-600">About Us</button></li>
                      <li><button className="hover:text-blue-600">Dashboard</button></li>
                      <li><button className="hover:text-blue-600">Downloads</button></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-4 text-sm">Support</h4>
                    <ul className="space-y-3 text-[13px] text-slate-600">
                      <li><button className="hover:text-blue-600">Help manuals</button></li>
                      <li><button className="hover:text-blue-600">FAQ</button></li>
                      <li><button className="hover:text-blue-600">Helpdesk</button></li>
                      <li><button className="hover:text-blue-600">Contact Us</button></li>
                    </ul>
                  </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-6">
                <div className="flex gap-4 text-blue-500">
                  <button className="hover:text-blue-700 bg-blue-50 p-1.5 rounded-md"><Instagram className="size-4" /></button>
                  <button className="hover:text-blue-700 bg-blue-50 p-1.5 rounded-md"><Twitter className="size-4" /></button>
                  <button className="hover:text-blue-700 bg-blue-50 p-1.5 rounded-md"><Facebook className="size-4" /></button>
                  <button className="hover:text-blue-700 bg-blue-50 p-1.5 rounded-md"><Youtube className="size-4" /></button>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Visitors count: <span className="font-mono">1,204,500</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-center gap-4 md:gap-8 text-[11px] text-slate-500 max-w-6xl mx-auto">
              <div>Copyrights @ APCRDA | All rights reserved</div>
              <div>Designed & Developed by <strong className="text-slate-700">Clove Technologies</strong></div>
            </div>
          </footer>
        </div>
      )}


      {showFeeWizard && <FeeWizard onClose={() => setShowFeeWizard(false)} />}
      {showStatusWizard && <StatusWizard onClose={() => setShowStatusWizard(false)} />}
      {showDevRegWizard && <DeveloperRegistrationWizard onClose={() => setShowDevRegWizard(false)} />}
      {showDevStatusWizard && (
        <DeveloperStatusWizard 
          title={showDevStatusWizard} 
          onClose={() => setShowDevStatusWizard(null)} 
        />
      )}
      {showDevRenewalWizard && <DeveloperRenewalWizard title={showDevRenewalWizard} onClose={() => setShowDevRenewalWizard(null)} />}
      {showRegDevWizard && <RegisteredDeveloperWizard type={showRegDevWizard} onClose={() => setShowRegDevWizard(null)} />}
      {showConsentWizard && (
        <DeveloperConsentWizard 
          type={showConsentWizard.type} 
          title={showConsentWizard.title} 
          onClose={() => setShowConsentWizard(null)} 
        />
      )}
      {showLtpRegWizard && <LtpRegistrationWizard onClose={() => setShowLtpRegWizard(false)} />}
      {showLtpRenewalWizard && <LtpRenewalWizard onClose={() => setShowLtpRenewalWizard(false)} />}
      {showLtpViewWizard && <LtpViewWizard onClose={() => setShowLtpViewWizard(false)} />}
    </div>
  );
}

// ============================================================
// FORGOT PASSWORD
// ============================================================
function ForgotPassword({ onBack }: { onBack: () => void }) {
  const { setAuthStage, setPendingEmail, pendingEmail } = useAppStore();
  const { toast } = useToast();
  const [email, setEmail] = React.useState(pendingEmail ?? "");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setPendingEmail(email);
      toast({
        title: "Reset link sent",
        description: `An OTP has been sent to ${email}`,
      });
    }, 700);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="absolute inset-0 bg-dotted opacity-30" />
      <Card className="relative z-10 w-full max-w-md shadow-gov-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-6" />
          </div>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your registered email and we&apos;ll send you a one-time password to
            verify your identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-5 text-center">
                <CheckCircle2 className="size-8 text-success" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">OTP sent successfully</p>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ve sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
                    The code is valid for 10 minutes.
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setAuthStage("otp")}
              >
                Enter OTP <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fp-email" className="text-xs font-medium">
                  Registered email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fp-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gov.in"
                    className="h-10 pl-9"
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>Send reset OTP</>
                )}
              </Button>
            </form>
          )}
          <button
            onClick={onBack}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to sign in
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// OTP
// ============================================================
function OtpScreen({ email, onBack }: { email: string; onBack: () => void }) {
  const { setAuthStage } = useAppStore();
  const { toast } = useToast();
  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Identity verified",
        description: "You can now set a new password.",
      });
      onBack();
    }, 700);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="absolute inset-0 bg-dotted opacity-30" />
      <Card className="relative z-10 w-full max-w-md shadow-gov-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Smartphone className="size-6" />
          </div>
          <CardTitle className="text-xl">Verify your identity</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{email || "your email"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(v) => setOtp(v)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive the code?{" "}
                <button type="button" className="font-medium text-primary hover:underline">
                  Resend in 0:42
                </button>
              </p>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Verifying…
                </>
              ) : (
                <>Verify &amp; continue</>
              )}
            </Button>
          </form>
          <button
            onClick={onBack}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to sign in
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
