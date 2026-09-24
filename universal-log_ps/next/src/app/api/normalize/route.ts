import { normalize } from "@/lib/normalize";
import { normalizeRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 1_500_000) {
      return Response.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Request exceeds the 1 MB evidence limit." } }, { status: 413 });
    }
    const input = normalizeRequestSchema.safeParse(await request.json());
    if (!input.success) {
      return Response.json({
        error: { code: "INVALID_REQUEST", message: "Normalization request failed validation.", details: input.error.flatten() },
      }, { status: 400 });
    }
    return Response.json(normalize(input.data), { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({
      error: { code: "NORMALIZATION_FAILED", message: error instanceof Error ? error.message : "Normalization failed." },
    }, { status: 422 });
  }
}
