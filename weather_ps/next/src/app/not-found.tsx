import Link from "next/link";
import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <div className="not-found"><CloudOff /><span>404 · Route unavailable</span><h1>This weather view does not exist.</h1><p>Return to the command overview or open the live national event stream.</p><div><Button nativeButton={false} variant="outline" render={<Link href="/events" />}>Live events</Button><Button nativeButton={false} render={<Link href="/" />}>Command overview</Button></div></div>;
}
