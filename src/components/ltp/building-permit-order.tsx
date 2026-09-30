"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  Building2,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface BuildingPermitOrderData {
  fileNo: string;
  permitNo: string;
  date: string;
  applicantName: string;
  applicantAddress: string;
  buildingUse: string;
  plotArea: string;
  plotCode: string;
  doorNo: string;
  villageName: string;
  district: string;
  applicationDate: string;
  developer?: string;
  developerLicNo?: string;
  ltp?: string;
  ltpLicNo?: string;
  structuralEngineer?: string;
  structuralEngineerLicNo?: string;
  rsNo?: string;
  township?: string;
  sector?: string;
  colony?: string;
  blockNo?: string;
  mandal?: string;
  gramPanchayat?: string;
  state?: string;
  siteArea: string;
  roadAffectedArea?: string;
  netSiteArea?: string;
  buildingName?: string;
  buildingHeight?: string;
  groundFloorArea?: string;
  upperFloors?: string;
  upperFloorArea?: string;
  totalBuiltUpArea?: string;
  commercialArea?: string;
  residentialArea?: string;
  basements?: string;
  buildingUsage?: string;
  setbackFrontProvided?: string;
  setbackFrontRequired?: string;
  setbackRearProvided?: string;
  setbackRearRequired?: string;
  setbackSide1Provided?: string;
  setbackSide1Required?: string;
  setbackSide2Provided?: string;
  setbackSide2Required?: string;
  maxBuildingCoverage?: string;
  maxFSI?: string;
  providedFSI?: string;
  noOfUnits?: string;
  greenCoverage?: string;
  openSpace?: string;
  fireWaterTank?: string;
  totalFeesPaid?: string;
  contractorsPolicy?: string;
  affidavitNo?: string;
  floorArea?: string;
  mortgageDeedNo?: string;
  sroOffice?: string;
  commencementBefore: string;
  completionBefore: string;
}

