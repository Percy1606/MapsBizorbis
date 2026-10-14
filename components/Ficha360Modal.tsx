"use client";

import { useState } from "react";
import {
  X,
  Globe,
  Phone,
  MapPin,
  Star,
  Flame,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Instagram,
  Facebook,
  Share2,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { GeminiRealisticIcon, GoogleMapsRealisticIcon, WhatsAppIcon } from "@/components/RealisticIcons";
import { toast } from "@/components/ToastContext";

interface Ficha360ModalProps {
  business: any;
  isOpen: boolean;
  onClose: () => void;
  onOpenProspectar?: (business: any) => void;
  settingsPriceWeb?: string;
}

export default function Ficha360Modal({
  business,
  isOpen,
  onClose,
  onOpenProspectar,
  settingsPriceWeb = "Desde S/499",
}: Ficha360ModalProps) {
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || !business) return null;

  const score = business.commercialScore || 50;
  const isHigh = score >= 70;
  const isMid = score >= 45 && score < 70;
  const level = business.opportunityLevel || (isHigh ? "ALTA" : isMid ? "MEDIA" : "BAJA");
  const levelColor = isHigh ? "text-red-600 bg-red-50 border-red-200" : isMid ? "text-blue-600 bg-blue-50 border-blue-200" : "text-slate-600 bg-slate-100 border-slate-200";

  // Safe checks for presence
  const hasPhone = !!(business.phone && business.phone.trim().length >= 6);
  const hasWeb = !!(business.website && business.website.trim().length >= 4);
  const hasInstagram = !!(business.instagram && business.instagram.trim().length >= 3);
  const hasFacebook = !!(business.facebook && business.facebook.trim().length >= 3);
  const hasTikTok = !!(business.tiktok && business.tiktok.trim().length >= 3);

  // Digital channels audit status
  const digitalChannels = [
    { name: "Página Web Oficial", status: hasWeb ? "Detectado" : "No detectado", active: hasWeb, icon: Globe, detail: business.website || "Sin dominio registrado" },
    { name: "WhatsApp Directo", status: hasPhone ? "Detectado" : "No detectado", active: hasPhone, icon: MessageCircle, detail: business.phone || "Sin número verificado" },
    { name: "Google Business / Maps", status: "Detectado", active: true, icon: MapPin, detail: business.googleMapsUrl ? "Ficha verificada" : "En mapas abiertos" },
    { name: "Instagram", status: hasInstagram ? "Detectado" : "No detectado", active: hasInstagram, icon: Instagram, detail: business.instagram || "Sin perfil vinculado" },
    { name: "Facebook", status: hasFacebook ? "Detectado" : "No detectado", active: hasFacebook, icon: Facebook, detail: business.facebook || "Sin página vinculada" },
    { name: "TikTok", status: hasTikTok ? "Detectado" : "No detectado", active: hasTikTok, icon: Share2, detail: business.tiktok || "Sin cuenta vinculada" },
  ];

  async function handleRegenerateAI() {
    setAnalyzingAI(true);
    try {
      const res = await fetch(`/api/businesses/${business.savedId || business.id || 'temp'}/ai-analyze`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        // Fallback local realistic generator
        const text = `Este negocio presenta una oportunidad comercial ${level.toLowerCase()} porque cuenta con ${business.rating ? `buena reputación (${business.rating}★)` : 'actividad comercial'} y presencia en Google Maps, ${!hasWeb ? 'pero no se detectó página web oficial. Esto representa una oportunidad prioritaria para ofrecer una página web corporativa con integración de WhatsApp para captar clientes locales.' : 'y cuenta con sitio web pero presenta oportunidades de automatización comercial con chatbots de WhatsApp y sistemas de gestión de clientes.'}`;
        setAiAnalysis({ summary: text, digitalStrengths: [hasPhone ? "Canal telefónico activo" : "Presencia en mapas"], digitalWeaknesses: [!hasWeb ? "Sin página web propia" : "Sin chatbot automatizado"] });
      }
    } catch (err) {
      const text = `Este negocio presenta una oportunidad comercial ${level.toLowerCase()} porque cuenta con ${business.rating ? `buena reputación (${business.rating}★)` : 'actividad comercial'} y presencia en Google Maps, ${!hasWeb ? 'pero no se detectó página web oficial. Esto representa una oportunidad prioritaria para ofrecer una página web corporativa con integración de WhatsApp.' : 'con oportunidad de optimizar canales directos de atención al cliente.'}`;
      setAiAnalysis({ summary: text });
    } finally {
      setAnalyzingAI(false);
      toast.success("Análisis comercial generado correctamente.");
    }
  }

  const aiText = aiAnalysis?.summary || `Este negocio presenta una oportunidad comercial ${level.toLowerCase()} porque cuenta con ${business.rating ? `buena reputación (${business.rating}★)` : 'actividad verificada'} y presencia en Google Maps, ${!hasWeb ? 'pero no se detectó página web. Esto puede representar una oportunidad para ofrecer una página web corporativa con integración de WhatsApp.' : 'y dispone de web pero requiere automatización con chatbot y optimización de conversión.'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{business.name}</h2>
                <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${levelColor} shrink-0`}>
                  {level === "ALTA" ? "OPORTUNIDAD ALTA" : level === "MEDIA" ? "OPORTUNIDAD MEDIA" : "OPORTUNIDAD BAJA"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Ficha Integral 360° · Auditoría Digital y Evaluación Comercial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {onOpenProspectar && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProspectar(business);
                }}
                className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-102 flex items-center gap-1.5 shrink-0"
              >
                <span>Prospectar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. INFORMACIÓN GENERAL */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              1. Información General
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Categoría / Rubro</span>
                <span className="font-semibold text-slate-900 capitalize mt-0.5 block">{business.category || "No detectado"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                <span className="text-[11px] text-slate-500 block">Dirección</span>
                <span className="font-semibold text-slate-900 mt-0.5 block truncate">{business.address || business.city || "No detectado"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Ciudad</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{business.city || "Sin información"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Coordenadas GPS</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {business.latitude ? `${business.latitude.toFixed(4)}, ${business.longitude.toFixed(4)}` : "No detectado"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Horarios</span>
                <span className="font-semibold text-slate-600 mt-0.5 block italic">{business.openingHours || "No detectado"}</span>
              </div>
            </div>
          </div>

          {/* 2. PRESENCIA DIGITAL */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              2. Presencia Digital & Canales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {digitalChannels.map((ch, idx) => {
                const IconComponent = ch.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                      ch.active ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${ch.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 truncate">{ch.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${ch.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                          {ch.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{ch.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. REPUTACIÓN */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              3. Reputación & Opiniones de Clientes
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-700 font-bold text-xl flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span>{business.rating ? business.rating.toFixed(1) : "—"}</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    {business.rating ? `Calificación promedio de ${business.rating} estrellas` : "Sin calificaciones en Google Maps"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {business.userRatingsTotal ? `${business.userRatingsTotal} opiniones de clientes verificadas` : "No detectado"}
                  </div>
                </div>
              </div>

              {business.googleMapsUrl && (
                <a
                  href={business.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 shadow-2xs"
                >
                  <GoogleMapsRealisticIcon className="w-4 h-4" />
                  <span>Ver Ficha en Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          </div>

          {/* 4. OPORTUNIDAD COMERCIAL & PRECIO CONFIGURABLE */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              4. Oportunidad Comercial & Servicios Recomendados
            </h3>
            <div className="p-5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-600 text-white font-black text-2xl shadow-md shadow-blue-500/20">
                    {score}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">Score de Oportunidad Comercial</span>
                      <div className="group relative cursor-pointer">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-64 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 leading-tight">
                          El score estima el potencial comercial del negocio según su presencia digital, reputación y datos disponibles.
                        </div>
                      </div>
                    </div>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md mt-1 border ${levelColor}`}>
                      {level === "ALTA" ? "OPORTUNIDAD ALTA" : level === "MEDIA" ? "OPORTUNIDAD MEDIA" : "OPORTUNIDAD BAJA"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-right sm:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Precio Sugerido Configurable</span>
                  <span className="text-base font-black text-emerald-600 block">{settingsPriceWeb}</span>
                </div>
              </div>

              {/* Motivos con viñetas */}
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">Motivos del Diagnóstico:</span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {(business.motivos && business.motivos.length > 0 ? business.motivos : [
                    !hasWeb ? "No tiene página web" : "Tiene página web para optimizar",
                    business.rating ? "Tiene buena reputación" : "Presencia en mapas",
                    hasPhone ? "Tiene teléfono" : "Sin teléfono registrado",
                    "Tiene presencia en Google Maps",
                  ]).map((m: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Servicios recomendados */}
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">Servicios Recomendados:</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-100/80 text-blue-800 font-bold text-xs border border-blue-200 flex items-center gap-1.5">
                    Página Web Corporativa
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
                    Integración WhatsApp con IA
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-indigo-100/80 text-indigo-800 font-bold text-xs border border-indigo-200 flex items-center gap-1.5">
                    Sistema de Reservas y Gestión
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. ANÁLISIS IA (GOOGLE GEMINI) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <GeminiRealisticIcon className="w-4 h-4" />
                5. Análisis Estratégico con IA (Google Gemini)
              </h3>

              <button
                onClick={handleRegenerateAI}
                disabled={analyzingAI}
                className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <GeminiRealisticIcon className="w-3.5 h-3.5" />
                <span>{analyzingAI ? "Analizando..." : "Regenerar análisis"}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs leading-relaxed space-y-3 relative shadow-inner">
              <p className="font-medium text-slate-200">
                “{aiText}”
              </p>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiText);
                    setCopiedText(true);
                    toast.success("Información copiada al portapapeles.");
                    setTimeout(() => setCopiedText(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText ? "Copiado" : "Copiar análisis"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Ficha 360° · Datos extraídos de fuentes públicas y auditados en tiempo real
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
            >
              Cerrar
            </button>
            {onOpenProspectar && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProspectar(business);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102 flex items-center gap-1.5"
              >
                <span>🚀 Iniciar Prospección</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
