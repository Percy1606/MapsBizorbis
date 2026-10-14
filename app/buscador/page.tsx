"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Briefcase,
  BookmarkPlus,
  CheckCircle2,
  Phone,
  Globe,
  Star,
  Flame,
  AlertCircle,
  Info,
  Mail,
  Copy,
  Check,
  Plus,
  HelpCircle,
  LayoutList,
  Map as MapIcon,
  Columns,
  Download,
  Share2,
  ExternalLink,
  Filter,
  Sparkles,
  Layers,
} from "lucide-react";
import { formatPhone, formatUrl } from "@/lib/utils";
import {
  WhatsAppIcon,
  GoogleMapsRealisticIcon,
  GeminiRealisticIcon,
  ExcelIcon,
} from "@/components/RealisticIcons";
import Ficha360Modal from "@/components/Ficha360Modal";
import ProspectModal from "@/components/ProspectModal";
import ExportModal from "@/components/ExportModal";
import { toast } from "@/components/ToastContext";

// Dynamic import of Leaflet map
const MapLeaflet = dynamic(() => import("@/components/MapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-medium">
      Cargando mapa interactivo...
    </div>
  ),
});

export interface EnrichedPlace {
  placeId: string;
  name: string;
  category: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  googleMapsUrl?: string;
  source: "google_places" | "openstreetmap";
  isSaved?: boolean;
  savedId?: string;
  crmStatus?: string;
  commercialScore: number;
  scoreConfidence: number;
  opportunityLevel?: "ALTA" | "MEDIA" | "BAJA";
  motivos?: string[];
  recommendedBadges?: string[];
  scoreFactors: {
    category: string;
    points: number;
    maxPoints?: number;
    reason: string;
    evidence: string;
  }[];
  negativeFactors?: {
    category: string;
    points: number;
    reason: string;
    evidence: string;
  }[];
  recommendedServices: string[];
}

