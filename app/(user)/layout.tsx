import { Navbar } from "@/components/Nav";
import { Toaster } from "@/components/ui/sonner";

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
