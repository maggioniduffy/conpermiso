import localFont from "next/font/local";
import "./globals.css";
import { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import { ServiceWorkerUpdater } from "@/components/ServiceWorkerUpdater";

const montserrat = localFont({
  src: [
    { path: "./fonts/Montserrat-Black.ttf", weight: "900", style: "normal" },
    {
      path: "./fonts/Montserrat-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    { path: "./fonts/Montserrat-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Montserrat-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Montserrat-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Montserrat-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Montserrat-Thin.ttf", weight: "200", style: "normal" },
    {
      path: "./fonts/Montserrat-ExtraLight.ttf",
      weight: "100",
      style: "normal",
    },
  ],
  variable: "--montserrat",
});

export const metadata: Metadata = {
  title: "KKapp",
  description: "Encontrá baños disponibles cerca tuyo!",
  metadataBase: new URL("https://kkapp.es"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KKapp",
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16" },
      { url: "/favicon-32.png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "KKapp",
    description: "Encontrá baños cerca tuyo, cuando más lo necesitás.",
    url: "https://kkapp.es",
    images: [{ url: "/opengraph-image.png?v=2", width: 1200, height: 630 }],
    siteName: "KKapp",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    title: "KKapp",
    description: "Encontrá baños cerca tuyo, cuando más lo necesitás.",
    card: "summary_large_image",
    images: ["/twitter-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#4a90e2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${montserrat.variable} bg-mywhite flex flex-col`}
      >
        <ServiceWorkerUpdater />
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
