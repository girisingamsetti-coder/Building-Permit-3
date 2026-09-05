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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const [email, setEmail] = React.useState("ltp@demo.gov.in");
  const [password, setPassword] = React.useState("demo1234");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [error, setError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [pwError, setPwError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [demoRole, setDemoRole] = React.useState<string>("");

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
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      {/* ---------- LEFT: branding panel (desktop only) ---------- */}
      <aside className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-sidebar px-10 py-10 text-sidebar-foreground lg:flex xl:w-[40%]">
        <div className="absolute inset-0 bg-grid opacity-[0.06]" />
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-sidebar-primary/15 blur-3xl" />

        {/* Top: logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <Building2 className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-semibold tracking-tight">LTP Approval</p>
              <p className="text-[11px] text-sidebar-foreground/60">
                Building Permit Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center: branding */}
        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/40 px-3 py-1 text-[11px]">
            <ShieldCheck className="size-3.5 text-sidebar-primary" />
            <span className="text-sidebar-foreground/80">Digital Government Service</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold leading-snug tracking-tight text-balance xl:text-3xl">
              Online Building Permit Application &amp; Approval Portal
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-sidebar-foreground/65">
              A unified digital platform for Licensed Technical Persons and
              approval officers to submit, scrutinise and approve building permit
              applications.
            </p>
          </div>
        </div>


      </aside>

      {/* ---------- RIGHT: login card ---------- */}
      <main className="flex w-full flex-col lg:w-[58%] xl:w-[60%]">
        <div className="flex min-h-screen flex-col">
          {/* Mobile branding header */}
          <div className="border-b border-border bg-sidebar px-5 py-3.5 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <Building2 className="size-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-sidebar-foreground">LTP Approval</p>
                <p className="text-[10px] text-sidebar-foreground/60">
                  Building Permit Management System
                </p>
              </div>
            </div>
          </div>

          {/* Login card */}
          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
            <div className="w-full max-w-[400px] space-y-6">
              {/* Header */}
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to your account to continue.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email / Mobile */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email / Mobile Number
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                        setError("");
                      }}
                      placeholder="Enter your registered email or mobile number"
                      className={cn(
                        "h-10 pl-9",
                        emailError && "border-destructive focus-visible:ring-destructive/20"
                      )}
                      aria-invalid={!!emailError}
                      autoComplete="username"
                    />
                  </div>
                  {emailError && (
                    <p className="flex items-center gap-1 text-[11px] text-destructive">
                      <AlertCircle className="size-3" />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPwError("");
                        setError("");
                      }}
                      placeholder="Enter password"
                      className={cn(
                        "h-10 pl-9 pr-9",
                        pwError && "border-destructive focus-visible:ring-destructive/20"
                      )}
                      aria-invalid={!!pwError}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {pwError && (
                    <p className="flex items-center gap-1 text-[11px] text-destructive">
                      <AlertCircle className="size-3" />
                      {pwError}
                    </p>
                  )}
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="remember"
                    className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none"
                  >
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={(v) => setRemember(v === true)}
                    />
                    Remember me
                  </label>
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

                {/* General error */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
                  >
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Signing in…
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Security note */}
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3" />
                Secure access to the Building Permit Management System
              </p>

              {/* Demo / Development Access */}
              <div className="space-y-2.5 rounded-lg border border-dashed border-border bg-muted/20 p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Demo access</p>
                    <p className="text-[10px] text-muted-foreground">
                      Demo / Development Access
                    </p>
                  </div>
                </div>
                <Select value={demoRole} onValueChange={handleDemoRoleSelect}>
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_CREDENTIALS.map((c) => (
                      <SelectItem key={c.role} value={c.role} className="text-xs">
                        <span className="font-medium">{ROLES[c.role].title}</span>
                        <span className="text-muted-foreground"> — {c.label.split("—")[0].trim()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {demoRole && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => loginAsRole(demoRole as RoleKey)}
                  >
                    Sign in as {ROLES[demoRole as RoleKey].title}
                    <ArrowRight className="size-3.5" />
                  </Button>
                )}
              </div>


            </div>
          </div>
        </div>
      </main>
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
