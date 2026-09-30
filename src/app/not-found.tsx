import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-6">
      <div className="max-w-md w-full bg-white border-2 border-[#7A1316] rounded-2xl shadow-xl p-8 text-center space-y-5">
        <div className="size-16 rounded-full bg-amber-100 text-[#7A1316] flex items-center justify-center mx-auto shadow-inner">
          <FileQuestion className="size-8" />
        </div>
        <div>
          <span className="font-mono text-xs font-black tracking-wider text-[#7A1316] uppercase bg-[#FBF3E4] border border-[#DCD5C8] px-2.5 py-1 rounded-full">
            404 — Not Found
          </span>
          <h2 className="text-lg font-black text-slate-900 tracking-tight mt-3">
            Page or Proposal Not Found
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            The requested workflow view or application route does not exist or has been relocated within the APCRDA portal.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors shadow-xs"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
