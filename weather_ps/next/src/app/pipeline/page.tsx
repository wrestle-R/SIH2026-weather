import type { Metadata } from "next";
import { PipelineWorkspace } from "@/components/pages/pipeline-workspace";

export const metadata: Metadata = { title: "Pipeline health" };
export default function PipelinePage() { return <PipelineWorkspace />; }
