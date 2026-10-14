"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Phone,
  Globe,
  MapPin,
  Calendar,
  User,
  FileText,
  Copy,
  Check,
  Send,
  RefreshCw,
  ExternalLink,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { WhatsAppIcon, GeminiRealisticIcon } from "@/components/RealisticIcons";
import { toast } from "@/components/ToastContext";
import { formatPhone } from "@/lib/utils";

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

interface ProspectModalProps {
  business: any;
  isOpen: boolean;
  onClose: () => void;
  onSavedSuccess?: (savedBusiness: any) => void;
  settingsPriceWeb?: string;
}

const CRM_STAGES = [
  "NUEVO",
  "CONTACTADO",
  "INTERESADO",
  "COTIZACION",
  "SEGUIMIENTO",
  "GANADO",
  "PERDIDO",
];

export default function ProspectModal({
  business,
  isOpen,
  onClose,
  onSavedSuccess,
  settingsPriceWeb = "Desde S/499",
}: ProspectModalProps) {
  const [channel, setChannel] = useState<"WhatsApp" | "Email" | "Facebook" | "Instagram">("WhatsApp");
  const [objective, setObjective] = useState<string>("Primer contacto");
  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // CRM fields
  const [crmStatus, setCrmStatus] = useState<string>("NUEVO");
  const [assignedTo, setAssignedTo] = useState<string>("Juan Pérez");
  const [nextFollowUp, setNextFollowUp] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (business) {
      setCrmStatus(business.crmStatus || "NUEVO");
      setAssignedTo(business.assignedTo || "Juan Pérez");
      setNotes(business.notes || "");
      if (business.nextFollowUp) {
        setNextFollowUp(safeFormatIsoDate(business.nextFollowUp));
      } else {
        fetch("/api/settings")
          .then((res) => res.json())
          .then((data) => {
            const days = typeof data.defaultFollowUpDays === "number" ? data.defaultFollowUpDays : 2;
            const d = new Date();
            d.setDate(d.getDate() + days);
            setNextFollowUp(d.toISOString().split("T")[0]);
          })
          .catch(() => {
            const d = new Date();
            d.setDate(d.getDate() + 2);
            setNextFollowUp(d.toISOString().split("T")[0]);
          });
      }
      // Generate initial pitch
      handleGenerateMessage(channel, objective);
    }
  }, [business]);

  if (!isOpen || !business) return null;

  const score = business.commercialScore || 50;
  const isHigh = score >= 70;
  const isMid = score >= 45 && score < 70;
  const level = business.opportunityLevel || (isHigh ? "ALTA" : isMid ? "MEDIA" : "BAJA");
  const levelColor = isHigh ? "text-red-600 bg-red-50 border-red-200" : isMid ? "text-blue-600 bg-blue-50 border-blue-200" : "text-slate-600 bg-slate-100 border-slate-200";

  const phoneInfo = formatPhone(business.phone);
  const hasPhone = !!phoneInfo.waLink;
  const waUrl = phoneInfo.waLink || "";

  async function handleGenerateMessage(selChannel = channel, selObjective = objective) {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business,
          channel: selChannel,
          objective: selObjective,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setGeneratedMessage(data.message);
      }
    } catch (err) {
      console.error("Error generating message:", err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveToCrm() {
    setSaving(true);
    try {
      const payload = {
        placeId: business.placeId,
        name: business.name,
        category: business.category,
        address: business.address,
        city: business.city,
        country: business.country,
        latitude: business.latitude,
        longitude: business.longitude,
        phone: business.phone,
        email: business.email,
        website: business.website,
        rating: business.rating,
        userRatingsTotal: business.userRatingsTotal,
        googleMapsUrl: business.googleMapsUrl,
        crmStatus,
        assignedTo,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp).toISOString() : null,
        notes,
      };

      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        toast.success("Cliente creado correctamente.");
        if (onSavedSuccess) {
          onSavedSuccess(data.businesses ? data.businesses[0] : payload);
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        toast.error("No se pudo guardar los cambios.");
      }
    } catch (err) {
      console.error("Error saving business:", err);
      toast.error("No se pudo guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Prospectar Negocio</h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${levelColor}`}>
                  {level}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {business.name} · {business.category} · {business.city || "Perú"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1 & 2 & 3. Resumen de Oportunidad y Servicio */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Oportunidad Detectada</span>
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <span>{level === "ALTA" ? "Oportunidad Alta" : level === "MEDIA" ? "Oportunidad Media" : "Oportunidad Estándar"}</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Score: {score}/100</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Servicio Sugerido</span>
              <div className="font-bold text-blue-600 text-xs">
                {!business.website ? "Página Web Corporativa" : "Chatbot WhatsApp con IA"}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Precio sugerido: {settingsPriceWeb}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Canal de Contacto</span>
              <div className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                {hasPhone ? (
                  <>
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{business.phone}</span>
                  </>
                ) : (
                  <span className="text-slate-400 italic">Sin teléfono verificado</span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
                {business.website ? business.website : "Sin sitio web oficial"}
              </span>
            </div>
          </div>

          {/* 4. GENERADOR DE MENSAJES IA */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <GeminiRealisticIcon className="w-4 h-4" />
                Mensaje Personalizado con IA
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {/* Selector Canal */}
                <select
                  value={channel}
                  onChange={(e) => {
                    const ch = e.target.value as any;
                    setChannel(ch);
                    handleGenerateMessage(ch, objective);
                  }}
                  className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                </select>

                {/* Selector Objetivo */}
                <select
                  value={objective}
                  onChange={(e) => {
                    const obj = e.target.value;
                    setObjective(obj);
                    handleGenerateMessage(channel, obj);
                  }}
                  className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                >
                  <option value="Primer contacto">Primer contacto</option>
                  <option value="Ofrecer página web">Ofrecer página web</option>
                  <option value="Ofrecer marketing digital">Ofrecer marketing digital</option>
                  <option value="Seguimiento">Seguimiento</option>
                  <option value="Cotización">Cotización</option>
                </select>

                <button
                  onClick={() => handleGenerateMessage(channel, objective)}
                  disabled={generating}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Regenerar mensaje"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin text-blue-600" : ""}`} />
                </button>
              </div>
            </div>

            {/* Generated message text area */}
            <div className="relative">
              <textarea
                rows={5}
                value={generating ? "Generando propuesta hiperpersonalizada con IA..." : generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                disabled={generating}
                className="w-full text-xs p-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-normal leading-relaxed text-slate-800"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Redactado exclusivamente a partir de datos reales de {business.name}.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMessage);
                      setCopied(true);
                      toast.success("Información copiada al portapapeles.");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? "¡Copiado!" : "Copiar mensaje"}</span>
                  </button>

                  {hasPhone && (
                    <a
                      href={`${waUrl}?text=${encodeURIComponent(generatedMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-102"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>Enviar por WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 5 & 6 & 7. GESTIÓN CRM: ESTADO, SEGUIMIENTO Y NOTAS */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Control Comercial & Seguimiento CRM
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Estado del Lead:
                </label>
                <select
                  value={crmStatus}
                  onChange={(e) => setCrmStatus(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800"
                >
                  <option value="NUEVO">Nuevo</option>
                  <option value="CONTACTADO">Contactado</option>
                  <option value="INTERESADO">Interesado</option>
                  <option value="COTIZACION">Cotización</option>
                  <option value="SEGUIMIENTO">Seguimiento</option>
                  <option value="GANADO">Ganado</option>
                  <option value="PERDIDO">Perdido</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Próximo Seguimiento:
                </label>
                <input
                  type="date"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Notas y Bitácora de Conversación:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Se contactó por WhatsApp ofreciendo web corporativa. Solicita llamar el viernes por la tarde..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Guardado en CRM
              </span>
            )}
            <button
              onClick={handleSaveToCrm}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-102 disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{saving ? "Guardando en CRM..." : "Guardar Prospecto en CRM"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
