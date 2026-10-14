"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Phone,
  MapPin,
  Star,
  Sparkles,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertCircle,
  Copy,
  MessageCircle,
  Mail,
  Clock,
  Send,
  RefreshCw,
  ExternalLink,
  Sliders,
  Trash2,
  Check,
} from "lucide-react";
import { formatPhone, formatUrl } from "@/lib/utils";
import {
  WhatsAppIcon,
  GoogleMapsRealisticIcon,
  GeminiRealisticIcon,
  SpeedGaugeRealisticIcon,
} from "@/components/RealisticIcons";
import { toast } from "@/components/ToastContext";

const CRM_STAGES = [
  { id: "NUEVO", label: "Nuevo" },
  { id: "CONTACTADO", label: "Contactado" },
  { id: "INTERESADO", label: "Interesado" },
  { id: "COTIZACION", label: "Cotización" },
  { id: "SEGUIMIENTO", label: "Seguimiento" },
  { id: "GANADO", label: "Ganado" },
  { id: "PERDIDO", label: "Perdido" },
];

function safeFormatIsoDate(val: any): string {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export default function BusinessDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audit state
  const [auditing, setAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // AI Analysis state
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Contact log modal/form
  const [logChannel, setLogChannel] = useState("WHATSAPP");
  const [logTone, setLogTone] = useState("PROFESIONAL");
  const [logMessage, setLogMessage] = useState("");
  const [loggingContact, setLoggingContact] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState<string | null>(null);

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  async function fetchBusiness() {
    try {
      const res = await fetch(`/api/businesses/${id}`);
      const data = await res.json();
      if (data.success) {
        setBusiness(data.business);
      } else {
        setError(data.error || "Negocio no encontrado");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateField(fields: Record<string, any>) {
    try {
      const res = await fetch(`/api/businesses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (data.success) {
        setBusiness((prev: any) => ({ ...prev, ...data.business }));
        toast.success("Registro actualizado correctamente.");
      } else {
        toast.error("No se pudo guardar los cambios.");
      }
    } catch (e) {
      console.error("Error al actualizar:", e);
      toast.error("No se pudo guardar los cambios.");
    }
  }

  async function runAudit() {
    setAuditing(true);
    setAuditError(null);
    try {
      const res = await fetch(`/api/businesses/${id}/audit`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al auditar");
      toast.success("Auditoría web completada correctamente.");
      fetchBusiness();
    } catch (e: any) {
      setAuditError(e.message);
      toast.error("Ocurrió un error al procesar la solicitud.");
    } finally {
      setAuditing(false);
    }
  }

  async function runAIAnalysis() {
    setAnalyzingAI(true);
    setAiError(null);
    try {
      const res = await fetch(`/api/businesses/${id}/ai-analyze`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en análisis con IA");
      toast.success("Análisis comercial generado correctamente.");
      fetchBusiness();
    } catch (e: any) {
      setAiError(e.message);
      toast.error("Ocurrió un error al procesar la solicitud.");
    } finally {
      setAnalyzingAI(false);
    }
  }

  async function handleSaveContactLog(e: React.FormEvent) {
    e.preventDefault();
    if (!logMessage.trim()) {
      toast.warning("Esta acción requiere información adicional.");
      return;
    }

    setLoggingContact(true);
    try {
      const res = await fetch(`/api/businesses/${id}/contact-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: logChannel,
          tone: logTone,
          messageContent: logMessage,
        }),
      });
      if (res.ok) {
        setLogMessage("");
        toast.success("Registro guardado correctamente.");
        fetchBusiness();
      } else {
        toast.error("No se pudo guardar los cambios.");
      }
    } catch (e) {
      console.error("Error guardando contacto:", e);
      toast.error("No se pudo guardar los cambios.");
    } finally {
      setLoggingContact(false);
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedPitch(label);
    toast.success("Información copiada al portapapeles.");
    setTimeout(() => setCopiedPitch(null), 2500);
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Cargando ficha del negocio desde MySQL...
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">{error || "No se encontró el negocio"}</h3>
        <Link
          href="/crm"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-blue-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al CRM
        </Link>
      </div>
    );
  }

  const phoneData = formatPhone(business.phone);
  const latestAudit = business.audits && business.audits.length > 0 ? business.audits[0] : null;
  const latestAI = business.aiAnalyses && business.aiAnalyses.length > 0 ? business.aiAnalyses[0] : null;

  const scoreFactors: any[] = business.scoreBreakdown ? JSON.parse(business.scoreBreakdown) : [];
  const recommendedServices: string[] = business.recommendedServices
    ? JSON.parse(business.recommendedServices)
    : [];

  const aiStrengths = latestAI?.digitalStrengths ? JSON.parse(latestAI.digitalStrengths) : [];
  const aiWeaknesses = latestAI?.digitalWeaknesses ? JSON.parse(latestAI.digitalWeaknesses) : [];
  const aiNegativeFactors = latestAI?.negativeFactors ? JSON.parse(latestAI.negativeFactors) : [];
  const aiServices = latestAI?.recommendedServices ? JSON.parse(latestAI.recommendedServices) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/crm"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al CRM
        </Link>

        <div className="flex items-center gap-2">
          {phoneData.waLink && (
            <a
              href={phoneData.waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <WhatsAppIcon className="w-4 h-4" /> Abrir WhatsApp wa.me
            </a>
          )}
          {business.googleMapsUrl && (
            <a
              href={business.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 shadow-2xs transition-all hover:scale-105"
            >
              <GoogleMapsRealisticIcon className="w-4 h-4" /> Ver en Google Maps
            </a>
          )}
        </div>
      </div>

      {/* Main Business Profile Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
              {business.isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Datos Reales Verificados
                </span>
              )}
              {business.doNotContact && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Lista de Exclusión (No Contactar)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="capitalize font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {business.category}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {business.address || business.city || "Ubicación registrada"}
              </span>
              {business.phone && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {business.phone}
                  </span>
                </>
              )}
              {business.rating && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {business.rating} ({business.userRatingsTotal || 0} reseñas)
                  </span>
                </>
              )}
            </div>

            {/* Web status */}
            <div className="pt-1">
              {business.website ? (
                <a
                  href={formatUrl(business.website) || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <Globe className="w-3.5 h-3.5" /> {business.website}
                </a>
              ) : (
                <span className="text-xs text-red-600 font-medium inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Sin página web registrada en mapas (Oportunidad Primaria)
                </span>
              )}
            </div>
          </div>

          {/* CRM Controls */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                Estado en CRM
              </label>
              <select
                value={business.crmStatus || "NUEVO"}
                onChange={(e) => handleUpdateField({ crmStatus: e.target.value })}
                className="w-full font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
              >
                {CRM_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
                {!CRM_STAGES.some((s) => s.id === business.crmStatus) && business.crmStatus && (
                  <option value={business.crmStatus}>{business.crmStatus}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                Próximo Seguimiento
              </label>
              <input
                type="date"
                value={safeFormatIsoDate(business.nextFollowUp)}
                onChange={(e) => handleUpdateField({ nextFollowUp: e.target.value })}
                className="w-full font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
              />
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={business.doNotContact}
                onChange={(e) => handleUpdateField({ doNotContact: e.target.checked })}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-600 font-medium">Marcar como No Contactar</span>
            </label>
          </div>
        </div>
      </div>

      {/* Grid: Scoring Breakdown + Web Presence Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Commercial Scoring Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-500" />
                  Puntuación de Oportunidad
                </h2>
                <div className="group relative cursor-pointer">
                  <span className="text-slate-400 hover:text-slate-600 text-xs font-bold">ℹ️</span>
                  <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 leading-tight">
                    El score estima el potencial comercial del negocio según su presencia digital, reputación y datos disponibles.
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Evaluación comercial explicable de 0 a 100</p>
            </div>
            <div className="text-right">
              <span
                className={`text-2xl font-black ${
                  business.commercialScore >= 70
                    ? "text-red-600"
                    : business.commercialScore >= 45
                    ? "text-blue-600"
                    : "text-slate-600"
                }`}
              >
                {business.commercialScore}
              </span>
              <span className="text-xs text-slate-400 font-bold">/100</span>
              <div className="text-[10px] text-slate-500">
                Confianza de datos: {business.scoreConfidence}%
              </div>
            </div>
          </div>

          {/* Factor list */}
          <div className="space-y-2.5">
            {scoreFactors.map((f, idx) => {
              const isNegative = f.points < 0 || f.type === "negative";
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    isNegative
                      ? "bg-rose-50/80 border-rose-200 text-rose-950"
                      : "bg-slate-50 border-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {isNegative && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                      {f.category}
                    </span>
                    <span
                      className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded ${
                        isNegative
                          ? "bg-rose-100 text-rose-700"
                          : "text-blue-600"
                      }`}
                    >
                      {f.points > 0 ? `+${f.points}` : f.points} {f.maxPoints && !isNegative ? `/ ${f.maxPoints}` : ""} pts
                    </span>
                  </div>
                  <div className={`mt-0.5 text-[11px] font-medium ${isNegative ? "text-rose-900/90" : "text-slate-600"}`}>
                    {f.reason}
                  </div>
                  <div className={`mt-1 text-[10px] italic ${isNegative ? "text-rose-700/70" : "text-slate-400"}`}>
                    {f.evidence}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended services */}
          {recommendedServices.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700 block mb-2">
                Servicios Sugeridos de tu Empresa:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recommendedServices.map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-100"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Web Audit & Performance */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SpeedGaugeRealisticIcon className="w-5 h-5 shrink-0" />
                Auditoría de Presencia Digital
              </h2>
              <p className="text-[11px] text-slate-500">
                Análisis técnico bajo demanda con Google PageSpeed y SSRF Guard
              </p>
            </div>

            {business.website && (
              <button
                onClick={runAudit}
                disabled={auditing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${auditing ? "animate-spin" : ""}`} />
                {auditing ? "Auditan..." : "Auditar Ahora"}
              </button>
            )}
          </div>

          {auditError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {auditError}
            </div>
          )}

          {!business.website ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Este negocio no tiene sitio web. La mejor propuesta es ofrecerle el desarrollo desde cero.
            </div>
          ) : latestAudit ? (
            <div className="space-y-4 text-xs">
              {/* Metrics bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">HTTPS</div>
                  <div className={`text-sm font-bold mt-1 ${latestAudit.hasHttps ? "text-emerald-600" : "text-red-500"}`}>
                    {latestAudit.hasHttps ? "Activo (SSL)" : "Inseguro"}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Móvil PageSpeed</div>
                  <div className={`text-sm font-bold mt-1 ${
                    latestAudit.mobileScore >= 75 ? "text-emerald-600" : latestAudit.mobileScore >= 50 ? "text-amber-500" : "text-red-500"
                  }`}>
                    {latestAudit.mobileScore !== null ? `${latestAudit.mobileScore}/100` : "Pendiente"}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Botón WhatsApp</div>
                  <div className={`text-sm font-bold mt-1 ${latestAudit.hasWhatsAppButton ? "text-emerald-600" : "text-amber-500"}`}>
                    {latestAudit.hasWhatsAppButton ? "Detectado" : "No detectado"}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Tecnología</div>
                  <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                    {latestAudit.detectedTech || "Personalizado"}
                  </div>
                </div>
              </div>

              {/* Opportunities detected in audit */}
              {latestAudit.opportunities && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <span className="font-bold text-amber-800 block mb-1">
                    Carencias y Oportunidades Verificadas:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-amber-900 text-[11px]">
                    {JSON.parse(latestAudit.opportunities).map((op: string, idx: number) => (
                      <li key={idx}>{op}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Sitio web listo para auditar ({business.website}). Haz clic en &quot;Auditar Ahora&quot; para obtener métricas reales de rendimiento y seguridad.
            </div>
          )}
        </div>
      </div>

      {/* Section 7 & 9: Google Gemini AI Analysis & Custom Pitch Generator */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
              <GeminiRealisticIcon className="w-5 h-5 shrink-0" />
              Inteligencia Artificial Comercial (Google Gemini)
            </h2>
            <p className="text-xs text-slate-500">
              Diagnóstico comercial con respuestas estructuradas y generador de propuestas personalizadas
            </p>
          </div>

          <button
            onClick={runAIAnalysis}
            disabled={analyzingAI}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <GeminiRealisticIcon className={`w-4 h-4 ${analyzingAI ? "animate-spin" : ""}`} />
            {analyzingAI ? "Generando con Gemini..." : "Generar Diagnóstico IA"}
          </button>
        </div>

        {aiError && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {aiError}
          </div>
        )}

        {latestAI ? (
          <div className="space-y-6">
            {/* AI Summary and Confidence */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                  Resumen de Actividad
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{latestAI.summary}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 shrink-0">
                Confianza {latestAI.confidenceLevel}
              </span>
            </div>

            {/* Strengths, Weaknesses & Negative Factors 3-cols */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Fortalezas Digitales
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  {aiStrengths.map((str: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span> {str}
                    </li>
                  ))}
                  {aiStrengths.length === 0 && (
                    <li className="text-slate-400 italic">Sin fortalezas registradas</li>
                  )}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-100">
                <span className="font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Carencias con Evidencia
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  {aiWeaknesses.map((wk: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span> {wk}
                    </li>
                  ))}
                  {aiWeaknesses.length === 0 && (
                    <li className="text-slate-400 italic">Sin carencias detectadas</li>
                  )}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Factores Negativos / Riesgos ⚠️
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  {aiNegativeFactors.map((neg: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">⚠</span> {neg}
                    </li>
                  ))}
                  {aiNegativeFactors.length === 0 && (
                    <li className="text-slate-500 italic">No se detectaron riesgos comerciales críticos.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Recommended Services Rationale */}
            {aiServices.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Soluciones de Software con Mayor Retorno para {business.name}:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiServices.map((srv: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white">
                      <div className="font-bold text-xs text-blue-600">{srv.service}</div>
                      <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">{srv.rationale}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 Pitch Drafts (Professional, Friendly, Direct) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Borradores de Contacto Personalizados (WhatsApp / Correo)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Profesional */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">Tono Profesional</span>
                      <button
                        onClick={() => copyText(latestAI.pitchProfessional, "prof")}
                        className="text-slate-500 hover:text-slate-800 p-1"
                        title="Copiar"
                      >
                        {copiedPitch === "prof" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {latestAI.pitchProfessional}
                    </p>
                  </div>
                  {phoneData.waLink && (
                    <a
                      href={`${phoneData.waLink}?text=${encodeURIComponent(latestAI.pitchProfessional)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all hover:scale-102"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" /> Enviar por WhatsApp
                    </a>
                  )}
                </div>

                {/* Cercano */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">Tono Cercano</span>
                      <button
                        onClick={() => copyText(latestAI.pitchFriendly, "friendly")}
                        className="text-slate-500 hover:text-slate-800 p-1"
                        title="Copiar"
                      >
                        {copiedPitch === "friendly" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {latestAI.pitchFriendly}
                    </p>
                  </div>
                  {phoneData.waLink && (
                    <a
                      href={`${phoneData.waLink}?text=${encodeURIComponent(latestAI.pitchFriendly)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all hover:scale-102"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" /> Enviar por WhatsApp
                    </a>
                  )}
                </div>

                {/* Directo */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">Tono Directo</span>
                      <button
                        onClick={() => copyText(latestAI.pitchDirect, "direct")}
                        className="text-slate-500 hover:text-slate-800 p-1"
                        title="Copiar"
                      >
                        {copiedPitch === "direct" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {latestAI.pitchDirect}
                    </p>
                  </div>
                  {phoneData.waLink && (
                    <a
                      href={`${phoneData.waLink}?text=${encodeURIComponent(latestAI.pitchDirect)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all hover:scale-102"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" /> Enviar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Cold calling script */}
            {latestAI.phoneScript && (
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
                <span className="text-xs font-bold text-amber-900 block mb-2">
                  Guión para Llamada Telefónica en Frío:
                </span>
                <p className="text-xs text-amber-950 whitespace-pre-wrap leading-relaxed">
                  {latestAI.phoneScript}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-xs">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Genera un diagnóstico estratégico con Google Gemini para descubrir fortalezas, carencias y borradores para contactar a este negocio.
          </div>
        )}
      </div>

      {/* CRM Contact Log & Activity History */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Registro de Gestiones y Contacto
        </h2>

        {/* New Log Form */}
        <form onSubmit={handleSaveContactLog} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Canal</label>
              <select
                value={logChannel}
                onChange={(e) => setLogChannel(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="LLAMADA">Llamada Telefónica</option>
                <option value="EMAIL">Correo Electrónico</option>
                <option value="REUNION">Reunión Virtual / Presencial</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tono Utilizado</label>
              <select
                value={logTone}
                onChange={(e) => setLogTone(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="PROFESIONAL">Profesional</option>
                <option value="CERCANO">Cercano</option>
                <option value="DIRECTO">Directo</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loggingContact || !logMessage.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                {loggingContact ? "Guardando..." : "Guardar Registro"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Notas de la interacción o resumen de la llamada:
            </label>
            <textarea
              rows={2}
              value={logMessage}
              onChange={(e) => setLogMessage(e.target.value)}
              placeholder="Ej: Se envió mensaje por WhatsApp con propuesta de catálogo web. Quedaron en responder mañana..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
              required
            />
          </div>
        </form>

        {/* Existing Logs History */}
        <div className="space-y-2 pt-2">
          {business.contactLogs && business.contactLogs.length > 0 ? (
            business.contactLogs.map((log: any) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span>{log.channel}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{log.messageContent}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              No hay interacciones registradas aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
