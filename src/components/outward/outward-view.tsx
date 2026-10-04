"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  RotateCcw,
  Send,
  Eye,
  Printer,
  Download,
  FileText,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
  QrCode,
  Stamp,
  HelpCircle,
  FileSpreadsheet,
  X,
} from "lucide-react";

// ============================================================
// Types
// ============================================================
export interface OutwardDispatchEntry {
  id: string;
  endorsementNo: string;
  letterType: string;
  dispatchMode: "SPEED_POST" | "REGISTERED_POST" | "HAND_DELIVERY" | "EMAIL" | "SPECIAL_MESSENGER" | "COURIER";
  trackingNumber: string;
  recipientName: string;
  recipientAddress: string;
  dispatchDate: string;
  issuingOfficer: string;
  issuingDesignation: string;
  remarks: string;
  attachments: string[];
  status: "DISPATCHED" | "DELIVERED" | "ACKNOWLEDGED";
}

export interface OutwardProposalRecord {
  id: string;
  seqNo: number;
  applicationNo: string;
  permissionType: string;
  applicant: string;
  applicantPhone?: string;
  applicantEmail?: string;
  fileAssignedDate: string;
  status: "Approved" | "Drawing Failed in Rules" | "In Review" | "Proceeding Issued" | "Shortfall Raised";
  submissionDate: string;
  owner: string;
  ownerAddress?: string;
  caseType: string;
  zone: string;
  dispatches: OutwardDispatchEntry[];
}

