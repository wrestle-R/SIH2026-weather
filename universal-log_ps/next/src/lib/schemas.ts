import { z } from "zod";
import type { JsonValue } from "@/lib/types";

const formatSchema = z.enum(["auto", "syslog", "json", "xml", "csv", "cef", "leef", "kv"]);
const concreteFormatSchema = z.enum(["syslog", "json", "xml", "csv", "cef", "leef", "kv"]);
const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValueSchema), z.record(z.string(), jsonValueSchema)]),
);

export const parserManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9._-]{2,63}$/),
  name: z.string().min(3).max(80),
  version: z.string().min(1).max(20),
  vendor: z.string().min(1).max(80),
  product: z.string().min(1).max(80),
  format: concreteFormatSchema,
  detection: z.object({ contains: z.string().max(120).optional(), pattern: z.string().max(500).optional() }).optional(),
  extraction: z.object({ pattern: z.string().max(500).optional() }).optional(),
  ocsfClassUid: z.union([z.literal(4001), z.literal(2004)]),
  mappings: z.array(z.object({
    from: z.string().min(1).max(120),
    to: z.string().min(1).max(120),
    transform: z.enum(["string", "integer", "lowercase", "timestamp", "ip", "protocol", "severity"]),
    required: z.boolean().optional(),
  })).min(1).max(80),
  defaults: z.record(z.string(), jsonValueSchema).optional(),
});

export const normalizeRequestSchema = z.object({
  rawBase64: z.string().min(1).max(1_400_000),
  format: formatSchema.optional().default("auto"),
  sourceId: z.string().max(100).optional().default("interactive-input"),
  mediaType: z.string().max(100).optional().default("text/plain"),
  manifest: parserManifestSchema.optional(),
});
