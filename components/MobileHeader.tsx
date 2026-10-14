"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/SidebarContext";
import { RadarRealisticIcon } from "@/components/RealisticIcons";

export default function MobileHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="lg:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-2xs z-20">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
          className="p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-slate-900 tracking-tight">Bizorbis</span>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-1.5 py-0.5 rounded-full">
            B2B
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <RadarRealisticIcon className="w-7 h-7" />
      </div>
    </header>
  );
}
