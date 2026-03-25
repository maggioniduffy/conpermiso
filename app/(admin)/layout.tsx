import { ReactNode } from "react";
import Navbar from "@/components/Nav/Navbar";
import AppFooter from "@/components/Footer";
import { Toaster } from "sonner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Navbar />
      <main className="flex-1">{children}</main>
      <AppFooter />
      <Toaster richColors position="bottom-center" />
    </div>
  );
}
