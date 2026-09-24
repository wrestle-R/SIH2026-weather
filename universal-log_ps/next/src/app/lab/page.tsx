import type { Metadata } from "next";
import { LabWorkspace } from "@/components/lab-workspace";

export const metadata: Metadata = { title: "Parser Lab" };
export default function LabPage() { return <LabWorkspace />; }
