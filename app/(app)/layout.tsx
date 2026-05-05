import { Navbar } from "@/components/Nav";
import { Toaster } from "@/components/ui/sonner";
import GeolocationProvider from "@/components/GeolocationProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="bg-trasparent flex flex-col full-height">
        <Navbar />
        <GeolocationProvider>
          <div className="flex-1 overflow-hidden">{children}</div>
        </GeolocationProvider>
      </main>
      <Toaster />
    </>
  );
}