const COUNTRIES = [
  { code: "PE", name: "Perú" },
  { code: "MX", name: "México" },
  { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" },
  { code: "AR", name: "Argentina" },
  { code: "EC", name: "Ecuador" },
  { code: "ES", name: "España" },
  { code: "US", name: "Estados Unidos" },
  { code: "GLOBAL", name: "Cualquier país (Global)" },
];

export default function BuscadorPage() {
  const router = useRouter();

  // Search form (inicia en blanco para búsqueda personalizada)
  const [country, setCountry] = useState("PE");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<
    { mainText: string; secondaryText: string; fullText: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const locationBoxRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [category, setCategory] = useState("");
  const [radiusKm, setRadiusKm] = useState(15);
  const [maxResults, setMaxResults] = useState(25);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EnrichedPlace[]>([]);
  const [sourceUsed, setSourceUsed] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // View mode: 'lista' | 'mapa' | 'ambos'
  const [viewMode, setViewMode] = useState<"lista" | "mapa" | "ambos">("ambos");

  // Configurable settings
  const [settingsPriceWeb, setSettingsPriceWeb] = useState<string>("Desde S/499");

  // Selection & Modals
  const [selectedItem, setSelectedItem] = useState<EnrichedPlace | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fichaModalItem, setFichaModalItem] = useState<EnrichedPlace | null>(null);
  const [prospectModalItem, setProspectModalItem] = useState<EnrichedPlace | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<"ALL" | "ALTA" | "NO_WEB" | "HAS_PHONE">("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [customPhones, setCustomPhones] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Click outside to dismiss autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationBoxRef.current &&
        !locationBoxRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchSuggestions(queryText: string, countryCode: string) {
    if (!queryText.trim() || queryText.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(
        `/api/places/autocomplete?q=${encodeURIComponent(
          queryText.trim()
        )}&country=${encodeURIComponent(countryCode)}`
      );
      if (res.ok) {
        const data = await res.json();
        const found = data.suggestions || [];
        setSuggestions(found);
        setShowSuggestions(found.length > 0);
      }
    } catch (err) {
      console.error("Error al obtener sugerencias:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  function handleLocationInput(val: string) {
    setLocation(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!val.trim() || val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val, country);
    }, 280);
  }

  function handleSelectSuggestion(sug: {
    mainText: string;
    secondaryText: string;
    fullText: string;
  }) {
    setLocation(sug.fullText);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  // Load preferences and settings on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("radar_view_mode") as any;
    if (savedMode && ["lista", "mapa", "ambos"].includes(savedMode)) {
      setViewMode(savedMode);
    }

    // Fetch settings for configurable price
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.priceWeb) setSettingsPriceWeb(data.priceWeb);
      })
      .catch((err) => console.log("Using default price:", err));
  }, []);

  function handleViewModeChange(mode: "lista" | "mapa" | "ambos") {
    setViewMode(mode);
    localStorage.setItem("radar_view_mode", mode);
  }

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!location.trim()) {
      toast.warning("Ingresa una ciudad o distrito para buscar.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    setSelectedItem(null);
    setSelectedIds([]);

    try {
      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          category: category.trim() || "todos",
          country,
          radiusKm,
          maxResults,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al buscar negocios.");
      }

      const found = data.results || [];
      setResults(found);
      setSourceUsed(data.sourceUsed);
      setNotice(data.notice);

      if (found.length > 0) {
        setSelectedItem(found[0]);
        toast.success("Búsqueda completada correctamente.");
      } else {
        toast.warning("No se encontraron resultados para la búsqueda.");
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor de búsqueda.");
      toast.error("Ocurrió un error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  // Toggle selection for bulk export
  function toggleSelectId(placeId: string) {
    setSelectedIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  }

  function handleSelectAll() {
    if (selectedIds.length === filteredResults.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredResults.map((r) => r.placeId));
    }
  }

  // Filter and sort results con useMemo: negocios con medios de comunicación siempre primero
  const filteredResults = useMemo(() => {
    const list = results.filter((item) => {
      const score = item.commercialScore || 50;
      const isHigh = score >= 70;
      const phone = customPhones[item.placeId] || item.phone;
      const hasPhone = !!(phone && phone.trim().length >= 6);
      const hasWeb = !!(item.website && item.website.trim().length >= 4);

      if (filterType === "ALTA") return isHigh;
      if (filterType === "NO_WEB") return !hasWeb;
      if (filterType === "HAS_PHONE") return hasPhone;
      return true;
    });

    return [...list].sort((a, b) => {
      const getCommTier = (item: EnrichedPlace) => {
        const phone = customPhones[item.placeId] || item.phone;
        const hasPhone = !!(phone && phone.trim().length >= 6);
        const hasEmail = !!(item.email && item.email.trim().length >= 4);
        const hasWeb = !!(item.website && item.website.trim().length >= 4);

        if (hasPhone && (hasEmail || hasWeb)) return 3;
        if (hasPhone || hasEmail) return 2;
        if (hasWeb) return 1;
        return 0;
      };

      const tierA = getCommTier(a);
      const tierB = getCommTier(b);

      if (tierB !== tierA) {
        return tierB - tierA; // Los negocios con teléfono/correo/web aparecen primero
      }

      return (b.commercialScore || 50) - (a.commercialScore || 50);
    });
  }, [results, filterType, customPhones]);

  // Save to CRM con actualización optimista instantánea
  async function handleSaveToCrm(item: EnrichedPlace) {
    setSavingId(item.placeId);
    // Respuesta visual instantánea (0ms)
    setResults((prev) =>
      prev.map((r) =>
        r.placeId === item.placeId ? { ...r, isSaved: true } : r
      )
    );

    try {
      const phoneToSave = customPhones[item.placeId] || item.phone;
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          phone: phoneToSave,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults((prev) =>
          prev.map((r) =>
            r.placeId === item.placeId
              ? { ...r, isSaved: true, savedId: data.businesses?.[0]?.id }
              : r
          )
        );
        toast.success("Cliente guardado en el CRM correctamente.");
      } else {
        // Rollback si falló en el servidor
        setResults((prev) =>
          prev.map((r) =>
            r.placeId === item.placeId ? { ...r, isSaved: false } : r
          )
        );
        toast.error("No se pudo guardar los cambios.");
      }
    } catch (err) {
      // Rollback si falló la red
      setResults((prev) =>
        prev.map((r) =>
          r.placeId === item.placeId ? { ...r, isSaved: false } : r
        )
      );
      console.error("Error al guardar en CRM:", err);
      toast.error("No se pudo guardar los cambios.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Buscador y Radar de Clientes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Descubre empresas reales, audita su presencia digital y detecta oportunidades comerciales con IA
          </p>
        </div>

        {/* View Mode Selector: Lista | Mapa | Ambos */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleViewModeChange("lista")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "lista"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Lista</span>
          </button>

          <button
            type="button"
            onClick={() => handleViewModeChange("mapa")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "mapa"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Mapa</span>
          </button>

          <button
            type="button"
            onClick={() => handleViewModeChange("ambos")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "ambos"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Ambos</span>
          </button>
        </div>
      </div>

      {/* Main Search Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Selector de País */}
            <div className="md:col-span-3 relative">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                País:
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={country}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    setCountry(newCountry);
                    if (location.trim().length >= 2) {
                      fetchSuggestions(location, newCountry);
                    }
                  }}
                  className="w-full pl-9 pr-8 py-2 text-base sm:text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-semibold text-slate-800 cursor-pointer appearance-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Ciudad o Distrito con Autocompletado Predictivo */}
            <div className="md:col-span-4 relative" ref={locationBoxRef}>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>Ciudad o Distrito:</span>
                {loadingSuggestions && (
                  <span className="text-[10px] text-blue-600 font-medium normal-case flex items-center gap-1">
                    Buscando...
                  </span>
                )}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => handleLocationInput(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder={
                    country === "PE"
                      ? "Ej: Sechura, Miraflores, Piura..."
                      : "Ej: Nombre de la ciudad..."
                  }
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-medium"
                  autoComplete="off"
                  required
                />
              </div>

              {/* Menú flotante de sugerencias predictivas */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Sugerencias de Ubicación</span>
                    <span className="text-blue-600 normal-case font-medium">Autocompletado exacto</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion(sug);
                        }}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50/70 transition-colors flex items-start gap-2.5 cursor-pointer group"
                      >
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                            {sug.mainText}
                          </div>
                          {sug.secondaryText && (
                            <div className="text-[11px] text-slate-500 truncate">
                              {sug.secondaryText}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rubro o Nicho Comercial */}
            <div className="md:col-span-3 relative">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>Rubro o Nicho:</span>
                <span className="text-[10px] text-slate-400 font-normal normal-case">
                  (Opcional)
                </span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ej: Todos los rubros, ferreterías..."
                  className="w-full pl-9 pr-3 py-2 text-base sm:text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-medium"
                />
              </div>
            </div>

            {/* Botón de Acción */}
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Search className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Buscando..." : "Buscar"}</span>
              </button>
            </div>
          </div>

          {/* Quick presets & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 overflow-x-auto no-scrollbar max-w-full pb-1 sm:flex-wrap">
              <span className="font-bold text-slate-700 shrink-0">Rubros sugeridos:</span>
              {[
                { name: "todos", label: "Todos los rubros", isAll: true },
                { name: "restaurantes", label: "Restaurantes" },
                { name: "clínicas", label: "Clínicas & Salud" },
                { name: "constructoras", label: "Constructoras" },
                { name: "hoteles", label: "Hoteles" },
                { name: "ferreterías", label: "Ferreterías" },
                { name: "talleres", label: "Talleres" },
              ].map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => setCategory(r.name === "todos" ? "Todos los rubros" : r.name)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all hover:scale-105 shadow-2xs border cursor-pointer text-xs shrink-0 sm:shrink ${r.isAll
                      ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-bold ring-1 ring-blue-500/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                    }`}
                >
                  {r.isAll && <Layers className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-slate-600">
                <span className="font-medium text-[11px]">Radio:</span>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white font-medium"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={15}>15 km</option>
                  <option value={30}>30 km</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-slate-600">
                <span className="font-medium text-[11px]">Límite:</span>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white font-medium"
                >
                  <option value={15}>15 resultados</option>
                  <option value={25}>25 resultados</option>
                  <option value={50}>50 resultados</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Notice / Feedback */}
      {notice && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2 shadow-2xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{notice}</div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Header & Actions Bar */}
      {results.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="font-extrabold text-slate-900 text-sm">{filteredResults.length}</span>
            <span className="text-slate-500 font-medium">negocios encontrados</span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
              {sourceUsed === "google_places" ? "Google Maps Places" : "OpenStreetMap"}
            </span>
            {(!category || category.toLowerCase().includes("todos")) && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                Barrido Toda la Ciudad
              </span>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            {/* Quick Filters */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs overflow-x-auto no-scrollbar max-w-full">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${filterType === "ALL" ? "bg-white text-blue-600 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Todos ({results.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("ALTA")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${filterType === "ALTA" ? "bg-white text-red-600 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Alta ({results.filter((r) => (r.commercialScore || 50) >= 70).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("NO_WEB")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${filterType === "NO_WEB" ? "bg-white text-amber-600 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Sin Web ({results.filter((r) => !r.website).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("HAS_PHONE")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${filterType === "HAS_PHONE" ? "bg-white text-emerald-600 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Con Teléfono ({results.filter((r) => !!r.phone).length})
              </button>
            </div>

            {/* Export modal trigger button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-300 shadow-2xs transition-all hover:scale-102 shrink-0"
            >
              <ExcelIcon className="w-3.5 h-3.5" />
              <span>Exportar {selectedIds.length > 0 ? `(${selectedIds.length})` : "Base"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Adapts cleanly according to viewMode */}
      <div className={`grid grid-cols-1 ${viewMode === "ambos" ? "lg:grid-cols-12" : "grid-cols-1"} gap-6`}>
        {/* Left Column: Business Cards List (Visible in 'lista' and 'ambos') */}
        {viewMode !== "mapa" && (
          <div className={`${viewMode === "ambos" ? "lg:col-span-7" : "col-span-1"} space-y-4`}>
            {/* Select all bar */}
            {filteredResults.length > 0 && (
              <div className="flex items-center justify-between px-2 text-xs text-slate-500">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredResults.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Seleccionar todos para exportar ({selectedIds.length} marcados)</span>
                </label>
              </div>
            )}

            {filteredResults.map((item) => {
              const score = item.commercialScore || 50;
              const isHigh = score >= 70;
              const isMid = score >= 45 && score < 70;
              const level = item.opportunityLevel || (isHigh ? "ALTA" : isMid ? "MEDIA" : "BAJA");
              const levelBadgeStyle = isHigh
                ? "bg-red-50 text-red-700 border-red-200"
                : isMid
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-100 text-slate-600 border-slate-200";

              const isSelected = selectedItem?.placeId === item.placeId;
              const isChecked = selectedIds.includes(item.placeId);
              const phoneData = formatPhone(customPhones[item.placeId] || item.phone);
              const mapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${item.name} ${item.address || location}`
              )}`;

              const motivesList = item.motivos && item.motivos.length > 0 ? item.motivos : [
                !item.website ? "No tiene página web" : "Tiene página web para optimizar",
                item.rating ? "Tiene buena reputación" : "Presencia en mapas",
                item.phone ? "Tiene teléfono" : "Sin teléfono verificado",
                "Tiene presencia en Google Maps",
              ];

              return (
                <div
                  key={item.placeId}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer relative shadow-2xs hover:shadow-md ${isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {/* Top Bar: Checkbox + Name + Score + Opportunity Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectId(item.placeId);
                        }}
                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm truncate hover:text-blue-600 transition-colors">
                            {item.name}
                          </h3>
                          <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.category || "General"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          📍 {item.address || item.city || "Sin dirección exacta"}
                        </p>
                      </div>
                    </div>

                    {/* Commercial Score with Tooltip */}
                    <div className="text-right shrink-0" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <span
                          className={`text-lg font-black ${isHigh ? "text-red-600" : isMid ? "text-blue-600" : "text-slate-600"
                            }`}
                        >
                          {score}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">/100</span>

                        <div className="group relative cursor-pointer ml-0.5">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                          <div className="absolute right-0 top-full mt-1 w-60 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 leading-tight">
                            El score estima el potencial comercial del negocio según su presencia digital, reputación y datos disponibles.
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 font-medium">
                        Confianza {item.scoreConfidence || 50}%
                      </div>
                    </div>
                  </div>

                  {/* Rating & Web Status */}
                  <div className="flex flex-wrap items-center gap-3 text-xs mt-3 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {item.rating ? `${item.rating} (${item.userRatingsTotal || 0} reseñas)` : "Sin reseñas"}
                    </span>

                    <span>·</span>

                    {item.website ? (
                      <a
                        href={formatUrl(item.website) || "#"}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium truncate max-w-[200px]"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span className="truncate">{item.website}</span>
                      </a>
                    ) : (
                      <span className="text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Sin Web (Oportunidad Alta)</span>
                      </span>
                    )}

                    <span>·</span>

                    <a
                      href={mapsQueryUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-600 hover:text-blue-600 flex items-center gap-1 font-medium text-[11px]"
                    >
                      <GoogleMapsRealisticIcon className="w-3.5 h-3.5" />
                      <span>Ver en Maps</span>
                    </a>
                  </div>

                  {/* SECCIÓN VISUAL DE OPORTUNIDAD COMERCIAL REQUERIDA (SECCIÓN 6) */}
                  <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${levelBadgeStyle}`}>
                          {level === "ALTA" ? "🔥 OPORTUNIDAD ALTA" : level === "MEDIA" ? "⚡ OPORTUNIDAD MEDIA" : "💤 OPORTUNIDAD BAJA"}
                        </span>
                      </div>

                      <span className="text-xs font-black text-emerald-600">
                        {settingsPriceWeb}
                      </span>
                    </div>

                    {/* Motivos en viñetas */}
                    <div className="text-[11px] text-slate-700 space-y-1">
                      <span className="font-bold text-slate-800 block text-[10px] uppercase">Motivos:</span>
                      <ul className="space-y-0.5 pl-1">
                        {motivesList.slice(0, 4).map((m: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Servicio recomendado */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-slate-800 text-[10px] uppercase mr-1">Servicio recomendado:</span>
                      {!item.website ? (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                          🌐 Página Web
                        </span>
                      ) : null}
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                        📱 Integración WhatsApp
                      </span>
                    </div>
                  </div>

                  {/* Canales de Contacto Directo */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      {/* Teléfono */}
                      <div className="flex items-center gap-2">
                        {phoneData.cleanPhone ? (
                          <div className="inline-flex items-center gap-1 font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{phoneData.cleanPhone}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(phoneData.cleanPhone);
                                setCopiedId(item.placeId);
                                toast.success("Información copiada al portapapeles.");
                                setTimeout(() => setCopiedId(null), 1500);
                              }}
                              className="text-slate-400 hover:text-slate-700 ml-1 p-0.5"
                              title="Copiar número"
                            >
                              {copiedId === item.placeId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-medium flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>Sin teléfono</span>
                          </span>
                        )}
                      </div>

                      {/* Correo Electrónico Automático */}
                      <div className="flex items-center gap-2">
                        {item.email ? (
                          <a
                            href={`mailto:${item.email}`}
                            className="inline-flex items-center gap-1 font-bold text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors"
                            title={`Enviar correo a ${item.email}`}
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate max-w-[170px]">{item.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-medium flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>Sin correo</span>
                          </span>
                        )}
                      </div>

                      {/* WhatsApp wa.me directo */}
                      {phoneData.waLink ? (
                        <a
                          href={`${phoneData.waLink}?text=${encodeURIComponent(
                            `Hola ${item.name}, les escribe un asesor comercial. Notamos la destacada actividad de su empresa en ${item.category} y quisiéramos presentarles una propuesta digital.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all hover:scale-102"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          <span>WhatsApp wa.me</span>
                        </a>
                      ) : editingPhoneId === item.placeId ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Ej: 987654321"
                            value={customPhones[item.placeId] || ""}
                            onChange={(e) =>
                              setCustomPhones((prev) => ({ ...prev, [item.placeId]: e.target.value }))
                            }
                            className="px-2 py-0.5 text-xs border border-slate-300 rounded-lg bg-white w-28"
                          />
                          <button
                            onClick={() => {
                              if (customPhones[item.placeId]) {
                                setEditingPhoneId(null);
                                const num = customPhones[item.placeId].replace(/[^\d]/g, "");
                                const waUrl = num.startsWith("51") ? `https://wa.me/${num}` : `https://wa.me/51${num}`;
                                window.open(waUrl, "_blank");
                              }
                            }}
                            className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                          >
                            Ir
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingPhoneId(item.placeId)}
                          className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <WhatsAppIcon className="w-3 h-3" />
                          <span>+ Ingresar número para WhatsApp</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Acciones Principales: Prospectar | Ver Ficha 360° | Guardar en CRM */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {/* Botón Principal: Prospectar */}
                      <button
                        onClick={() => setProspectModalItem(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all hover:scale-105 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>Prospectar</span>
                      </button>

                      {/* Botón Ver Ficha 360° */}
                      <button
                        onClick={() => setFichaModalItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <GeminiRealisticIcon className="w-3.5 h-3.5" />
                        <span>Ver Ficha 360°</span>
                      </button>
                    </div>

                    {/* Botón Dinámico Guardar en CRM */}
                    <div className="flex items-center">
                      {!item.isSaved ? (
                        <button
                          onClick={() => handleSaveToCrm(item)}
                          disabled={savingId === item.placeId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-slate-500" />
                          <span>{savingId === item.placeId ? "Guardando..." : "Guardar en CRM"}</span>
                        </button>
                      ) : (
                        <Link
                          href={`/negocios/${item.savedId || item.placeId}`}
                          className="group inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                          title="Hacer clic para ver en CRM"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="group-hover:hidden">✓ En CRM</span>
                          <span className="hidden group-hover:inline">Ver prospecto →</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredResults.length === 0 && !loading && (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">Inicia una prospección geográfica</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Ingresa cualquier ciudad o país y el rubro que deseas buscar. Los negocios se consultan en tiempo real y se evalúan comercialmente.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Right Column: Interactive Leaflet Map (Visible in 'mapa' and 'ambos') */}
        {viewMode !== "lista" && (
          <div className={`${viewMode === "ambos" ? "lg:col-span-5 sticky top-6" : "col-span-1"} h-[380px] sm:h-[480px] lg:h-[750px]`}>
            <MapLeaflet
              items={filteredResults.map((r) => ({
                id: r.placeId,
                name: r.name,
                latitude: r.latitude,
                longitude: r.longitude,
                category: r.category,
                commercialScore: r.commercialScore,
                opportunityLevel: r.opportunityLevel,
                address: r.address,
                website: r.website,
                phone: customPhones[r.placeId] || r.phone,
                googleMapsUrl: r.googleMapsUrl,
              }))}
              selectedItem={
                selectedItem
                  ? {
                    id: selectedItem.placeId,
                    name: selectedItem.name,
                    latitude: selectedItem.latitude,
                    longitude: selectedItem.longitude,
                    category: selectedItem.category,
                    commercialScore: selectedItem.commercialScore,
                    opportunityLevel: selectedItem.opportunityLevel,
                    address: selectedItem.address,
                    website: selectedItem.website,
                    phone: customPhones[selectedItem.placeId] || selectedItem.phone,
                  }
                  : null
              }
              onSelectItem={(clickedItem) => {
                const found = results.find((r) => r.name === clickedItem.name);
                if (found) setSelectedItem(found);
              }}
            />
          </div>
        )}
      </div>

      {/* Modales Interactivos */}
      <Ficha360Modal
        business={fichaModalItem}
        isOpen={!!fichaModalItem}
        onClose={() => setFichaModalItem(null)}
        settingsPriceWeb={settingsPriceWeb}
        onOpenProspectar={(b) => setProspectModalItem(b)}
      />

      <ProspectModal
        business={prospectModalItem}
        isOpen={!!prospectModalItem}
        onClose={() => setProspectModalItem(null)}
        settingsPriceWeb={settingsPriceWeb}
        onSavedSuccess={(saved) => {
          setResults((prev) =>
            prev.map((r) =>
              r.placeId === saved.placeId ? { ...r, isSaved: true, savedId: saved.id } : r
            )
          );
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        items={filteredResults}
        selectedItems={filteredResults.filter((r) => selectedIds.includes(r.placeId))}
      />
    </div>
  );
}
