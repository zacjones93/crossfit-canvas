import type { Metadata } from "next";
import { Bebas_Neue, Montserrat, Work_Sans } from "next/font/google";
import "./globals.css";
import "server-only";

import { ThemeProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NextTopLoader from "nextjs-toploader";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/constants";

export const dynamic = "force-dynamic";

// Typography: Gritty Urban Athleticism Design Direction
// Primary Headlines (H1, H2): Bebas Neue - Bold brush-style/hand-painted
const bebasNeue = Bebas_Neue({
  weight: "400", // Bebas Neue only has one weight (display/bold)
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

// Secondary Headlines (H3, H4): Montserrat Bold - Clean, strong sans-serif
const montserrat = Montserrat({
  weight: ["400", "700"], // 700 (Bold) for H3/H4
  subsets: ["latin"],
  variable: "--font-montserrat",
});

// Body Text: Work Sans - Readable sans-serif
const workSans = Work_Sans({
  weight: ["400", "500"], // 400 (Regular) for body, 500 (Medium) for emphasis
  subsets: ["latin"],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  keywords: [
    "SaaS",
    "Next.js",
    "React",
    "TypeScript",
    "Cloudflare Workers",
    "Edge Computing",
  ],
  authors: [{ name: "Lubomir Georgiev" }],
  creator: "Lubomir Georgiev",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: "@LubomirGeorg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${workSans.variable} ${montserrat.variable} ${bebasNeue.variable} ${workSans.className}`}
      >
        <NextTopLoader
          initialPosition={0.15}
          shadow="0 0 10px #000, 0 0 5px #000"
          height={4}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider delayDuration={100} skipDelayDuration={50}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
        <Toaster
          richColors
          closeButton
          position="top-right"
          expand
          duration={7000}
        />
      </body>
    </html>
  );
}
