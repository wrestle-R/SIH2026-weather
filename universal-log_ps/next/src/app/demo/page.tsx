import type { Metadata } from "next";
import { LiveDemoShowcase } from "@/components/live-demo-showcase";

export const metadata: Metadata = { title: "Live Demo" };

export default function LiveDemoPage() {
  return <LiveDemoShowcase />;
}
