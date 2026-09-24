import type { Metadata } from "next";
import { EventExplorer } from "@/components/event-explorer";

export const metadata: Metadata = { title: "Event Explorer" };
export default function EventsPage() { return <EventExplorer />; }
