import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar additionalClass="fixed z-99 top-0" />
      <main className="bg-jet min-h-screen flex flex-col">{children}</main>
      <Toaster />
    </>
  );
}
