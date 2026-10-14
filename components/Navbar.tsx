"use client";

import Link from "next/link";
import { Search, Menu, PanelLeftClose, PanelLeft, Sparkles } from "lucide-react";
import { ExcelIcon } from "@/components/RealisticIcons";
import { useSidebar } from "@/components/SidebarContext";

export default function Navbar() {
  const { toggleSidebar, isCollapsed } = useSidebar();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-20">
      {/* Left: Sidebar Toggle Button + Quick Search */}
      <div className="flex items-center gap-3">
        {/* Toggle Button for Navigation Bar / Sidebar */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Alternar barra de navegación lateral"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs flex items-center justify-center group"
          title="Alternar barra lateral (Colapsar / Expandir)"
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5 text-blue-600 transition-transform group-hover:scale-110" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-transform group-hover:scale-110" />
          )}
        </button>

        {/* Quick Search trigger */}
        <Link
          href="/buscador"
          className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs font-medium transition-all border border-slate-200/60"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Búsqueda rápida en cualquier ciudad o país...</span>
          <span className="md:hidden">Buscar negocios...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-slate-300 rounded-md shadow-2xs font-mono text-slate-500">
            Ctrl+K
          </kbd>
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Quick Excel Export button */}
        <a
          href="/api/export/excel"
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs transition-all hover:scale-105"
          title="Descargar base de datos en formato Excel .xlsx"
        >
          <ExcelIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Excel</span>
        </a>

        {/* Prospectar Button */}
        <Link
          href="/buscador"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all hover:scale-105"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prospectar Negocios</span>
          <span className="sm:hidden">Prospectar</span>
        </Link>
      </div>
    </header>
  );
}
