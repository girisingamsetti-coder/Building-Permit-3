"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { useToast } from "@/hooks/use-toast";
import { WizardStepper, type WizardStep } from "./wizard-stepper";
import { ApplicationDetailsStep, type AppDetailsData } from "./step-app-details";
import { ProjectPropertyStep, type ProjectPropertyData } from "./step-project-property";
import { DrawingUploadStep } from "./step-drawing-upload";
import { DocumentsStep } from "./step-documents";
import { ReviewSubmitStep } from "./step-review-submit";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";
import type { UploadedFile } from "@/components/design-system/files";
import type { ApplicationType, PropertyType } from "@/types";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  PartyPopper,
  FilePlus2,
} from "lucide-react";

const STEPS: WizardStep[] = [
  { id: 0, label: "Details" },
  { id: 1, label: "Project" },
  { id: 2, label: "Drawing" },
  { id: 3, label: "Documents" },
  { id: 4, label: "Review" },
];

const DOC_COUNT = 8;

export function NewApplicationModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, createApplication, openApplication } = useAppStore();
  const { toast } = useToast();
  const [step, setStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedAppNo, setSubmittedAppNo] = React.useState("");
  const [submittedAppId, setSubmittedAppId] = React.useState("");
  const [showDiscard, setShowDiscard] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [appData, setAppData] = React.useState<AppDetailsData>({
    appType: "BUILDING_PERMISSION" as ApplicationType,
    propertyType: "RESIDENTIAL" as PropertyType,
    applicantName: user?.name ?? "",
    applicantContact: user?.phone ?? "",
    applicantEmail: user?.email ?? "",
    ltpLicense: user?.licenseNo ?? "",
  });

  const [projectData, setProjectData] = React.useState<ProjectPropertyData>({
    projectName: "",
    builtUpArea: "",
    plotArea: "",
    numFloors: "",
    numUnits: "",
    surveyNo: "",
    plotNo: "",
    ward: "",
    zone: "",
    locality: "",
    district: "Pune",
    state: "Maharashtra",
    pincode: "",
  });

  const [drawingFiles, setDrawingFiles] = React.useState<UploadedFile[]>([]);
  const [uploadedDocs, setUploadedDocs] = React.useState<Record<string, { fileName: string; fileSize: string }>>({});

  // Check if any data has been entered
  const hasData = React.useMemo(() => {
    return (
      appData.applicantName !== (user?.name ?? "") ||
      appData.applicantContact !== (user?.phone ?? "") ||
      appData.applicantEmail !== (user?.email ?? "") ||
      !!projectData.projectName ||
      !!projectData.builtUpArea ||
      !!projectData.surveyNo ||
      drawingFiles.length > 0 ||
      Object.keys(uploadedDocs).length > 0
    );
  }, [appData, projectData, drawingFiles, uploadedDocs, user]);

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setSubmitted(false);
      setErrors({});
      setDrawingFiles([]);
      setUploadedDocs({});
      setAppData({
        appType: "BUILDING_PERMISSION",
        propertyType: "RESIDENTIAL",
        applicantName: user?.name ?? "",
        applicantContact: user?.phone ?? "",
        applicantEmail: user?.email ?? "",
        ltpLicense: user?.licenseNo ?? "",
      });
      setProjectData({
        projectName: "", builtUpArea: "", plotArea: "", numFloors: "", numUnits: "",
        surveyNo: "", plotNo: "", ward: "", zone: "", locality: "",
        district: "Pune", state: "Maharashtra", pincode: "",
      });
    }
  }, [open, user]);

  // Handle close attempt
  function handleClose() {
    if (submitted || !hasData) {
      onOpenChange(false);
    } else {
      setShowDiscard(true);
    }
  }

  // Validation per step
  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!appData.appType) errs.appType = "Application type is required.";
      if (!appData.applicantName.trim()) errs.applicantName = "Applicant name is required.";
      if (!appData.applicantContact.trim()) {
        errs.applicantContact = "Mobile number is required.";
      } else if (!/^[+\d\s-]{10,}$/.test(appData.applicantContact)) {
        errs.applicantContact = "Please enter a valid mobile number.";
      }
      if (appData.applicantEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(appData.applicantEmail)) {
        errs.applicantEmail = "Please enter a valid email address.";
      }
    } else if (s === 1) {
      if (!projectData.projectName.trim()) errs.projectName = "Project name is required.";
      if (!projectData.builtUpArea) errs.builtUpArea = "Built-up area is required.";
      if (!projectData.plotArea) errs.plotArea = "Plot area is required.";
      if (!projectData.surveyNo.trim()) errs.surveyNo = "Survey number is required.";
      if (!projectData.ward) errs.ward = "Ward is required.";
      if (!projectData.zone) errs.zone = "Zone is required.";
    } else if (s === 2) {
      if (drawingFiles.length === 0) errs.drawing = "Please upload the required drawing.";
      else if (drawingFiles.some((f) => f.status !== "done")) errs.drawing = "Please wait for upload to complete.";
    } else if (s === 3) {
      // Document validation — all required docs must be uploaded
      const requiredCount = 7; // 7 required docs
      if (Object.keys(uploadedDocs).length < requiredCount) {
        errs.documents = "Please upload all required documents.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleContinue() {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleSaveDraft() {
    // Create a draft application (no drawing → DRAFT status)
    const id = createApplication({
      applicationType: appData.appType,
      propertyType: appData.propertyType,
      projectName: projectData.projectName || "Untitled Draft",
      applicantName: appData.applicantName,
      applicantContact: appData.applicantContact,
      applicantEmail: appData.applicantEmail,
      applicantAddress: projectData.locality,
      plotArea: Number(projectData.plotArea) || 0,
      builtUpArea: Number(projectData.builtUpArea) || 0,
      landUse: appData.propertyType === "COMMERCIAL" ? "Commercial (C1)" : "Residential (R1)",
      ward: projectData.ward,
      zone: projectData.zone,
      surveyNo: projectData.surveyNo,
      address: `${projectData.plotNo}, ${projectData.locality}, ${projectData.district}, ${projectData.state} — ${projectData.pincode}`,
    });
    toast({
      title: "Application saved as draft",
      description: "You can continue editing from My Applications.",
    });
    onOpenChange(false);
  }

  function handleSubmit() {
    const id = createApplication({
      applicationType: appData.appType,
      propertyType: appData.propertyType,
      projectName: projectData.projectName,
      applicantName: appData.applicantName,
      applicantContact: appData.applicantContact,
      applicantEmail: appData.applicantEmail,
      applicantAddress: `${projectData.plotNo}, ${projectData.locality}, ${projectData.district}, ${projectData.state} — ${projectData.pincode}`,
      plotArea: Number(projectData.plotArea) || 0,
      builtUpArea: Number(projectData.builtUpArea) || 0,
      landUse: appData.propertyType === "COMMERCIAL" ? "Commercial (C1)" : "Residential (R1)",
      ward: projectData.ward,
      zone: projectData.zone,
      surveyNo: projectData.surveyNo,
      address: `${projectData.plotNo}, ${projectData.locality}, ${projectData.district}, ${projectData.state} — ${projectData.pincode}`,
      drawingFileName: drawingFiles[0]?.name,
      drawingFileSize: drawingFiles[0]?.size,
      uploadedDocCodes: Object.keys(uploadedDocs),
    });
    // Get the app number from the store
    const app = useAppStore.getState().applications.find((a) => a.id === id);
    setSubmittedAppNo(app?.applicationNo ?? "MC/BP/2026/04/XXXX");
    setSubmittedAppId(id);
    setSubmitted(true);
    toast({
      title: "Application submitted successfully",
      description: `Application ${app?.applicationNo} has been created.`,
    });
  }

  function handleViewApplication() {
    onOpenChange(false);
    if (submittedAppId) openApplication(submittedAppId, "ltp-application-details");
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent
          className="flex max-h-[90vh] w-[96vw] max-w-[1200px] flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-h-[90vh]"
          showCloseButton={false}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleClose();
          }}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">New Application</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new building permit application
          </DialogDescription>

          {/* Header (fixed) */}
          <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FilePlus2 className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-semibold leading-tight">New Application</h2>
                <p className="text-xs text-muted-foreground">Create a new building permit application</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label="Close dialog"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Stepper (fixed) */}
          {!submitted && (
            <div className="border-b border-border bg-muted/20 px-6 py-3">
              <WizardStepper steps={STEPS} currentStep={step} />
            </div>
          )}

          {/* Content (scrollable) */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
                  <PartyPopper className="size-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Application Submitted Successfully</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Your application has been created and is now entering the drawing scrutiny stage.
                  </p>
                </div>
                <div className="w-full max-w-sm rounded-xl border border-border bg-muted/30 p-4 text-left">
                  <dl className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Application No.</dt>
                      <dd className="font-mono text-sm font-medium text-primary">{submittedAppNo}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</dt>
                      <dd><span className="inline-flex items-center rounded-full bg-info/10 px-2 py-0.5 text-[11px] font-medium text-info">Submitted</span></dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Next Stage</dt>
                      <dd className="text-sm font-medium">Drawing Scrutiny</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                  <Button onClick={handleViewApplication}>
                    View Application <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <ApplicationDetailsStep
                    data={appData}
                    update={(k, v) => setAppData((prev) => ({ ...prev, [k]: v }))}
                    errors={errors}
                  />
                )}
                {step === 1 && (
                  <ProjectPropertyStep
                    data={projectData}
                    update={(k, v) => setProjectData((prev) => ({ ...prev, [k]: v }))}
                    errors={errors}
                  />
                )}
                {step === 2 && (
                  <DrawingUploadStep
                    files={drawingFiles}
                    onUpload={(newFiles) => {
                      setDrawingFiles((prev) => {
                        const map = new Map(prev.map((f) => [f.id, f]));
                        newFiles.forEach((f) => map.set(f.id, f));
                        return Array.from(map.values());
                      });
                    }}
                    onRemove={(id) => setDrawingFiles((prev) => prev.filter((f) => f.id !== id))}
                    error={errors.drawing}
                  />
                )}
                {step === 3 && (
                  <DocumentsStep
                    uploadedDocs={uploadedDocs}
                    onToggle={(code, name) => {
                      setUploadedDocs((prev) => {
                        const next = { ...prev };
                        if (next[code]) {
                          delete next[code];
                        } else {
                          next[code] = { fileName: `${code}_v1.pdf`, fileSize: "1.2 MB" };
                          toast({ title: "Document uploaded", description: name });
                        }
                        return next;
                      });
                    }}
                  />
                )}
                {step === 4 && (
                  <ReviewSubmitStep
                    appData={appData}
                    projectData={projectData}
                    drawingFiles={drawingFiles}
                    uploadedDocs={uploadedDocs}
                    docCount={DOC_COUNT}
                    onEdit={(s) => setStep(s)}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer (fixed) */}
          {!submitted && (
            <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/20 px-6 py-3">
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <Button variant="outline" size="sm" onClick={handleBack}>
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSaveDraft}>
                  <Save className="size-4" /> Save as Draft
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button size="sm" onClick={handleContinue}>
                    Continue <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSubmit}>
                    <Check className="size-4" /> Submit Application
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showDiscard}
        onContinueEditing={() => setShowDiscard(false)}
        onDiscard={() => {
          setShowDiscard(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
