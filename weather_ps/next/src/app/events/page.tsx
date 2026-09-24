import type { Metadata } from "next";
import { EventsWorkspace } from "@/components/pages/events-workspace";

export const metadata: Metadata = { title: "Live events" };
export default function EventsPage() { return <EventsWorkspace />; }
