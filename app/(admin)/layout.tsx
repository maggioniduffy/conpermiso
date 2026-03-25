import { ReactNode } from "react";
import Navbar from "@/components/Nav/Navbar";
import { Toaster } from "sonner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mywhite">
      <Navbar />
      <main>{children}</main>
      <Toaster richColors position="bottom-center" />
    </div>
  );
}
