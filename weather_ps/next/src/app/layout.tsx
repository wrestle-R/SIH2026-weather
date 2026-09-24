import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Montserrat } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { DashboardLanguageProvider } from "@/hooks/use-dashboard-language";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const montserrat = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Varunetra — National Weather Intelligence",
    template: "%s — Varunetra",
  },
  description:
    "Multi-source, AI-assisted weather event intelligence across India.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <DashboardLanguageProvider>
          <AppShell>{children}</AppShell>
        </DashboardLanguageProvider>
      </body>
    </html>
  );
}