// ============================================================
// 28 PROPOSALS (from official APCRDA Outward portal screenshot)
// ============================================================
const INITIAL_OUTWARD_PROPOSALS: OutwardProposalRecord[] = [
  {
    id: "out-prop-01",
    seqNo: 1,
    applicationNo: "1168/0018/BP/10/011/2025 (SUB-14)",
    permissionType: "Building Permission",
    applicant: "SUMATHI G",
    applicantPhone: "+91 98480 22331",
    applicantEmail: "sumathi.g@example.com",
    fileAssignedDate: "04/12/2025",
    status: "Approved",
    submissionDate: "5/12/2025",
    owner: "KUPPALA.SUBBA RAO",
    ownerAddress: "D.No 4-18-22, Arundelpet, Guntur, AP - 522002",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [
      {
        id: "disp-01",
        endorsementNo: "APCRDA/OUT/2026/04/0114",
        letterType: "Building Permission Sanction Letter & Proceeding Order",
        dispatchMode: "SPEED_POST",
        trackingNumber: "EP892014902IN",
        recipientName: "KUPPALA.SUBBA RAO",
        recipientAddress: "D.No 4-18-22, Arundelpet, Guntur, AP - 522002",
        dispatchDate: "10/12/2025",
        issuingOfficer: "A Jyotheeswar Reddy",
        issuingDesignation: "Commissioner",
        remarks: "Sanctioned proceeding order and authenticated drawings dispatched via Speed Post.",
        attachments: ["Sanctioned Drawing Sheet (.DWG/.PDF)", "Form 53 Statutory Endorsement", "Challan Fee Receipt"],
        status: "ACKNOWLEDGED",
      },
    ],
  },
  {
    id: "out-prop-02",
    seqNo: 2,
    applicationNo: "1168/0027/BP/10/008/2025 (SUB-6)",
    permissionType: "Building Permission",
    applicant: "SUMATHI G",
    applicantPhone: "+91 98480 22331",
    applicantEmail: "sumathi.g@example.com",
    fileAssignedDate: "04/12/2025",
    status: "Approved",
    submissionDate: "5/12/2025",
    owner: "KOMMINENI RATNA SNEHIKA",
    ownerAddress: "Flat 302, Sai Residency, Brodipet, Guntur, AP - 522002",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [],
  },
  {
    id: "out-prop-03",
    seqNo: 3,
    applicationNo: "1168/0030/BP/10/004/2025 (SUB-3)",
    permissionType: "Building Permission",
    applicant: "SUMATHI G",
    applicantPhone: "+91 98480 22331",
    applicantEmail: "sumathi.g@example.com",
    fileAssignedDate: "15/12/2025",
    status: "Approved",
    submissionDate: "16/12/2025",
    owner: "RAVELA RAMESH BABU",
    ownerAddress: "Plot No. 14, Ring Road, Amaravati, AP - 522237",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [],
  },
  {
    id: "out-prop-04",
    seqNo: 4,
    applicationNo: "1168/0024/BP/10/009/2025 (SUB-5)",
    permissionType: "Building Permission",
    applicant: "SUMATHI G",
    applicantPhone: "+91 98480 22331",
    applicantEmail: "sumathi.g@example.com",
    fileAssignedDate: "16/12/2025",
    status: "Approved",
    submissionDate: "17/12/2025",
    owner: "VATTIKUTI SAMBASIVA RAO",
    ownerAddress: "D.No 6-3-45, Lakshmipuram, Guntur, AP - 522007",
    caseType: "New",
    zone: "Zone 2",
    dispatches: [],
  },
  {
    id: "out-prop-05",
    seqNo: 5,
    applicationNo: "1168/0025/BP/10/017/2025 (SUB-2)",
    permissionType: "Building Permission",
    applicant: "Y BALA CHANDAR",
    applicantPhone: "+91 94401 88992",
    applicantEmail: "balachandar.y@example.com",
    fileAssignedDate: "17/12/2025",
    status: "Drawing Failed in Rules",
    submissionDate: "18/12/2025",
    owner: "Sri CHANUMOLU APPARAO S/o KRISHNAIAH",
    ownerAddress: "Village Layout, Kankipadu, Krishna Dist, AP - 521151",
    caseType: "New",
    zone: "Zone 2",
    dispatches: [
      {
        id: "disp-05",
        endorsementNo: "APCRDA/OUT/2025/12/0388",
        letterType: "Formal Shortfall Deficiency Notice & Rectification Directive",
        dispatchMode: "EMAIL",
        trackingNumber: "EMAIL-OUT-9912",
        recipientName: "Sri CHANUMOLU APPARAO S/o KRISHNAIAH",
        recipientAddress: "Village Layout, Kankipadu, Krishna Dist, AP - 521151",
        dispatchDate: "20/12/2025",
        issuingOfficer: "Sri Harsha",
        issuingDesignation: "Zonal Deputy Director - Zone 2",
        remarks: "Auto-DCR rule engine violations cited. 15 days cure notice served.",
        attachments: ["PreDCR Rule Violation Report", "Deficiency Schedule"],
        status: "DELIVERED",
      },
    ],
  },
  {
    id: "out-prop-06",
    seqNo: 6,
    applicationNo: "1168/0041/BP/10/009/2025 (SUB-1)",
    permissionType: "Building Permission",
    applicant: "SUMATHI G",
    applicantPhone: "+91 98480 22331",
    applicantEmail: "sumathi.g@example.com",
    fileAssignedDate: "31/12/2025",
    status: "Approved",
    submissionDate: "1/1/2026",
    owner: "VATTIKUTI MANIKYA RAO",
    ownerAddress: "D.No 12-4-9, Pattabhipuram, Guntur, AP - 522006",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [],
  },
  {
    id: "out-prop-07",
    seqNo: 7,
    applicationNo: "1168/0006/BP/10/016/2025 (SUB-39)",
    permissionType: "Building Permission",
    applicant: "KANAPARTHI VIDYA SAGAR",
    applicantPhone: "+91 94412 33445",
    applicantEmail: "vidyasagar.k@example.com",
    fileAssignedDate: "05/01/2026",
    status: "Approved",
    submissionDate: "6/1/2026",
    owner: "Ramadevi Ponguru",
    ownerAddress: "D.No 5-2-19, MG Road, Vijayawada, AP - 520010",
    caseType: "New",
    zone: "Zone 3",
    dispatches: [],
  },
  {
    id: "out-prop-08",
    seqNo: 8,
    applicationNo: "1168/0014/BP/12/027/2025 (SUB-24)",
    permissionType: "Building Permission",
    applicant: "NAGANJANEYULU KOTHAPUDI Naganjaneyulu",
    applicantPhone: "+91 98492 55667",
    applicantEmail: "naganjaneyulu@example.com",
    fileAssignedDate: "03/02/2026",
    status: "Approved",
    submissionDate: "4/2/2026",
    owner: "N. St. Mathew's Public Schools (St. Gabriel Educational Society) (NSM)",
    ownerAddress: "Institutional Sector, Vijayawada Bypass, AP - 520008",
    caseType: "New",
    zone: "Zone 2",
    dispatches: [
      {
        id: "disp-08",
        endorsementNo: "APCRDA/OUT/2026/02/0219",
        letterType: "Building Permission Sanction Letter & Proceeding Order",
        dispatchMode: "SPECIAL_MESSENGER",
        trackingNumber: "SM-VMC-2026-114",
        recipientName: "N. St. Mathew's Public Schools (NSM)",
        recipientAddress: "Institutional Sector, Vijayawada Bypass, AP - 520008",
        dispatchDate: "10/02/2026",
        issuingOfficer: "Hemanthsai",
        issuingDesignation: "Additional Commissioner",
        remarks: "Institutional block sanction order delivered with official receipt.",
        attachments: ["Sanction Proceeding", "Structural Safety Endorsement", "Fire NOC Copy"],
        status: "ACKNOWLEDGED",
      },
    ],
  },
  {
    id: "out-prop-09",
    seqNo: 9,
    applicationNo: "1168/0043/BP/10/016/2025 (SUB-6)",
    permissionType: "Building Permission",
    applicant: "SRINIVAS ALLU",
    applicantPhone: "+91 99081 77665",
    applicantEmail: "allu.srinivas@example.com",
    fileAssignedDate: "06/02/2026",
    status: "Approved",
    submissionDate: "7/2/2026",
    owner: "Nagalingam Leela Kumar",
    ownerAddress: "Sector 4, Mangalagiri Town, Guntur, AP - 522503",
    caseType: "New",
    zone: "Zone 3",
    dispatches: [],
  },
  {
    id: "out-prop-10",
    seqNo: 10,
    applicationNo: "1168/0028/BP/10/008/2026 (SUB-4)",
    permissionType: "Building Permission",
    applicant: "SUMATHI G",
    applicantPhone: "+91 98480 22331",
    applicantEmail: "sumathi.g@example.com",
    fileAssignedDate: "19/02/2026",
    status: "Approved",
    submissionDate: "20/2/2026",
    owner: "KOMMINENI NARASIMHA RAO",
    ownerAddress: "Plot No. 88, Auto Nagar, Guntur, AP - 522001",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [],
  },
  {
    id: "out-prop-11",
    seqNo: 11,
    applicationNo: "1168/0014/BP/10/017/2026 (SUB-18)",
    permissionType: "Building Permission",
    applicant: "SRINIVAS RAO V",
    applicantPhone: "+91 98661 44556",
    applicantEmail: "srinivasrao.v@example.com",
    fileAssignedDate: "24/02/2026",
    status: "Drawing Failed in Rules",
    submissionDate: "25/2/2026",
    owner: "M/s VARUN HOSPITALITY PRIVATE LIMITED, REPRESENTED BY ITS AUTHORIZED SIGNATORY & PROJECT ENGINEER SRI. AYYALASOMAYAJULA SREENIVASA RAO S/o A. RAMA RAO",
    ownerAddress: "Varun Beach Towers, Bandar Road, Vijayawada, AP - 520010",
    caseType: "New",
    zone: "Zone 2",
    dispatches: [],
  },
  {
    id: "out-prop-12",
    seqNo: 12,
    applicationNo: "1168/0015/BP/10/018/2026 (SUB-10)",
    permissionType: "Building Permission",
    applicant: "GULLAPALLI VENKATA SANDEEP",
    applicantPhone: "+91 94405 66778",
    applicantEmail: "sandeep.g@example.com",
    fileAssignedDate: "25/02/2026",
    status: "Approved",
    submissionDate: "26/2/2026",
    owner: "Bank of Baroda (Erstwhile Vijaya Bank)",
    ownerAddress: "Zonal Office, Governorpet, Vijayawada, AP - 520002",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [
      {
        id: "disp-12",
        endorsementNo: "APCRDA/OUT/2026/03/0074",
        letterType: "Building Permission Sanction Letter & Proceeding Order",
        dispatchMode: "REGISTERED_POST",
        trackingNumber: "RPAD-AP-2026-904",
        recipientName: "Bank of Baroda (Zonal Manager)",
        recipientAddress: "Zonal Office, Governorpet, Vijayawada, AP - 520002",
        dispatchDate: "02/03/2026",
        issuingOfficer: "A Jyotheeswar Reddy",
        issuingDesignation: "Commissioner",
        remarks: "Commercial branch building permit order dispatched.",
        attachments: ["Sanction Order", "Permit Certificate", "Form 53 Endorsement"],
        status: "DELIVERED",
      },
    ],
  },
  {
    id: "out-prop-13",
    seqNo: 13,
    applicationNo: "1168/0038/BP/10/018/2026 (SUB-7)",
    permissionType: "Building Permission",
    applicant: "GULLAPALLI VENKATA SANDEEP",
    applicantPhone: "+91 94405 66778",
    applicantEmail: "sandeep.g@example.com",
    fileAssignedDate: "08/03/2026",
    status: "Approved",
    submissionDate: "9/3/2026",
    owner: "PUNJAB NATIONAL BANK (PNB)",
    ownerAddress: "Circle Office, Gayatri Nagar, Vijayawada, AP - 520008",
    caseType: "New",
    zone: "Zone 2",
    dispatches: [],
  },
  {
    id: "out-prop-14",
    seqNo: 14,
    applicationNo: "1168/0046/BP/10/006/2026 (SUB-1)",
    permissionType: "Building Permission",
    applicant: "SUMATHI G",
    applicantPhone: "+91 98480 22331",
    applicantEmail: "sumathi.g@example.com",
    fileAssignedDate: "08/03/2026",
    status: "Approved",
    submissionDate: "9/3/2026",
    owner: "DODDA VENU",
    ownerAddress: "D.No 2-15-4, Kothapet, Guntur, AP - 522001",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [],
  },
  {
    id: "out-prop-15",
    seqNo: 15,
    applicationNo: "1168/0065/BP/10/018/2026 (SUB-3)",
    permissionType: "Building Permission",
    applicant: "GULLAPALLI VENKATA SANDEEP",
    applicantPhone: "+91 94405 66778",
    applicantEmail: "sandeep.g@example.com",
    fileAssignedDate: "29/03/2026",
    status: "Approved",
    submissionDate: "30/3/2026",
    owner: "Canara Bank",
    ownerAddress: "Regional Office, Old Club Road, Guntur, AP - 522001",
    caseType: "New",
    zone: "Zone 3",
    dispatches: [],
  },
  {
    id: "out-prop-16",
    seqNo: 16,
    applicationNo: "1168/0072/BP/10/021/2026 (SUB-5)",
    permissionType: "Building Permission",
    applicant: "K. SRAVANI",
    applicantPhone: "+91 94406 12345",
    applicantEmail: "sravani.k@example.com",
    fileAssignedDate: "02/04/2026",
    status: "In Review",
    submissionDate: "03/04/2026",
    owner: "K. Venkateswara Rao",
    ownerAddress: "Plot 104, Seed Access Road, Amaravati, AP - 522237",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [],
  },
  {
    id: "out-prop-17",
    seqNo: 17,
    applicationNo: "1168/0081/BP/10/012/2026 (SUB-2)",
    permissionType: "Building Permission",
    applicant: "M. KISHORE",
    applicantPhone: "+91 98499 87654",
    applicantEmail: "kishore.m@example.com",
    fileAssignedDate: "05/04/2026",
    status: "Approved",
    submissionDate: "06/04/2026",
    owner: "T. Lakshmi Devi",
    ownerAddress: "D.No 7-1-20, Tadepalli, Guntur, AP - 522501",
    caseType: "Alteration",
    zone: "Zone 2",
    dispatches: [],
  },
  {
    id: "out-prop-18",
    seqNo: 18,
    applicationNo: "1168/0088/BP/10/015/2026 (SUB-8)",
    permissionType: "Building Permission",
    applicant: "SUMATHI G",
    applicantPhone: "+91 98480 22331",
    applicantEmail: "sumathi.g@example.com",
    fileAssignedDate: "08/04/2026",
    status: "Proceeding Issued",
    submissionDate: "09/04/2026",
    owner: "B. Satyanarayana",
    ownerAddress: "D.No 3-8-12, Nallapadu, Guntur, AP - 522005",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [],
  },
  {
    id: "out-prop-19",
    seqNo: 19,
    applicationNo: "1168/0094/BP/10/022/2026 (SUB-1)",
    permissionType: "Building Permission",
    applicant: "KANAPARTHI VIDYA SAGAR",
    applicantPhone: "+91 94412 33445",
    applicantEmail: "vidyasagar.k@example.com",
    fileAssignedDate: "11/04/2026",
    status: "Shortfall Raised",
    submissionDate: "12/04/2026",
    owner: "Y. Madhavi Latha",
    ownerAddress: "Plot 52, Enikepadu, Vijayawada Rural, AP - 521108",
    caseType: "New",
    zone: "Zone 3",
    dispatches: [],
  },
  {
    id: "out-prop-20",
    seqNo: 20,
    applicationNo: "1168/0102/BP/10/019/2026 (SUB-4)",
    permissionType: "Building Permission",
    applicant: "SRINIVAS ALLU",
    applicantPhone: "+91 99081 77665",
    applicantEmail: "allu.srinivas@example.com",
    fileAssignedDate: "14/04/2026",
    status: "Approved",
    submissionDate: "15/04/2026",
    owner: "G. Murali Krishna",
    ownerAddress: "D.No 9-14-3, Gollapudi, Vijayawada, AP - 521225",
    caseType: "New",
    zone: "Zone 2",
    dispatches: [],
  },
  {
    id: "out-prop-21",
    seqNo: 21,
    applicationNo: "1168/0110/BP/10/007/2026 (SUB-6)",
    permissionType: "Layout Permission",
    applicant: "NAGANJANEYULU KOTHAPUDI",
    applicantPhone: "+91 98492 55667",
    applicantEmail: "naganjaneyulu@example.com",
    fileAssignedDate: "18/04/2026",
    status: "Approved",
    submissionDate: "19/04/2026",
    owner: "Sri Srinivasa Developers",
    ownerAddress: "Layout Sector B, Nelapadu, Amaravati, AP - 522237",
    caseType: "Layout",
    zone: "Zone 1",
    dispatches: [],
  },
  {
    id: "out-prop-22",
    seqNo: 22,
    applicationNo: "1168/0118/BP/10/025/2026 (SUB-2)",
    permissionType: "Building Permission",
    applicant: "Y BALA CHANDAR",
    applicantPhone: "+91 94401 88992",
    applicantEmail: "balachandar.y@example.com",
    fileAssignedDate: "21/04/2026",
    status: "Drawing Failed in Rules",
    submissionDate: "22/04/2026",
    owner: "K. Radhakrishna Murthy",
    ownerAddress: "D.No 1-22-9, Poranki, Krishna Dist, AP - 521137",
    caseType: "New",
    zone: "Zone 2",
    dispatches: [],
  },
  {
    id: "out-prop-23",
    seqNo: 23,
    applicationNo: "1168/0125/BP/10/014/2026 (SUB-7)",
    permissionType: "Building Permission",
    applicant: "SUMATHI G",
    applicantPhone: "+91 98480 22331",
    applicantEmail: "sumathi.g@example.com",
    fileAssignedDate: "24/04/2026",
    status: "Approved",
    submissionDate: "25/04/2026",
    owner: "P. Sambasiva Rao",
    ownerAddress: "Plot 303, Navodaya Colony, Guntur, AP - 522007",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [],
  },
  {
    id: "out-prop-24",
    seqNo: 24,
    applicationNo: "1168/0133/BP/10/030/2026 (SUB-3)",
    permissionType: "Occupancy Certificate",
    applicant: "GULLAPALLI VENKATA SANDEEP",
    applicantPhone: "+91 94405 66778",
    applicantEmail: "sandeep.g@example.com",
    fileAssignedDate: "27/04/2026",
    status: "Approved",
    submissionDate: "28/04/2026",
    owner: "Reliance Retail Ltd",
    ownerAddress: "Commercial Hub, MG Road, Vijayawada, AP - 520010",
    caseType: "OC",
    zone: "Zone 3",
    dispatches: [],
  },
  {
    id: "out-prop-25",
    seqNo: 25,
    applicationNo: "1168/0141/BP/10/011/2026 (SUB-5)",
    permissionType: "Building Permission",
    applicant: "SRINIVAS RAO V",
    applicantPhone: "+91 98661 44556",
    applicantEmail: "srinivasrao.v@example.com",
    fileAssignedDate: "30/04/2026",
    status: "In Review",
    submissionDate: "01/05/2026",
    owner: "N. Subrahmanyam",
    ownerAddress: "D.No 8-3-11, Bhavanipuram, Vijayawada, AP - 520012",
    caseType: "New",
    zone: "Zone 2",
    dispatches: [],
  },
  {
    id: "out-prop-26",
    seqNo: 26,
    applicationNo: "1168/0148/BP/10/009/2026 (SUB-2)",
    permissionType: "Building Permission",
    applicant: "SUMATHI G",
    applicantPhone: "+91 98480 22331",
    applicantEmail: "sumathi.g@example.com",
    fileAssignedDate: "03/05/2026",
    status: "Approved",
    submissionDate: "04/05/2026",
    owner: "D. Koteswara Rao",
    ownerAddress: "Plot 19, Syamalanagar, Guntur, AP - 522006",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [],
  },
  {
    id: "out-prop-27",
    seqNo: 27,
    applicationNo: "1168/0155/BP/10/016/2026 (SUB-9)",
    permissionType: "Building Permission",
    applicant: "KANAPARTHI VIDYA SAGAR",
    applicantPhone: "+91 94412 33445",
    applicantEmail: "vidyasagar.k@example.com",
    fileAssignedDate: "06/05/2026",
    status: "Proceeding Issued",
    submissionDate: "07/05/2026",
    owner: "Ch. Venkateswarlu",
    ownerAddress: "D.No 11-4-2, Gunadala, Vijayawada, AP - 520004",
    caseType: "New",
    zone: "Zone 3",
    dispatches: [],
  },
  {
    id: "out-prop-28",
    seqNo: 28,
    applicationNo: "1168/0162/BP/10/028/2026 (SUB-4)",
    permissionType: "Building Permission",
    applicant: "GULLAPALLI VENKATA SANDEEP",
    applicantPhone: "+91 94405 66778",
    applicantEmail: "sandeep.g@example.com",
    fileAssignedDate: "09/05/2026",
    status: "Approved",
    submissionDate: "10/05/2026",
    owner: "State Bank of India (SBI)",
    ownerAddress: "Regional Business Office, Court Road, Guntur, AP - 522001",
    caseType: "New",
    zone: "Zone 1",
    dispatches: [],
  },
];

