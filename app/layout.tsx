import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { PageTransition } from "@/components/ui/page-transition";

export const metadata: Metadata = {
  title: "IMOV",
  description: "Movie and series streaming catalog MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <SiteShell>
          <PageTransition>{children}</PageTransition>
        </SiteShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
