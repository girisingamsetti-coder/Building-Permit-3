"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { ROLES } from "@/data/mock-data";
import {
  PageHeader,
  SectionCard,
  InfoGrid,
} from "@/components/design-system/layout";
import { RoleBadge } from "@/components/design-system/badges";
import { formatDateTime } from "@/components/design-system/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  KeyRound,
  Bell,
  Smartphone,
  Save,
  Building2,
  IdCard,
  CircleHelp,
  Search,
  MessageSquare,
  PhoneCall,
  Mail as MailIcon,
  BookOpen,
  ChevronRight,
  FileText,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// PROFILE
// ============================================================
export function LtpProfile() {
  const { user, navigate } = useAppStore();
  const { toast } = useToast();

  if (!user) return null;
  const role = ROLES[user.role];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your account information and preferences."
        icon={User}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Profile" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          {/* Profile card */}
          <SectionCard noPadding>
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div>
                <p className="text-base font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.designation}</p>
              </div>
              <RoleBadge role={user.role} />
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-success" /> Active · Last login {user.lastLogin ? formatDateTime(user.lastLogin) : "—"}
              </div>
            </div>
            <Separator />
            <div className="space-y-2 p-4">
              <ProfileLink icon={Mail} label="Email" value={user.email} />
              <ProfileLink icon={Phone} label="Phone" value={user.phone} />
              {user.licenseNo && <ProfileLink icon={IdCard} label="License No." value={user.licenseNo} mono />}
              {user.employeeId && <ProfileLink icon={IdCard} label="Employee ID" value={user.employeeId} mono />}
              {user.zone && <ProfileLink icon={MapPin} label="Zone" value={user.zone} />}
              <ProfileLink icon={Building2} label="Department" value={user.department ?? "—"} />
            </div>
          </SectionCard>

          {/* Security summary */}
          <SectionCard title="Security" icon={ShieldCheck}>
            <ul className="space-y-2.5 text-xs">
              <SecurityRow icon={KeyRound} label="Password" value="Last changed 23 days ago" ok />
              <SecurityRow icon={Smartphone} label="2FA / OTP" value="Enabled" ok />
              <SecurityRow icon={ShieldCheck} label="Session" value="Active on 1 device" ok />
            </ul>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => toast({ title: "Security settings", description: "Security panel opened." })}>
              Manage security
            </Button>
          </SectionCard>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Personal Information" description="Update your contact and professional details" icon={User}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name"><Input defaultValue={user.name} /></Field>
              <Field label="Designation"><Input defaultValue={user.designation ?? ""} /></Field>
              <Field label="Email"><Input type="email" defaultValue={user.email} /></Field>
              <Field label="Phone"><Input defaultValue={user.phone} /></Field>
              <Field label="License / Employee ID"><Input defaultValue={user.licenseNo ?? user.employeeId ?? ""} /></Field>
              <Field label="Zone"><Input defaultValue={user.zone ?? ""} /></Field>
              <div className="sm:col-span-2">
                <Field label="Address"><Textarea defaultValue="Office: 2nd Floor, Lattice Studio, Baner, Pune — 411045" rows={2} /></Field>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={() => toast({ title: "Profile updated", description: "Your changes have been saved." })}><Save className="size-4" /> Save changes</Button>
            </div>
          </SectionCard>

          <SectionCard title="Notification Preferences" description="Choose how you want to be notified" icon={Bell}>
            <div className="space-y-3">
              {[
                { label: "Application status updates", desc: "When your application moves to a new stage", channels: ["In-app", "SMS", "Email"] },
                { label: "Shortfall alerts", desc: "When a shortfall is raised or resolved", channels: ["In-app", "SMS"] },
                { label: "Payment confirmations", desc: "Receipts and payment status", channels: ["In-app", "Email"] },
                { label: "Scrutiny results", desc: "Pass/fail notifications for drawings", channels: ["In-app", "SMS"] },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.channels.map((c) => (
                      <Badge key={c} variant="outline" className="text-[9px] gap-1">
                        <span className="size-1.5 rounded-full bg-success" /> {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Role & Permissions" description={`Your role: ${role.fullName}`} icon={ShieldCheck}>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{role.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function ProfileLink({ icon: Icon, label, value, mono }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md px-1 py-1">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="text-[11px] text-muted-foreground w-24 shrink-0">{label}</span>
      <span className={cn("text-xs font-medium text-foreground truncate", mono && "font-mono")}>{value}</span>
    </div>
  );
}

function SecurityRow({ icon: Icon, label, value, ok }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; ok?: boolean }) {
  return (
    <li className="flex items-center gap-2.5">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <span className="text-muted-foreground">{value}</span>
      {ok && <CheckCircle />}
    </li>
  );
}

function CheckCircle() {
  return <span className="flex size-4 items-center justify-center rounded-full bg-success/15 text-success"><ShieldCheck className="size-3" /></span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

// ============================================================
// HELP & SUPPORT
// ============================================================
export function LtpHelp() {
  const { navigate } = useAppStore();
  const { toast } = useToast();

  const faqs = [
    { q: "How do I create a new application?", a: "Navigate to 'New Application' from the sidebar or dashboard. Fill in the multi-step form covering application type, applicant details, project information and property location. You can save as draft and return later." },
    { q: "What happens after I upload drawings?", a: "The system runs an automated scrutiny against Development Control Regulations (DCR). You'll receive a scrutiny report showing passed, failed and warning checks. If critical checks fail, you must re-upload corrected drawings." },
    { q: "How are fees calculated?", a: "Fees are calculated automatically based on the fee structure configured for your application type. The calculation uses built-up area, fixed components and statutory charges. You can view the detailed breakup on the Fees page." },
    { q: "What is the approval workflow?", a: "After successful payment, your application enters a multi-level approval workflow: TPA/TPS → ZAD/ZDD → ZJD → Director DP → Additional Commissioner → Commissioner. Each officer can approve, forward, raise a shortfall or return the application." },
    { q: "What should I do if a shortfall is raised?", a: "Visit the Shortfall Center to view all shortfalls. Click 'Respond' to submit your response and attach supporting documents. The reviewing officer will verify and resolve the shortfall." },
    { q: "How long does the entire process take?", a: "The SLA is shown on each application. Typically, scrutiny is instant, document verification takes 2-3 days, and the approval workflow takes 15-30 days depending on complexity and shortfalls." },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Support"
        description="Find answers, contact support and access resources."
        icon={CircleHelp}
        breadcrumbs={[{ label: "LTP Portal", onClick: () => navigate("ltp-dashboard") }, { label: "Help & Support" }]}
      />

      {/* Quick help cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, title: "User Guide", desc: "Step-by-step documentation", action: "Open guide" },
          { icon: MessageSquare, title: "Live Chat", desc: "Chat with a support agent", action: "Start chat" },
          { icon: PhoneCall, title: "Helpline", desc: "1800-200-XXXX (toll-free)", action: "Call now" },
        ].map((c) => (
          <button
            key={c.title}
            onClick={() => toast({ title: c.action, description: c.desc })}
            className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-5 text-left shadow-gov transition-all hover:border-primary/40 hover:shadow-gov-lg"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <c.icon className="size-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
              {c.action} <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Frequently Asked Questions" icon={CircleHelp}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-sm hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Contact Support" icon={MailIcon}>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <PhoneCall className="size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Helpline</p>
                  <p className="font-medium">1800-200-XXXX</p>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <MailIcon className="size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">support@municipality.gov.in</p>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Working Hours</p>
                  <p className="font-medium">Mon–Sat, 9:00 AM – 6:00 PM</p>
                </div>
              </li>
            </ul>
          </SectionCard>

          <SectionCard title="Resources" icon={FileText}>
            <ul className="space-y-2">
              {["DCR Rule Book 2025", "Fee Structure Circular", "Application Checklist", "Drawing Submission Standards", "Workflow Stage Guide"].map((r) => (
                <li key={r}>
                  <button onClick={() => toast({ title: "Opening resource", description: r })} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted">
                    <span>{r}</span>
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Raise a Ticket" icon={MessageSquare}>
            <div className="space-y-3">
              <Field label="Subject"><Input placeholder="Briefly describe your issue" /></Field>
              <Field label="Description"><Textarea placeholder="Provide details…" rows={3} /></Field>
              <Button className="w-full" onClick={() => toast({ title: "Ticket raised", description: "Your support ticket #TKT-2025-0142 has been created." })}>
                <MessageSquare className="size-4" /> Submit Ticket
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
