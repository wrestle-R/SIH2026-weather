import type { Metadata, Viewport } from "next";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { AppStateProvider } from "@/components/app-state";

export const metadata: Metadata = {
  title: { default: "ULPF Command Center", template: "%s | ULPF" },
  description: "SIH 2026 universal, lossless and traceable perimeter log normalization demo.",
};

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#0b0d0f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <AppStateProvider><AppShell>{children}</AppShell></AppStateProvider>
      </body>
    </html>
  );
}
