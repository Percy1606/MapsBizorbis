"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  KanbanSquare,
  Settings,
  FileSpreadsheet,
  X,
  PanelLeft,
  PanelLeftClose,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ExcelIcon,
  RadarRealisticIcon,
} from "@/components/RealisticIcons";
import { useSidebar } from "@/components/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, isCollapsed, closeMobile, toggleSidebar } = useSidebar();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error logging out:", err);
    }
    window.location.href = "/login";
  }

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Buscador De Cliente", href: "/buscador", icon: Compass },
    { name: "CRM de Prospección", href: "/crm", icon: KanbanSquare },
    { name: "Configuración ", href: "/configuracion", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          "bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 transition-all duration-300 z-50",
          // Desktop collapse state
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile responsive state (slide-in drawer)
          "fixed inset-y-0 left-0 lg:static lg:min-h-screen",
          isOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800 bg-slate-950/60">
          <Link
            href="/"
            onClick={closeMobile}
            className="flex items-center gap-2.5 overflow-hidden group min-w-0"
            title="Bizorbis"
          >
            <div className="shrink-0 drop-shadow-md transition-transform group-hover:scale-105">
              <RadarRealisticIcon className="w-8 h-8" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-200 truncate">
                <span className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5 leading-tight truncate">
                  Bizorbis
                </span>
                <span className="text-[10px] text-blue-400 font-semibold block uppercase tracking-wider">
                  Inteligencia B2B
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Alternar barra lateral"
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4 text-blue-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Close button for mobile only */}
          <button
            onClick={closeMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Módulos Principales
            </div>
          )}

          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobile}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition-all duration-150 relative group",
                  isCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-slate-400"
                    )}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>

                {/* Floating tooltip on collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-800">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Quick Export Excel */}
          {!isCollapsed && (
            <div className="pt-6 px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Exportación de Datos
            </div>
          )}

          <a
            href="/api/export/excel"
            download
            title={isCollapsed ? "Exportar a Excel" : undefined}
            className={cn(
              "flex items-center rounded-xl text-sm text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 transition-all font-semibold shadow-xs group relative",
              isCollapsed ? "justify-center p-2.5 mt-2" : "gap-3 px-3.5 py-2.5"
            )}
          >
            <div className="shrink-0 transition-transform group-hover:scale-110">
              <ExcelIcon className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold leading-tight truncate">Exportar a Excel</span>
                <span className="block text-[10px] text-emerald-400/80 font-normal truncate">Formato nativo .xlsx</span>
              </div>
            )}

            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-800">
                Exportar a Excel (.xlsx)
              </div>
            )}
          </a>
        </nav>

        {/* User Session & Logout */}
        <div
          className={cn(
            "border-t border-slate-800/80 bg-slate-950/40 transition-all",
            isCollapsed ? "p-2 flex flex-col items-center" : "p-3"
          )}
        >
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 truncate">
                  <span className="block text-xs font-bold text-slate-200 truncate leading-tight">
                    Administrador
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-semibold truncate leading-tight">
                    Sesión activa
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer group relative"
            >
              <LogOut className="w-4 h-4" />
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-800">
                Cerrar Sesión
              </div>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
