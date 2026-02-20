import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PulsePlanner",
  description: "Event scheduling with invites, RSVP tracking, and practical AI tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // #region agent log
  fetch("http://127.0.0.1:7395/ingest/303de73a-969c-42fd-8a4b-917e69820b4a", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1875f0" },
    body: JSON.stringify({
      sessionId: "1875f0",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "src/app/layout.tsx:26",
      message: "RootLayout rendered",
      data: { hasChildren: Boolean(children) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
