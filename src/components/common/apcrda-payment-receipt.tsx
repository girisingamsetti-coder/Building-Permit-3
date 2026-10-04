"use client";

import * as React from "react";
import Image from "next/image";
import { Printer, Download, X, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Application } from "@/types";

export interface ApcrdaPaymentReceiptData {
  receiptNo: string;
  receiptDate: string;
  demandNoteNo: string;
  baNo: string;
  applicantName: string;
  communicationAddress: string;
  amount: number;
  amountInWords?: string;
  transactionType?: string;
  paymentMadeAt?: string;
  transactionId: string;
  paymentDate?: string;
  paymentGateway?: string;
}

export function amountToWordsINR(amount: number): string {
  if (amount === 0) return "Rupees Zero Only";
  const num = Math.floor(Math.abs(amount));

  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function inWords(n: number): string {
    if (n === 0) return "";
    let str = "";
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + "Crore ";
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + "Lacs ";
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + "Thousand ";
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + "Hundred ";
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : " ");
      }
    }
    return str;
  }

  const words = inWords(num).trim();
  return `Rupees ${words} Only`;
}

export function formatIndianCurrency(amount: number): string {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ApcrdaPaymentReceipt({
  data,
  onClose,
  showActions = true,
}: {
  data: ApcrdaPaymentReceiptData;
  onClose?: () => void;
  showActions?: boolean;
}) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const amountInWords =
    data.amountInWords || amountToWordsINR(data.amount);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Actions Toolbar - Hidden during print */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2] border border-[#DCD5C8] rounded-xl p-3.5 print:hidden shadow-xs">
          <div className="flex items-center gap-2">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="gap-1.5 h-8 text-xs cursor-pointer border-[#DCD5C8] hover:bg-white"
              >
                <ArrowLeft className="size-3.5" /> Back
              </Button>
            )}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#7A1316]">APCRDA Payment Receipt</span>
              <span className="text-slate-400">|</span>
              <span className="font-mono text-slate-600">{data.receiptNo}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 h-8 text-xs cursor-pointer border-[#7A1316]/30 text-[#7A1316] hover:bg-[#F5EBE1]"
            >
              <Printer className="size-3.5" /> Print Receipt
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 h-8 text-xs cursor-pointer bg-[#7A1316] hover:bg-[#8F161A] text-white shadow-xs"
            >
              <Download className="size-3.5" /> Download PDF
            </Button>
          </div>
        </div>
      )}

      {/* Official Receipt Sheet matching Payment receipt.pdf */}
      <div
        id="apcrda-payment-receipt-sheet"
        className="bg-white text-slate-900 border border-slate-300 rounded-lg p-8 sm:p-12 shadow-sm font-sans print:border-none print:shadow-none print:p-0 print:m-0"
        style={{ minHeight: "800px" }}
      >
        {/* Department Logo & Title */}
        <div className="flex flex-col items-center justify-center text-center space-y-1 mb-7">
          <div className="w-16 h-16 relative mb-1 flex items-center justify-center">
            {/* APCRDA Seal Badge */}
            <div className="w-14 h-14 rounded-full border-2 border-amber-600 bg-amber-50 flex items-center justify-center p-1 shadow-2xs">
              <Image
                src="/APCRDA.png"
                alt="APCRDA Seal"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
            Andhra Pradesh Capital Region Development Authority
          </h1>
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-wider uppercase">
            DEVELOPMENT PROMOTION DEPARTMENT
          </h2>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 underline underline-offset-4 tracking-wider uppercase pt-1">
            PAYMENT RECEIPT
          </h3>
        </div>

        {/* Metadata Top 4-Grid */}
        <div className="text-xs sm:text-[13px] leading-relaxed mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 border-b border-transparent pb-1">
            <div className="flex">
              <span className="font-bold text-slate-900 w-36 shrink-0">Receipt No.</span>
              <span className="font-bold text-slate-900 mx-2">:</span>
              <span className="font-semibold text-slate-900">{data.receiptNo}</span>
            </div>
            <div className="flex sm:justify-start">
              <span className="font-bold text-slate-900 w-32 shrink-0">Receipt Date</span>
              <span className="font-bold text-slate-900 mx-2">:</span>
              <span className="font-semibold text-slate-900">{data.receiptDate}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 pt-1">
            <div className="flex">
              <span className="font-bold text-slate-900 w-36 shrink-0">Demand Note No</span>
              <span className="font-bold text-slate-900 mx-2">:</span>
              <span className="font-semibold text-slate-900">{data.demandNoteNo}</span>
            </div>
            <div className="flex sm:justify-start">
              <span className="font-bold text-slate-900 w-36 shrink-0">Application Number</span>
              <span className="font-bold text-slate-900 mx-2">:</span>
              <span className="font-semibold text-slate-900">{data.baNo}</span>
            </div>
          </div>
        </div>

        {/* Applicant & Communication Details */}
        <div className="text-xs sm:text-[13px] leading-relaxed space-y-1.5 my-4 pt-2 border-t border-slate-200/80">
          <div className="flex items-start">
            <span className="font-bold text-slate-900 w-44 shrink-0">Applicant Name</span>
            <span className="font-bold text-slate-900 mx-2">:</span>
            <span className="font-semibold text-slate-900 flex-1 leading-snug">
              {data.applicantName}
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-bold text-slate-900 w-44 shrink-0">Communication Address</span>
            <span className="font-bold text-slate-900 mx-2">:</span>
            <span className="font-medium text-slate-800 flex-1 leading-snug">
              {data.communicationAddress}
            </span>
          </div>
        </div>

        {/* Main Boxed Payment Table (Matches PDF exactly) */}
        <div className="border border-slate-700 rounded-xs overflow-hidden mt-5 mb-8 text-xs sm:text-[13px]">
          {/* Top Payment Rows */}
          <div className="p-3.5 space-y-2.5">
            <div className="flex items-baseline">
              <span className="font-bold text-slate-900 w-44 shrink-0">Amount (INR)</span>
              <span className="font-bold text-slate-900 mx-2">:</span>
              <span className="font-bold text-slate-900 text-sm sm:text-base font-mono">
                {formatIndianCurrency(data.amount)}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="font-bold text-slate-900 w-44 shrink-0">Amount (In Words)</span>
              <span className="font-bold text-slate-900 mx-2">:</span>
              <span className="font-bold text-slate-900 flex-1 leading-snug">
                {amountInWords}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="font-bold text-slate-900 w-44 shrink-0">Transaction Type</span>
              <span className="font-bold text-slate-900 mx-2">:</span>
              <span className="font-bold text-slate-900">
                {data.transactionType || "Net Banking / Credit Card / Debit Card"}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="font-bold text-slate-900 w-44 shrink-0">Payment Made At</span>
              <span className="font-bold text-slate-900 mx-2">:</span>
              <span className="font-bold text-slate-900">
                {data.paymentMadeAt || "Online"}
              </span>
            </div>
          </div>

          {/* Payment Details Subheading Bar */}
          <div className="bg-[#EFEFEF] border-t border-b border-slate-400 px-3.5 py-1.5 text-xs font-bold text-slate-900 tracking-wide">
            Payment Details
          </div>

          {/* Transaction Metadata */}
          <div className="p-3.5 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <div className="flex items-baseline">
                <span className="font-bold text-slate-900 w-44 shrink-0">Transaction ID</span>
                <span className="font-bold text-slate-900 mx-2">:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {data.transactionId}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-slate-900 w-20 shrink-0">Date</span>
                <span className="font-bold text-slate-900 mx-2">:</span>
                <span className="font-bold text-slate-900">
                  {data.paymentDate || data.receiptDate}
                </span>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="font-bold text-slate-900 w-44 shrink-0">Payment Gateway</span>
              <span className="font-bold text-slate-900 mx-2">:</span>
              <span className="font-bold text-slate-900">
                {data.paymentGateway || "TP"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-8 text-[11px] sm:text-xs text-slate-700 italic font-medium">
          ** This is system generated report and does not require any signature. **
        </div>
      </div>
    </div>
  );
}

