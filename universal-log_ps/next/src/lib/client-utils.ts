import type { LogFormat, NormalizationBatch, ParserManifest } from "@/lib/types";

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  return btoa(binary);
}

export function textToBase64(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text));
}

export async function normalizeRemote(input: { text?: string; bytes?: Uint8Array; format?: LogFormat; sourceId?: string; mediaType?: string; manifest?: ParserManifest }): Promise<NormalizationBatch> {
  const rawBase64 = input.bytes ? bytesToBase64(input.bytes) : textToBase64(input.text ?? "");
  const response = await fetch("/api/normalize", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawBase64, format: input.format ?? "auto", sourceId: input.sourceId, mediaType: input.mediaType, manifest: input.manifest }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "Normalization request failed.");
  return body as NormalizationBatch;
}

export function downloadJson(filename: string, data: unknown, mime = "application/json") {
  const blob = new Blob([typeof data === "string" ? data : JSON.stringify(data, null, 2)], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  URL.revokeObjectURL(url);
}

export async function sha256Text(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
