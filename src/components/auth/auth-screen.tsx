"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore, DEMO_CREDENTIALS } from "@/store/app-store";
import { ROLES } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  ShieldCheck,
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
  Zap,
  Award,
  Clock,
  FileCheck2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { RoleBadge } from "@/components/design-system/badges";

export function AuthScreen() {
  const { authStage, setAuthStage, pendingEmail, setPendingEmail, login, loginAsRole } =
    useAppStore();
  const { toast } = useToast();

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
// LOGIN
// ============================================================
function LoginForm() {
  const { login, loginAsRole, setAuthStage, setPendingEmail } = useAppStore();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("ltp@demo.gov.in");
  const [password, setPassword] = React.useState("demo1234");
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? "Login failed");
        return;
      }
      toast({
        title: "Welcome back",
        description: "You have signed in to the LTP Approval Workflow Portal.",
      });
    }, 600);
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-sidebar-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg">
            <Building2 className="size-6" />
          </div>
          <div>
            <p className="text-base font-semibold leading-tight">Municipal Authority</p>
            <p className="text-xs text-sidebar-foreground/60">Directorate of Town & Country Planning</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/40 px-3 py-1 text-xs">
              <ShieldCheck className="size-3.5 text-sidebar-primary" />
              <span className="text-sidebar-foreground/80">Government of India · e-Governance Initiative</span>
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance">
              Integrated Building &amp; Project Approval Workflow Portal
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-sidebar-foreground/70">
              Submit applications, upload drawings, complete scrutiny, pay fees and
              track approvals through a transparent multi-level workflow — for Licensed
              Technical Persons and municipal officers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            {[
              { icon: Award, label: "7 approval stages", desc: "LTP → Commissioner" },
              { icon: FileCheck2, label: "Auto-scrutiny", desc: "DCR rule engine" },
              { icon: Clock, label: "SLA tracking", desc: "Real-time visibility" },
              { icon: ShieldCheck, label: "Audit-ready", desc: "Full traceability" },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3 backdrop-blur"
              >
                <f.icon className="size-5 text-sidebar-primary" />
                <p className="mt-2 text-sm font-medium">{f.label}</p>
                <p className="text-[11px] text-sidebar-foreground/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[11px] text-sidebar-foreground/50">
          <span>v2.4.1 · Build 2025.01</span>
          <span>·</span>
          <span>NIC-compliant secure portal</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Municipal Authority</p>
              <p className="text-xs text-muted-foreground">Approval Workflow Portal</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground">
              Use your registered credentials to access the portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gov.in"
                  className="h-10 pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    setPendingEmail(email);
                    setAuthStage("forgot");
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          {/* Demo role quick access */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-dashed border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                <Zap className="mr-1 inline size-3 text-amber-500" />
                Quick demo role access
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_CREDENTIALS.slice(0, 6).map((c) => (
              <button
                key={c.role}
                onClick={() => loginAsRole(c.role)}
                className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left transition-all hover:border-primary/40 hover:shadow-gov"
              >
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-xs font-medium text-foreground">
                    {ROLES[c.role].title}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {c.email}
                  </span>
                </span>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            By signing in, you agree to the terms of use and acknowledge that all actions
            are recorded for audit purposes. This is a demonstration portal — no real
            payments or SMS are processed.
          </p>
        </div>
      </div>
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