export function buildReceiptFromApplication(app: Application): ApcrdaPaymentReceiptData {
  const p = app.payment;
  const rawDate = p?.completedAt ? new Date(p.completedAt) : new Date();
  const formattedDate = !isNaN(rawDate.getTime())
    ? rawDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "09 February, 2026";

  const totalFee = p?.amount || app.fee?.total || 572698;

  return {
    receiptNo: p?.receiptNo || `1168/CH/0107/${rawDate.getFullYear() || 2026}`,
    receiptDate: formattedDate,
    demandNoteNo: p?.referenceNo || p?.receiptNo || `1168/CH/0107/${rawDate.getFullYear() || 2026}`,
    baNo: app.applicationNo || "1168/0014/BP/12/027/2026",
    applicantName: app.applicant?.name || "NANNAPANENI RAMBABU",
    communicationAddress: app.applicant?.address
      ? `${app.applicant.address}, ${app.project?.ward || ""}, ${app.project?.zone || ""}`
      : ", St. Jhons Brothers Quaters, Gannavaram Mandalam, Buddavaram Panchayathi, Davaj,",
    amount: totalFee,
    transactionType:
      p?.method === "UPI"
        ? "UPI"
        : p?.method === "NETBANKING"
        ? "Net Banking"
        : "Net Banking / Credit Card / Debit Card",
    paymentMadeAt: "Online",
    transactionId: p?.transactionId || "786612820",
    paymentDate: formattedDate,
    paymentGateway: p?.gateway || "TP",
  };
}

export function ApcrdaPaymentReceiptModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: ApcrdaPaymentReceiptData | null;
}) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-4 sm:p-6 my-6 max-h-[92vh] overflow-y-auto border border-slate-300">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors print:hidden shadow-xs"
          title="Close receipt"
        >
          <X className="size-4" />
        </button>
        <ApcrdaPaymentReceipt data={data} onClose={onClose} showActions={true} />
      </div>
    </div>
  );
}
