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
      <main className="bg-trasparent h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
      <Toaster />
    </>
  );
}
