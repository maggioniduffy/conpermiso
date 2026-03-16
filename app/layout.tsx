import localFont from "next/font/local";
import "./globals.css";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

const montserrat = localFont({
  src: [
    {
      path: "./fonts/Montserrat-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-Thin.ttf",
      weight: "200",
      style: "normal",
    },
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
  description: "Created by maggioniduffy",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/favicon.ico" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} min-h-screen flex flex-col`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
