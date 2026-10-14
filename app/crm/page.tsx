"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  KanbanSquare,
  Table as TableIcon,
  Search,
  Plus,
  Phone,
  Globe,
  Star,
  ExternalLink,
  MessageCircle,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  ArrowRight,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Bell,
  MoreVertical,
  Mail,
  Loader2,
  Pencil,
  Inbox,
  RotateCcw,
  Compass,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { formatPhone } from "@/lib/utils";
import {
  ExcelIcon,
  WhatsAppIcon,
  GeminiRealisticIcon,
} from "@/components/RealisticIcons";
import Ficha360Modal from "@/components/Ficha360Modal";
import ProspectModal from "@/components/ProspectModal";
import ExportModal from "@/components/ExportModal";
import EditBusinessModal from "@/components/EditBusinessModal";
import { toast } from "@/components/ToastContext";

// 7 Pipeline Columns
const KANBAN_COLUMNS = [
  { id: "NUEVO", label: "Nuevo", dotColor: "bg-slate-400", color: "bg-slate-100 text-slate-800 border-slate-300" },
  { id: "CONTACTADO", label: "Contactado", dotColor: "bg-blue-500", color: "bg-blue-50 text-blue-800 border-blue-200" },
  { id: "INTERESADO", label: "Interesado", dotColor: "bg-amber-500", color: "bg-amber-50 text-amber-800 border-amber-300" },
  { id: "COTIZACION", label: "Cotización", dotColor: "bg-purple-500", color: "bg-purple-50 text-purple-800 border-purple-200" },
  { id: "SEGUIMIENTO", label: "Seguimiento", dotColor: "bg-indigo-500", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  { id: "GANADO", label: "Ganado", dotColor: "bg-emerald-500", color: "bg-emerald-50 text-emerald-800 border-emerald-300" },
  { id: "PERDIDO", label: "Perdido", dotColor: "bg-rose-500", color: "bg-rose-50 text-rose-800 border-rose-200" },
];

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function CrmPage() {
  const [viewMode, setViewMode] = useState<"KANBAN" | "TABLE">("TABLE");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL");

  // Floating Action Menu state with fixed viewport coordinates (immune to table overflow clipping)
  const [activeActionMenu, setActiveActionMenu] = useState<{
    id: string;
    item: any;
    top: number;
    left: number;
  } | null>(null);



  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null);

  // Modals
  const [fichaItem, setFichaItem] = useState<any | null>(null);
  const [prospectItem, setProspectItem] = useState<any | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Close actions dropdown on click outside or scroll
  useEffect(() => {
    function handleClickOutside() {
      setActiveActionMenu(null);
    }
    window.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", handleClickOutside);
    };
  }, []);

  async function fetchBusinesses() {
    try {
      const res = await fetch("/api/businesses");
      const data = await res.json();
      if (data.success) {
        setBusinesses(data.businesses || []);
      }
    } catch (e) {
      console.error("Error al cargar negocios:", e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      // Optimistic update
      setBusinesses((prev) =>
        prev.map((b) => (b.id === id ? { ...b, crmStatus: newStatus } : b))
      );

      const res = await fetch(`/api/businesses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crmStatus: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Error en servidor");
      }
      toast.success("Registro actualizado correctamente.");
    } catch (e) {
      console.error("Error al actualizar estado:", e);
      toast.error("No se pudo guardar los cambios.");
      fetchBusinesses();
    }
  }

  async function deleteBusiness(id: string) {
    if (!confirm("¿Eliminar este prospecto del CRM?")) return;
    const backup = businesses;
    // Eliminación optimista instantánea (0ms)
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await fetch(`/api/businesses/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Registro eliminado correctamente.");
      } else {
        setBusinesses(backup);
        toast.error("No se pudo eliminar el registro.");
      }
    } catch (e) {
      setBusinesses(backup);
      console.error("Error al eliminar:", e);
      toast.error("No se pudo eliminar el registro.");
    }
  }



  // Drag handlers for Kanban
  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    if (activeDropColumn !== colId) {
      setActiveDropColumn(colId);
    }
  }

  function handleDrop(e: React.DragEvent, colId: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    if (id) {
      updateStatus(id, colId);
    }
    setDraggedId(null);
    setActiveDropColumn(null);
  }

  // Filtrado memoizado para rendimiento instantáneo en CRM
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return businesses.filter((b) => {
      const matchesSearch =
        !term ||
        b.name?.toLowerCase().includes(term) ||
        b.category?.toLowerCase().includes(term) ||
        b.city?.toLowerCase().includes(term) ||
        b.email?.toLowerCase().includes(term);
      const matchesPriority =
        filterPriority === "ALL" || b.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [businesses, searchTerm, filterPriority]);

  // Paginación para vista de tabla
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPriority, pageSize]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedItems = useMemo(() => {
    return filtered.slice(startIndex, endIndex);
  }, [filtered, startIndex, endIndex]);

  return (
    <div className="space-y-6 w-full max-w-[1700px] mx-auto pb-16 font-crm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>CRM Comercial &amp; Pipeline de Ventas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Gestiona tus oportunidades comerciales, asignaciones, historial y fechas de seguimiento
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setViewMode("TABLE")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "TABLE"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "KANBAN"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all hover:scale-102"
          >
            <ExcelIcon className="w-4 h-4" />
            <span>Exportar CRM</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por negocio, rubro, ciudad o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-base sm:text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Prioridad:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white font-semibold text-slate-700"
            >
              <option value="ALL">Todas</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Media</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>

          <span className="text-slate-400 font-semibold">
            Total: <b className="text-slate-800">{filtered.length}</b> prospectos
          </span>
        </div>
      </div>

      {/* Main View: TABLE with exact reference aesthetics applied to REAL system data */}
      {viewMode === "TABLE" ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto min-h-[460px]">
            <table className="w-full text-left border-collapse min-w-[980px]">
              {/* Header: Exact N° symbol, dark navy, bold uppercase, clean border */}
              <thead className="bg-[#FBFBFC] border-b border-slate-200 text-[#0F172A] font-crm font-black text-[11px] tracking-wider uppercase select-none">
                <tr>
                  <th className="py-3.5 px-3 text-center w-12 text-slate-800">
                    N°
                  </th>
                  <th className="py-3.5 px-3 text-left min-w-[220px]">
                    EMPRESA / RUBRO
                  </th>
                  <th className="py-3.5 px-3 text-left min-w-[210px]">
                    CONTACTO (TEL / CORREO / WEB)
                  </th>
                  <th className="py-3.5 px-3 text-center min-w-[160px]">
                    OPORTUNIDAD & SCORE
                  </th>
                  <th className="py-3.5 px-3 text-left min-w-[135px]">
                    ESTADO CRM
                  </th>
                  <th className="py-3.5 px-3 text-center min-w-[130px]">
                    SEGUIMIENTO
                  </th>
                  <th className="py-3.5 px-3 text-left min-w-[200px]">
                    DIRECCIÓN / CIUDAD
                  </th>
                  <th className="py-3.5 px-3 text-center w-16">
                    ACCIONES
                  </th>
                </tr>
              </thead>

              {/* Rows with dotted dividers & smooth hover */}
              <tbody className="divide-y divide-dashed divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-9 h-9 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <div className="space-y-1">
                          <span className="font-crm font-black text-sm text-slate-800 tracking-tight block">
                            Cargando datos...
                          </span>
                          <span className="font-crm text-xs text-slate-400 font-medium block">
                            Obteniendo y organizando los prospectos de tu CRM
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                          <Inbox className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <div className="space-y-1">
                          <span className="font-crm font-black text-sm text-slate-800 tracking-tight block">
                            {businesses.length === 0
                              ? "No hay información disponible"
                              : "No se encontraron prospectos"}
                          </span>
                          <span className="font-crm text-xs text-slate-500 font-medium block leading-relaxed">
                            {businesses.length === 0
                              ? "Aún no tienes prospectos registrados en tu pipeline comercial. Utiliza el buscador para captar negocios y agregarlos al CRM."
                              : "No hay prospectos que coincidan con los filtros aplicados o el término de búsqueda actual."}
                          </span>
                        </div>

                        {businesses.length === 0 ? (
                          <Link
                            href="/buscador"
                            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-crm font-black text-xs transition-all shadow-sm shadow-blue-500/20 hover:scale-102"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Buscar nuevos prospectos</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTerm("");
                              setFilterPriority("ALL");
                            }}
                            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-crm font-bold text-xs transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Limpiar filtros de búsqueda</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => {
                    const phoneData = formatPhone(item.phone);
                    const score = item.commercialScore || 0;
                    const isHigh = score >= 70;
                    const isMid = score >= 45 && score < 70;

                    // Real days elapsed in CRM
                    const daysElapsed = Math.max(
                      0,
                      Math.floor(
                        (Date.now() -
                          new Date(item.createdAt || Date.now()).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    );

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors font-crm group"
                      >
                        {/* 1. N° */}
                        <td className="py-3.5 px-3 text-center text-slate-400 font-bold text-xs">
                          {startIndex + index + 1}
                        </td>

                        {/* 2. EMPRESA / RUBRO */}
                        <td className="py-3.5 px-3 text-left min-w-[220px]">
                          <Link
                            href={`/negocios/${item.id}`}
                            className="font-crm font-black text-[12px] text-slate-900 uppercase tracking-tight line-clamp-1 hover:text-blue-600 transition-colors block"
                            title={item.name}
                          >
                            {item.name}
                          </Link>
                          <span className="font-crm text-[10px] text-slate-400 font-semibold uppercase tracking-normal block mt-0.5">
                            {item.category || "General"}
                          </span>
                        </td>

                        {/* 3. CONTACTO (TEL / CORREO / WEB) */}
                        <td className="py-3.5 px-3 text-left min-w-[210px]">
                          {/* Teléfono */}
                          <div className="font-crm font-black text-[11px] text-slate-800 tracking-tight flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{phoneData.cleanPhone ? phoneData.display : "Sin teléfono"}</span>
                            {phoneData.waLink && (
                              <a
                                href={phoneData.waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 hover:scale-110 transition-transform inline-flex"
                                title="Abrir WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          {/* Correo */}
                          <div className="mt-0.5">
                            {item.email ? (
                              <a
                                href={`mailto:${item.email}`}
                                className="font-crm text-[10px] text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-semibold truncate max-w-[200px]"
                                title={`Enviar correo a ${item.email}`}
                              >
                                <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                                <span className="truncate">{item.email}</span>
                              </a>
                            ) : (
                              <span className="font-crm text-[10px] text-slate-400 inline-flex items-center gap-1 font-medium">
                                <Mail className="w-3 h-3 text-slate-300 shrink-0" />
                                <span>Sin correo</span>
                              </span>
                            )}
                          </div>

                          {/* Sitio Web */}
                          <div className="font-crm text-[10px] text-slate-400 font-medium tracking-normal mt-0.5 truncate max-w-[200px]">
                            {item.website ? (
                              <a
                                href={
                                  item.website.startsWith("http")
                                    ? item.website
                                    : `https://${item.website}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Globe className="w-3 h-3 shrink-0 text-slate-400" />
                                <span className="truncate">
                                  {item.website
                                    .replace(/^https?:\/\/(www\.)?/, "")
                                    .replace(/\/$/, "")}
                                </span>
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <Globe className="w-3 h-3 shrink-0 text-slate-300" />
                                <span>Sin web</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. OPORTUNIDAD & SCORE */}
                        <td className="py-3.5 px-3 text-center min-w-[160px]">
                          {isHigh ? (
                            <span className="font-crm inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-[#E6F9F0] text-[#059669] border border-[#A7F3D0]">
                              M.RENTABLE · {score} pts
                            </span>
                          ) : isMid ? (
                            <span className="font-crm inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                              RENTABLE · {score} pts
                            </span>
                          ) : (
                            <span className="font-crm inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]">
                              POCO RENTABLE · {score} pts
                            </span>
                          )}
                          <span className="font-crm text-[9px] font-bold text-slate-400 uppercase tracking-tight block mt-0.5">
                            Prioridad {item.priority || "MEDIA"}
                          </span>
                        </td>

                        {/* 5. ESTADO CRM */}
                        <td className="py-3.5 px-3 text-left min-w-[135px]">
                          <select
                            value={item.crmStatus || "NUEVO"}
                            onChange={(e) => updateStatus(item.id, e.target.value)}
                            className="font-crm font-black text-[9px] uppercase tracking-wider px-2 py-1 rounded bg-[#E2E8F0] text-[#1E293B] border border-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-slate-200 transition-colors"
                          >
                            {KANBAN_COLUMNS.map((col) => (
                              <option key={col.id} value={col.id}>
                                {col.label.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* 6. SEGUIMIENTO & DÍAS */}
                        <td className="py-3.5 px-3 text-center min-w-[130px]">
                          {item.nextFollowUp ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="font-crm inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-tight bg-[#E11D48] text-white shadow-xs">
                                {new Date(item.nextFollowUp).toLocaleDateString("es-PE", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="font-crm text-[9.5px] font-bold text-rose-600 mt-0.5 block">
                                {daysElapsed > 0 ? `Hace ${daysElapsed}d` : "Hoy"}
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="font-crm font-bold text-[10.5px] text-slate-400 uppercase tracking-tight">
                                SIN DEFINIR
                              </span>
                              <span className="font-crm text-[9.5px] text-slate-400 mt-0.5 block">
                                {daysElapsed > 0 ? `Creado hace ${daysElapsed}d` : "Nuevo"}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* 7. DIRECCIÓN / CIUDAD */}
                        <td className="py-3.5 px-3 text-left min-w-[200px]">
                          <span
                            className="font-crm font-bold text-[10px] text-slate-800 uppercase truncate max-w-[220px] block"
                            title={item.address || "Sin dirección"}
                          >
                            {item.address || "Sin dirección registrada"}
                          </span>
                          <span className="font-crm font-black text-[10px] text-slate-900 uppercase tracking-wider block mt-0.5">
                            {item.city?.toUpperCase() || "PERÚ"}
                          </span>
                        </td>

                        {/* 8. ACCIONES */}
                        <td className="py-3.5 px-3 text-center w-16">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeActionMenu?.id === item.id) {
                                setActiveActionMenu(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const menuWidth = 210;
                                const menuHeight = 175;
                                let left = rect.right - menuWidth;
                                if (left < 10) left = 10;
                                let top = rect.bottom + 6;
                                if (top + menuHeight > window.innerHeight) {
                                  top = rect.top - menuHeight - 6;
                                }
                                setActiveActionMenu({
                                  id: item.id,
                                  item,
                                  top,
                                  left,
                                });
                              }
                            }}
                            className="font-crm font-black text-lg text-blue-500 hover:text-blue-700 tracking-widest px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Acciones del prospecto"
                          >
                            ···
                          </button>
                        </td>
                      </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>

          {/* Barra de Paginación */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 bg-[#FBFBFC] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-crm select-none">
              {/* Información y selector de elementos por página */}
              <div className="flex flex-wrap items-center gap-3 text-slate-500">
                <span>
                  Mostrando <strong className="text-slate-800 font-bold">{startIndex + 1}</strong> a{" "}
                  <strong className="text-slate-800 font-bold">{endIndex}</strong> de{" "}
                  <strong className="text-slate-800 font-bold">{totalItems}</strong> prospectos
                </span>

                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500">Filas por página:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Botones de Navegación de Páginas */}
              <div className="flex items-center gap-1">
                {/* Primera página */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={validCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Primera página"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                {/* Página anterior */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-colors text-xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers(validCurrentPage, totalPages).map((p, idx) =>
                    p === "..." ? (
                      <span key={`dots-${idx}`} className="px-1.5 text-slate-400 font-bold">
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        type="button"
                        onClick={() => setCurrentPage(Number(p))}
                        className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          validCurrentPage === p
                            ? "bg-blue-600 text-white shadow-xs font-black"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                {/* Siguiente página */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-colors text-xs cursor-pointer"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Última página */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Última página"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board View with Drag & Drop */
        loading ? (
          <div className="w-full py-24 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-2xs font-crm">
            <div className="w-9 h-9 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <div className="space-y-1 text-center">
              <span className="font-crm font-black text-sm text-slate-800 tracking-tight block">
                Cargando datos...
              </span>
              <span className="font-crm text-xs text-slate-400 font-medium block">
                Obteniendo y organizando los prospectos de tu CRM
              </span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center max-w-xl mx-auto font-crm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
              <Inbox className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <span className="font-crm font-black text-sm text-slate-800 tracking-tight block">
                {businesses.length === 0
                  ? "No hay información disponible"
                  : "No se encontraron prospectos"}
              </span>
              <span className="font-crm text-xs text-slate-500 font-medium block leading-relaxed">
                {businesses.length === 0
                  ? "Aún no tienes prospectos registrados en tu pipeline comercial. Utiliza el buscador para captar negocios y agregarlos al CRM."
                  : "No hay prospectos que coincidan con los filtros aplicados o el término de búsqueda actual."}
              </span>
            </div>
            {businesses.length === 0 ? (
              <Link
                href="/buscador"
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-crm font-black text-xs transition-all shadow-sm shadow-blue-500/20 hover:scale-102"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Buscar nuevos prospectos</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setFilterPriority("ALL");
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-crm font-bold text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar filtros de búsqueda</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x snap-mandatory">
          {KANBAN_COLUMNS.map((col) => {
            const colItems = filtered.filter((b) => {
              const status = b.crmStatus || "NUEVO";
              if (col.id === "PERDIDO" && status === "NO_CONTACTAR") return true;
              return status === col.id;
            });
            const isColumnOver = activeDropColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex-shrink-0 snap-center w-[85vw] max-w-[320px] sm:w-80 rounded-2xl flex flex-col max-h-[800px] border transition-colors ${
                  isColumnOver
                    ? "bg-blue-50/70 border-blue-400"
                    : "bg-slate-100/70 border-slate-200"
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <span className="font-bold text-xs text-slate-800">{col.label}</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {colItems.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 overflow-y-auto space-y-3 flex-1 min-h-[150px]">
                  {colItems.map((item) => {
                    const phoneData = formatPhone(item.phone);
                    const score = item.commercialScore || 50;
                    const isHigh = score >= 70;
                    const isMid = score >= 45 && score < 70;
                    const oppLevel = isHigh ? "ALTA" : isMid ? "MEDIA" : "BAJA";
                    const oppBadge = isHigh
                      ? "bg-red-50 text-red-700 border-red-200"
                      : isMid
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-600 border-slate-200";

                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2.5 relative group"
                      >
                        {/* Top: Name & Rubro */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/negocios/${item.id}`}
                              className="font-bold text-xs text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>

                            <span
                              className={`text-[10px] font-black px-1.5 py-0.2 rounded border ${
                                isHigh ? "text-red-600 border-red-200" : "text-blue-600 border-blue-200"
                              }`}
                            >
                              {score}/100
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="capitalize font-medium truncate">{item.category || "General"}</span>
                            <span>·</span>
                            <span className="truncate">{item.city || "Perú"}</span>
                          </div>
                        </div>

                        {/* Oportunidad Badge */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${oppBadge}`}>
                            {oppLevel === "ALTA" ? "Alta" : oppLevel === "MEDIA" ? "Media" : "Baja"}
                          </span>

                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.website ? "Con web" : "Sin web"}
                          </span>
                        </div>

                        {/* Seguimiento y Responsable */}
                        <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>
                              {item.nextFollowUp ? (
                                <span className="font-bold text-amber-900">
                                  Seguimiento: {new Date(item.nextFollowUp).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Sin seguimiento programado</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {phoneData.waLink ? (
                              <a
                                href={phoneData.waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                title="Abrir WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </a>
                            ) : null}

                            <button
                              onClick={() => setProspectItem(item)}
                              className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] transition-colors"
                              title="Gestionar y prospectar"
                            >
                              Gestionar
                            </button>
                          </div>

                          <Link
                            href={`/negocios/${item.id}`}
                            className="text-[10px] font-bold text-slate-600 hover:text-blue-600 flex items-center gap-0.5"
                          >
                            <span>Ficha 360°</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {colItems.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      Arrastra aquí un prospecto
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )
      )}

      {/* Floating Action Menu rendered outside table overflow to prevent clipping */}
      {activeActionMenu && (
        <div
          style={{
            top: `${activeActionMenu.top}px`,
            left: `${activeActionMenu.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          className="fixed w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-[9999] text-left animate-in fade-in zoom-in-95 duration-100 font-crm"
        >
          {(() => {
            const p = formatPhone(activeActionMenu.item.phone);
            return p.waLink ? (
              <a
                href={p.waLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => setActiveActionMenu(null)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <span>Contactar por WhatsApp</span>
              </a>
            ) : null;
          })()}

          {/* Editar Datos */}
          <button
            type="button"
            onClick={() => {
              setEditingItem(activeActionMenu.item);
              setActiveActionMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Editar Datos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setProspectItem(activeActionMenu.item);
              setActiveActionMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Gestionar Prospecto</span>
          </button>

          <Link
            href={`/negocios/${activeActionMenu.item.id}`}
            onClick={() => setActiveActionMenu(null)}
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Ver Ficha 360°</span>
          </Link>

          <div className="border-t border-slate-100 my-1" />

          <button
            type="button"
            onClick={() => {
              deleteBusiness(activeActionMenu.item.id);
              setActiveActionMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Eliminar Prospecto</span>
          </button>
        </div>
      )}

      {/* Modales */}
      <ProspectModal
        business={prospectItem}
        isOpen={!!prospectItem}
        onClose={() => setProspectItem(null)}
        onSavedSuccess={() => {
          fetchBusinesses();
          setProspectItem(null);
        }}
      />

      <EditBusinessModal
        business={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSaved={(updated) => {
          setBusinesses((prev) =>
            prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
          );
          setEditingItem(null);
        }}
        onDeleted={deleteBusiness}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        items={filtered}
      />
    </div>
  );
}
