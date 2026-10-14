"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import { SidebarProvider } from "@/components/SidebarContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <main className="w-full h-full min-h-screen overflow-y-auto bg-white">
        {children}
      </main>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 pb-20 lg:pb-8">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
