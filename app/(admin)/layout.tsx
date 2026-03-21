import { ReactNode } from "react";
import Navbar from "@/components/Nav/Navbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mywhite">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
