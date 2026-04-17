import { Navbar } from "@/components/Nav";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main
        className="bg-trasparent flex flex-col"
        style={{ height: "100dvh" }}
      >
        <Navbar />
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
      <Toaster />
    </>
  );
}
