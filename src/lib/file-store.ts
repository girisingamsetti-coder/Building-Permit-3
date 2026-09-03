"use client";

// ============================================================
// FILE STORE — in-memory persistent binary file storage
//
// Stores the ACTUAL uploaded file content (as ArrayBuffer + MIME type +
// original filename) keyed by a stable fileReference ID.
//
// This is the single source of truth for uploaded document binaries.
// DocumentRecord.fileReference is the key into this store.
//
// Persistence model:
//   - In-memory for the current session (survives navigation, survives
//     HMR, survives route changes — same as the Zustand store).
//   - On a full page reload, seed documents lose their binary content
//     (they were never really uploaded); download then falls back to a
//     clearly-labelled demo placeholder. User-uploaded files in the
//     current session remain valid binaries.
//
// This is NOT a fake PDF generator. When a real file is uploaded, the
// exact bytes the user selected are stored and returned on download.
// ============================================================

export interface StoredFile {
  fileReference: string;
  fileName: string;
  mimeType: string;
  size: number;
  data: ArrayBuffer;       // actual file bytes
  uploadedAt: string;
  uploadedBy: string;
  applicationId: string;
  documentCode: string;
  version: number;
}

class FileStore {
  private files = new Map<string, StoredFile>();

  /** Store a real uploaded file. Returns the fileReference key. */
  store(input: {
    data: ArrayBuffer;
    fileName: string;
    mimeType: string;
    applicationId: string;
    documentCode: string;
    version: number;
    uploadedBy: string;
  }): string {
    const fileReference = genFileReference(input.applicationId, input.documentCode, input.version);
    const stored: StoredFile = {
      fileReference,
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.data.byteLength,
      data: input.data,
      uploadedAt: new Date().toISOString(),
      uploadedBy: input.uploadedBy,
      applicationId: input.applicationId,
      documentCode: input.documentCode,
      version: input.version,
    };
    this.files.set(fileReference, stored);
    return fileReference;
  }

  /** Retrieve a stored file by its fileReference. Returns null if not found. */
  get(fileReference: string): StoredFile | null {
    return this.files.get(fileReference) ?? null;
  }

  /** Check whether a real binary exists for this fileReference. */
  has(fileReference: string): boolean {
    return this.files.has(fileReference);
  }

  /** Remove a stored file (used when cleaning up old versions if ever needed). */
  delete(fileReference: string): void {
    this.files.delete(fileReference);
  }
}

// Generate a stable, unique fileReference for each uploaded file version.
// Format: filestore://<applicationId>/<documentCode>/v<version>
export function genFileReference(applicationId: string, documentCode: string, version: number): string {
  return `filestore://${applicationId}/${documentCode}/v${version}`;
}

// Singleton
export const fileStore = new FileStore();

// ============================================================
// MIME TYPE DETECTION + VALIDATION
// ============================================================

/** Allowed MIME types for document uploads. */
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  gif: ["image/gif"],
  webp: ["image/webp"],
  dwg: ["application/acad", "application/x-acad", "image/vnd.dwg", "application/octet-stream"],
  dxf: ["application/dxf", "image/vnd.dxf", "application/octet-stream"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
};

/** Allowed file extensions (lowercase, without the dot). */
export const ALLOWED_EXTENSIONS = [
  "pdf", "jpg", "jpeg", "png", "gif", "webp",
  "dwg", "dxf",
  "doc", "docx", "xls", "xlsx",
];

export interface FileValidationResult {
  ok: boolean;
  error?: string;
  extension?: string;
  mimeType?: string;
}

/** Validate a file's extension + MIME type. Don't trust extension alone. */
export function validateFile(file: File, maxBytes = 50 * 1024 * 1024): FileValidationResult {
  if (!file) return { ok: false, error: "No file provided." };
  if (file.size === 0) return { ok: false, error: "File is empty." };
  if (file.size > maxBytes) {
    return { ok: false, error: `File exceeds the maximum size of ${(maxBytes / 1024 / 1024).toFixed(0)} MB.` };
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return { ok: false, error: `File type ".${ext || "?"}" is not supported.` };
  }
  // MIME from the browser (can be empty for some types); fall back to extension mapping.
  const browserMime = file.type || extensionToMime(ext);
  const allowed = ALLOWED_MIME_TYPES[ext] ?? [];
  // If the browser reports a MIME that's NOT in the allowed list for this extension, reject.
  // (Catches e.g. "malicious.txt" renamed to "document.pdf" where the OS may still report text/plain.)
  if (browserMime && allowed.length > 0 && !allowed.includes(browserMime) && !allowed.includes("application/octet-stream")) {
    // Allow if the browser reports octet-stream (generic) — common for DWG/DXF.
    if (browserMime !== "application/octet-stream") {
      return { ok: false, error: `MIME type "${browserMime}" does not match the ".${ext}" extension.` };
    }
  }
  return { ok: true, extension: ext, mimeType: browserMime };
}

/** Map a file extension to a canonical MIME type. */
export function extensionToMime(ext: string): string {
  const map: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    dwg: "application/acad",
    dxf: "application/dxf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return map[ext] ?? "application/octet-stream";
}

// ============================================================
// FILE READ HELPERS
// ============================================================

/** Read a File as ArrayBuffer (the actual binary content). */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsArrayBuffer(file);
  });
}

/** Read a File as a data URL (for image preview). */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

// ============================================================
// DOWNLOAD HELPER — creates a valid Blob from stored file content
// ============================================================

/**
 * Download a stored file by its fileReference. Creates a valid Blob with the
 * original MIME type and triggers a browser download with the correct filename.
 * Returns true on success, false if the file isn't in the store.
 */
export function downloadStoredFile(fileReference: string): boolean {
  const stored = fileStore.get(fileReference);
  if (!stored) return false;
  // Create a Blob from the ACTUAL stored bytes with the correct MIME type.
  const blob = new Blob([stored.data], { type: stored.mimeType });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = stored.fileName;
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
  // Revoke after a short delay to ensure the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

/**
 * Get a Blob URL for a stored file (used for in-page preview, e.g. PDF iframe
 * or image src). Caller must revoke the URL when done.
 */
export function getStoredFileObjectURL(fileReference: string): string | null {
  const stored = fileStore.get(fileReference);
  if (!stored) return null;
  const blob = new Blob([stored.data], { type: stored.mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Verify a stored PDF begins with the %PDF- signature. Returns true for valid
 * PDFs, false otherwise (also false for non-PDF files).
 */
export function isValidPdf(fileReference: string): boolean {
  const stored = fileStore.get(fileReference);
  if (!stored) return false;
  if (stored.mimeType !== "application/pdf") return false;
  const bytes = new Uint8Array(stored.data.slice(0, 5));
  const signature = String.fromCharCode(...bytes);
  return signature.startsWith("%PDF-");
}
