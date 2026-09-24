import type { Metadata } from "next";
import { SchemaExplorer } from "@/components/schema-explorer";

export const metadata: Metadata = { title: "Schema Studio" };
export default function SchemaPage() { return <SchemaExplorer />; }
