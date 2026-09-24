import type { Metadata } from "next";
import { SourceRegistry } from "@/components/source-registry";

export const metadata: Metadata = { title: "Source Registry" };
export default function SourcesPage() { return <SourceRegistry />; }
