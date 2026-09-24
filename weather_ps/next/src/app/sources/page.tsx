import type { Metadata } from "next";
import { SourcesWorkspace } from "@/components/pages/sources-workspace";

export const metadata: Metadata = { title: "Source registry" };
export default function SourcesPage() { return <SourcesWorkspace />; }
