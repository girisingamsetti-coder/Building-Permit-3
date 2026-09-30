"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  Layers,
  FileText,
  CreditCard,
  Building2,
  Check,
  X,
  Printer,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Calendar,
  AlertCircle,
  Paperclip,
  Upload,
  Save,
  Flame,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  FileCheck2,
  FolderClosed,
} from "lucide-react";
import type { Application } from "@/types";
import { LpsPlotDetailsView, type LpsPlotRecord } from "./lps-plot-details-view";

export function LtpSubmissionDetails({
  onBack,
  baNo = "1168/0142/BP/10/015/2026",
  proposalStatus = "Scrutiny Done/Proceeding Pending",
  submissionDate = "23-07-2026",
  isDraft = false,
  initialLpsType,
  initialPlotCode,
}: {
  onBack?: () => void;
  baNo?: string;
  proposalStatus?: string;
  submissionDate?: string;
  isDraft?: boolean;
  initialLpsType?: "LPS Layout" | "Non-LPS";
  initialPlotCode?: string;
}) {
  const { applications, user, navigate, setLtpActiveMenu } = useAppStore();
  const [submissionSuccessModal, setSubmissionSuccessModal] = React.useState(false);

  // Main Tabs: Application Form | Drawings | Documentation | Payments | Apply for NOCs
  const [mainTab, setMainTab] = React.useState<"form" | "drawing" | "documentation" | "payments" | "nocs">("form");

  // ─────────────────────────────────────────────────────────────
  // DOCUMENTATION REPOSITORY STATE
  // ─────────────────────────────────────────────────────────────
  interface DocumentationRecord {
    id: string;
    code: string;
    name: string;
    category: "Ownership" | "Technical" | "NOC & Clearances" | "Affidavits";
    required: boolean;
    status: "Verified" | "Under Scrutiny" | "Uploaded";
    fileName: string;
    fileSize: string;
    uploadedDate: string;
    uploadedBy: string;
    docNo: string;
    version: string;
  }

  const [documentationList, setDocumentationList] = React.useState<DocumentationRecord[]>([
    {
      id: "doc-1",
      code: "DOC-OWN-01",
      name: "Registered Sale Deed / Title Deed",
      category: "Ownership",
      required: true,
      status: "Verified",
      fileName: "Sale_Deed_Doc_4137_2026.pdf",
      fileSize: "3.4 MB",
      uploadedDate: "23-07-2026",
      uploadedBy: "K. Ramamurthy (LTP)",
      docNo: "SD/2026/GNT/84920",
      version: "v1.0",
    },
    {
      id: "doc-2",
      code: "DOC-OWN-02",
      name: "Encumbrance Certificate (13 Years EC)",
      category: "Ownership",
      required: true,
      status: "Verified",
      fileName: "Form_15_EC_2013_2026.pdf",
      fileSize: "1.8 MB",
      uploadedDate: "23-07-2026",
      uploadedBy: "K. Ramamurthy (LTP)",
      docNo: "EC-2026-901412",
      version: "v1.0",
    },
    {
      id: "doc-3",
      code: "DOC-OWN-03",
      name: "Latest Pattadar Passbook / Mutation Extract",
      category: "Ownership",
      required: true,
      status: "Verified",
      fileName: "Revenue_Mutation_Record.pdf",
      fileSize: "2.1 MB",
      uploadedDate: "23-07-2026",
      uploadedBy: "K. Ramamurthy (LTP)",
      docNo: "MUT/2025/11029",
      version: "v1.0",
    },
    {
      id: "doc-4",
      code: "DOC-TEC-01",
      name: "Structural Stability Certificate & Calculations (Form 3)",
      category: "Technical",
      required: true,
      status: "Verified",
      fileName: "Structural_Stability_Sign.pdf",
      fileSize: "4.6 MB",
      uploadedDate: "24-07-2026",
      uploadedBy: "Er. B. Venkanna (SE-110)",
      docNo: "STR-CERT-2026-44",
      version: "v1.2",
    },
    {
      id: "doc-5",
      code: "DOC-TEC-02",
      name: "Geo-Technical Soil Investigation Report",
      category: "Technical",
      required: true,
      status: "Under Scrutiny",
      fileName: "Soil_Test_Inavolu_Block4137.pdf",
      fileSize: "6.2 MB",
      uploadedDate: "24-07-2026",
      uploadedBy: "Er. B. Venkanna (SE-110)",
      docNo: "SOIL-RPT-2026-89",
      version: "v1.0",
    },
    {
      id: "doc-6",
      code: "DOC-NOC-01",
      name: "Fire Safety Provisional Clearance / NOC",
      category: "NOC & Clearances",
      required: true,
      status: "Verified",
      fileName: "AP_Fire_Provisional_NOC_882.pdf",
      fileSize: "1.2 MB",
      uploadedDate: "25-07-2026",
      uploadedBy: "AP State Disaster & Fire",
      docNo: "NOC/FIRE/APCRDA/882",
      version: "v1.0",
    },
    {
      id: "doc-7",
      code: "DOC-NOC-02",
      name: "AAI Airport Height Clearance NOC",
      category: "NOC & Clearances",
      required: false,
      status: "Verified",
      fileName: "AAI_NOC_VJA_2026_118.pdf",
      fileSize: "980 KB",
      uploadedDate: "25-07-2026",
      uploadedBy: "Airports Authority of India",
      docNo: "AAI/SR/2026/VJA/118",
      version: "v1.0",
    },
    {
      id: "doc-8",
      code: "DOC-AFF-01",
      name: "Joint Undertaking Affidavit by Owner & Licensed Personnel",
      category: "Affidavits",
      required: true,
      status: "Verified",
      fileName: "Joint_Undertaking_Affidavit_Notarized.pdf",
      fileSize: "2.4 MB",
      uploadedDate: "23-07-2026",
      uploadedBy: "K. Ramamurthy (LTP)",
      docNo: "AFF/NOTARY/2026/771",
      version: "v1.0",
    },
    {
      id: "doc-9",
      code: "DOC-AFF-02",
      name: "Rain Water Harvesting & Tree Plantation Undertaking",
      category: "Affidavits",
      required: true,
      status: "Uploaded",
      fileName: "RWH_Greenery_Pledge_Doc.pdf",
      fileSize: "1.1 MB",
      uploadedDate: "25-07-2026",
      uploadedBy: "K. Ramamurthy (LTP)",
      docNo: "AFF/RWH/2026/304",
      version: "v1.0",
    },
  ]);

  const [docCategoryFilter, setDocCategoryFilter] = React.useState<string>("ALL");
  const [docSearchQuery, setDocSearchQuery] = React.useState<string>("");
  const [activeDocPreview, setActiveDocPreview] = React.useState<DocumentationRecord | null>(null);
  const [uploadNewDocModalOpen, setUploadNewDocModalOpen] = React.useState<boolean>(false);
  const [newDocName, setNewDocName] = React.useState<string>("");
  const [newDocCategory, setNewDocCategory] = React.useState<"Ownership" | "Technical" | "NOC & Clearances" | "Affidavits">("Ownership");
  const [newDocNumber, setNewDocNumber] = React.useState<string>("");
  const [newDocRequired, setNewDocRequired] = React.useState<boolean>(true);
  const [newDocFileName, setNewDocFileName] = React.useState<string>("");

  // Sub Tabs under Application Form
  const [subTab, setSubTab] = React.useState<
    | "general"
    | "applicant"
    | "plot"
  >("general");

  // Sub Tabs under Documentation
  const [docSubTab, setDocSubTab] = React.useState<
    | "app-checklist"
    | "doc-checklist"
    | "others"
    | "repository"
  >("app-checklist");

  // ─────────────────────────────────────────────────────────────
  // 1. GENERAL INFORMATION STATE
  // ─────────────────────────────────────────────────────────────
  const [caseType, setCaseType] = React.useState("New");
  const [permissionType, setPermissionType] = React.useState("Building Permission");
  const [natureOfPermission, setNatureOfPermission] = React.useState("General");
  const [applicationType, setApplicationType] = React.useState<"Private" | "Govt land" | "CRDA land">("Private");
  const [isLpsLayout, setIsLpsLayout] = React.useState<"LPS Layout" | "Non-LPS">(
    initialLpsType ?? (baNo.includes("/LPS/") ? "LPS Layout" : "Non-LPS")
  );
  const [district, setDistrict] = React.useState("Guntur");
  const [mandal, setMandal] = React.useState("Thullur");
  const [revenueVillage, setRevenueVillage] = React.useState("INAVOLU");
  const [gramPanchayat, setGramPanchayat] = React.useState("INAVOLU");
  const [governmentProposal, setGovernmentProposal] = React.useState("NA");

  // LPS Layout Specific Fields (matching user screenshot)
  const [lpsBlockNo, setLpsBlockNo] = React.useState("4137");
  const [lpsSurveyNo, setLpsSurveyNo] = React.useState("231229230");
  const [lpsPlotNo, setLpsPlotNo] = React.useState("11-502-4137-9-D82");
  const [lpsLandUseZone, setLpsLandUseZone] = React.useState("Residential");
  const [lpsZoningDistrict, setLpsZoningDistrict] = React.useState("R3-Medium to High density");
  const [lpsProposedUse, setLpsProposedUse] = React.useState("Residential");
  const [lpsProposedActivity, setLpsProposedActivity] = React.useState("Residential Apartment Bldg");
  const [lpsRoadStreet, setLpsRoadStreet] = React.useState("ROAD");
  const [lpsBuildingHeight, setLpsBuildingHeight] = React.useState("30");

  const handleLpsPlotLoaded = (rec: LpsPlotRecord) => {
    setOwnerName(rec.owners);
    setMandal(rec.mandal);
    setDistrict(rec.district);
    setRevenueVillage(rec.village);
    setGramPanchayat(rec.village);
    setLpsBlockNo(rec.block);
    setLpsPlotNo(rec.plotCode);
    setLpsSurveyNo(rec.rsNumber);
    setLpsLandUseZone(rec.landUse);
    setLpsZoningDistrict(rec.zoning);
    setPlotAreaProposed(rec.netPlotAreaM2);
    setPlotAreaDocument(rec.allottedExtent);
    setPlotAreaGround(rec.netPlotAreaM2);
  };

  // Nature of Site (5 Options)
  const siteNatureOptions = [
    {
      id: "approved-layout",
      title: "Approved Layout",
      desc: "For developing Approved Layout",
    },
    {
      id: "regularized-plot",
      title: "Regularized Plot Under LRS/RLP",
      desc: "For developing Regularized Plot Under LRS/RLP",
    },
    {
      id: "plot-part-lrs",
      title: "Plot Part Of LRS/RLP Layout but Not Regularized",
      desc: "14% Open space charges +33% Penalization charges",
    },
    {
      id: "gramkantam",
      title: "Gramkantam",
      desc: "14% Open space charges are not applicable",
    },
    {
      id: "extended-habitation",
      title: "Extended Habitation exempted from LPS",
      desc: "14% Open space charges are applicable if applicant has not satisfying as per few conditions",
    },
  ];
  const [selectedSiteNature, setSelectedSiteNature] = React.useState("gramkantam");

  // Lower General Info Fields
  const [layoutLocation, setLayoutLocation] = React.useState("INAVOLU");
  const [blockNo, setBlockNo] = React.useState("NA");
  const [rsNo, setRsNo] = React.useState("87-1");
  const [zoningDistrict, setZoningDistrict] = React.useState("R1-Village Planning Zone");
  const [landUseZone, setLandUseZone] = React.useState("Residential");
  const [proposedActivity, setProposedActivity] = React.useState("Bungalow/ Dwelling / Non Apartment");
  const [proposedUse, setProposedUse] = React.useState("Residential");
  const [buildingHeight, setBuildingHeight] = React.useState("10.00 m");
  const [roadStreet, setRoadStreet] = React.useState("12.00 m wide road");

  // ─────────────────────────────────────────────────────────────
  // 2. APPLICANT INFORMATION STATE (Image 1)
  // ─────────────────────────────────────────────────────────────
  const [sectionLtpOpen, setSectionLtpOpen] = React.useState(true);
  const [sectionApplicantOpen, setSectionApplicantOpen] = React.useState(true);
  const [sectionStructuralOpen, setSectionStructuralOpen] = React.useState(true);

  // Licensed Technical Personnel's Information
  const [ltpType, setLtpType] = React.useState("Engineer");
  const [ltpAddress, setLtpAddress] = React.useState("$$");
  const [ltpName, setLtpName] = React.useState("SRINIVAS ALLU");
  const [ltpValidity, setLtpValidity] = React.useState("17/1/2028");
  const [ltpLicenseNo, setLtpLicenseNo] = React.useState("MAU61-DPOVU(LE)/34/2021");
  const [ltpEmail, setLtpEmail] = React.useState("sreenivasallu@gmail.com");
  const [ltpMobile, setLtpMobile] = React.useState("9676865523");
  const [ltpAadhaar, setLtpAadhaar] = React.useState("589412094381");
  const [showLtpAadhaar, setShowLtpAadhaar] = React.useState(false);

  // Applicant's Information
  const [applicantUseType, setApplicantUseType] = React.useState<"Self Use" | "Selling">("Self Use");
  const [ownerName, setOwnerName] = React.useState("NANNAPANENI RAMBABU");
  const [applicantRoadStreet, setApplicantRoadStreet] = React.useState("");
  const [doorNo, setDoorNo] = React.useState("1-93");
  const [applicantDistrict, setApplicantDistrict] = React.useState("Guntur");
  const [city, setCity] = React.useState("Ainavolu");
  const [applicantEmail, setApplicantEmail] = React.useState("krishnaltp@gmail.com");
  const [pinCode, setPinCode] = React.useState("522503");
  const [applicantMobile, setApplicantMobile] = React.useState("7989974399");
  const [landlineNumber, setLandlineNumber] = React.useState("");
  const [applicantAadhaar, setApplicantAadhaar] = React.useState("982345671234");
  const [showApplicantAadhaar, setShowApplicantAadhaar] = React.useState(false);

  // Structural Engineer Information
  const [structuralName, setStructuralName] = React.useState("Select");
  const [structuralAddress, setStructuralAddress] = React.useState("");
  const [structuralValidity, setStructuralValidity] = React.useState("");

  // ─────────────────────────────────────────────────────────────
  // 3. PLOT DETAILS STATE (Image 2)
  // ─────────────────────────────────────────────────────────────
  const [sectionProposedOpen, setSectionProposedOpen] = React.useState(true);
  const [sectionSiteDetailsOpen, setSectionSiteDetailsOpen] = React.useState(true);
  const [sectionScheduleOpen, setSectionScheduleOpen] = React.useState(true);

  // Proposed Construction
  const [plotAreaProposed, setPlotAreaProposed] = React.useState("83.59");
  const [plotAreaDocument, setPlotAreaDocument] = React.useState("83.61");
  const [plotAreaGround, setPlotAreaGround] = React.useState("83.59");
  const [plotStructure, setPlotStructure] = React.useState("Below 200 sq m");
  const [isAffectingRoadWidening, setIsAffectingRoadWidening] = React.useState<"Yes" | "No">("No");
  const [proposedBuiltUpArea, setProposedBuiltUpArea] = React.useState("57.02");
  const [isCompoundWallProposed, setIsCompoundWallProposed] = React.useState<"Yes" | "No">("No");
  const [roadWidthInput, setRoadWidthInput] = React.useState("0");

  // Site Details
  const [abutsExistingRoad, setAbutsExistingRoad] = React.useState<"Yes" | "No">("Yes");
  const [statusOfRoad, setStatusOfRoad] = React.useState<"Public" | "Private">("Public");
  const [natureOfRoad, setNatureOfRoad] = React.useState("CC - Concrete");
  const [widthOfApproachRoad, setWidthOfApproachRoad] = React.useState("3");
  const [plotNearbyReligious, setPlotNearbyReligious] = React.useState("NA");
  const [vicinityAerodrome, setVicinityAerodrome] = React.useState<"Yes" | "No">("No");
  const [vicinityWaterBodies, setVicinityWaterBodies] = React.useState<"Yes" | "No">("No");
  const [marketValue, setMarketValue] = React.useState("5750");
  const [abuttingIrr, setAbuttingIrr] = React.useState<"Yes" | "No">("No");

  // Schedule of Boundaries
  const [northBoundary, setNorthBoundary] = React.useState("Others");
  const [northNo, setNorthNo] = React.useState("");
  const [southBoundary, setSouthBoundary] = React.useState("Others");
  const [southNo, setSouthNo] = React.useState("");
  const [eastBoundary, setEastBoundary] = React.useState("Others");
  const [eastNo, setEastNo] = React.useState("");
  const [westBoundary, setWestBoundary] = React.useState("Others");
  const [westNo, setWestNo] = React.useState("");

  // ─────────────────────────────────────────────────────────────
  // 4. APPLICATION CHECKLIST STATE (Image 3)
  // ─────────────────────────────────────────────────────────────
  const initialChecklist = [
    {
      id: 1,
      desc: "Whether Zoning district is R1 zone, Individual Residential buildings and size of the plot is greater than 200.00sqmt. or height above 7m?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 2,
      desc: "Whether the Zoning district of the plot is other than R1 zone?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 3,
      desc: "Whether any applicability of clearance certificate for payment of tax arrears?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 4,
      desc: "Whether the height of the building is greater than 10 mtr ?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 5,
      desc: "Whether the Commercial building height is greater than 15 mtr.?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 6,
      desc: "Whether the buildings of Educational, Cinema Theatres, Functional halls & other Assembly buildings where plot area is greater than 500 sq.m or height is greater than 6 mtr?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 7,
      desc: "Whether Residential Building and the height of the building is greater than 18mtr or Group housing?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 8,
      desc: "Whether In case of land leased/allotted by APCRDA ?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 9,
      desc: "Proposed building with Built-up Area above 20000 Sq.m?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 10,
      desc: "Whether the proposed site is located within the distance of above 100m and upto 200m from the protected Monuments as notified under Archaeological monuments and Ancient sites?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 11,
      desc: "Whether edge of the proposed building is within 30 mts distance from the railway property boundary?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 12,
      desc: "Whether site falls in Extended Habitation exempted from LPS?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 13,
      desc: "Whether Site falls under IPLP/ RLP but not regularized?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
    {
      id: 14,
      desc: "Whether any approved plan/ regularized plan given in the proposed site?",
      val: "No" as "Yes" | "No",
      remark: "",
    },
  ];
  const [checklistItems, setChecklistItems] = React.useState(initialChecklist);

  const updateChecklistItem = (id: number, val: "Yes" | "No") => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, val } : item))
    );
  };

  const updateChecklistRemark = (id: number, remark: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remark } : item))
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 5. DOCUMENT CHECKLIST STATE (Image 4)
  // ─────────────────────────────────────────────────────────────
  const [docTab, setDocTab] = React.useState<"Primary" | "Additional">("Primary");

  const [documentItems, setDocumentItems] = React.useState([
    {
      id: 1,
      title:
        "Original sale deed, registered under the provisions of the Indian Registration Act, 1908/Certified copy issued by Stamps and Registration Department for the perusal of the sanctioning authority and cross veri cation with the attested copy submitted with the building application.",
      files: ["sale_deed_reg_doc_87_1.pdf (1.8 MB)"],
      checked: true,
    },
    {
      id: 2,
      title:
        "Certificate of Supervision shall be in the form prescribed by Commissioner and shall be duly signed by the Licensed Professional as per Section 209.1 (vii) per the Capital City ZR",
      files: ["supervision_cert_signed.pdf (640 KB)"],
      checked: true,
    },
    {
      id: 3,
      title:
        "Attested copy of the Land Pooling Ownership Certificate issued by APCRDA or in case of other than land pooling equivalent document in support of ownership.",
      files: ["lpoc_inavolu_allotment.pdf (2.1 MB)"],
      checked: true,
    },
    {
      id: 4,
      title:
        "The Owner and Builder/Developer shall give and Affidavit duly notarized to the effect that in the case of any violation from the sanction building plan.",
      files: ["notarized_affidavit_violation_undertaking.pdf (512 KB)"],
      checked: true,
    },
    {
      id: 5,
      title: "Certification of appointment to New LTP",
      files: ["ltp_appointment_srinuvas_allu.pdf (420 KB)"],
      checked: true,
    },
  ]);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = React.useState<{ title: string; files: string[] } | null>(null);
  const [uploadDocModal, setUploadDocModal] = React.useState<{ id: number; title: string } | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 6. OTHERS STATE (Image 5)
  // ─────────────────────────────────────────────────────────────
  const [sectionOthersOpen, setSectionOthersOpen] = React.useState(true);
  const [contractorRiskPolicyNo, setContractorRiskPolicyNo] = React.useState("");
  const [contractorDate, setContractorDate] = React.useState("");
  const [validUptoDate, setValidUptoDate] = React.useState("");
  const [mortgageDeedNo, setMortgageDeedNo] = React.useState("");
  const [mortgageDeedDate, setMortgageDeedDate] = React.useState("");
  const [floorHandedOver, setFloorHandedOver] = React.useState("");
  const [mortgageArea, setMortgageArea] = React.useState("0");
  const [subRegisterOffice, setSubRegisterOffice] = React.useState("");

  // Modals & Feedback
  const [proposalFlowOpen, setProposalFlowOpen] = React.useState(false);
  const [reportsOpen, setReportsOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 7. APPLY FOR NOCS STATE
  // ─────────────────────────────────────────────────────────────
  const [hasFireNoc, setHasFireNoc] = React.useState<"NA" | "No" | "Yes">("No");
  const [fireNocRefNo, setFireNocRefNo] = React.useState("");
  const [fireNocIssueDate, setFireNocIssueDate] = React.useState("");
  const [fireNocDocAttached, setFireNocDocAttached] = React.useState(false);
  const [hasAaiNoc, setHasAaiNoc] = React.useState<"NA" | "No" | "Yes">("NA");
  const [aaiNocRefNo, setAaiNocRefNo] = React.useState("AAI/SR/2026/VJA/118");
  const [aaiNocIssueDate, setAaiNocIssueDate] = React.useState("2026-06-15");
  const [hasEnvNoc, setHasEnvNoc] = React.useState<"NA" | "No" | "Yes">("NA");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const renderApplicantCard = (compact: boolean = false) => (
    <div className="bg-[#FBF3E4] border-2 border-[#7A1316] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
      <button
        type="button"
        onClick={() => setSectionApplicantOpen(!sectionApplicantOpen)}
        className="w-full bg-[#7A1316] text-white px-3.5 sm:px-4 py-2 text-xs font-bold flex items-center justify-between cursor-pointer shrink-0"
      >
        <span className="flex items-center gap-1.5 tracking-wide">
          <span className="text-xs font-mono">{sectionApplicantOpen ? "▲" : "▼"}</span>
          Applicant&apos;s Information
        </span>
        <span className="text-[10px] text-amber-200 uppercase font-mono tracking-wider">Owner / Promoters</span>
      </button>

      {sectionApplicantOpen && (
        <div
          className={cn(
            "p-3.5 sm:p-5 text-xs flex-1 grid content-between",
            compact
              ? "grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5"
              : "grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5"
          )}
        >
          {/* Row 1: Self Use or Selling */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCD5C8]/60 pb-2 md:col-span-2"
          >
            <label className="font-bold text-slate-800 shrink-0 text-xs">
              <span className="text-rose-600 font-black mr-1">*</span> Application is for Self Use or Selling Purpose?
            </label>
            <div className="flex items-center gap-6 sm:w-52 md:w-56 xl:w-60 2xl:w-64">
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800 text-xs">
                <input
                  type="radio"
                  name="appUseType"
                  checked={applicantUseType === "Self Use"}
                  onChange={() => setApplicantUseType("Self Use")}
                  className="accent-[#7A1316] cursor-pointer"
                />
                <span>Self Use</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800 text-xs">
                <input
                  type="radio"
                  name="appUseType"
                  checked={applicantUseType === "Selling"}
                  onChange={() => setApplicantUseType("Selling")}
                  className="accent-[#7A1316] cursor-pointer"
                />
                <span>Selling</span>
              </label>
            </div>
          </div>

          {/* Row 2: Owner Name & Road/Street */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <label className="font-bold text-slate-800 shrink-0 text-xs">
              <span className="text-rose-600 font-black mr-1">*</span> Owner Name (In Full)
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full sm:w-52 md:w-56 xl:w-60 2xl:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 font-medium outline-none focus:border-[#7A1316]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <label className="font-semibold text-slate-800 shrink-0 text-xs">Road/Street</label>
            <input
              type="text"
              value={applicantRoadStreet}
              onChange={(e) => setApplicantRoadStreet(e.target.value)}
              className="w-full sm:w-52 md:w-56 xl:w-60 2xl:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 outline-none focus:border-[#7A1316]"
            />
          </div>

          {/* Row 3: Door No & District */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <label className="font-bold text-slate-800 shrink-0 text-xs">
              <span className="text-rose-600 font-black mr-1">*</span> Door No./Flat No.
            </label>
            <input
              type="text"
              value={doorNo}
              onChange={(e) => setDoorNo(e.target.value)}
              className="w-full sm:w-52 md:w-56 xl:w-60 2xl:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 outline-none focus:border-[#7A1316]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <label className="font-bold text-slate-800 shrink-0 text-xs">
              <span className="text-rose-600 font-black mr-1">*</span> District
            </label>
            <input
              type="text"
              value={applicantDistrict}
              onChange={(e) => setApplicantDistrict(e.target.value)}
              className="w-full sm:w-52 md:w-56 xl:w-60 2xl:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 outline-none focus:border-[#7A1316]"
            />
          </div>

          {/* Row 4: City & Email */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <label className="font-bold text-slate-800 shrink-0 text-xs">
              <span className="text-rose-600 font-black mr-1">*</span> City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full sm:w-52 md:w-56 xl:w-60 2xl:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 outline-none focus:border-[#7A1316]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <label className="font-bold text-slate-800 shrink-0 text-xs">
              <span className="text-rose-600 font-black mr-1">*</span> Email
            </label>
            <input
              type="email"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              className="w-full sm:w-52 md:w-56 xl:w-60 2xl:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 outline-none focus:border-[#7A1316]"
            />
          </div>

          {/* Row 5: PinCode & Mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <label className="font-bold text-slate-800 shrink-0 text-xs">
              <span className="text-rose-600 font-black mr-1">*</span> PinCode
            </label>
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full sm:w-52 md:w-56 xl:w-60 2xl:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 font-mono outline-none focus:border-[#7A1316]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <label className="font-bold text-slate-800 shrink-0 text-xs">
              <span className="text-rose-600 font-black mr-1">*</span> Mobile
            </label>
            <input
              type="text"
              value={applicantMobile}
              onChange={(e) => setApplicantMobile(e.target.value)}
              className="w-full sm:w-52 md:w-56 xl:w-60 2xl:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 font-mono outline-none focus:border-[#7A1316]"
            />
          </div>

          {/* Row 6: Mobile Number & Aadhaar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <label className="font-semibold text-slate-800 shrink-0 text-xs">Mobile Number</label>
            <input
              type="text"
              value={landlineNumber}
              onChange={(e) => setLandlineNumber(e.target.value)}
              placeholder="Enter Mobile Number"
              className="w-full sm:w-52 md:w-56 xl:w-60 2xl:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 font-mono outline-none focus:border-[#7A1316]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <label className="font-bold text-slate-800 shrink-0 text-xs">
              <span className="text-rose-600 font-black mr-1">*</span> Aadhaar No.
            </label>
            <div className="relative w-full sm:w-52 md:w-56 xl:w-60 2xl:w-64">
              <input
                type={showApplicantAadhaar ? "text" : "password"}
                value={applicantAadhaar}
                onChange={(e) => setApplicantAadhaar(e.target.value)}
                className="w-full h-8 bg-white border border-[#DCD5C8] rounded pl-2.5 pr-8 text-xs text-slate-800 font-mono outline-none focus:border-[#7A1316]"
              />
              <button
                type="button"
                onClick={() => setShowApplicantAadhaar(!showApplicantAadhaar)}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showApplicantAadhaar ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );

  const renderStructuralEngineerCard = (compact: boolean = false, isBelowSearch: boolean = false) => (
    <div
      className={cn(
        "bg-[#FAF7F2] rounded-xl shadow-xs overflow-hidden h-full flex flex-col justify-between",
        isBelowSearch ? "border-2 border-[#7A1316]" : "border border-[#7A1316]/50"
      )}
    >
      <button
        type="button"
        onClick={() => setSectionStructuralOpen(!sectionStructuralOpen)}
        className="w-full bg-[#7A1316] text-white px-3.5 sm:px-4 py-2 text-xs font-bold flex items-center justify-between cursor-pointer shrink-0"
      >
        <span className="flex items-center gap-2 tracking-wide">
          <span className="text-xs font-mono">{sectionStructuralOpen ? "▲" : "▼"}</span>
          Structural Engineer
        </span>
        <span className="text-[10px] text-amber-200 uppercase font-mono tracking-wider">
          Structural Stability
        </span>
      </button>

      {sectionStructuralOpen && (
        <div className="p-3.5 sm:p-5 text-xs bg-[#FAF7F2] flex-1 flex flex-col justify-between">
          <div
            className={cn(
              "grid gap-x-6 gap-y-3.5 items-center",
              isBelowSearch
                ? "grid-cols-1 md:grid-cols-2"
                : compact
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-x-5 gap-y-2.5"
                  : "grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3"
            )}
          >
            {/* Field 1: Structural Engineer Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <label className="font-bold text-slate-800 shrink-0 text-xs">
                Structural Engineer Name
              </label>
              <select
                value={structuralName}
                onChange={(e) => setStructuralName(e.target.value)}
                className="w-full sm:w-52 md:w-56 xl:w-52 2xl:w-60 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 outline-none focus:border-[#7A1316]"
              >
                <option value="Select">Select</option>
                <option value="Er. P. Ramachandra Rao">Er. P. Ramachandra Rao</option>
                <option value="Er. K. Suresh Kumar">Er. K. Suresh Kumar</option>
              </select>
            </div>

            {/* Field 2: Validity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <label className="font-bold text-slate-800 shrink-0 text-xs">Validity</label>
              <input
                type="text"
                value={structuralValidity}
                onChange={(e) => setStructuralValidity(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full sm:w-52 md:w-56 xl:w-52 2xl:w-60 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 outline-none focus:border-[#7A1316]"
              />
            </div>

            {/* Field 3: Address */}
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2",
                isBelowSearch && "col-span-1 md:col-span-2"
              )}
            >
              <label className="font-bold text-slate-800 shrink-0 text-xs">Address</label>
              <input
                type="text"
                value={structuralAddress}
                onChange={(e) => setStructuralAddress(e.target.value)}
                placeholder="Enter Address"
                className={cn(
                  "h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-xs text-slate-800 outline-none focus:border-[#7A1316]",
                  isBelowSearch
                    ? "w-full sm:flex-1 sm:ml-4"
                    : "w-full sm:w-52 md:w-56 xl:w-52 2xl:w-60"
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderApplicantCards = (compact: boolean = false) => (
    <div className="w-full space-y-4">
      {renderApplicantCard(compact)}
      {renderStructuralEngineerCard(compact, false)}
    </div>
  );

  return (
    <div className="w-full h-full bg-[#FAF7F2] flex flex-col font-sans text-slate-800 overflow-hidden select-none">


      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 right-6 z-50 bg-[#7A1316] text-white text-xs font-semibold px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in-50 slide-in-from-top-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── MAIN TABS (Application Form | Drawings | Documentation | Payments) ── */}
      <div className="bg-[#FAF7F2] border-b border-[#DCD5C8] px-4 pt-2 flex items-center gap-1 shrink-0">
        <button
          onClick={() => setMainTab("form")}
          className={cn(
            "px-4 py-2 text-xs font-bold transition-all relative border-b-2 cursor-pointer flex items-center gap-1.5",
            mainTab === "form"
              ? "text-[#7A1316] border-[#7A1316] font-black bg-[#FBF3E4] rounded-t-md border-t border-x border-[#DCD5C8] border-b-transparent -mb-[1px]"
              : "text-slate-600 border-transparent hover:text-slate-900"
          )}
        >
          <FileText className="size-3.5" />
          <span>Application Form</span>
        </button>
        <button
          onClick={() => setMainTab("drawing")}
          className={cn(
            "px-4 py-2 text-xs font-bold transition-all relative border-b-2 cursor-pointer flex items-center gap-1.5",
            mainTab === "drawing"
              ? "text-[#7A1316] border-[#7A1316] font-black bg-[#FBF3E4] rounded-t-md border-t border-x border-[#DCD5C8] border-b-transparent -mb-[1px]"
              : "text-slate-600 border-transparent hover:text-slate-900"
          )}
        >
          <Layers className="size-3.5" />
          <span>Drawings</span>
        </button>
        <button
          onClick={() => setMainTab("documentation")}
          className={cn(
            "px-4 py-2 text-xs font-bold transition-all relative border-b-2 cursor-pointer flex items-center gap-1.5",
            mainTab === "documentation"
              ? "text-[#7A1316] border-[#7A1316] font-black bg-[#FBF3E4] rounded-t-md border-t border-x border-[#DCD5C8] border-b-transparent -mb-[1px]"
              : "text-slate-600 border-transparent hover:text-slate-900"
          )}
        >
          <Paperclip className="size-3.5" />
          <span>Documentation</span>
        </button>
        <button
          onClick={() => setMainTab("payments")}
          className={cn(
            "px-4 py-2 text-xs font-bold transition-all relative border-b-2 cursor-pointer flex items-center gap-1.5",
            mainTab === "payments"
              ? "text-[#7A1316] border-[#7A1316] font-black bg-[#FBF3E4] rounded-t-md border-t border-x border-[#DCD5C8] border-b-transparent -mb-[1px]"
              : "text-slate-600 border-transparent hover:text-slate-900"
          )}
        >
          <CreditCard className="size-3.5" />
          <span>Payments</span>
        </button>
        <button
          onClick={() => setMainTab("nocs")}
          className={cn(
            "px-4 py-2 text-xs font-bold transition-all relative border-b-2 cursor-pointer flex items-center gap-1.5",
            mainTab === "nocs"
              ? "text-[#7A1316] border-[#7A1316] font-black bg-[#FBF3E4] rounded-t-md border-t border-x border-[#DCD5C8] border-b-transparent -mb-[1px]"
              : "text-slate-600 border-transparent hover:text-slate-900"
          )}
        >
          <Flame className="size-3.5 text-orange-600" />
          <span>Apply for NOCs</span>
        </button>
      </div>

      {/* ── SUB-TABS (When Application Form is active) ── */}
      {mainTab === "form" && (
        <div className="bg-[#FBF3E4] border-b border-[#DCD5C8] px-4 py-1.5 flex items-center flex-wrap gap-x-6 gap-y-1 text-xs shrink-0 shadow-2xs">
          {[
            { id: "general", label: "General Information" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as typeof subTab)}
              className={cn(
                "font-semibold transition-colors cursor-pointer relative py-0.5",
                subTab === tab.id
                  ? "text-[#7A1316] font-black underline underline-offset-4 decoration-2 decoration-[#7A1316]"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── SUB-TABS (When Documentation is active) ── */}
      {mainTab === "documentation" && (
        <div className="bg-[#FBF3E4] border-b border-[#DCD5C8] px-4 py-1.5 flex items-center flex-wrap gap-x-6 gap-y-1 text-xs shrink-0 shadow-2xs">
          {[
            { id: "app-checklist", label: "Application Checklist" },
            { id: "doc-checklist", label: "Document Checklist" },
            { id: "others", label: "Others" },
            { id: "repository", label: "Document Repository & Files" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDocSubTab(tab.id as typeof docSubTab)}
              className={cn(
                "font-semibold transition-colors cursor-pointer relative py-0.5",
                docSubTab === tab.id
                  ? "text-[#7A1316] font-black underline underline-offset-4 decoration-2 decoration-[#7A1316]"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── CONTENT BODY AREA (Scrollable) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-[#FAF7F2]">
        {/* ========================================================================= */}
        {/* SUB-TAB 1: GENERAL INFORMATION                                           */}
        {/* ========================================================================= */}
        {mainTab === "form" && subTab === "general" && (
          isLpsLayout === "LPS Layout" ? (
            <div className="w-full pb-8">
              <LpsPlotDetailsView
                initialPlotCode={initialPlotCode || ""}
                onPlotLoaded={handleLpsPlotLoaded}
                onSaveAndNext={() => {
                  showToast("Application saved successfully!");
                  setSubmissionSuccessModal(true);
                }}
                onBack={onBack ? onBack : () => navigate("ltp-dashboard")}
                applicantSlot={renderApplicantCard(true)}
                structuralEngineerSlot={renderStructuralEngineerCard(true, true)}
              />
            </div>
          ) : (
            <div className="w-full bg-[#FBF3E4] border-2 border-[#7A1316] rounded-xl shadow-xs p-4 sm:p-6 space-y-6">
            {/* Form Fields: Two Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
              {/* Row 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0">
                  <span className="text-rose-600 font-black mr-1">*</span> Case Type
                </label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                >
                  <option value="New">New</option>
                  <option value="Revision">Revision</option>
                  <option value="Renewal">Renewal</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0">
                  <span className="text-rose-600 font-black mr-1">*</span> Permission Type
                </label>
                <select
                  value={permissionType}
                  onChange={(e) => setPermissionType(e.target.value)}
                  className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                >
                  <option value="Building Permission">Building Permission</option>
                  <option value="Layout Approval">Layout Approval</option>
                  <option value="Occupancy Certificate">Occupancy Certificate</option>
                </select>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0">
                  <span className="text-rose-600 font-black mr-1">*</span> Nature of Permission
                </label>
                <select
                  value={natureOfPermission}
                  onChange={(e) => setNatureOfPermission(e.target.value)}
                  className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                >
                  <option value="General">General</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0">
                  <span className="text-rose-600 font-black mr-1">*</span> Application Type
                </label>
                <div className="flex items-center gap-4 w-full sm:w-64">
                  {(["Private", "Govt land", "CRDA land"] as const).map((opt) => (
                    <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                      <input
                        type="radio"
                        name="appType"
                        checked={applicationType === opt}
                        onChange={() => setApplicationType(opt)}
                        className="accent-[#7A1316] cursor-pointer"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0">
                  <span className="text-rose-600 font-black mr-1">*</span> Application is from LPS Layout?
                </label>
                <div className="flex items-center gap-2 w-full sm:w-64">
                  <span className="text-xs font-bold text-[#7A1316]">
                    {isLpsLayout}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0">
                  <span className="text-rose-600 font-black mr-1">*</span> Mandal
                </label>
                <select
                  value={mandal}
                  onChange={(e) => setMandal(e.target.value)}
                  className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                >
                  <option value="Thullur">Thullur</option>
                  <option value="Mangalagiri">Mangalagiri</option>
                  <option value="Tadepalle">Tadepalle</option>
                </select>
              </div>

              {/* Row 4 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0">
                  <span className="text-rose-600 font-black mr-1">*</span> District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                >
                  <option value="Guntur">Guntur</option>
                  <option value="Krishna">Krishna</option>
                  <option value="NTR">NTR</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0">
                  <span className="text-rose-600 font-black mr-1">*</span> Gram panchayat
                </label>
                <select
                  value={gramPanchayat}
                  onChange={(e) => setGramPanchayat(e.target.value)}
                  className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                >
                  <option value="INAVOLU">INAVOLU</option>
                  <option value="Velagapudi">Velagapudi</option>
                  <option value="Nelapadu">Nelapadu</option>
                </select>
              </div>

              {/* Row 5 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0">
                  <span className="text-rose-600 font-black mr-1">*</span> Revenue Village
                </label>
                <select
                  value={revenueVillage}
                  onChange={(e) => setRevenueVillage(e.target.value)}
                  className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                >
                  <option value="INAVOLU">INAVOLU</option>
                  <option value="Velagapudi">Velagapudi</option>
                  <option value="Nelapadu">Nelapadu</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 shrink-0">
                  <span className="text-rose-600 font-black mr-1">*</span> Government Proposal
                </label>
                <select
                  value={governmentProposal}
                  onChange={(e) => setGovernmentProposal(e.target.value)}
                  className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                >
                  <option value="NA">NA</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            {/* When Non-LPS is selected: Nature of Site and site details are required. When LPS Layout is selected: these details are not required and removed. */}
            {isLpsLayout === "Non-LPS" && (
              <>
                <hr className="border-[#DCD5C8]" />

                {/* Nature of Site (5 Selectable Cards) */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      <span className="text-rose-600 font-black mr-1">*</span> Nature of Site
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select the Nature of Site you want to apply for (Required for Non-LPS layout)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {siteNatureOptions.map((opt) => {
                      const isSelected = selectedSiteNature === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedSiteNature(opt.id)}
                          className={cn(
                            "rounded-lg p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between text-center relative",
                            isSelected
                              ? "border-2 border-[#7A1316] bg-[#FDF6ED] shadow-xs"
                              : "border border-[#DCD5C8] bg-white/80 hover:bg-[#FAF4EB]"
                          )}
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={cn(
                                "size-4 rounded-full border flex items-center justify-center transition-colors",
                                isSelected ? "border-[#7A1316] bg-[#7A1316]" : "border-slate-400 bg-white"
                              )}
                            >
                              {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-xs font-bold text-slate-900 leading-tight">
                              {opt.title}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-2 leading-snug">
                            {opt.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lower Site Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Layout Location
                    </label>
                    <select
                      value={layoutLocation}
                      onChange={(e) => setLayoutLocation(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                    >
                      <option value="INAVOLU">INAVOLU</option>
                      <option value="Thullur">Thullur</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Block No.
                    </label>
                    <select
                      value={blockNo}
                      onChange={(e) => setBlockNo(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                    >
                      <option value="NA">NA</option>
                      <option value="Block-A">Block-A</option>
                      <option value="Block-B">Block-B</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> RS/TS/NTS/D No.
                    </label>
                    <input
                      type="text"
                      value={rsNo}
                      onChange={(e) => setRsNo(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Zoning District
                    </label>
                    <select
                      value={zoningDistrict}
                      onChange={(e) => setZoningDistrict(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                    >
                      <option value="R1-Village Planning Zone">R1-Village Planning Zone</option>
                      <option value="R2-Medium Density Residential">R2-Medium Density Residential</option>
                      <option value="C1-Commercial Zone">C1-Commercial Zone</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Land Use Zone
                    </label>
                    <select
                      value={landUseZone}
                      onChange={(e) => setLandUseZone(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Public & Semi-Public">Public & Semi-Public</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Proposed Activity
                    </label>
                    <select
                      value={proposedActivity}
                      onChange={(e) => setProposedActivity(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                    >
                      <option value="Bungalow/ Dwelling / Non Apartment">Bungalow/ Dwelling / Non Apartment</option>
                      <option value="Apartment Building">Apartment Building</option>
                      <option value="Commercial Complex">Commercial Complex</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Proposed Use
                    </label>
                    <select
                      value={proposedUse}
                      onChange={(e) => setProposedUse(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Mixed Use">Mixed Use</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Building Height
                    </label>
                    <input
                      type="text"
                      value={buildingHeight}
                      onChange={(e) => setBuildingHeight(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      Road/Street
                    </label>
                    <input
                      type="text"
                      value={roadStreet}
                      onChange={(e) => setRoadStreet(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                    />
                  </div>
                </div>
              </>
            )}



            {/* Bottom Action Footer / Next Button */}
            <div className="pt-4 border-t border-[#DCD5C8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Ensure all mandatory fields marked with <span className="text-rose-600 font-bold">*</span> are verified before proceeding.
              </div>
              <button
                type="button"
                onClick={(e) => {
                  showToast("General Information saved. Proceeding to Applicant Information...");
                  setSubTab("applicant");
                  (e.currentTarget.closest(".overflow-y-auto") as HTMLElement)?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center justify-center gap-2 group shrink-0"
              >
                <span>Next: Applicant Information</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )
      )}

        {/* ========================================================================= */}
        {/* SUB-TAB 2: APPLICANT INFORMATION (Image 1)                                */}
        {/* ========================================================================= */}
        {mainTab === "form" && subTab === "applicant" && (
          <div className="w-full space-y-4 pb-8">
            {renderApplicantCards(false)}

            {/* Bottom Action Footer / Next Button */}
            <div className="bg-[#FBF3E4] border-2 border-[#7A1316]/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    setSubTab("general");
                    (e.currentTarget.closest(".overflow-y-auto") as HTMLElement)?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-[#DCD5C8] text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back: General Information</span>
                </button>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Step 2 of 3: Applicant &amp; Technical Personnel
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  showToast("Applicant Information saved. Proceeding to Plot Details...");
                  setSubTab("plot");
                  (e.currentTarget.closest(".overflow-y-auto") as HTMLElement)?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center justify-center gap-2 group shrink-0"
              >
                <span>Next: Plot Details</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 3: PLOT DETAILS (Image 2)                                         */}
        {/* ========================================================================= */}
        {mainTab === "form" && subTab === "plot" && (
          <div className="w-full space-y-4 pb-8">
            {/* 1. Proposed Construction */}
            <div className="bg-[#FBF3E4] border border-[#7A1316]/50 rounded-lg shadow-xs overflow-hidden">
              <button
                onClick={() => setSectionProposedOpen(!sectionProposedOpen)}
                className="w-full bg-[#7A1316] text-white px-4 py-2 text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5 tracking-wide">
                  <span className="text-sm font-mono">{sectionProposedOpen ? "▲" : "▼"}</span>
                  Proposed Construction
                </span>
                <span className="text-[10px] text-amber-200 uppercase font-mono">Area Parameters</span>
              </button>

              {sectionProposedOpen && (
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                  {/* Row 1 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Proposed Plot Area (sq. mtr.)
                    </label>
                    <input
                      type="text"
                      value={plotAreaProposed}
                      onChange={(e) => setPlotAreaProposed(e.target.value)}
                      className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-mono outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Total Area As per Documents (sq. mtr.)
                    </label>
                    <input
                      type="text"
                      value={plotAreaDocument}
                      onChange={(e) => setPlotAreaDocument(e.target.value)}
                      className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-mono outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Total Area As On Grounds (sq. mtr.)
                    </label>
                    <input
                      type="text"
                      value={plotAreaGround}
                      onChange={(e) => setPlotAreaGround(e.target.value)}
                      className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-mono outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Plot Structure
                    </label>
                    <select
                      value={plotStructure}
                      onChange={(e) => setPlotStructure(e.target.value)}
                      className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    >
                      <option value="Below 200 sq m">Below 200 sq m</option>
                      <option value="200 to 500 sq m">200 to 500 sq m</option>
                      <option value="Above 500 sq m">Above 500 sq m</option>
                    </select>
                  </div>

                  {/* Row 3 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Is site affecting road widening?
                    </label>
                    <div className="flex items-center gap-6 sm:w-72">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="affectingWidening"
                          checked={isAffectingRoadWidening === "Yes"}
                          onChange={() => setIsAffectingRoadWidening("Yes")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="affectingWidening"
                          checked={isAffectingRoadWidening === "No"}
                          onChange={() => setIsAffectingRoadWidening("No")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Proposed Built Up Area (sq. mtr.)
                    </label>
                    <input
                      type="text"
                      value={proposedBuiltUpArea}
                      onChange={(e) => setProposedBuiltUpArea(e.target.value)}
                      className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-mono outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  {/* Row 4 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-semibold text-slate-800 shrink-0">
                      Is Compound Wall proposed?
                    </label>
                    <div className="flex items-center gap-6 sm:w-72">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="compoundWall"
                          checked={isCompoundWallProposed === "Yes"}
                          onChange={() => setIsCompoundWallProposed("Yes")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="compoundWall"
                          checked={isCompoundWallProposed === "No"}
                          onChange={() => setIsCompoundWallProposed("No")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-semibold text-slate-800 shrink-0">Road Width</label>
                    <input
                      type="text"
                      value={roadWidthInput}
                      onChange={(e) => setRoadWidthInput(e.target.value)}
                      className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-mono outline-none focus:border-[#7A1316]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Site Details */}
            <div className="bg-[#FBF3E4] border border-[#7A1316]/50 rounded-lg shadow-xs overflow-hidden">
              <button
                onClick={() => setSectionSiteDetailsOpen(!sectionSiteDetailsOpen)}
                className="w-full bg-[#7A1316] text-white px-4 py-2 text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5 tracking-wide">
                  <span className="text-sm font-mono">{sectionSiteDetailsOpen ? "▲" : "▼"}</span>
                  Site Details
                </span>
                <span className="text-[10px] text-amber-200 uppercase font-mono">Surroundings & Valuation</span>
              </button>

              {sectionSiteDetailsOpen && (
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                  {/* Row 1 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Whether site abuts any existing road?
                    </label>
                    <div className="flex items-center gap-6 sm:w-72">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="abutsRoad"
                          checked={abutsExistingRoad === "Yes"}
                          onChange={() => setAbutsExistingRoad("Yes")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="abutsRoad"
                          checked={abutsExistingRoad === "No"}
                          onChange={() => setAbutsExistingRoad("No")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Status of Road
                    </label>
                    <div className="flex items-center gap-6 sm:w-72">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="statusRoad"
                          checked={statusOfRoad === "Public"}
                          onChange={() => setStatusOfRoad("Public")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>Public</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="statusRoad"
                          checked={statusOfRoad === "Private"}
                          onChange={() => setStatusOfRoad("Private")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>Private</span>
                      </label>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Nature of the Road
                    </label>
                    <select
                      value={natureOfRoad}
                      onChange={(e) => setNatureOfRoad(e.target.value)}
                      className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    >
                      <option value="CC - Concrete">CC - Concrete</option>
                      <option value="BT - Bitumen">BT - Bitumen</option>
                      <option value="WBM">WBM</option>
                      <option value="Katcha">Katcha</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Width of the Approach Road (Mtr.)
                    </label>
                    <input
                      type="text"
                      value={widthOfApproachRoad}
                      onChange={(e) => setWidthOfApproachRoad(e.target.value)}
                      className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-mono outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-semibold text-slate-800 shrink-0">
                      Plot Nearby Religious Structures
                    </label>
                    <select
                      value={plotNearbyReligious}
                      onChange={(e) => setPlotNearbyReligious(e.target.value)}
                      className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    >
                      <option value="NA">NA</option>
                      <option value="Temple">Temple</option>
                      <option value="Mosque">Mosque</option>
                      <option value="Church">Church</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-semibold text-slate-800 shrink-0">
                      Is the Plot in the vicinity of Aerodrome?
                    </label>
                    <div className="flex items-center gap-6 sm:w-72">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="vicinityAero"
                          checked={vicinityAerodrome === "Yes"}
                          onChange={() => setVicinityAerodrome("Yes")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="vicinityAero"
                          checked={vicinityAerodrome === "No"}
                          onChange={() => setVicinityAerodrome("No")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:col-span-2">
                    <label className="font-semibold text-slate-800 shrink-0">
                      Is the buildings which are in the vicinity area of Water Bodies/Railways/High tension line?
                    </label>
                    <div className="flex items-center gap-6 sm:w-72">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="vicinityWater"
                          checked={vicinityWaterBodies === "Yes"}
                          onChange={() => setVicinityWaterBodies("Yes")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="vicinityWater"
                          checked={vicinityWaterBodies === "No"}
                          onChange={() => setVicinityWaterBodies("No")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  {/* Row 5 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Market Value (in Rs per Sq.Yard)
                    </label>
                    <input
                      type="text"
                      value={marketValue}
                      onChange={(e) => setMarketValue(e.target.value)}
                      className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-mono outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 shrink-0">
                      <span className="text-rose-600 font-black mr-1">*</span> Whether site is abutting from IRR?
                    </label>
                    <div className="flex items-center gap-6 sm:w-72">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="abuttingIrr"
                          checked={abuttingIrr === "Yes"}
                          onChange={() => setAbuttingIrr("Yes")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="abuttingIrr"
                          checked={abuttingIrr === "No"}
                          onChange={() => setAbuttingIrr("No")}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Schedule of Boundaries */}
            <div className="bg-[#FBF3E4] border border-[#7A1316]/50 rounded-lg shadow-xs overflow-hidden">
              <button
                onClick={() => setSectionScheduleOpen(!sectionScheduleOpen)}
                className="w-full bg-[#7A1316] text-white px-4 py-2 text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5 tracking-wide">
                  <span className="text-sm font-mono">{sectionScheduleOpen ? "▲" : "▼"}</span>
                  Schedule of boundaries
                </span>
                <span className="text-[10px] text-amber-200 uppercase font-mono">Cardinal Directions</span>
              </button>

              {sectionScheduleOpen && (
                <div className="p-4 sm:p-5 space-y-3 text-xs">
                  {/* North */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="w-24 font-bold text-slate-800">North</label>
                    <select
                      value={northBoundary}
                      onChange={(e) => setNorthBoundary(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    >
                      <option value="Others">Others</option>
                      <option value="Road">Road</option>
                      <option value="Neighbour Plot">Neighbour Plot</option>
                    </select>
                    <label className="font-semibold text-slate-700 sm:ml-4">No.</label>
                    <input
                      type="text"
                      value={northNo}
                      onChange={(e) => setNorthNo(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  {/* South */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="w-24 font-bold text-slate-800">South</label>
                    <select
                      value={southBoundary}
                      onChange={(e) => setSouthBoundary(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    >
                      <option value="Others">Others</option>
                      <option value="Road">Road</option>
                      <option value="Neighbour Plot">Neighbour Plot</option>
                    </select>
                    <label className="font-semibold text-slate-700 sm:ml-4">No.</label>
                    <input
                      type="text"
                      value={southNo}
                      onChange={(e) => setSouthNo(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  {/* West */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="w-24 font-bold text-slate-800">West</label>
                    <select
                      value={westBoundary}
                      onChange={(e) => setWestBoundary(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    >
                      <option value="Others">Others</option>
                      <option value="Road">Road</option>
                      <option value="Neighbour Plot">Neighbour Plot</option>
                    </select>
                    <label className="font-semibold text-slate-700 sm:ml-4">No.</label>
                    <input
                      type="text"
                      value={westNo}
                      onChange={(e) => setWestNo(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    />
                  </div>

                  {/* East */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="w-24 font-bold text-slate-800">East</label>
                    <select
                      value={eastBoundary}
                      onChange={(e) => setEastBoundary(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    >
                      <option value="Others">Others</option>
                      <option value="Road">Road</option>
                      <option value="Neighbour Plot">Neighbour Plot</option>
                    </select>
                    <label className="font-semibold text-slate-700 sm:ml-4">No.</label>
                    <input
                      type="text"
                      value={eastNo}
                      onChange={(e) => setEastNo(e.target.value)}
                      className="w-full sm:w-64 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="bg-[#FBF3E4] border border-[#DCD5C8] p-3 rounded-lg flex items-center justify-between shadow-2xs">
              <button
                type="button"
                onClick={(e) => {
                  setSubTab("applicant");
                  (e.currentTarget.closest(".overflow-y-auto") as HTMLElement)?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-[#DCD5C8] text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back: Applicant Information</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  showToast("Plot Details verified. Proceeding to Documentation...");
                  setMainTab("documentation");
                  setDocSubTab("app-checklist");
                  (e.currentTarget.closest(".overflow-y-auto") as HTMLElement)?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold px-5 py-2 rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-2 group"
              >
                <span>Next: Documentation</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}




        {/* ========================================================================= */}
        {/* MAIN TAB 2: DRAWING                                                       */}
        {/* ========================================================================= */}
        {mainTab === "drawing" && (
          <div className="max-w-5xl mx-auto bg-[#FBF3E4] border-2 border-[#7A1316] rounded-xl shadow-xs p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-3">
              <div>
                <h3 className="font-black text-[#7A1316] text-sm uppercase">2D CAD Scrutiny & Building Plan Drawings</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Automated Rule Checking Engine v4.2 — 100% compliant with APCRDA BBAS regulations</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-black px-3 py-1 rounded-full text-xs">
                SCRUTINY PASSED
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-[#DCD5C8] text-center">
                <div className="font-bold text-slate-800">Ground Floor Plan</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Drawing_v2_GF.dwg</div>
                <div className="mt-3 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1"><Check className="size-3" /> Rule verified</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-[#DCD5C8] text-center">
                <div className="font-bold text-slate-800">First Floor & Section Plan</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Drawing_v2_FF.dwg</div>
                <div className="mt-3 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1"><Check className="size-3" /> Rule verified</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-[#DCD5C8] text-center">
                <div className="font-bold text-slate-800">Site Plan & Service Layout</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Drawing_v2_Site.dwg</div>
                <div className="mt-3 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1"><Check className="size-3" /> Rule verified</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN TAB: DOCUMENTATION                                                   */}
        {/* ========================================================================= */}
        {mainTab === "documentation" && (
          <>
            {/* ── DOC SUB-TAB 1: APPLICATION CHECKLIST ── */}
            {docSubTab === "app-checklist" && (
              <div className="max-w-6xl mx-auto space-y-3">
                {/* Top Bar with Save & Continue */}
                <div className="flex items-center justify-between bg-[#FBF3E4] border border-[#DCD5C8] p-3 rounded-lg shadow-2xs">
                  <div>
                    <h3 className="font-black text-[#7A1316] text-xs uppercase tracking-wide">
                      Application Statutory Checklist
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mandatory regulatory confirmations for APCRDA BBAS scrutiny compliance.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      showToast("Checklist responses saved successfully");
                      setDocSubTab("doc-checklist");
                    }}
                    className="bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold px-4 py-1.5 rounded transition-colors shadow-2xs cursor-pointer"
                  >
                    Save & Continue
                  </button>
                </div>

                {/* Checklist Table */}
                <div className="bg-[#FBF3E4] border border-[#7A1316]/40 rounded-lg overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#7A1316] text-white font-bold border-b border-[#630E10]">
                        <tr>
                          <th className="px-3 py-2.5 w-10 text-center">#</th>
                          <th className="px-4 py-2.5">Description</th>
                          <th className="px-4 py-2.5 w-36 text-center">Value</th>
                          <th className="px-4 py-2.5 w-64">Remark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCD5C8] bg-white">
                        {checklistItems.map((item) => (
                          <tr key={item.id} className="hover:bg-[#FAF4EB] transition-colors">
                            <td className="px-3 py-2.5 text-center font-bold text-slate-600">
                              {item.id}
                            </td>
                            <td className="px-4 py-2.5 text-slate-800 leading-snug">
                              {item.desc}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <div className="inline-flex items-center gap-3">
                                <span className="text-amber-600 font-bold text-xs" title="Review Required">
                                  !
                                </span>
                                <label className="inline-flex items-center gap-1 cursor-pointer font-medium text-slate-700">
                                  <input
                                    type="radio"
                                    name={`check-${item.id}`}
                                    checked={item.val === "Yes"}
                                    onChange={() => updateChecklistItem(item.id, "Yes")}
                                    className="accent-[#7A1316] cursor-pointer"
                                  />
                                  <span>Yes</span>
                                </label>
                                <label className="inline-flex items-center gap-1 cursor-pointer font-medium text-slate-700">
                                  <input
                                    type="radio"
                                    name={`check-${item.id}`}
                                    checked={item.val === "No"}
                                    onChange={() => updateChecklistItem(item.id, "No")}
                                    className="accent-[#7A1316] cursor-pointer"
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <input
                                type="text"
                                value={item.remark}
                                placeholder="Optional remark..."
                                onChange={(e) => updateChecklistRemark(item.id, e.target.value)}
                                className="w-full h-7 bg-white border border-[#DCD5C8] rounded px-2 text-xs text-slate-800 outline-none focus:border-[#7A1316]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── DOC SUB-TAB 2: DOCUMENT CHECKLIST ── */}
            {docSubTab === "doc-checklist" && (
              <div className="max-w-6xl mx-auto space-y-3">
                {/* Top Bar with Primary/Additional Tabs & Red Instruction Note */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FBF3E4] border border-[#DCD5C8] px-4 py-2 rounded-lg shadow-2xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDocTab("Primary")}
                      className={cn(
                        "text-xs font-bold px-3 py-1 rounded transition-colors cursor-pointer",
                        docTab === "Primary"
                          ? "bg-[#7A1316] text-white"
                          : "bg-white border border-[#DCD5C8] text-slate-700 hover:bg-[#FAF4EB]"
                      )}
                    >
                      Primary
                    </button>
                    <button
                      onClick={() => setDocTab("Additional")}
                      className={cn(
                        "text-xs font-bold px-3 py-1 rounded transition-colors cursor-pointer",
                        docTab === "Additional"
                          ? "bg-[#7A1316] text-white"
                          : "bg-white border border-[#DCD5C8] text-slate-700 hover:bg-[#FAF4EB]"
                      )}
                    >
                      Additional
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-rose-700 font-semibold text-xs flex items-center gap-1">
                      <span>* Click on Document(s) to View attachment/Remarks</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`Application BA No. ${baNo} submitted successfully!`);
                        setSubmissionSuccessModal(true);
                      }}
                      className="bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold px-4 py-1.5 rounded transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Submit</span>
                    </button>
                  </div>
                </div>

                {/* Document Checklist Items */}
                <div className="bg-[#FBF3E4] border border-[#7A1316]/40 rounded-lg p-4 space-y-3 shadow-xs">
                  {documentItems.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white border border-[#DCD5C8] rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:border-[#7A1316]/60 transition-colors"
                    >
                      {/* Left: Checkbox Icon + Document Title */}
                      <div className="flex items-start gap-2.5 max-w-3xl">
                        <div className="size-4 shrink-0 mt-0.5 rounded border border-[#7A1316] bg-[#7A1316] text-white flex items-center justify-center">
                          <Check className="size-3" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 leading-snug">{doc.title}</p>
                          {doc.files.length > 0 && (
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                              <Paperclip className="size-3" />
                              <span>Attached: {doc.files.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-bold">
                        <button
                          onClick={() => setPreviewDoc({ title: doc.title, files: doc.files })}
                          className="text-blue-700 hover:underline hover:text-blue-900 cursor-pointer"
                        >
                          View Files
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => setUploadDocModal({ id: doc.id, title: doc.title })}
                          className="text-blue-700 hover:underline hover:text-blue-900 cursor-pointer"
                        >
                          Attach More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Action Footer for Document Checklist */}
                <div className="bg-[#FBF3E4] border border-[#DCD5C8] p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-slate-800">Final Verification:</span> Ensure all mandatory document files are attached and verified before final submission.
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setDocSubTab("app-checklist")}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-[#DCD5C8] text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Application Checklist</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`Application BA No. ${baNo} submitted successfully!`);
                        setSubmissionSuccessModal(true);
                      }}
                      className="bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold px-5 py-2 rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-2 group"
                    >
                      <CheckCircle2 className="size-4" />
                      <span>Submit Application</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── DOC SUB-TAB 3: OTHERS ── */}
            {docSubTab === "others" && (
              <div className="max-w-6xl mx-auto space-y-3">
                {/* Top Bar with Mandatory Notice & Save & Continue */}
                <div className="flex items-center justify-between bg-[#FBF3E4] border border-[#DCD5C8] px-4 py-2 rounded-lg shadow-2xs">
                  <span className="text-xs text-slate-600 font-medium">
                    Fields marked with <span className="text-rose-600 font-bold">*</span> are mandatory
                  </span>
                  <button
                    onClick={() => {
                      showToast("Other details saved successfully");
                      setDocSubTab("repository");
                    }}
                    className="bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold px-4 py-1.5 rounded transition-colors shadow-2xs cursor-pointer"
                  >
                    Save & Continue
                  </button>
                </div>

                {/* Other Details Section */}
                <div className="bg-[#FBF3E4] border border-[#7A1316]/50 rounded-lg shadow-xs overflow-hidden">
                  <button
                    onClick={() => setSectionOthersOpen(!sectionOthersOpen)}
                    className="w-full bg-[#7A1316] text-white px-4 py-2 text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 tracking-wide">
                      <span className="text-sm font-mono">{sectionOthersOpen ? "▲" : "▼"}</span>
                      Other Details
                    </span>
                    <span className="text-[10px] text-amber-200 uppercase font-mono">Contract & Mortgage</span>
                  </button>

                  {sectionOthersOpen && (
                    <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
                      {/* Row 1 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="font-semibold text-slate-800 shrink-0">
                          Contractor's all Risk policy No.
                        </label>
                        <input
                          type="text"
                          value={contractorRiskPolicyNo}
                          onChange={(e) => setContractorRiskPolicyNo(e.target.value)}
                          className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="font-semibold text-slate-800 shrink-0">
                          Contractor's Date
                        </label>
                        <div className="relative w-full sm:w-72">
                          <input
                            type="date"
                            value={contractorDate}
                            onChange={(e) => setContractorDate(e.target.value)}
                            className="w-full h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                          />
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="font-semibold text-slate-800 shrink-0">
                          Valid Upto
                        </label>
                        <div className="relative w-full sm:w-72">
                          <input
                            type="date"
                            value={validUptoDate}
                            onChange={(e) => setValidUptoDate(e.target.value)}
                            className="w-full h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Placeholder for layout alignment */}
                      </div>

                      {/* Row 3 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="font-bold text-slate-800 shrink-0">
                          <span className="text-rose-600 font-black mr-1">*</span> Mortgage Deed No.
                        </label>
                        <input
                          type="text"
                          value={mortgageDeedNo}
                          onChange={(e) => setMortgageDeedNo(e.target.value)}
                          className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="font-bold text-slate-800 shrink-0">
                          <span className="text-rose-600 font-black mr-1">*</span> Mortgage Deed Date
                        </label>
                        <div className="relative w-full sm:w-72">
                          <input
                            type="date"
                            value={mortgageDeedDate}
                            onChange={(e) => setMortgageDeedDate(e.target.value)}
                            className="w-full h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                          />
                        </div>
                      </div>

                      {/* Row 4 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="font-bold text-slate-800 shrink-0">
                          <span className="text-rose-600 font-black mr-1">*</span> Floor handed Over
                        </label>
                        <input
                          type="text"
                          value={floorHandedOver}
                          onChange={(e) => setFloorHandedOver(e.target.value)}
                          className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="font-bold text-slate-800 shrink-0">
                          <span className="text-rose-600 font-black mr-1">*</span> Area (Sq. Mtr.)
                        </label>
                        <input
                          type="text"
                          value={mortgageArea}
                          onChange={(e) => setMortgageArea(e.target.value)}
                          className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-mono outline-none focus:border-[#7A1316]"
                        />
                      </div>

                      {/* Row 5 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="font-bold text-slate-800 shrink-0">
                          <span className="text-rose-600 font-black mr-1">*</span> Sub Register Office
                        </label>
                        <input
                          type="text"
                          value={subRegisterOffice}
                          onChange={(e) => setSubRegisterOffice(e.target.value)}
                          className="w-full sm:w-72 h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── DOC SUB-TAB 4: REPOSITORY & CLEARANCES ── */}
            {docSubTab === "repository" && (
              <div className="max-w-6xl mx-auto space-y-4 text-xs font-sans">
                {/* Top Documentation Header Card */}
                <div className="bg-[#FBF3E4] border-2 border-[#7A1316] rounded-xl shadow-xs p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DCD5C8] pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-[#7A1316] text-sm uppercase tracking-wide">
                          Application Documentation &amp; Statutory Clearances
                        </h3>
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                          COMPLIANCE 100%
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Official verified land title deeds, structural integrity certificates, NOCs and statutory affidavits for BA No. <strong className="font-mono text-slate-900">{baNo}</strong>
                      </p>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center flex-wrap gap-2 shrink-0">
                      <button
                        onClick={() => setUploadNewDocModalOpen(true)}
                        className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold px-3 py-1.5 rounded transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 border border-[#630E10]"
                      >
                        <Plus className="size-3.5" />
                        <span>Upload Document</span>
                      </button>
                      <button
                        onClick={() => showToast(`Archiving and downloading ${documentationList.length} application documents as ZIP...`)}
                        className="bg-white hover:bg-slate-50 text-slate-800 border border-[#DCD5C8] font-bold px-3 py-1.5 rounded transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="size-3.5 text-[#7A1316]" />
                        <span>Download All (ZIP)</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="bg-white hover:bg-slate-50 text-slate-800 border border-[#DCD5C8] font-bold px-3 py-1.5 rounded transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Printer className="size-3.5 text-[#7A1316]" />
                        <span>Print Manifest</span>
                      </button>
                    </div>
                  </div>

                  {/* KPI Badges Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5">
                    <div className="bg-white p-2.5 rounded-lg border border-[#DCD5C8] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Total Documents</div>
                        <div className="text-base font-black text-slate-900">{documentationList.length}</div>
                      </div>
                      <FolderClosed className="size-5 text-[#7A1316]/70" />
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-[#DCD5C8] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Verified &amp; Accepted</div>
                        <div className="text-base font-black text-emerald-700">
                          {documentationList.filter((d) => d.status === "Verified").length}
                        </div>
                      </div>
                      <ShieldCheck className="size-5 text-emerald-600" />
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-[#DCD5C8] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Under Scrutiny</div>
                        <div className="text-base font-black text-amber-700">
                          {documentationList.filter((d) => d.status === "Under Scrutiny").length}
                        </div>
                      </div>
                      <Clock className="size-5 text-amber-600" />
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-[#DCD5C8] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Mandatory Shortfalls</div>
                        <div className="text-base font-black text-emerald-700">0</div>
                      </div>
                      <CheckCircle2 className="size-5 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Filter Pills & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-lg border border-[#DCD5C8] shadow-2xs">
                  {/* Category Pills */}
                  <div className="flex items-center flex-wrap gap-1.5">
                    {[
                      { id: "ALL", label: `All (${documentationList.length})` },
                      { id: "Ownership", label: `Ownership (${documentationList.filter((d) => d.category === "Ownership").length})` },
                      { id: "Technical", label: `Technical (${documentationList.filter((d) => d.category === "Technical").length})` },
                      { id: "NOC & Clearances", label: `NOCs (${documentationList.filter((d) => d.category === "NOC & Clearances").length})` },
                      { id: "Affidavits", label: `Affidavits (${documentationList.filter((d) => d.category === "Affidavits").length})` },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setDocCategoryFilter(cat.id)}
                        className={cn(
                          "px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer",
                          docCategoryFilter === cat.id
                            ? "bg-[#7A1316] text-white shadow-2xs"
                            : "bg-[#FAF7F2] text-slate-700 border border-[#DCD5C8] hover:bg-[#F5EBE1]"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Box */}
                  <div className="flex items-center gap-2 border border-[#DCD5C8] bg-white rounded px-2.5 py-1 w-full sm:w-64 focus-within:border-[#7A1316] transition-colors">
                    <Search className="size-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search document name or code..."
                      value={docSearchQuery}
                      onChange={(e) => setDocSearchQuery(e.target.value)}
                      className="w-full text-xs text-slate-800 placeholder:italic placeholder:text-slate-400 outline-none"
                    />
                    {docSearchQuery && (
                      <button onClick={() => setDocSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Documentation Table */}
                <div className="bg-white rounded-xl border border-[#DCD5C8] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#7A1316] text-white font-bold border-b border-[#630E10] text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="px-3.5 py-2.5 w-12 text-center">#</th>
                          <th className="px-3.5 py-2.5">Document Details</th>
                          <th className="px-3.5 py-2.5">Category</th>
                          <th className="px-3.5 py-2.5">Reference No.</th>
                          <th className="px-3.5 py-2.5">Uploaded File</th>
                          <th className="px-3.5 py-2.5">Uploaded By &amp; Date</th>
                          <th className="px-3.5 py-2.5 text-center">Status</th>
                          <th className="px-3.5 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCD5C8]">
                        {documentationList
                          .filter((item) => {
                            if (docCategoryFilter !== "ALL" && item.category !== docCategoryFilter) return false;
                            if (docSearchQuery.trim()) {
                              const q = docSearchQuery.toLowerCase();
                              return (
                                item.name.toLowerCase().includes(q) ||
                                item.code.toLowerCase().includes(q) ||
                                item.fileName.toLowerCase().includes(q) ||
                                item.docNo.toLowerCase().includes(q)
                              );
                            }
                            return true;
                          })
                          .map((doc, idx) => (
                            <tr key={doc.id} className="hover:bg-[#FAF4EB] transition-colors">
                              <td className="px-3.5 py-2.5 text-center font-bold text-slate-500 font-mono text-[11px]">
                                {idx + 1}
                              </td>
                              <td className="px-3.5 py-2.5">
                                <div className="font-bold text-slate-900 leading-tight">{doc.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono text-[10px] text-slate-500 bg-[#FAF7F2] border border-[#DCD5C8] px-1.5 py-0.5 rounded">
                                    {doc.code}
                                  </span>
                                  {doc.required ? (
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                      Mandatory
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                                      Optional
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3.5 py-2.5">
                                <span className="font-semibold text-slate-700 bg-[#FAF7F2] border border-[#DCD5C8] px-2 py-0.5 rounded text-[11px]">
                                  {doc.category}
                                </span>
                              </td>
                              <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-700">
                                {doc.docNo}
                              </td>
                              <td className="px-3.5 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <FileText className="size-4 text-[#7A1316] shrink-0" />
                                  <div className="min-w-0">
                                    <div className="font-medium text-slate-900 truncate max-w-[180px]" title={doc.fileName}>
                                      {doc.fileName}
                                    </div>
                                    <div className="text-[10px] text-slate-500">{doc.fileSize} · {doc.version}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3.5 py-2.5 text-[11px]">
                                <div className="text-slate-800 font-medium">{doc.uploadedBy}</div>
                                <div className="text-slate-500 text-[10px]">{doc.uploadedDate}</div>
                              </td>
                              <td className="px-3.5 py-2.5 text-center">
                                {doc.status === "Verified" && (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                    <Check className="size-3" /> Verified
                                  </span>
                                )}
                                {doc.status === "Under Scrutiny" && (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                    <Clock className="size-3" /> In Scrutiny
                                  </span>
                                )}
                                {doc.status === "Uploaded" && (
                                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                    <Upload className="size-3" /> Uploaded
                                  </span>
                                )}
                              </td>
                              <td className="px-3.5 py-2.5 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => setActiveDocPreview(doc)}
                                    className="bg-[#FAF7F2] hover:bg-[#F5EBE1] text-[#7A1316] border border-[#DCD5C8] font-bold px-2 py-1 rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                    title="Preview Document"
                                  >
                                    <Eye className="size-3" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    onClick={() => showToast(`Downloading ${doc.fileName}...`)}
                                    className="bg-[#FAF7F2] hover:bg-[#F5EBE1] text-slate-700 border border-[#DCD5C8] font-bold p-1 rounded text-[11px] transition-colors cursor-pointer shadow-2xs"
                                    title="Download Document"
                                  >
                                    <Download className="size-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* MAIN TAB 3: PAYMENTS                                                      */}
        {/* ========================================================================= */}
        {mainTab === "payments" && (
          <div className="max-w-4xl mx-auto bg-[#FBF3E4] border-2 border-[#7A1316] rounded-xl shadow-xs p-6 space-y-4 text-xs">
            <h3 className="font-black text-[#7A1316] text-sm uppercase tracking-wider border-b border-[#DCD5C8] pb-2">
              Fee Assessment & Payment History
            </h3>
            <div className="bg-white rounded-lg border border-[#DCD5C8] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F5EBE1] text-[#7A1316] font-bold border-b border-[#DCD5C8]">
                  <tr>
                    <th className="px-3.5 py-2.5">Fee Head</th>
                    <th className="px-3.5 py-2.5">Challan No.</th>
                    <th className="px-3.5 py-2.5">Amount (₹)</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCD5C8]">
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium">Scrutiny Fee (CAD Engine)</td>
                    <td className="px-3.5 py-2.5 font-mono">CH-2026-98102</td>
                    <td className="px-3.5 py-2.5 font-bold">₹ 5,800</td>
                    <td className="px-3.5 py-2.5 text-emerald-700 font-bold">Paid (Online)</td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-blue-700 hover:underline cursor-pointer">Download</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium">Building Permit Basic Fee</td>
                    <td className="px-3.5 py-2.5 font-mono">CH-2026-98105</td>
                    <td className="px-3.5 py-2.5 font-bold">₹ 14,200</td>
                    <td className="px-3.5 py-2.5 text-emerald-700 font-bold">Paid (Online)</td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-blue-700 hover:underline cursor-pointer">Download</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium">Gramkantam Verification Fee</td>
                    <td className="px-3.5 py-2.5 font-mono">CH-2026-98109</td>
                    <td className="px-3.5 py-2.5 font-bold">₹ 2,000</td>
                    <td className="px-3.5 py-2.5 text-emerald-700 font-bold">Paid (Online)</td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-blue-700 hover:underline cursor-pointer">Download</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN TAB 5: APPLY FOR NOCS (Statutory Single-Desk Clearances)              */}
        {/* ========================================================================= */}
        {mainTab === "nocs" && (
          <div className="max-w-6xl mx-auto space-y-4 text-xs font-sans">
            {/* Top Header Card */}
            <div className="bg-[#FBF3E4] border-2 border-[#7A1316] rounded-xl shadow-xs p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCD5C8] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Flame className="size-4 text-orange-600" />
                    <h3 className="font-black text-[#7A1316] text-sm uppercase tracking-wide">
                      Single Desk Clearances &amp; Statutory NOC Application
                    </h3>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Departmental statutory clearances for Proposal BA No. <strong className="font-mono text-slate-900">{baNo}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => showToast("All NOC statutory declarations saved successfully!")}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#7A1316] hover:bg-[#8F161A] text-white border border-[#630E10] rounded text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Save className="size-3.5" />
                    <span>Save NOC Details</span>
                  </button>
                </div>
              </div>

              {/* Status Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5">
                <div className="bg-white p-3 rounded-lg border border-[#DCD5C8]">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Fire Services</div>
                  <div className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                    {hasFireNoc === "Yes" ? (
                      <span className="text-emerald-700 flex items-center gap-1"><Check className="size-3" /> Approved</span>
                    ) : hasFireNoc === "NA" ? (
                      <span className="text-slate-500">Not Applicable</span>
                    ) : (
                      <span className="text-amber-700">Clearance Pending</span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#DCD5C8]">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Airport (AAI NOCAS)</div>
                  <div className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                    {hasAaiNoc === "Yes" ? (
                      <span className="text-emerald-700 flex items-center gap-1"><Check className="size-3" /> Approved</span>
                    ) : (
                      <span className="text-slate-500">Within Height Limit</span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#DCD5C8]">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Pollution (APPCB)</div>
                  <div className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                    {hasEnvNoc === "Yes" ? (
                      <span className="text-emerald-700 flex items-center gap-1"><Check className="size-3" /> Consent Active</span>
                    ) : (
                      <span className="text-slate-500">Not Required (&lt;20k sqm)</span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#DCD5C8]">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Water Body Buffer</div>
                  <div className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                    <span className="text-emerald-700 flex items-center gap-1"><Check className="size-3" /> Buffer Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department 1: External Fire Service */}
            <div className="bg-white border border-[#DCD5C8] rounded-xl shadow-xs overflow-hidden">
              <div className="bg-[#7A1316] text-white px-4 py-2.5 flex items-center justify-between font-bold text-xs tracking-wide">
                <div className="flex items-center gap-2">
                  <Flame className="size-4 text-orange-400 fill-orange-400 shrink-0" />
                  <span>1. External Fire Service (AP State Disaster Response &amp; Fire Services)</span>
                </div>
                <span className="text-[10px] bg-[#8F161A] border border-[#A22025] px-2 py-0.5 rounded text-amber-200 uppercase font-mono">
                  Statutory Rule 18
                </span>
              </div>
              <div className="p-4 sm:p-5 bg-[#FBF3E4] space-y-4">
                <p className="text-[11px] text-slate-700 italic leading-relaxed">
                  <span className="font-bold not-italic text-slate-900">Mandatory Applicability: </span>
                  All Types of Residential buildings with height more than 18m or Group housing or Commercial buildings of height 15m and above. Buildings of public congregation like Educational Buildings, Cinema Theatres, Function Halls and other Assembly Buildings on plot area of 500 sq.m and above or height above 6m.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 px-3.5 bg-white rounded border border-[#DCD5C8]">
                  <div className="text-xs font-bold text-slate-800">
                    Do you have Approved Fire NOC for this application?
                  </div>
                  <div className="flex items-center gap-6 text-xs font-medium text-slate-800">
                    {(["NA", "No", "Yes"] as const).map((opt) => (
                      <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="fireNocApproved"
                          value={opt}
                          checked={hasFireNoc === opt}
                          onChange={() => setHasFireNoc(opt)}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span className="font-bold">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {hasFireNoc === "Yes" && (
                  <div className="p-4 bg-white rounded border border-[#DCD5C8] space-y-3 animate-in fade-in duration-200">
                    <div className="font-bold text-[#7A1316] text-xs uppercase tracking-wide">
                      Approved Fire NOC Document &amp; Reference Details:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Fire NOC Certificate / Reference Number
                        </label>
                        <input
                          type="text"
                          value={fireNocRefNo}
                          onChange={(e) => setFireNocRefNo(e.target.value)}
                          placeholder="e.g. AP/FIRE/NOC/2026/0412"
                          className="w-full h-8 px-2.5 border border-[#DCD5C8] rounded bg-[#FAF7F2] text-slate-800 outline-none focus:border-[#7A1316]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          NOC Issue Date
                        </label>
                        <input
                          type="date"
                          value={fireNocIssueDate}
                          onChange={(e) => setFireNocIssueDate(e.target.value)}
                          className="w-full h-8 px-2.5 border border-[#DCD5C8] rounded bg-[#FAF7F2] text-slate-800 outline-none focus:border-[#7A1316]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Attach Approved Fire NOC (PDF)
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setFireNocDocAttached(true);
                            showToast("Approved Fire NOC document attached successfully");
                          }}
                          className="px-3.5 py-1.5 bg-[#7A1316] hover:bg-[#8F161A] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs border border-[#630E10]"
                        >
                          <Upload className="size-3.5" /> Attach Document
                        </button>
                        {fireNocDocAttached && (
                          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="size-3.5 text-emerald-600" /> Fire_NOC_Approval_Sanctioned.pdf attached
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Department 2: Airports Authority of India (AAI NOCAS) */}
            <div className="bg-white border border-[#DCD5C8] rounded-xl shadow-xs overflow-hidden">
              <div className="bg-[#7A1316] text-white px-4 py-2.5 flex items-center justify-between font-bold text-xs tracking-wide">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-cyan-300 shrink-0" />
                  <span>2. Airport Authority of India (AAI NOCAS Clearance)</span>
                </div>
                <span className="text-[10px] bg-[#8F161A] border border-[#A22025] px-2 py-0.5 rounded text-amber-200 uppercase font-mono">
                  Obstacle Limitation Surface
                </span>
              </div>
              <div className="p-4 sm:p-5 bg-[#FBF3E4] space-y-4">
                <p className="text-[11px] text-slate-700 italic leading-relaxed">
                  <span className="font-bold not-italic text-slate-900">Mandatory Applicability: </span>
                  All proposed structures within 20km radius of Vijayawada International Airport (Gannavaram) exceeding site CCZM (Colour Coded Zoning Map) elevation limits.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 px-3.5 bg-white rounded border border-[#DCD5C8]">
                  <div className="text-xs font-bold text-slate-800">
                    Do you have AAI Height Clearance NOC for this application?
                  </div>
                  <div className="flex items-center gap-6 text-xs font-medium text-slate-800">
                    {(["NA", "No", "Yes"] as const).map((opt) => (
                      <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="aaiNocApproved"
                          value={opt}
                          checked={hasAaiNoc === opt}
                          onChange={() => setHasAaiNoc(opt)}
                          className="accent-[#7A1316] cursor-pointer"
                        />
                        <span className="font-bold">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {hasAaiNoc === "Yes" && (
                  <div className="p-4 bg-white rounded border border-[#DCD5C8] space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          AAI NOCAS Application / Clearance Number
                        </label>
                        <input
                          type="text"
                          value={aaiNocRefNo}
                          onChange={(e) => setAaiNocRefNo(e.target.value)}
                          placeholder="e.g. AAI/SR/2026/VJA/118"
                          className="w-full h-8 px-2.5 border border-[#DCD5C8] rounded bg-[#FAF7F2] text-slate-800 outline-none focus:border-[#7A1316]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          NOC Issue Date
                        </label>
                        <input
                          type="date"
                          value={aaiNocIssueDate}
                          onChange={(e) => setAaiNocIssueDate(e.target.value)}
                          className="w-full h-8 px-2.5 border border-[#DCD5C8] rounded bg-[#FAF7F2] text-slate-800 outline-none focus:border-[#7A1316]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Department 3: Environmental & Water Resources Clearances */}
            <div className="bg-white border border-[#DCD5C8] rounded-xl shadow-xs overflow-hidden">
              <div className="bg-[#7A1316] text-white px-4 py-2.5 flex items-center justify-between font-bold text-xs tracking-wide">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-300 shrink-0" />
                  <span>3. Environmental (APPCB / SEIAA) &amp; Irrigation Department Clearances</span>
                </div>
                <span className="text-[10px] bg-[#8F161A] border border-[#A22025] px-2 py-0.5 rounded text-amber-200 uppercase font-mono">
                  State Clearances
                </span>
              </div>
              <div className="p-4 sm:p-5 bg-[#FBF3E4] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded border border-[#DCD5C8] space-y-2">
                    <div className="font-bold text-slate-800">State Environmental Impact Clearance (SEIAA)</div>
                    <div className="text-[11px] text-slate-600">Built-up area &lt; 20,000 sq.m: Automatically exempted from EIA notification.</div>
                    <div className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="size-3.5" /> Exempted under Category B2
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border border-[#DCD5C8] space-y-2">
                    <div className="font-bold text-slate-800">Water Body Buffer &amp; Flood Inundation Clearance</div>
                    <div className="text-[11px] text-slate-600">Site is beyond 30m buffer from Krishna river and major irrigation canals.</div>
                    <div className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="size-3.5" /> Certified compliant with APCRDA Zonal Regulations
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PROPOSAL FLOW MODAL ── */}
      {proposalFlowOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl w-full max-w-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-2">
              <h3 className="font-black text-[#7A1316] text-sm uppercase">Proposal Workflow Flowchart</h3>
              <button
                onClick={() => setProposalFlowOpen(false)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-900">Stage 1: Application Submission & Fee Payment</div>
                  <div className="text-[11px] text-emerald-700">Completed on 23-07-2026 11:30 AM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-900">Stage 2: Automated Scrutiny & Rule Validation</div>
                  <div className="text-[11px] text-emerald-700">100% Passed — All setbacks, FAR & height verified</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-blue-50 border border-blue-200 rounded">
                <Clock className="size-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-bold text-blue-900">Stage 3: Proceeding Pending (Competent Authority)</div>
                  <div className="text-[11px] text-blue-700">Assigned to: Planning Officer (Thullur Zone) — Pending Final Sanction</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-slate-100 border border-slate-200 rounded text-slate-500">
                <Clock className="size-4 shrink-0" />
                <div>
                  <div className="font-bold">Stage 4: Sanction Order & Permit Generation</div>
                  <div className="text-[11px]">Subsequent step after Proceeding approval</div>
                </div>
              </div>
            </div>
            <div className="text-right pt-2 border-t border-[#DCD5C8]">
              <button
                onClick={() => setProposalFlowOpen(false)}
                className="bg-[#7A1316] text-white font-bold text-xs px-4 py-1.5 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REPORTS MODAL ── */}
      {reportsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-2">
              <h3 className="font-black text-[#7A1316] text-sm uppercase">Application Reports & Documents</h3>
              <button
                onClick={() => setReportsOpen(false)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-white rounded border border-[#DCD5C8] flex items-center justify-between">
                <span className="font-medium text-slate-800">Auto Scrutiny Compliance Report</span>
                <button
                  onClick={() => showToast("Scrutiny Report downloaded")}
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="size-3" /> PDF
                </button>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#DCD5C8] flex items-center justify-between">
                <span className="font-medium text-slate-800">Site Inspection Summary</span>
                <button
                  onClick={() => showToast("Inspection Summary downloaded")}
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="size-3" /> PDF
                </button>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#DCD5C8] flex items-center justify-between">
                <span className="font-medium text-slate-800">Fee Assessment Statement & Challan</span>
                <button
                  onClick={() => showToast("Challan statement downloaded")}
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="size-3" /> PDF
                </button>
              </div>
            </div>
            <div className="text-right pt-2 border-t border-[#DCD5C8]">
              <button
                onClick={() => setReportsOpen(false)}
                className="bg-[#7A1316] text-white font-bold text-xs px-4 py-1.5 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCUMENT PREVIEW MODAL ── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-2">
              <h3 className="font-black text-[#7A1316] text-xs uppercase line-clamp-1">
                Attached Files: {previewDoc.title}
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {previewDoc.files.map((f, i) => (
                <div key={i} className="p-3 bg-white border border-[#DCD5C8] rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-[#7A1316]" />
                    <span className="font-mono text-slate-800">{f}</span>
                  </div>
                  <button
                    onClick={() => showToast(`Downloading ${f}`)}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="size-3" /> Download
                  </button>
                </div>
              ))}
            </div>
            <div className="text-right pt-2 border-t border-[#DCD5C8]">
              <button
                onClick={() => setPreviewDoc(null)}
                className="bg-[#7A1316] text-white font-bold text-xs px-4 py-1.5 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ATTACH FILES MODAL ── */}
      {uploadDocModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-2">
              <h3 className="font-black text-[#7A1316] text-xs uppercase line-clamp-1">
                Attach File: {uploadDocModal.title}
              </h3>
              <button
                onClick={() => setUploadDocModal(null)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="border-2 border-dashed border-[#7A1316]/50 bg-white/80 rounded-lg p-6 text-center space-y-2">
              <Upload className="size-8 text-[#7A1316] mx-auto" />
              <div className="text-xs font-bold text-slate-800">
                Drag and drop PDF / DWG document here
              </div>
              <div className="text-[11px] text-slate-500">
                Supports PDF, DWG, DXF up to 10 MB
              </div>
              <button
                onClick={() => {
                  showToast("File uploaded and linked successfully");
                  setUploadDocModal(null);
                }}
                className="mt-2 bg-[#7A1316] text-white text-xs font-bold px-4 py-1.5 rounded cursor-pointer"
              >
                Browse Files
              </button>
            </div>
            <div className="text-right pt-2 border-t border-[#DCD5C8]">
              <button
                onClick={() => setUploadDocModal(null)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer mr-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCUMENTATION PREVIEW MODAL ── */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="bg-[#FBF3E4] border-b-2 border-[#7A1316] px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-[#7A1316]" />
                <div>
                  <h3 className="font-black text-[#7A1316] text-xs sm:text-sm uppercase tracking-wide">
                    Document Viewer — {activeDocPreview.code}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">{activeDocPreview.name}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveDocPreview(null)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-200 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Document Content / Simulated Sheet */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col items-center">
              <div className="w-full max-w-lg bg-white border border-slate-300 shadow-lg p-6 sm:p-8 space-y-5 rounded relative">
                {/* Government Header Banner */}
                <div className="text-center border-b-2 border-[#7A1316] pb-3 space-y-1">
                  <div className="font-serif text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                    GOVERNMENT OF ANDHRA PRADESH
                  </div>
                  <h4 className="font-black text-[#7A1316] text-sm tracking-tight leading-tight">
                    ANDHRA PRADESH CAPITAL REGION DEVELOPMENT AUTHORITY (APCRDA)
                  </h4>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Building Permission &amp; Town Planning Department · Vijayawada
                  </div>
                </div>

                {/* Document Certificate Banner */}
                <div className="bg-[#FBF3E4] border border-[#DCD5C8] rounded-md p-3 text-center space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Statutory Submission Record
                  </div>
                  <div className="font-black text-[#7A1316] text-sm">{activeDocPreview.name}</div>
                  <div className="font-mono text-xs text-slate-700 font-semibold">Ref No: {activeDocPreview.docNo}</div>
                </div>

                {/* Metadata Table */}
                <div className="border border-[#DCD5C8] rounded-md overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-[#DCD5C8]">
                      <tr>
                        <td className="px-3 py-1.5 font-bold text-slate-600 bg-slate-50 w-36">Application BA No.</td>
                        <td className="px-3 py-1.5 font-mono font-bold text-[#7A1316]">{baNo}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-bold text-slate-600 bg-slate-50">Document Code</td>
                        <td className="px-3 py-1.5 font-mono">{activeDocPreview.code}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-bold text-slate-600 bg-slate-50">File Name</td>
                        <td className="px-3 py-1.5 font-mono text-[11px]">{activeDocPreview.fileName}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-bold text-slate-600 bg-slate-50">File Size &amp; Type</td>
                        <td className="px-3 py-1.5">{activeDocPreview.fileSize} (Encrypted PDF / Validated)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-bold text-slate-600 bg-slate-50">Uploaded By</td>
                        <td className="px-3 py-1.5">{activeDocPreview.uploadedBy} on {activeDocPreview.uploadedDate}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-bold text-slate-600 bg-slate-50">Scrutiny Status</td>
                        <td className="px-3 py-1.5 font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" />
                          <span>{activeDocPreview.status} &amp; Digitally Verified</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Official Stamp & QR Code */}
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                  <div className="border-2 border-emerald-700 text-emerald-800 rounded px-2.5 py-1 text-center rotate-[-3deg] inline-block shadow-2xs">
                    <div className="text-[9px] font-black uppercase tracking-wider">APCRDA SCRUTINY WING</div>
                    <div className="text-[11px] font-black">DIGITALLY VERIFIED</div>
                    <div className="text-[8px] font-mono">HASH: 9A81-FE21-8B04</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-mono">Scan for Official Verification</div>
                    <div className="inline-block bg-slate-800 text-white font-mono text-[9px] px-2 py-1 rounded mt-0.5">
                      QR: {baNo.slice(-6)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#FBF3E4] border-t border-[#DCD5C8] px-4 py-2.5 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">Status: <strong className="text-emerald-700">{activeDocPreview.status}</strong></span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast(`Downloading ${activeDocPreview.fileName}...`)}
                  className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold px-3 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Download className="size-3.5" />
                  <span>Download Document</span>
                </button>
                <button
                  onClick={() => setActiveDocPreview(null)}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-[#DCD5C8] font-bold px-3 py-1.5 rounded text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD NEW DOCUMENT MODAL ── */}
      {uploadNewDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-2">
              <h3 className="font-black text-[#7A1316] text-xs sm:text-sm uppercase">
                Upload Application Document
              </h3>
              <button
                onClick={() => setUploadNewDocModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newDocName.trim()) {
                  showToast("Please enter document name");
                  return;
                }
                const newDoc: DocumentationRecord = {
                  id: `doc-${Date.now()}`,
                  code: `DOC-${newDocCategory.slice(0, 3).toUpperCase()}-${String(documentationList.length + 1).padStart(2, "0")}`,
                  name: newDocName.trim(),
                  category: newDocCategory,
                  required: newDocRequired,
                  status: "Uploaded",
                  fileName: newDocFileName.trim() || `${newDocName.trim().replace(/\s+/g, "_")}.pdf`,
                  fileSize: "2.8 MB",
                  uploadedDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
                  uploadedBy: user?.name ? `${user.name} (LTP)` : "K. Ramamurthy (LTP)",
                  docNo: newDocNumber.trim() || `DOC/2026/${Math.floor(10000 + Math.random() * 90000)}`,
                  version: "v1.0",
                };
                setDocumentationList((prev) => [newDoc, ...prev]);
                setNewDocName("");
                setNewDocNumber("");
                setNewDocFileName("");
                setUploadNewDocModalOpen(false);
                showToast(`"${newDoc.name}" uploaded and attached successfully`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  <span className="text-rose-600 mr-1">*</span> Document Category
                </label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as typeof newDocCategory)}
                  className="w-full h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 font-medium outline-none focus:border-[#7A1316]"
                >
                  <option value="Ownership">Ownership &amp; Title</option>
                  <option value="Technical">Technical &amp; Structural</option>
                  <option value="NOC & Clearances">NOC &amp; Statutory Clearances</option>
                  <option value="Affidavits">Affidavits &amp; Declarations</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  <span className="text-rose-600 mr-1">*</span> Document Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Registered Partition Deed / Structural Calculation"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Registration / Reference No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DOC/GNT/2026/8912"
                  value={newDocNumber}
                  onChange={(e) => setNewDocNumber(e.target.value)}
                  className="w-full h-8 bg-white border border-[#DCD5C8] rounded px-2.5 text-slate-800 outline-none focus:border-[#7A1316]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Select Document File (PDF / DWG / JPG)
                </label>
                <div
                  onClick={() => setNewDocFileName(newDocName ? `${newDocName.replace(/\s+/g, "_")}_doc.pdf` : "New_Uploaded_Document.pdf")}
                  className="border-2 border-dashed border-[#7A1316]/50 bg-white/80 rounded-lg p-4 text-center cursor-pointer hover:bg-white transition-colors"
                >
                  <Upload className="size-6 text-[#7A1316] mx-auto mb-1" />
                  <div className="font-bold text-slate-800 text-xs">
                    {newDocFileName ? newDocFileName : "Click to select or drag & drop file"}
                  </div>
                  <div className="text-[10px] text-slate-500">PDF, JPG, PNG up to 25 MB</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqCheck"
                  checked={newDocRequired}
                  onChange={(e) => setNewDocRequired(e.target.checked)}
                  className="accent-[#7A1316] cursor-pointer"
                />
                <label htmlFor="reqCheck" className="font-semibold text-slate-700 cursor-pointer">
                  Mark this document as Mandatory for permit sanction
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCD5C8]">
                <button
                  type="button"
                  onClick={() => setUploadNewDocModalOpen(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold px-4 py-1.5 rounded transition-colors shadow-2xs cursor-pointer border border-[#630E10]"
                >
                  Upload &amp; Attach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUBMISSION SUCCESS CONFIRMATION MODAL ── */}
      {submissionSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] border-2 border-[#7A1316] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="bg-[#7A1316] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-5 text-emerald-400" />
                <h3 className="font-black text-sm uppercase tracking-wide">
                  Application Saved Successfully
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionSuccessModal(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3.5 flex items-start gap-3">
                <ShieldCheck className="size-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">
                    Application Saved Successfully
                  </h4>
                  <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                    Your building permission proposal and plot details have been saved successfully. You can download the application form or proceed to drawing submission.
                  </p>
                </div>
              </div>

              {/* Application Details Summary */}
              <div className="bg-white border border-[#DCD5C8] rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between border-b border-[#DCD5C8]/60 pb-2">
                  <span className="text-slate-500 font-medium">Proposal / BA Number:</span>
                  <span className="font-mono font-bold text-slate-900">{baNo}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#DCD5C8]/60 pb-2">
                  <span className="text-slate-500 font-medium">Current Status:</span>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                    Application Form Created
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-[#DCD5C8]/60 pb-2">
                  <span className="text-slate-500 font-medium">Document Compliance:</span>
                  <span className="font-bold text-emerald-700">100% Verified (0 Shortfalls)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Submission Timestamp:</span>
                  <span className="font-mono text-slate-700">{new Date().toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  id="download-form-btn"
                  onClick={() => showToast(`Downloading official application form for ${baNo}...`)}
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-[#DCD5C8] font-bold px-3.5 py-2 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="size-3.5 text-[#7A1316]" />
                  <span>Download Form</span>
                </button>
                <button
                  type="button"
                  id="proceed-to-drawing-submission-btn"
                  onClick={() => {
                    setSubmissionSuccessModal(false);
                    setMainTab("drawing");
                  }}
                  className="bg-[#7A1316] hover:bg-[#8F161A] text-white font-bold px-4 py-2 rounded-lg transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Drawing Submission</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
