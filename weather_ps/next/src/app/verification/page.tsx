import type { Metadata } from "next";
import { VerificationWorkspace } from "@/components/pages/verification-workspace";

export const metadata: Metadata = { title: "Verification queue" };
export default function VerificationPage() { return <VerificationWorkspace />; }