const LETTER_TYPES = [
  "Building Permission Sanction Letter & Proceeding Order",
  "Technical Scrutiny Endorsement & Clearance",
  "Formal Shortfall Deficiency Notice & Rectification Directive",
  "Site Inspection Summons & Verification Letter",
  "Show Cause Directive & Hearing Notice",
  "Occupancy Certificate & Completion Endorsement",
  "Rejection Order & Grounds of Refusal",
];

const DISPATCH_MODES = [
  { value: "SPEED_POST", label: "Speed Post (RPAD)" },
  { value: "REGISTERED_POST", label: "Registered Post" },
  { value: "HAND_DELIVERY", label: "Hand Delivery (In-Person Acknowledgment)" },
  { value: "EMAIL", label: "Official Email / e-Dispatch" },
  { value: "SPECIAL_MESSENGER", label: "Special ULB Messenger" },
  { value: "COURIER", label: "Tracked Courier" },
];

export function OutwardView() {
  const user = useAppStore((s) => s.user);
  const { toast } = useToast();

  const [proposals, setProposals] = React.useState<OutwardProposalRecord[]>(INITIAL_OUTWARD_PROPOSALS);
  const [activeTab, setActiveTab] = React.useState<"proposals" | "register">("proposals");

  // Filters & Search
  const [searchTerm, setSearchTerm] = React.useState("");
  const [permissionTypeFilter, setPermissionTypeFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [caseTypeFilter, setCaseTypeFilter] = React.useState<string>("ALL");
  const [zoneFilter, setZoneFilter] = React.useState<string>("ALL");
  const [showFilterDrawer, setShowFilterDrawer] = React.useState(false);

  // Pagination (15 items per page like screenshot shows 15 items on page 1)
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 15;

  // Selected proposal for dispatching letter & endorsement
  const [selectedProposalForDispatch, setSelectedProposalForDispatch] = React.useState<OutwardProposalRecord | null>(null);

  // Selected dispatch for viewing letterhead
  const [selectedDispatchForPreview, setSelectedDispatchForPreview] = React.useState<{
    proposal: OutwardProposalRecord;
    dispatch: OutwardDispatchEntry;
  } | null>(null);

  // Form states for dispatch dialog
  const [letterType, setLetterType] = React.useState(LETTER_TYPES[0]);
  const [outwardNo, setOutwardNo] = React.useState("");
  const [dispatchMode, setDispatchMode] = React.useState<OutwardDispatchEntry["dispatchMode"]>("SPEED_POST");
  const [trackingNo, setTrackingNo] = React.useState("");
  const [recipientName, setRecipientName] = React.useState("");
  const [recipientAddress, setRecipientAddress] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [selectedAttachments, setSelectedAttachments] = React.useState<string[]>([
    "Sanctioned Architectural Drawing Sheet (.DWG / .PDF)",
    "Proceeding Order Copy",
    "Form 53 Statutory Endorsement",
  ]);

  // Open dispatch modal handler
  const handleOpenDispatch = (proposal: OutwardProposalRecord) => {
    setSelectedProposalForDispatch(proposal);
    const randNo = Math.floor(100 + Math.random() * 900);
    const now = new Date();
    setOutwardNo(`APCRDA/OUT/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${randNo}`);
    setTrackingNo(`EP${Math.floor(10000000 + Math.random() * 90000000)}IN`);
    setRecipientName(proposal.owner || proposal.applicant);
    setRecipientAddress(proposal.ownerAddress || "Andhra Pradesh Capital Region");
    setLetterType(
      proposal.status === "Approved"
        ? "Building Permission Sanction Letter & Proceeding Order"
        : proposal.status === "Drawing Failed in Rules" || proposal.status === "Shortfall Raised"
        ? "Formal Shortfall Deficiency Notice & Rectification Directive"
        : "Technical Scrutiny Endorsement & Clearance"
    );
    setRemarks(
      proposal.status === "Approved"
        ? "Building permission sanction order, validated drawing sheets and statutory conditions endorsed."
        : "Deficiencies cited in Auto-DCR rule scrutiny. Necessary rectifications to be submitted within 15 days."
    );
  };

  // Submit dispatch handler
  const handleConfirmDispatch = () => {
    if (!selectedProposalForDispatch) return;

    const now = new Date();
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    const newDispatch: OutwardDispatchEntry = {
      id: `disp-${Date.now()}`,
      endorsementNo: outwardNo.trim() || `APCRDA/OUT/2026/04/${Math.floor(100 + Math.random() * 900)}`,
      letterType,
      dispatchMode,
      trackingNumber: trackingNo.trim() || `EP${Math.floor(10000000 + Math.random() * 90000000)}IN`,
      recipientName: recipientName.trim() || selectedProposalForDispatch.owner,
      recipientAddress: recipientAddress.trim() || "APCRDA Jurisdiction",
      dispatchDate: formattedDate,
      issuingOfficer: user?.name || "Town Planning Authority",
      issuingDesignation: user?.designation || "Authorised Officer",
      remarks: remarks.trim() || "Official dispatch recorded in APCRDA Outward register.",
      attachments: selectedAttachments,
      status: "DISPATCHED",
    };

    setProposals((prev) =>
      prev.map((p) =>
        p.id === selectedProposalForDispatch.id
          ? {
              ...p,
              dispatches: [newDispatch, ...p.dispatches],
            }
          : p
      )
    );

    toast({
      title: "Letter & Endorsement Dispatched",
      description: `Outward No. ${newDispatch.endorsementNo} has been dispatched to ${newDispatch.recipientName} via ${newDispatch.dispatchMode.replace(/_/g, " ")}.`,
    });

    setSelectedProposalForDispatch(null);
  };

  // Filtering
  const filteredProposals = React.useMemo(() => {
    return proposals.filter((item) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matches =
          item.applicationNo.toLowerCase().includes(q) ||
          item.applicant.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q) ||
          item.permissionType.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.caseType.toLowerCase().includes(q) ||
          item.zone.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Permission Type
      if (permissionTypeFilter !== "ALL" && item.permissionType !== permissionTypeFilter) {
        return false;
      }

      // Status
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }

      // Case Type
      if (caseTypeFilter !== "ALL" && item.caseType !== caseTypeFilter) {
        return false;
      }

      // Zone
      if (zoneFilter !== "ALL" && item.zone !== zoneFilter) {
        return false;
      }

      return true;
    });
  }, [proposals, searchTerm, permissionTypeFilter, statusFilter, caseTypeFilter, zoneFilter]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setPermissionTypeFilter("ALL");
    setStatusFilter("ALL");
    setCaseTypeFilter("ALL");
    setZoneFilter("ALL");
    setCurrentPage(1);
    toast({
      title: "Filters Cleared",
      description: "Search keyword and dropdown filters have been reset.",
    });
  };

  // Pagination calculation
  const totalItems = filteredProposals.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProposals = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProposals.slice(start, start + pageSize);
  }, [filteredProposals, currentPage, pageSize]);

  // All dispatches list for the register view
  const allDispatchesList = React.useMemo(() => {
    const list: { proposal: OutwardProposalRecord; dispatch: OutwardDispatchEntry }[] = [];
    proposals.forEach((p) => {
      p.dispatches.forEach((d) => {
        list.push({ proposal: p, dispatch: d });
      });
    });
    return list;
  }, [proposals]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Seq No", "Application No", "Permission Type", "Applicant", "File Assigned Date", "Status", "Submission Date", "Owner", "Case Type", "Dispatches Count"];
    const rows = filteredProposals.map((p) => [
      p.seqNo,
      `"${p.applicationNo}"`,
      `"${p.permissionType}"`,
      `"${p.applicant}"`,
      `"${p.fileAssignedDate}"`,
      `"${p.status}"`,
      `"${p.submissionDate}"`,
      `"${p.owner}"`,
      `"${p.caseType}"`,
      p.dispatches.length,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `APCRDA_Outward_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Outward CSV Exported",
      description: `Downloaded ${filteredProposals.length} proposal records.`,
    });
  };

  return (
    <div className="w-full h-full bg-[#FAF7F2] p-2.5 sm:p-4 flex flex-col gap-3 font-sans text-slate-800 overflow-hidden">
      {/* ── TOP CONTROLS BAR (Matches user screenshot: Search left, Filter/Find/Clear right) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white border border-[#EADBCE] rounded-lg p-2.5 shadow-2xs">
        {/* Left: Search input with green check / icon */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="size-3.5 stroke-[2.5]" />
              </span>
            </div>
            <Input
              type="text"
              placeholder="Enter keywords to search for"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-8 sm:h-9 text-xs italic bg-white border-slate-300 focus:border-[#801824] focus:ring-[#801824]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Filter, Find, Clear buttons as in screenshot */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilterDrawer((prev) => !prev)}
            className={cn(
              "h-8 text-xs font-semibold px-3 gap-1.5 border-[#D0C2B2] cursor-pointer transition-colors",
              showFilterDrawer ? "bg-[#801824] text-white hover:bg-[#941C2B]" : "bg-[#FDFBF7] text-slate-700 hover:bg-[#F3EADF]"
            )}
          >
            <Filter className="size-3.5" />
            Filter
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: "Search Active",
                description: `Showing ${filteredProposals.length} matching proposals.`,
              });
            }}
            className="h-8 text-xs font-semibold px-3 gap-1.5 bg-[#FDFBF7] text-slate-700 border-[#D0C2B2] hover:bg-[#F3EADF] cursor-pointer"
          >
            <Search className="size-3.5 text-slate-500" />
            Find
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 text-xs font-semibold px-3 gap-1.5 bg-[#FDFBF7] text-slate-700 border-[#D0C2B2] hover:bg-[#F3EADF] cursor-pointer"
          >
            <RotateCcw className="size-3.5 text-slate-500" />
            Clear
          </Button>
        </div>
      </div>

      {/* ── COLLAPSIBLE FILTER CONTROLS ── */}
      {showFilterDrawer && (
        <div className="bg-[#FBF3E4] border border-[#EADBCE] rounded-lg p-3 animate-in fade-in-50 duration-150 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7A1316]">Permission Type:</span>
            <Select value={permissionTypeFilter} onValueChange={(val) => { setPermissionTypeFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 text-xs bg-white w-44">
                <SelectValue placeholder="All Permission Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Permission Types</SelectItem>
                <SelectItem value="Building Permission">Building Permission</SelectItem>
                <SelectItem value="Layout Permission">Layout Permission</SelectItem>
                <SelectItem value="Occupancy Certificate">Occupancy Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7A1316]">Status:</span>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 text-xs bg-white w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Drawing Failed in Rules">Drawing Failed in Rules</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Proceeding Issued">Proceeding Issued</SelectItem>
                <SelectItem value="Shortfall Raised">Shortfall Raised</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7A1316]">Case Type:</span>
            <Select value={caseTypeFilter} onValueChange={(val) => { setCaseTypeFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 text-xs bg-white w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Cases</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Alteration">Alteration</SelectItem>
                <SelectItem value="Layout">Layout</SelectItem>
                <SelectItem value="OC">OC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7A1316]">Zone:</span>
            <Select value={zoneFilter} onValueChange={(val) => { setZoneFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 text-xs bg-white w-28">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Zones</SelectItem>
                <SelectItem value="Zone 1">Zone 1</SelectItem>
                <SelectItem value="Zone 2">Zone 2</SelectItem>
                <SelectItem value="Zone 3">Zone 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearFilters}
            className="h-8 text-xs text-[#801824] hover:bg-[#F3EADF] font-bold ml-auto cursor-pointer"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* ── TOP MODULE TABS (Proposals for Outward Dispatch vs Dispatched Letters Register) ── */}
      <div className="flex items-center justify-between border-b border-[#EADBCE] pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("proposals")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "proposals"
                ? "bg-[#801824] text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-[#F3EADF] border border-[#EADBCE]"
            )}
          >
            <Send className="size-3.5" />
            Proposals for Outward Dispatch
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-black",
              activeTab === "proposals" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-800"
            )}>
              {filteredProposals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("register")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "register"
                ? "bg-[#801824] text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-[#F3EADF] border border-[#EADBCE]"
            )}
          >
            <FileText className="size-3.5" />
            Dispatched Letters & Endorsements Register
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-black",
              activeTab === "register" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
            )}>
              {allDispatchesList.length}
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Authority Outward Despatch Section</span>
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-700">{user?.name || "Official"} ({user?.designation || user?.role})</span>
        </div>
      </div>

      {/* ── TAB 1: PROPOSALS TABLE (Beige & Maroon Theme with all columns shown in screenshot) ── */}
      {activeTab === "proposals" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs">
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
                <tr className="divide-x divide-[#DCD5C8]">
                  <th className="w-10 px-2 py-2 text-center whitespace-nowrap">#</th>
                  <th className="w-48 px-3 py-2 whitespace-nowrap">Application No.</th>
                  <th className="w-36 px-3 py-2 whitespace-nowrap">Permission Type</th>
                  <th className="w-44 px-3 py-2 whitespace-nowrap">Applicant</th>
                  <th className="w-28 px-2 py-2 text-center whitespace-nowrap">File Assigned Date</th>
                  <th className="w-32 px-2 py-2 text-center whitespace-nowrap">Status</th>
                  <th className="w-24 px-2 py-2 text-center whitespace-nowrap">Submission Date</th>
                  <th className="w-64 max-w-[260px] px-3 py-2">Owner</th>
                  <th className="w-20 px-2 py-2 text-center whitespace-nowrap">Case Type</th>
                  <th className="w-36 px-3 py-2 text-center whitespace-nowrap bg-[#EFE3D3]">Action / Outward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {paginatedProposals.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-400 font-medium">
                      No proposals match the search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedProposals.map((item, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    const hasDispatches = item.dispatches.length > 0;
                    const latestDispatch = item.dispatches[0];

                    return (
                      <tr key={item.id} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]">
                        {/* # Sequence No */}
                        <td className="px-2 py-2 text-center text-slate-600 font-medium whitespace-nowrap">
                          {rowNumber}
                        </td>

                        {/* Application No. (clickable link in maroon) */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenDispatch(item)}
                            className="font-mono font-bold text-[#7A1316] hover:text-[#8F161A] hover:underline cursor-pointer text-left block"
                            title="Click to compose and dispatch letter/endorsement"
                          >
                            {item.applicationNo}
                          </button>
                          {hasDispatches && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-0.5">
                              <CheckCircle2 className="size-2.5" /> Dispatched: {latestDispatch.endorsementNo}
                            </span>
                          )}
                        </td>

                        {/* Permission Type */}
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap font-medium">
                          {item.permissionType}
                        </td>

                        {/* Applicant */}
                        <td className="px-3 py-2 text-slate-800 font-semibold whitespace-nowrap">
                          {item.applicant}
                        </td>

                        {/* File Assigned Date */}
                        <td className="px-2 py-2 text-center text-slate-600 whitespace-nowrap font-mono">
                          {item.fileAssignedDate}
                        </td>

                        {/* Status (Approved in blue/emerald, Drawing Failed in Rules in red as in screenshot) */}
                        <td className="px-2 py-2 text-center whitespace-nowrap font-medium">
                          {item.status === "Approved" ? (
                            <span className="text-[#0E5E7A] font-semibold">
                              Approved
                            </span>
                          ) : item.status === "Drawing Failed in Rules" ? (
                            <span className="text-red-600 font-bold">
                              Drawing Failed in Rules
                            </span>
                          ) : item.status === "Proceeding Issued" ? (
                            <span className="text-purple-700 font-semibold">
                              Proceeding Issued
                            </span>
                          ) : item.status === "Shortfall Raised" ? (
                            <span className="text-amber-700 font-semibold">
                              Shortfall Raised
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              {item.status}
                            </span>
                          )}
                        </td>

                        {/* Submission Date */}
                        <td className="px-2 py-2 text-center text-slate-600 whitespace-nowrap font-mono">
                          {item.submissionDate}
                        </td>

                        {/* Owner */}
                        <td className="px-3 py-2 text-slate-800 font-medium truncate max-w-[260px]" title={item.owner}>
                          {item.owner}
                        </td>

                        {/* Case Type */}
                        <td className="px-2 py-2 text-center text-slate-700 whitespace-nowrap">
                          {item.caseType}
                        </td>

                        {/* Action / Outward Button */}
                        <td className="px-3 py-2 text-center whitespace-nowrap bg-[#FAF4EB]/60">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleOpenDispatch(item)}
                              className="h-7 px-2.5 text-[11px] font-bold bg-[#801824] hover:bg-[#941C2B] text-white gap-1 cursor-pointer shadow-2xs"
                            >
                              <Send className="size-3" />
                              {hasDispatches ? "Send Endorsement" : "Send Letter"}
                            </Button>

                            {hasDispatches && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedDispatchForPreview({ proposal: item, dispatch: latestDispatch })}
                                title="View & Print Endorsement Letterhead"
                                className="h-7 px-2 text-[11px] font-medium border-[#801824]/40 text-[#801824] hover:bg-[#F3EADF] cursor-pointer"
                              >
                                <Eye className="size-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── BOTTOM PAGINATION & METRICS BAR (Matches screenshot layout) ── */}
          <div className="bg-[#F5EBE1] border-t border-[#DCD5C8] px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            {/* Left: Print & CSV Export buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-7 text-xs px-2 gap-1 bg-white border-[#D0C2B2] text-slate-700 hover:bg-[#F3EADF] cursor-pointer"
              >
                <FileSpreadsheet className="size-3 text-emerald-700" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-7 text-xs px-2 gap-1 bg-white border-[#D0C2B2] text-slate-700 hover:bg-[#F3EADF] cursor-pointer"
              >
                <Printer className="size-3 text-slate-600" />
                Print
              </Button>
            </div>

            {/* Center: Pagination numbers [1] 2 */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-6 w-6 p-0 text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "size-6 rounded text-xs font-bold transition-all cursor-pointer",
                    currentPage === pageNum
                      ? "bg-[#801824] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-[#EBDBC8]"
                  )}
                >
                  {pageNum}
                </button>
              ))}

              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-6 w-6 p-0 text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>

            {/* Right: Total Proposals count */}
            <div className="font-bold text-[#7A1316]">
              Total Proposal(s) : {totalItems}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DISPATCHED LETTERS REGISTER & AUDIT TRAIL ── */}
      {activeTab === "register" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl border-2 border-[#801824] bg-[#FBF3E4] shadow-xs">
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F5EBE1] text-[#7A1316] border-b border-[#DCD5C8] font-bold text-xs sticky top-0 z-10">
                <tr className="divide-x divide-[#DCD5C8]">
                  <th className="w-36 px-3 py-2 whitespace-nowrap">Outward No.</th>
                  <th className="w-48 px-3 py-2 whitespace-nowrap">Application No.</th>
                  <th className="w-52 px-3 py-2 whitespace-nowrap">Letter / Endorsement Type</th>
                  <th className="w-40 px-3 py-2 whitespace-nowrap">Mode & Tracking #</th>
                  <th className="w-52 px-3 py-2 whitespace-nowrap">Recipient & Address</th>
                  <th className="w-24 px-2 py-2 text-center whitespace-nowrap">Date</th>
                  <th className="w-36 px-3 py-2 whitespace-nowrap">Issuing Officer</th>
                  <th className="w-24 px-2 py-2 text-center whitespace-nowrap">Status</th>
                  <th className="w-28 px-2 py-2 text-center whitespace-nowrap bg-[#EFE3D3]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {allDispatchesList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400 font-medium">
                      No letters or endorsements have been dispatched yet. Click "Send Letter" on any proposal to dispatch.
                    </td>
                  </tr>
                ) : (
                  allDispatchesList.map(({ proposal, dispatch }) => (
                    <tr key={dispatch.id} className="hover:bg-[#FDFBF7] transition-colors divide-x divide-[#EADBCE]">
                      {/* Outward No. */}
                      <td className="px-3 py-2 font-mono font-bold text-[#801824] whitespace-nowrap">
                        {dispatch.endorsementNo}
                      </td>

                      {/* Application No. */}
                      <td className="px-3 py-2 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {proposal.applicationNo}
                      </td>

                      {/* Letter Type */}
                      <td className="px-3 py-2 font-medium text-slate-800">
                        {dispatch.letterType}
                      </td>

                      {/* Mode & Tracking */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Truck className="size-3 text-[#801824]" />
                          {dispatch.dispatchMode.replace(/_/g, " ")}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {dispatch.trackingNumber}
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="px-3 py-2">
                        <div className="font-bold text-slate-800">{dispatch.recipientName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={dispatch.recipientAddress}>
                          {dispatch.recipientAddress}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-2 py-2 text-center font-mono text-slate-700 whitespace-nowrap">
                        {dispatch.dispatchDate}
                      </td>

                      {/* Issuing Officer */}
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-800">{dispatch.issuingOfficer}</div>
                        <div className="text-[10px] text-slate-500">{dispatch.issuingDesignation}</div>
                      </td>

                      {/* Status */}
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold",
                          dispatch.status === "ACKNOWLEDGED"
                            ? "bg-emerald-100 text-emerald-800"
                            : dispatch.status === "DELIVERED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        )}>
                          {dispatch.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-2 py-2 text-center whitespace-nowrap bg-[#FAF4EB]/60">
                        <Button
                          size="sm"
                          onClick={() => setSelectedDispatchForPreview({ proposal, dispatch })}
                          className="h-7 px-2.5 text-xs bg-[#801824] hover:bg-[#941C2B] text-white gap-1 cursor-pointer font-semibold"
                        >
                          <Eye className="size-3" />
                          View Letter
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Bar */}
          <div className="bg-[#F5EBE1] border-t border-[#DCD5C8] px-3 py-2 flex items-center justify-between text-xs font-bold text-[#7A1316]">
            <div>Total Outward Entries: {allDispatchesList.length}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-7 text-xs px-2 gap-1 bg-white border-[#D0C2B2] text-slate-700 hover:bg-[#F3EADF]"
            >
              <FileSpreadsheet className="size-3 text-emerald-700" /> Export Register
            </Button>
          </div>
        </div>
      )}

      {/* ── MODAL 1: SEND LETTER & ENDORSEMENT DIALOG ── */}
      {selectedProposalForDispatch && (
        <Dialog
          open={!!selectedProposalForDispatch}
          onOpenChange={(open) => !open && setSelectedProposalForDispatch(null)}
        >
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto font-sans p-5 sm:p-6 bg-[#FAF7F2] border-2 border-[#801824]">
            <DialogHeader className="border-b border-[#EADBCE] pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold text-[#7A1316] flex items-center gap-2">
                    <Send className="size-5 text-[#801824]" />
                    Dispatch Official Letter & Endorsement
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-600 mt-1">
                    Issue statutory orders, scrutiny endorsements, shortfall citations, or sanction proceedings for Outward dispatch.
                  </DialogDescription>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#EBDBC8] text-[#7A1316] font-mono font-bold text-xs">
                  {selectedProposalForDispatch.zone}
                </span>
              </div>
            </DialogHeader>

            {/* Proposal Details Card */}
            <div className="bg-white rounded-lg border border-[#EADBCE] p-3 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Application No.</span>
                  <span className="font-mono font-bold text-[#7A1316]">{selectedProposalForDispatch.applicationNo}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Permission Type</span>
                  <span className="font-semibold text-slate-800">{selectedProposalForDispatch.permissionType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposal Status</span>
                  <span className={cn(
                    "font-bold",
                    selectedProposalForDispatch.status === "Approved" ? "text-emerald-700" : "text-red-600"
                  )}>
                    {selectedProposalForDispatch.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Submission Date</span>
                  <span className="font-mono text-slate-700">{selectedProposalForDispatch.submissionDate}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner / Society</span>
                  <span className="font-medium text-slate-800">{selectedProposalForDispatch.owner}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant (LTP / Architect)</span>
                  <span className="font-medium text-slate-800">{selectedProposalForDispatch.applicant}</span>
                </div>
              </div>
            </div>

            {/* Endorsement Form */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Letter Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Letter & Endorsement Type *</label>
                  <Select value={letterType} onValueChange={setLetterType}>
                    <SelectTrigger className="h-9 text-xs bg-white border-slate-300">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LETTER_TYPES.map((lt) => (
                        <SelectItem key={lt} value={lt} className="text-xs">
                          {lt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Outward Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Outward Despatch Number *</label>
                  <Input
                    value={outwardNo}
                    onChange={(e) => setOutwardNo(e.target.value)}
                    className="h-9 text-xs font-mono font-bold bg-white border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mode of Dispatch */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mode of Dispatch *</label>
                  <Select value={dispatchMode} onValueChange={(val: any) => setDispatchMode(val)}>
                    <SelectTrigger className="h-9 text-xs bg-white border-slate-300">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISPATCH_MODES.map((dm) => (
                        <SelectItem key={dm.value} value={dm.value} className="text-xs">
                          {dm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tracking / Barcode Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Postal Barcode / Tracking Number</label>
                  <Input
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    className="h-9 text-xs font-mono bg-white border-slate-300"
                  />
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Recipient Name *</label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="h-9 text-xs bg-white border-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Recipient Postal Address *</label>
                  <Input
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="h-9 text-xs bg-white border-slate-300"
                  />
                </div>
              </div>

              {/* Endorsement Remarks & Directives */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Endorsement Directives & Special Conditions</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter statutory conditions, directives or hearing intimation details..."
                  className="w-full rounded-md border border-slate-300 p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#801824]"
                />
              </div>

              {/* Mandatory Enclosures Checklist */}
              <div className="bg-white rounded-lg border border-[#EADBCE] p-3 space-y-1.5">
                <span className="text-xs font-bold text-slate-800 block">Enclosures Checklist (Dispatched with Letter):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                  {[
                    "Sanctioned Architectural Drawing Sheet (.DWG / .PDF)",
                    "Proceeding Order Copy with Sanction Conditions",
                    "Form 53 Statutory Endorsement",
                    "Challan & Fee Payment Verification Receipt",
                  ].map((enc) => (
                    <label key={enc} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAttachments.includes(enc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAttachments((prev) => [...prev, enc]);
                          } else {
                            setSelectedAttachments((prev) => prev.filter((x) => x !== enc));
                          }
                        }}
                        className="rounded border-slate-300 text-[#801824] focus:ring-[#801824]"
                      />
                      <span className="text-xs">{enc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-[#EADBCE] pt-3 flex items-center justify-between sm:justify-between w-full">
              <Button
                variant="outline"
                type="button"
                onClick={() => setSelectedProposalForDispatch(null)}
                className="h-8 text-xs border-slate-300"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tempDispatch: OutwardDispatchEntry = {
                      id: "temp-preview",
                      endorsementNo: outwardNo || "APCRDA/OUT/2026/04/PREVIEW",
                      letterType,
                      dispatchMode,
                      trackingNumber: trackingNo || "EP123456789IN",
                      recipientName: recipientName || selectedProposalForDispatch.owner,
                      recipientAddress: recipientAddress || "Amaravati, AP",
                      dispatchDate: `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                      issuingOfficer: user?.name || "Town Planning Authority",
                      issuingDesignation: user?.designation || "Authorised Officer",
                      remarks,
                      attachments: selectedAttachments,
                      status: "DISPATCHED",
                    };
                    setSelectedDispatchForPreview({
                      proposal: selectedProposalForDispatch,
                      dispatch: tempDispatch,
                    });
                  }}
                  className="h-8 text-xs border-[#801824] text-[#801824] hover:bg-[#F3EADF] gap-1 cursor-pointer font-semibold"
                >
                  <Eye className="size-3" />
                  Preview Letterhead
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirmDispatch}
                  className="h-8 text-xs bg-[#801824] hover:bg-[#941C2B] text-white gap-1.5 cursor-pointer font-bold shadow-xs"
                >
                  <Send className="size-3.5" />
                  Dispatch & Endorse
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 2: OFFICIAL APCRDA LETTERHEAD PREVIEW MODAL ── */}
      {selectedDispatchForPreview && (
        <Dialog
          open={!!selectedDispatchForPreview}
          onOpenChange={(open) => !open && setSelectedDispatchForPreview(null)}
        >
          <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto font-sans p-6 bg-white border-2 border-[#801824]">
            {/* Official Letterhead Header */}
            <div className="text-center border-b-2 border-[#801824] pb-4">
              <div className="flex justify-center mb-1">
                <div className="size-12 rounded-full border border-[#801824] p-1 flex items-center justify-center bg-[#FAF4EB]">
                  <Building2 className="size-7 text-[#801824]" />
                </div>
              </div>
              <h2 className="text-sm font-black tracking-wider text-[#7A1316] uppercase">
                Andhra Pradesh Capital Region Development Authority (APCRDA)
              </h2>
              <p className="text-[11px] font-semibold text-slate-700">
                TOWN PLANNING WING · OUTWARD DESPATCH & PROCEEDING SECTION
              </p>
              <p className="text-[10px] text-slate-500">
                Lenin Centre, Governorpet, Vijayawada - 520002 · Website: www.crda.ap.gov.in
              </p>
            </div>

            {/* Letter Metadata */}
            <div className="py-3 border-b border-slate-200 text-xs flex justify-between items-start">
              <div className="space-y-1">
                <div>
                  <span className="font-bold text-slate-600">Outward No: </span>
                  <span className="font-mono font-bold text-[#801824]">{selectedDispatchForPreview.dispatch.endorsementNo}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Application No: </span>
                  <span className="font-mono font-bold text-slate-900">{selectedDispatchForPreview.proposal.applicationNo}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Mode: </span>
                  <span className="font-semibold text-slate-700">{selectedDispatchForPreview.dispatch.dispatchMode.replace(/_/g, " ")} ({selectedDispatchForPreview.dispatch.trackingNumber})</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div>
                  <span className="font-bold text-slate-600">Dated: </span>
                  <span className="font-mono font-bold text-slate-900">{selectedDispatchForPreview.dispatch.dispatchDate}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Zone: </span>
                  <span className="font-semibold text-slate-800">{selectedDispatchForPreview.proposal.zone}</span>
                </div>
              </div>
            </div>

            {/* Recipient Box */}
            <div className="py-3 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-600 block">To,</span>
              <div className="font-bold text-slate-900 pl-4">{selectedDispatchForPreview.dispatch.recipientName}</div>
              <div className="text-slate-700 pl-4 whitespace-pre-wrap">{selectedDispatchForPreview.dispatch.recipientAddress}</div>
            </div>

            {/* Subject & Reference */}
            <div className="py-3 border-b border-slate-200 text-xs space-y-1.5">
              <div>
                <span className="font-bold text-slate-800">Sub: </span>
                <span className="font-bold text-[#7A1316]">
                  APCRDA – Town Planning – {selectedDispatchForPreview.dispatch.letterType} – Communication of Proceedings – Reg.
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-800">Ref: </span>
                <span className="text-slate-700">
                  1. Proposal Application filed by Sri/Smt. {selectedDispatchForPreview.proposal.applicant} dated {selectedDispatchForPreview.proposal.submissionDate}.
                  <br />
                  2. Technical verification by Town Planning Wing and Zonal Scrutiny Committee.
                </span>
              </div>
            </div>

            {/* Letter Body Text */}
            <div className="py-3 text-xs leading-relaxed text-slate-800 space-y-2">
              <p>
                In exercise of the powers conferred under Section 81 of the Andhra Pradesh Capital Region Development Authority Act, 2014, and in accordance with the AP Building Rules, the competent authority has issued the following communication in respect of the subject application:
              </p>
              <div className="bg-[#FAF4EB] border-l-4 border-[#801824] p-3 rounded text-xs font-medium text-slate-800">
                {selectedDispatchForPreview.dispatch.remarks || "All conditions stipulated in the sanction proceeding shall be strictly complied with prior to commencement of works."}
              </div>
              <p>
                The applicant and owner are hereby directed to strictly adhere to the sanctioned parameters. Any deviation or unauthorized construction beyond the endorsed drawing limits will attract immediate cancellation and penal action under statutory building bylaws.
              </p>
            </div>

            {/* Enclosures Checklist */}
            {selectedDispatchForPreview.dispatch.attachments.length > 0 && (
              <div className="py-2 text-[11px] text-slate-600 border-t border-slate-200">
                <span className="font-bold block mb-1">Enclosures:</span>
                <ul className="list-disc list-inside space-y-0.5 pl-2">
                  {selectedDispatchForPreview.dispatch.attachments.map((att, i) => (
                    <li key={i}>{att}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sign-off & Seal */}
            <div className="pt-6 flex justify-between items-end border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1 border border-slate-300 rounded bg-slate-50">
                  <QrCode className="size-12 text-slate-700" />
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  Scan to verify
                  <br />
                  APCRDA Outward Portal
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="inline-block border border-emerald-600/40 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-800 mb-1">
                  Digitally Authenticated
                </div>
                <div className="font-bold text-xs text-slate-900">{selectedDispatchForPreview.dispatch.issuingOfficer}</div>
                <div className="text-[11px] text-slate-600 font-medium">{selectedDispatchForPreview.dispatch.issuingDesignation}</div>
                <div className="text-[10px] text-[#7A1316] font-bold">APCRDA · Andhra Pradesh</div>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-200 pt-4 flex items-center justify-between sm:justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDispatchForPreview(null)}
                className="h-8 text-xs"
              >
                Close Preview
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="h-8 text-xs bg-[#801824] hover:bg-[#941C2B] text-white gap-1.5 cursor-pointer font-bold"
              >
                <Printer className="size-3.5" />
                Print Endorsement Letter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
