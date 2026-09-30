"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log sanitized error information to monitoring service
    console.error("Application Error Boundary caught error:", error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-6">
      <div className="max-w-md w-full bg-white border-2 border-[#7A1316] rounded-2xl shadow-xl p-8 text-center space-y-5">
        <div className="size-16 rounded-full bg-rose-100 text-[#7A1316] flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="size-8" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Unexpected System Exception
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            An unexpected error occurred while rendering the workflow portal. Your session data is preserved.
          </p>
          {process.env.NODE_ENV !== "production" && error.message && (
            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-800 font-mono text-left overflow-auto max-h-24">
              {error.message}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-[#7A1316] hover:bg-[#8F161A] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="size-3.5" />
            <span>Try Again</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-[#DCD5C8] text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Home className="size-3.5 text-[#7A1316]" />
            <span>Go to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
