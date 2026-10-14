"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/SidebarContext";
import { RadarRealisticIcon } from "@/components/RealisticIcons";

export default function MobileHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="lg:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-2xs z-20">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-slate-800">Bizorbis</span>
      </div>
      <RadarRealisticIcon className="w-6 h-6" />
    </div>
  );
}
