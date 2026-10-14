import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { SidebarProvider } from "@/components/SidebarContext";
import AppShell from "@/components/AppShell";
import { ToastProvider } from "@/components/ToastContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bizorbis - Prospección B2B Inteligente",
  description: "Plataforma de inteligencia comercial y captación de clientes para empresas de software.",
  icons: {
    icon: [
      { url: "/icon.svg?v=3", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg?v=3",
    apple: "/icon.svg?v=3",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased flex h-screen overflow-hidden bg-slate-50 text-slate-900`}>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
