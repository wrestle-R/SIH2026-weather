import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/montserrat";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { AppStateProvider } from "@/components/app-state";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: { default: "ULPF Command Center", template: "%s | ULPF" },
  description: "SIH 2026 universal, lossless and traceable perimeter log normalization demo.",
};

export const viewport: Viewport = { colorScheme: "light", themeColor: "#f5f7fa", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <TooltipProvider><AppStateProvider><AppShell>{children}</AppShell></AppStateProvider></TooltipProvider>
      </body>
    </html>
  );
}
