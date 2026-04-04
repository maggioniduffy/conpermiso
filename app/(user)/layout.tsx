import { ReactNode } from "react";
import Navbar from "@/components/Nav/Navbar";
import { Toaster } from "sonner";
import AppFooter from "@/components/Footer";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Navbar />
      <main className="flex-1">{children}</main>
      <AppFooter />
      <Toaster richColors position="bottom-center" />
    </div>
  );
}
