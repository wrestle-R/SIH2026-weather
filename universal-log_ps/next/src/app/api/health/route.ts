import { SUPPORTED_FORMATS } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "healthy",
    service: "ulpf-demo",
    schema: { name: "OCSF", version: "1.9.0" },
    supportedFormats: SUPPORTED_FORMATS.filter((format) => format !== "auto"),
    airGapRuntime: true,
    persistence: "browser-local",
    checkedAt: new Date().toISOString(),
  });
}