// ─── DEFAULT DATA BUILDER ────────────────────────────────────────────────────
export function buildPermitOrderFromBaNo(baNo: string, applicantName?: string, village?: string, district?: string): BuildingPermitOrderData {
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}, ${d.getFullYear()}`;
  const plusYears = (y: number) => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() + y);
    return fmt(d);
  };

  return {
    fileNo: baNo,
    permitNo: baNo,
    date: fmt(today),
    applicantName: applicantName ?? "JONNALAGADDA SRINIVASARAO",
    applicantAddress: `${village ?? "Borupalem"}, Thullur, ${district ?? "Guntur"}, Andhra Pradesh`,
    buildingUse: "Commercial",
    plotArea: "777.60",
    plotCode: baNo,
    doorNo: "55, 73, 80",
    villageName: village ?? "Borupalem",
    district: district ?? "Guntur",
    applicationDate: fmt(today),
    developer: "NA",
    developerLicNo: "NA",
    ltp: "NA",
    ltpLicNo: "NA",
    structuralEngineer: "NA",
    structuralEngineerLicNo: "NA",
    rsNo: "55, 73, 80",
    township: "1",
    sector: "52",
    colony: "252",
    blockNo: "1794",
    mandal: "Thullur",
    gramPanchayat: "GP0710009",
    state: "Andhra Pradesh",
    siteArea: "777.60",
    roadAffectedArea: "0.00",
    netSiteArea: "1,622.44",
    buildingName: "Canara Bank",
    buildingHeight: "28.00",
    groundFloorArea: "532.37",
    upperFloors: "7",
    upperFloorArea: "4,088.16",
    totalBuiltUpArea: "4,620.53",
    commercialArea: "4,620.53",
    residentialArea: "0.00",
    basements: "2",
    buildingUsage: "SPECIAL",
    setbackFrontProvided: "7.00",
    setbackFrontRequired: "3.00",
    setbackRearProvided: "7.00",
    setbackRearRequired: "6.00",
    setbackSide1Provided: "7.00",
    setbackSide1Required: "6.00",
    setbackSide2Provided: "7.00",
    setbackSide2Required: "6.00",
    maxBuildingCoverage: "42.00%",
    maxFSI: "≤ 5.000",
    providedFSI: "2.848",
    noOfUnits: "NA",
    greenCoverage: "348.99",
    openSpace: "941.08",
    fireWaterTank: "NA",
    totalFeesPaid: "As per Challan",
    contractorsPolicy: "NA",
    affidavitNo: "NA",
    floorArea: "681.36",
    mortgageDeedNo: "NA",
    sroOffice: "NA",
    commencementBefore: plusYears(1),
    completionBefore: plusYears(3),
  };
}

// ─── CONDITIONS ──────────────────────────────────────────────────────────────
const CONDITIONS = [
  "The permission accorded does not confer any ownership rights. As per Sec 113 of APCRDA Act, the Commissioner or the Authority or the Government, may revoke any development permission issued under this Act, whenever it is found that there has been any false statement or wrong permission is issued or any misinterpretation of any material fact or rule on which the permission was granted.",
  "Limitations of Building Sanction: Sanction of building permission by this Authority shall not mean responsibility or clearance of title or ownership, easement rights, variation in area, structural stability, workmanship, building services, flooding risk, or other licences required under other laws.",
  "If any dispute litigation arises in future, regarding the ownership of a land the applicant shall be responsible for the settlement of the same, APCRDA or its employees shall not be a part to any such dispute / litigation.",
  "This permission does not bar any public agency including APCRDA to acquire the lands for public purpose as per law.",
  "The construction shall be done by the owner only in accordance with the sanctioned Plan under the strict supervision of the Architect, Structural Engineer and site engineer failing which the violations are liable for demolition besides legal action.",
  "Structural Safety and Fire Safety Requirements shall be the responsibility of the Owner, Builder/Developer, Architect and Structural Engineer and shall provide all necessary Fire Fighting installations as stipulated in National Building Code of India - 2016.",
  "Construction shall be covered under the contractors all risk Insurance till the issue of occupancy certificate.",
  "Architect / Structural Engineer if changed, the consent of the previous Architect / Structural Engineer is required and to be intimated to the APCRDA.",
  "The Services like Sanitation, Plumbing, Fire Safety requirements, lifts, electrical installations etc., shall be executed under the supervision of Qualified Technical Personnel.",
  "The permit Order remains valid for three years during which time the development works or construction shall be completed, and if not completed, such permission shall be got revalidated for another two years only on submitting an application and on payment of the additional fees and charges as may be prescribed.",
  "If the works are not commenced within one year from the date of issue of Permit Order, the Development Permission stands lapsed.",
  "Neither the granting of the development permission or the approval of the drawings and specifications, nor the inspections made by the Sanctioning Authority during development shall, in any way, relieve the licensed professional or developer from full responsibility for carrying out the development in accordance with these Regulations.",
  "If during the execution any deviation is made from the Sanctioned Permit Order, the revised Development Permit shall be obtained without fail.",
  "Sanctioned Plan copy as attested by the APCRDA shall be displayed at the construction site for public view.",
  "Commencement Notice shall be submitted by the applicant before commencement of the building.",
  "Basement and designated areas approved for parking in the plan should be used exclusively for parking of vehicles.",
  "No. of flats as sanctioned shall not be increased without prior approval of APCRDA at any time in future.",
  "The Builder/Developer shall register the project in the RERA website.",
  "All greenery and live landscaping as shown in the approved plan shall be completed before occupancy of building and shall be properly maintained.",
  "Stocking of Building Materials on footpath and road margin causing obstruction to free Movement of public & vehicles shall not be done.",
  "A safe distance of minimum 3.0 mts Vertical and Horizontal Distance between the Building & High Tension Electrical Lines and 1.5 mts for Low Tension electrical line shall be maintained.",
  "Green building norms, energy efficiency guidelines (ECBC) and Environmentally sustainable development shall be followed.",
  "Rain Water Harvesting Structure (percolation pit) and plantation of trees shall be taken up as per stipulations in Water, Land and Trees Act. 2002.",
  "Buildings shall be designed for compliance with earth quake resistance and resisting other natural hazards.",
  "Owner / Builder shall install roof top solar plants in the 1/3 of the roof top areas of all buildings to meet 10% of the total energy demand of the buildings.",
  "Occupancy Certificate shall be mandatory for all buildings.",
  "Mortgage shall be released only upon issue of Occupancy Certificate by the Commissioner, APCRDA.",
  "The applicant shall pay the short fall of payment if any, noticed by the Authority at any time.",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Cell({ children, bold, maroon, span, center }: { children?: React.ReactNode; bold?: boolean; maroon?: boolean; span?: number; center?: boolean }) {
  return (
    <td
      colSpan={span}
      className={cn(
        "border border-[#DCD5C8] px-2.5 py-1.5 text-[11px] align-top leading-snug",
        bold && "font-bold",
        maroon && "text-[#7A1316]",
        center && "text-center"
      )}
    >
      {children}
    </td>
  );
}

function SectionHead({ letter, title }: { letter: string; title: string }) {
  return (
    <tr>
      <td
        colSpan={10}
        className="border border-[#DCD5C8] bg-[#801824] px-3 py-1.5 text-[11px] font-black tracking-wider text-[#FDF6ED]"
      >
        {letter}&nbsp;&nbsp;{title}
      </td>
    </tr>
  );
}

function DataRow({ sno, label, value, extra }: { sno?: string | number; label: string; value?: string; extra?: React.ReactNode }) {
  return (
    <tr className="even:bg-[#FAF4EB]">
      {sno !== undefined && <Cell bold>{sno}</Cell>}
      <Cell bold={false}>{label}</Cell>
      <Cell bold span={sno !== undefined ? undefined : 2}>
        {value}
        {extra}
      </Cell>
    </tr>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function BuildingPermitOrder({
  data,
  onBack,
}: {
  data: BuildingPermitOrderData;
  onBack?: () => void;
}) {
  const handleDownload = () => {
    const el = document.getElementById("bpo-document");
    if (!el) return;
    const text = el.innerText;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BuildingPermitOrder-${data.permitNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 no-print">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-[#7A1316] hover:bg-[#F5EBE1]">
            <ArrowLeft className="size-3.5" />
            Back to Payments
          </Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer className="size-3.5" />
            Print
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-[#801824] hover:bg-[#941C2B] text-white"
            onClick={handleDownload}
          >
            <Download className="size-3.5" />
            Download
          </Button>
        </div>
      </div>

      {/* ── Document ── */}
      <div
        id="bpo-document"
        className="mx-auto max-w-5xl bg-white border border-[#DCD5C8] rounded-xl overflow-hidden shadow-lg"
        style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: "11px" }}
      >
        {/* Header */}
        <div className="border-b-2 border-[#801824] bg-[#FAF4EB] px-8 py-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#801824] text-white shrink-0">
              <Building2 className="size-7" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#801824]">
                Andhra Pradesh Capital Region Development Authority
              </p>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Development Promotion Department
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-1.5">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span className="text-[13px] font-black uppercase tracking-widest text-emerald-700">
              Building Permit Order
            </span>
          </div>
        </div>

        {/* Address + Reference */}
        <div className="grid grid-cols-2 border-b border-[#DCD5C8]">
          <div className="border-r border-[#DCD5C8] px-6 py-4 space-y-1">
            <p className="font-bold">To,</p>
            <p>Sri/Smt.</p>
            <p className="font-bold text-[12px]">{data.applicantName}</p>
            <p className="text-slate-600">{data.applicantAddress}</p>
            <p className="mt-3 italic text-slate-700">Sir / Madam,</p>
          </div>
          <div className="px-6 py-4 space-y-2.5">
            {[
              { label: "File No.", value: data.fileNo },
              { label: "Permit No.", value: data.permitNo },
              { label: "Date", value: data.date },
            ].map((r) => (
              <div key={r.label} className="flex gap-2 items-baseline">
                <span className="w-24 shrink-0 font-bold text-slate-600">{r.label} :</span>
                <span className="font-mono font-bold text-[#801824] text-[12px]">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub / Ref */}
        <div className="border-b border-[#DCD5C8] px-6 py-3 bg-[#FDFAF5] space-y-2">
          <p className="leading-relaxed">
            <span className="font-bold">Sub:</span> APCRDA — Building Permission — Proposal for construction of{" "}
            <span className="font-bold">{data.buildingUse}</span> in an extent of{" "}
            <span className="font-bold">{data.plotArea} Sqm</span> in Plot Code{" "}
            <span className="font-mono font-bold">{data.plotCode}</span>, D.No.{" "}
            <span className="font-bold">{data.doorNo}</span> of{" "}
            <span className="font-bold">{data.villageName}</span>,{" "}
            <span className="font-bold">{data.district}</span> District — Permission Sanctioned — Regarding.
          </p>
          <p>
            <span className="font-bold">Ref:</span> Your Application Date:{" "}
            <span className="font-bold">{data.applicationDate}</span>&nbsp;&nbsp;|&nbsp;&nbsp;Amaravati Capital city ZR-2016.
          </p>
        </div>

        {/* Preamble */}
        <div className="border-b border-[#DCD5C8] px-6 py-3 bg-white">
          <p className="leading-relaxed">
            The Application submitted in the reference has been examined with reference to the rules and regulations of Amaravati Capital City Master plan &amp; Zoning regulations-2016 and permission is hereby{" "}
            <span className="font-bold underline decoration-[#801824]">sanctioned conditionally</span> as detailed below:
          </p>
        </div>

        {/* Sections */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {/* ── A ── */}
              <SectionHead letter="A" title="APPLICANT AND LICENSED PERSONNEL DETAILS:" />
              <tr className="even:bg-[#FAF4EB]"><Cell bold>1</Cell><Cell>Applicant</Cell><Cell bold span={2}>{data.applicantName}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>2</Cell><Cell>Developer / Builder</Cell><Cell>{data.developer ?? "NA"}</Cell><Cell><span className="font-bold">Lic.No.</span> {data.developerLicNo ?? "NA"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>3</Cell><Cell>Licensed Technical Person</Cell><Cell>{data.ltp ?? "NA"}</Cell><Cell><span className="font-bold">Lic.No.</span> {data.ltpLicNo ?? "NA"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>4</Cell><Cell>Structural Engineer</Cell><Cell>{data.structuralEngineer ?? "NA"}</Cell><Cell><span className="font-bold">Lic.No.</span> {data.structuralEngineerLicNo ?? "NA"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>5</Cell><Cell>Others</Cell><Cell span={2}>NA</Cell></tr>

              {/* ── B ── */}
              <SectionHead letter="B" title="SITE DETAILS" />
              <tr className="even:bg-[#FAF4EB]"><Cell bold>1</Cell><Cell>D No./RS.No</Cell><Cell span={2}>{data.rsNo ?? data.doorNo}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>2</Cell><Cell>Plot Code</Cell><Cell span={2} bold>{data.plotCode}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>3</Cell><Cell>Township</Cell><Cell span={2}>{data.township ?? "1"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>4</Cell><Cell>Sector</Cell><Cell>{data.sector ?? "—"}</Cell><Cell><span className="font-bold">Colony</span> {data.colony ?? "—"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>5</Cell><Cell>Block No.</Cell><Cell>{data.blockNo ?? "—"}</Cell><Cell><span className="font-bold">Mandal</span> {data.mandal ?? "—"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>6</Cell><Cell>Village / LPS Village</Cell><Cell>{data.villageName}</Cell><Cell><span className="font-bold">District</span> {data.district}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>7</Cell><Cell>Gram Panchayat</Cell><Cell>{data.gramPanchayat ?? "—"}</Cell><Cell><span className="font-bold">State</span> {data.state ?? "Andhra Pradesh"}</Cell></tr>

              {/* ── C ── */}
              <SectionHead letter="C" title="DETAILS OF PERMISSION SANCTIONED AS PER ZR OF AMARAVATI CAPITAL CITY" />
              <tr className="even:bg-[#FAF4EB]"><Cell bold>1</Cell><Cell>Site Area (Sqm)</Cell><Cell span={2} bold>{data.siteArea}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>2</Cell><Cell>Road affected area (m²)</Cell><Cell span={2}>{data.roadAffectedArea ?? "0.00"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>3</Cell><Cell>Net Site Area (m²)</Cell><Cell span={2} bold>{data.netSiteArea ?? data.siteArea}</Cell></tr>

              {/* Built-up area */}
              <tr>
                <td colSpan={10} className="border border-[#DCD5C8] bg-[#F5EBE1] px-3 py-1.5 text-[11px] font-bold text-[#7A1316]">
                  Building — {data.buildingName ?? "Main Building"} &nbsp;(Height (m): {data.buildingHeight ?? "—"})
                </td>
              </tr>
              <tr className="bg-[#F5EBE1] font-bold text-[#7A1316]">
                <Cell bold></Cell><Cell bold></Cell><Cell bold center>Ground floor</Cell><Cell bold center>Upper floors</Cell>
              </tr>
              <tr className="even:bg-[#FAF4EB]">
                <Cell></Cell><Cell>Commercial</Cell><Cell center>{data.groundFloorArea ?? "—"} m²</Cell>
                <Cell center>{data.upperFloors ?? "—"} floors · {data.upperFloorArea ?? "—"} m²</Cell>
              </tr>
              <tr className="even:bg-[#FAF4EB]">
                <Cell></Cell><Cell>Residential</Cell><Cell center>{data.residentialArea ?? "0.00"} m²</Cell><Cell></Cell>
              </tr>
              <tr className="even:bg-[#FAF4EB]">
                <Cell></Cell><Cell bold>Total Built up area</Cell><Cell bold center span={2}>{data.totalBuiltUpArea ?? "—"} m²</Cell>
              </tr>
              <tr className="even:bg-[#FAF4EB]">
                <Cell></Cell><Cell>Basements</Cell><Cell span={2}>{data.basements ?? "—"}</Cell>
              </tr>

              <tr className="even:bg-[#FAF4EB]"><Cell bold>6</Cell><Cell>Usage</Cell><Cell span={2} bold>{data.buildingUsage ?? data.buildingUse}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>7</Cell><Cell>Building Height (m)</Cell><Cell span={2} bold>{data.buildingHeight ?? "—"}</Cell></tr>

              {/* Setbacks */}
              <tr>
                <td colSpan={10} className="border border-[#DCD5C8] px-3 py-1 text-[11px] font-bold text-[#7A1316] bg-[#F5EBE1]">
                  8 &nbsp;&nbsp; Set-backs as per Amaravati ZR-2016
                </td>
              </tr>
              <tr className="bg-[#F5EBE1] font-bold text-[#7A1316]">
                <Cell bold></Cell><Cell bold></Cell><Cell bold center>Front</Cell><Cell bold center>Rear</Cell>
              </tr>
              <tr className="even:bg-[#FAF4EB]">
                <Cell></Cell><Cell bold>Provided</Cell><Cell center>{data.setbackFrontProvided ?? "—"}</Cell><Cell center>{data.setbackRearProvided ?? "—"}</Cell>
              </tr>
              <tr className="even:bg-[#FAF4EB]">
                <Cell></Cell><Cell bold>Required</Cell><Cell center>{data.setbackFrontRequired ?? "—"}</Cell><Cell center>{data.setbackRearRequired ?? "—"}</Cell>
              </tr>
              <tr className="bg-[#F5EBE1] font-bold text-[#7A1316]">
                <Cell bold></Cell><Cell bold></Cell><Cell bold center>Side I</Cell><Cell bold center>Side II</Cell>
              </tr>
              <tr className="even:bg-[#FAF4EB]">
                <Cell></Cell><Cell bold>Provided</Cell><Cell center>{data.setbackSide1Provided ?? "—"}</Cell><Cell center>{data.setbackSide2Provided ?? "—"}</Cell>
              </tr>
              <tr className="even:bg-[#FAF4EB]">
                <Cell></Cell><Cell bold>Required</Cell><Cell center>{data.setbackSide1Required ?? "—"}</Cell><Cell center>{data.setbackSide2Required ?? "—"}</Cell>
              </tr>

              <tr className="even:bg-[#FAF4EB]"><Cell bold>9</Cell><Cell>Maximum Building Coverage</Cell><Cell span={2}>Provided : {data.maxBuildingCoverage ?? "—"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell></Cell><Cell>Maximum F.S.I</Cell><Cell span={2}>{data.maxFSI ?? "—"}&nbsp;&nbsp; Provided : {data.providedFSI ?? "—"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>10</Cell><Cell>No. of Units</Cell><Cell span={2}>{data.noOfUnits ?? "NA"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>11</Cell><Cell>Green Coverage (m²)</Cell><Cell span={2}>{data.greenCoverage ?? "—"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>12</Cell><Cell>Open Space for Recreation (m²)</Cell><Cell span={2}>{data.openSpace ?? "—"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>13</Cell><Cell>Fire Water tank</Cell><Cell span={2}>{data.fireWaterTank ?? "NA"}</Cell></tr>

              {/* ── D ── */}
              <SectionHead letter="D" title="DETAILS OF FEES PAID (Rs.) TOTAL:" />
              <tr className="even:bg-[#FAF4EB]"><Cell bold span={2}>TOTAL:</Cell><Cell span={2} bold>{data.totalFeesPaid ?? "NA"}</Cell></tr>

              {/* ── E ── */}
              <SectionHead letter="E" title="OTHER DETAILS:" />
              <tr className="even:bg-[#FAF4EB]"><Cell bold>1</Cell><Cell>Contractor&apos;s all Risk Policy No.</Cell><Cell>{data.contractorsPolicy ?? "NA"}</Cell><Cell>Date — &nbsp; Valid Upto —</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>2</Cell><Cell>Notarised Affidavit No. / Area (m²)</Cell><Cell>{data.affidavitNo ?? "NA"}</Cell><Cell>Floor handed over: {data.floorArea ?? "—"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>3</Cell><Cell>Mortgage Deed No.</Cell><Cell>{data.mortgageDeedNo ?? "NA"}</Cell><Cell>S.R.O. {data.sroOffice ?? "NA"}</Cell></tr>
              <tr className="even:bg-[#FAF4EB]"><Cell bold>4</Cell><Cell span={3}>Enter Sr. No. in prohibitory Property Watch Register — NA</Cell></tr>

              {/* ── F & G ── */}
              <SectionHead letter="F" title={`Construction to be Commenced Before  ${data.commencementBefore}`} />
              <SectionHead letter="G" title={`Construction to be Completed Before  ${data.completionBefore}`} />
            </tbody>
          </table>
        </div>

        {/* Conditions */}
        <div className="border-t-2 border-[#DCD5C8] px-6 py-5 bg-[#FDFAF5]">
          <p className="font-bold text-[12px] mb-3 text-[#7A1316]">
            The Building permission is sanctioned subject to following conditions:
          </p>
          <ol className="space-y-2 list-decimal list-outside pl-5">
            {CONDITIONS.map((c, i) => (
              <li key={i} className="leading-relaxed text-[10.5px] text-slate-800">
                {c}
              </li>
            ))}
          </ol>
        </div>

        {/* Signature block */}
        <div className="border-t-2 border-[#DCD5C8] px-6 py-5 bg-white flex justify-between items-end">
          <div className="text-[11px] text-slate-600 space-y-0.5">
            <p className="font-bold">Copy to:</p>
            <p>The Panchayat Secretary,</p>
            <p>{data.villageName}</p>
            <p>{data.district} District.</p>
          </div>
          <div className="text-center text-[11px]">
            <div className="h-12 mb-1" />
            <p className="font-bold text-[12px]">By order</p>
            <p className="font-black text-[14px] text-[#801824]">Commissioner</p>
            <p className="text-slate-500 text-[10px]">Andhra Pradesh Capital Region Development Authority</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#DCD5C8] px-6 py-3 bg-[#FAF4EB] text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <FileCheck className="size-3 text-emerald-600 shrink-0" />
            <span className="text-[9.5px] font-semibold text-emerald-700">
              This is a system-generated document and does not require any physical signature. This is an authorized document under Amaravati Capital City ZR-2016.
            </span>
          </div>
          <p className="text-[9.5px] text-slate-500">
            For further confirmation, visit{" "}
            <span className="text-[#801824] font-semibold">https://bbas.ap.gov.in/</span> with file number.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          #bpo-document { box-shadow: none !important; border: 1px solid #ccc !important; border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
