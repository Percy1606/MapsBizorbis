"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Building2,
  Globe,
  Sparkles,
  TrendingUp,
  Flame,
  ArrowRight,
  KanbanSquare,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Bell,
  Activity,
  FileText,
  UserCheck,
  Percent,
} from "lucide-react";
import { ExcelIcon, RadarRealisticIcon } from "@/components/RealisticIcons";

interface DashboardData {
  totals: {
    totalBusinesses: number;
    withWeb: number;
    withoutWeb: number;
    highPriority: number;
    nuevo: number;
    contactados: number;
    interesados: number;
    cotizaciones: number;
    seguimiento: number;
    ganados: number;
    perdidos: number;
    conversionRate: number;
    requierenSeguimientoHoy: number;
  };
  statusDistribution: {
    status: string;
    count: number;
    color: string;
  }[];
  recentActivity: {
    text: string;
    date: string;
  }[];
  nicheRadar: {
    category: string;
    count: number;
    avgScore: number;
  }[];
  recentProspects: {
    id: string;
    name: string;
    category: string;
    city: string;
    crmStatus: string;
    commercialScore: number;
    priority: string;
    phone: string | null;
    website: string | null;
    nextFollowUp?: string | null;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/crm/stats");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Error al cargar estadísticas:", e);
    } finally {
      setLoading(false);
    }
  }

  const totals = data?.totals || {
    totalBusinesses: 0,
    withWeb: 0,
    withoutWeb: 0,
    highPriority: 0,
    nuevo: 0,
    contactados: 0,
    interesados: 0,
    cotizaciones: 0,
    seguimiento: 0,
    ganados: 0,
    perdidos: 0,
    conversionRate: 0,
    requierenSeguimientoHoy: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <RadarRealisticIcon className="w-7 h-7" />
            <span>Bizorbis & Dashboard Comercial</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inteligencia comercial B2B, prospección de negocios y embudo de conversión
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <a
            href="/api/export/excel"
            download
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all hover:scale-102"
          >
            <ExcelIcon className="w-4 h-4" />
            <span>Exportar Excel</span>
          </a>

          <Link
            href="/buscador"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:scale-102"
          >
            <Compass className="w-4 h-4" />
            <span>Buscar Nuevos Negocios</span>
          </Link>
        </div>
      </div>

      {/* Alerta de Seguimiento Requerida (Sección 11) */}
      {totals.requierenSeguimientoHoy > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-amber-900 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold">
                {totals.requierenSeguimientoHoy} {totals.requierenSeguimientoHoy === 1 ? "prospecto requiere" : "prospectos requieren"} seguimiento hoy.
              </div>
              <p className="text-[11px] text-amber-700">
                Hay clientes agendados para contacto o con fecha de revisión programada.
              </p>
            </div>
          </div>

          <Link
            href="/crm"
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all hover:scale-102 shadow-2xs whitespace-nowrap"
          >
            Ver en CRM →
          </Link>
        </div>
      )}

      {/* 7 KPI Metrics Requeridos (Sección 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Prospectos Registrados */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Registrados</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {loading ? "..." : totals.totalBusinesses}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate">
            {totals.withoutWeb} sin web
          </span>
        </div>

        {/* 2. Oportunidades Altas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Oportunidades</span>
          <div className="text-xl font-black text-red-600 mt-1">
            {loading ? "..." : totals.highPriority}
          </div>
          <span className="text-[10px] text-red-600/80 font-bold mt-1 block truncate">
            Score &gt; 70
          </span>
        </div>

        {/* 3. Contactados */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Contactados</span>
          <div className="text-xl font-black text-blue-600 mt-1">
            {loading ? "..." : totals.contactados}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate">
            Primer contacto
          </span>
        </div>

        {/* 4. Interesados */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Interesados</span>
          <div className="text-xl font-black text-amber-600 mt-1">
            {loading ? "..." : totals.interesados}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate">
            En conversación
          </span>
        </div>

        {/* 5. Cotizaciones */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Cotizaciones</span>
          <div className="text-xl font-black text-purple-600 mt-1">
            {loading ? "..." : totals.cotizaciones}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate">
            Propuestas enviadas
          </span>
        </div>

        {/* 6. Clientes Ganados */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Ganados</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {loading ? "..." : totals.ganados}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block truncate">
            Cierres exitosos
          </span>
        </div>

        {/* 7. Tasa de Conversión */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Conversión</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {loading ? "..." : `${totals.conversionRate}%`}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate">
            Ganados / Gestionados
          </span>
        </div>
      </div>

      {/* Gráfico Visual: Prospectos por Estado & Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico: Prospectos por Estado (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Distribución del Pipeline por Estado</span>
              </h2>
              <p className="text-xs text-slate-500">Volumen y avance en el embudo comercial</p>
            </div>

            <Link href="/crm" className="text-xs font-bold text-blue-600 hover:underline">
              Ver Kanban →
            </Link>
          </div>

          {/* Progress Bar Graph */}
          <div className="space-y-3 pt-1">
            {data?.statusDistribution?.map((item) => {
              const total = totals.totalBusinesses || 1;
              const percent = Math.round((item.count / total) * 100);

              return (
                <div key={item.status} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span>{item.status}</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.count} <span className="text-slate-400 font-normal">({percent}%)</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(item.count > 0 ? 5 : 0, percent)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actividad Reciente Requerida (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Actividad Reciente</span>
              </h2>
              <p className="text-xs text-slate-500">Últimas acciones comerciales y registros</p>
            </div>
          </div>

          <div className="space-y-3">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 leading-snug">{act.text}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs italic">
                Aún no hay actividad registrada. Explora una zona y guarda prospectos para ver el historial aquí.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Radar de Nichos y Prospectos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar de Nichos */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Radar de Nichos con Mayor Potencial</span>
          </h2>

          <div className="space-y-2 text-xs">
            {data?.nicheRadar?.map((niche, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 capitalize block">{niche.category}</span>
                  <span className="text-[11px] text-slate-500">{niche.count} negocios evaluados</span>
                </div>

                <div className="text-right">
                  <span className="font-black text-blue-600">{niche.avgScore}/100</span>
                  <span className="text-[10px] text-slate-400 block">Score Promedio</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prospectos Recientes */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Prospectos Recientes en CRM</span>
            </h2>

            <Link href="/crm" className="text-xs font-bold text-blue-600 hover:underline">
              Ir al CRM →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {data?.recentProspects?.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/negocios/${p.id}`} className="font-bold text-slate-900 hover:text-blue-600 truncate block">
                    {p.name}
                  </Link>
                  <span className="text-[11px] text-slate-500 capitalize">{p.category} · {p.city || "Perú"}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {p.crmStatus}
                  </span>
                  <span className="font-black text-blue-600 text-xs">
                    {p.commercialScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
