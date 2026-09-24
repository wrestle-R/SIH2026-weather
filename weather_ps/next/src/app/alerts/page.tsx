import type { Metadata } from "next";
import { AlertsWorkspace } from "@/components/pages/alerts-workspace";

export const metadata: Metadata = { title: "Alerts" };
export default function AlertsPage() { return <AlertsWorkspace />; }
