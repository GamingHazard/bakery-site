import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./communications.css";
import ScrollRevealObserver from "./scroll-reveal";
import ServiceWorkerCleanup from "./service-worker-cleanup";
import QueryProvider from "./query-provider";

export const metadata: Metadata = {
  title: "The SourDough Bakery — Good bread takes time",
  description:
    "Artisan sourdough, pastries and small-batch bakery favourites, made with care in Kampala, Uganda.",
  openGraph: {
    title: "The SourDough Bakery",
    description: "Good bread takes time. Discover our artisan bakes.",
    type: "website",
  },

  icons: {
    icon: [
      {
        url: "/logo.jpeg",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ServiceWorkerCleanup />
        <ScrollRevealObserver />
        <QueryProvider>{children}</QueryProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
