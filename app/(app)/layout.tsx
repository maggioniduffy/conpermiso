import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <main>
        <Navbar />
        {children}
      </main>
      <Toaster />
    </SessionProvider>
  );
}
