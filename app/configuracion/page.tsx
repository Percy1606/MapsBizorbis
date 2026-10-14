"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Save,
  Building,
  DollarSign,
  MessageSquare,
  Mail,
  Bot,
  RotateCcw,
  Phone,
  Globe,
  Sparkles,
  Calendar,
  Copy,
  Info,
  Lock,
  User,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { toast } from "@/components/ToastContext";

const DEFAULT_CLIENT_TEMPLATES = {
  templateWhatsAppFirst:
    "Hola equipo de {nombre}, un saludo cordial. Les escribe {mi_empresa}. Estuvimos revisando negocios destacados en el rubro de {rubro} en {ciudad} y notamos una gran oportunidad para captar más clientes mediante una página web profesional con botón directo a WhatsApp.\n\n¿Tendrían 5 minutos esta semana para compartirles una propuesta personalizada sin compromiso?\n\n{mi_firma}",
  templateWhatsAppFollowup:
    "Hola {nombre}, ¿cómo están? Les escribe {mi_empresa} para hacer un breve seguimiento a nuestro mensaje anterior sobre potenciar su canal digital.\n\n¿Tuvieron oportunidad de revisarlo o prefieren que coordinemos una breve llamada de 5 minutos? ¡Que tengan un excelente día!",
  templateWhatsAppQuote:
    "Estimado equipo de {nombre}, conforme a lo conversado, hemos preparado una cotización a medida para el desarrollo web corporativo ({precio_web}). Incluye diseño adaptado a celulares, integración directa a WhatsApp y posicionamiento local.\n\n¿Me confirman si les gustaría recibir el documento en PDF por este medio?\n\n{mi_firma}",
  templateEmailSubject:
    "Propuesta comercial para potenciar la presencia digital de {nombre}",
  templateEmailBody:
    "Estimado equipo de {nombre},\n\nEspero se encuentren muy bien. Les escribe {mi_empresa}. Estuvimos analizando el sector de {rubro} en {ciudad} y encontramos un gran potencial en su negocio para incrementar su captación de clientes locales.\n\nNos encantaría agendar una breve videollamada de 10 minutos esta semana para presentarles una demostración adaptada a sus necesidades comerciales.\n\nQuedamos a su entera disposición.\n\n{mi_firma}",
  aiTone: "consultivo" as const,
  aiCustomInstructions:
    "Siempre busca aportar valor concreto, destacar la ventaja de tener web con botón a WhatsApp y ofrecer una breve demo de 5 minutos.",
  defaultFollowUpDays: 2,
};

const DYNAMIC_VARIABLES = [
  { tag: "{nombre}", desc: "Nombre del negocio" },
  { tag: "{rubro}", desc: "Rubro o categoría" },
  { tag: "{ciudad}", desc: "Ciudad o distrito" },
  { tag: "{mi_empresa}", desc: "Nombre de tu agencia" },
  { tag: "{mi_firma}", desc: "Firma de despedida" },
  { tag: "{precio_web}", desc: "Precio web sugerido" },
  { tag: "{mi_telefono}", desc: "WhatsApp de tu agencia" },
  { tag: "{mi_portafolio}", desc: "Enlace a tu portafolio" },
];

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"agencia" | "whatsapp" | "email" | "ia_crm">("agencia");

  // Settings state - Agencia & Precios
  const [companyName, setCompanyName] = useState("Mi Agencia Tech");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyPortfolioUrl, setCompanyPortfolioUrl] = useState("");
  const [companyServices, setCompanyServices] = useState(
    "Desarrollo web corporativo, Catálogos digitales, Chatbots de WhatsApp con IA, Sistemas de reservas y CRM"
  );
  const [commercialSign, setCommercialSign] = useState(
    "Atentamente,\nEquipo de Soluciones Comerciales"
  );
  const [priceWeb, setPriceWeb] = useState("Desde S/499");
  const [priceWhatsApp, setPriceWhatsApp] = useState("Desde S/299");
  const [priceCustom, setPriceCustom] = useState("Desde S/899");

  // Settings state - Credenciales de Acceso
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Settings state - Plantillas WhatsApp
  const [templateWhatsAppFirst, setTemplateWhatsAppFirst] = useState(DEFAULT_CLIENT_TEMPLATES.templateWhatsAppFirst);
  const [templateWhatsAppFollowup, setTemplateWhatsAppFollowup] = useState(DEFAULT_CLIENT_TEMPLATES.templateWhatsAppFollowup);
  const [templateWhatsAppQuote, setTemplateWhatsAppQuote] = useState(DEFAULT_CLIENT_TEMPLATES.templateWhatsAppQuote);

  // Settings state - Plantillas Email
  const [templateEmailSubject, setTemplateEmailSubject] = useState(DEFAULT_CLIENT_TEMPLATES.templateEmailSubject);
  const [templateEmailBody, setTemplateEmailBody] = useState(DEFAULT_CLIENT_TEMPLATES.templateEmailBody);

  // Settings state - IA & CRM
  const [aiTone, setAiTone] = useState<"consultivo" | "directo" | "formal" | "amigable">("consultivo");
  const [aiCustomInstructions, setAiCustomInstructions] = useState(DEFAULT_CLIENT_TEMPLATES.aiCustomInstructions);
  const [defaultFollowUpDays, setDefaultFollowUpDays] = useState(2);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.companyName) setCompanyName(data.companyName);
        if (data.companyServices) setCompanyServices(data.companyServices);
        if (data.commercialSign) setCommercialSign(data.commercialSign);
        if (data.priceWeb) setPriceWeb(data.priceWeb);
        if (data.priceWhatsApp) setPriceWhatsApp(data.priceWhatsApp);
        if (data.priceCustom) setPriceCustom(data.priceCustom);

        if (data.companyPhone !== undefined) setCompanyPhone(data.companyPhone || "");
        if (data.companyPortfolioUrl !== undefined) setCompanyPortfolioUrl(data.companyPortfolioUrl || "");
        if (data.aiTone) setAiTone(data.aiTone);
        if (data.aiCustomInstructions !== undefined) setAiCustomInstructions(data.aiCustomInstructions || "");
        if (typeof data.defaultFollowUpDays === "number") setDefaultFollowUpDays(data.defaultFollowUpDays);

        if (data.templateWhatsAppFirst) setTemplateWhatsAppFirst(data.templateWhatsAppFirst);
        if (data.templateWhatsAppFollowup) setTemplateWhatsAppFollowup(data.templateWhatsAppFollowup);
        if (data.templateWhatsAppQuote) setTemplateWhatsAppQuote(data.templateWhatsAppQuote);
        if (data.templateEmailSubject) setTemplateEmailSubject(data.templateEmailSubject);
        if (data.templateEmailBody) setTemplateEmailBody(data.templateEmailBody);

        if (data.adminUser) setAdminUser(data.adminUser);
        // La contraseña se deja vacía por seguridad a menos que se desee cambiar
        setAdminPassword("");
      })
      .catch((err) => console.error("Error loading settings:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveSettings(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyPhone,
          companyPortfolioUrl,
          companyServices,
          commercialSign,
          priceWeb,
          priceWhatsApp,
          priceCustom,
          templateWhatsAppFirst,
          templateWhatsAppFollowup,
          templateWhatsAppQuote,
          templateEmailSubject,
          templateEmailBody,
          aiTone,
          aiCustomInstructions,
          defaultFollowUpDays: Number(defaultFollowUpDays) || 2,
          adminUser: adminUser.trim(),
          ...(adminPassword.trim() ? { adminPassword: adminPassword.trim() } : {}),
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        toast.success("Cambios guardados correctamente.");
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        toast.error("No se pudo guardar los cambios.");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("No se pudo guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  function handleRestoreDefaultTemplates() {
    setTemplateWhatsAppFirst(DEFAULT_CLIENT_TEMPLATES.templateWhatsAppFirst);
    setTemplateWhatsAppFollowup(DEFAULT_CLIENT_TEMPLATES.templateWhatsAppFollowup);
    setTemplateWhatsAppQuote(DEFAULT_CLIENT_TEMPLATES.templateWhatsAppQuote);
    setTemplateEmailSubject(DEFAULT_CLIENT_TEMPLATES.templateEmailSubject);
    setTemplateEmailBody(DEFAULT_CLIENT_TEMPLATES.templateEmailBody);
    setAiTone(DEFAULT_CLIENT_TEMPLATES.aiTone);
    setAiCustomInstructions(DEFAULT_CLIENT_TEMPLATES.aiCustomInstructions);
    setDefaultFollowUpDays(DEFAULT_CLIENT_TEMPLATES.defaultFollowUpDays);
    toast.info("Plantillas restauradas a valores recomendados.");
  }

  function handleCopyTag(tag: string) {
    navigator.clipboard.writeText(tag);
    toast.success(`Etiqueta ${tag} copiada al portapapeles.`);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header con el ÚNICO botón de guardar cambios */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Configuración Comercial & Mensajes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personaliza los datos de tu agencia, credenciales de acceso, precios de referencia, plantillas de WhatsApp y correos
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveSettings()}
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all hover:scale-102 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Guardando cambios..." : "Guardar Cambios"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Cambios guardados correctamente en el sistema.</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-px touch-pan-x">
        <button
          type="button"
          onClick={() => setActiveTab("agencia")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "agencia"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Datos & Precios</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "whatsapp"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Plantillas WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "email"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Mail className="w-4 h-4 text-blue-500" />
          <span>Plantilla Correo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ia_crm")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "ia_crm"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Bot className="w-4 h-4 text-purple-600" />
          <span>IA & Automatización CRM</span>
        </button>
      </div>

      {/* Dynamic Variables helper banner (shown for templates) */}
      {(activeTab === "whatsapp" || activeTab === "email") && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Etiquetas dinámicas disponibles (Haz clic para copiar):
            </span>
            <button
              type="button"
              onClick={handleRestoreDefaultTemplates}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar recomendados</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DYNAMIC_VARIABLES.map((v) => (
              <button
                key={v.tag}
                type="button"
                onClick={() => handleCopyTag(v.tag)}
                title={`Copiar ${v.tag}: ${v.desc}`}
                className="group inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-[11px] font-mono text-slate-700 transition-all shadow-2xs cursor-pointer"
              >
                <span className="font-semibold text-blue-600">{v.tag}</span>
                <span className="text-slate-400 group-hover:text-slate-600 font-sans text-[10px]">
                  ({v.desc})
                </span>
                <Copy className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-600 ml-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: DATOS & PRECIOS */}
      {activeTab === "agencia" && (
        <div className="space-y-6">
          {/* Datos Comerciales */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-blue-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Datos Comerciales de Tu Empresa</h2>
                <p className="text-[11px] text-slate-500">
                  La Inteligencia Artificial y las plantillas utilizan esta información para firmar mensajes y estructurar propuestas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nombre de tu Agencia / Empresa:
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej: Mi Agencia Tech"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Firma Comercial en Mensajes:
                </label>
                <input
                  type="text"
                  value={commercialSign}
                  onChange={(e) => setCommercialSign(e.target.value)}
                  placeholder="Ej: Atentamente, Equipo Comercial"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  Teléfono WhatsApp de tu Agencia:
                </label>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="Ej: +51 987 654 321"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Disponible en plantillas con &#123;mi_telefono&#125;</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-600" />
                  Enlace a Portafolio o Sitio Web:
                </label>
                <input
                  type="text"
                  value={companyPortfolioUrl}
                  onChange={(e) => setCompanyPortfolioUrl(e.target.value)}
                  placeholder="Ej: https://miagenciatech.com/portafolio"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Disponible en plantillas con &#123;mi_portafolio&#125;</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Catálogo de Servicios Ofrecidos:
                </label>
                <textarea
                  rows={2}
                  value={companyServices}
                  onChange={(e) => setCompanyServices(e.target.value)}
                  placeholder="Ej: Desarrollo web corporativo, Catálogos digitales, Chatbots de WhatsApp con IA..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Credenciales de Acceso al Sistema (Usuario y Contraseña) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Seguridad & Credenciales de Acceso</h3>
                <p className="text-[11px] text-slate-500">
                  Usuario y contraseña para iniciar sesión en la plataforma cuando esté publicada en tu servidor
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Usuario de Acceso:
                </label>
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-semibold"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Nombre de usuario para iniciar sesión</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Contraseña de Acceso:
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="•••••••• (Dejar en blanco para conservar actual)"
                    className="w-full p-2.5 pr-10 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Clave confidencial de administrador</span>
              </div>
            </div>
          </div>

          {/* Precios Sugeridos */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Precios Sugeridos Configurables</h3>
                <p className="text-[11px] text-slate-500">Valores de referencia para las tarjetas de oportunidad y propuestas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Página Web Corporativa:
                </label>
                <input
                  type="text"
                  value={priceWeb}
                  onChange={(e) => setPriceWeb(e.target.value)}
                  placeholder="Ej: Desde S/499"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Visible en fichas y cotizaciones</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Integración WhatsApp / Chatbot IA:
                </label>
                <input
                  type="text"
                  value={priceWhatsApp}
                  onChange={(e) => setPriceWhatsApp(e.target.value)}
                  placeholder="Ej: Desde S/299"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Visible en propuestas de chatbot</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Sistemas a Medida / CRM / ERP:
                </label>
                <input
                  type="text"
                  value={priceCustom}
                  onChange={(e) => setPriceCustom(e.target.value)}
                  placeholder="Ej: Desde S/899"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Visible en cotizaciones avanzadas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLANTILLAS WHATSAPP */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6">
          {/* Primer Contacto */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Plantilla 1: Primer Contacto (Prospección Inicial)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mensaje persuasivo enviado a negocios que aún no tienen página web o requieren modernización
                </p>
              </div>
            </div>

            <textarea
              rows={6}
              value={templateWhatsAppFirst}
              onChange={(e) => setTemplateWhatsAppFirst(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 text-xs leading-relaxed font-mono"
            />
          </div>

          {/* Seguimiento */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Plantilla 2: Seguimiento Comercial
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mensaje corto y respetuoso para recordar la propuesta a prospectos que no han respondido
                </p>
              </div>
            </div>

            <textarea
              rows={5}
              value={templateWhatsAppFollowup}
              onChange={(e) => setTemplateWhatsAppFollowup(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 text-xs leading-relaxed font-mono"
            />
          </div>

          {/* Cotización / Cierre */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Plantilla 3: Presentación de Cotización
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mensaje para clientes interesados que solicitaron costos y detalles del servicio web
                </p>
              </div>
            </div>

            <textarea
              rows={5}
              value={templateWhatsAppQuote}
              onChange={(e) => setTemplateWhatsAppQuote(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 text-xs leading-relaxed font-mono"
            />
          </div>
        </div>
      )}

      {/* TAB 3: PLANTILLA EMAIL */}
      {activeTab === "email" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Plantilla para Envío de Correo Electrónico
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Configura el asunto y contenido para el canal de Email en la prospección de clientes
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Asunto del Correo:
              </label>
              <input
                type="text"
                value={templateEmailSubject}
                onChange={(e) => setTemplateEmailSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-semibold text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Cuerpo del Correo:
              </label>
              <textarea
                rows={10}
                value={templateEmailBody}
                onChange={(e) => setTemplateEmailBody(e.target.value)}
                className="w-full p-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 text-xs leading-relaxed font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IA & AUTOMATIZACIÓN CRM */}
      {activeTab === "ia_crm" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bot className="w-4 h-4 text-purple-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Directivas de Inteligencia Artificial (Google Gemini)</h3>
                <p className="text-[11px] text-slate-500">
                  Controla el estilo, tono de voz y directrices clave de redacción comercial
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Tono de Comunicación Comercial:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { key: "consultivo", label: "Consultivo", desc: "Aporta valor, detecta mejoras y propone soluciones de asesoría" },
                    { key: "directo", label: "Directo", desc: "Claro, breve, enfocado en precios y beneficios inmediatos" },
                    { key: "formal", label: "Formal", desc: "Corporativo, respetuoso y con redacción protocolar tradicional" },
                    { key: "amigable", label: "Amigable", desc: "Cercano, dinámico y muy fácil de responder por WhatsApp" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setAiTone(t.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        aiTone === t.key
                          ? "border-purple-500 bg-purple-50/70 ring-1 ring-purple-500"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <span className={`block font-bold text-xs ${aiTone === t.key ? "text-purple-700" : "text-slate-800"}`}>
                        {t.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Instrucciones Personalizadas para la IA:
                </label>
                <textarea
                  rows={3}
                  value={aiCustomInstructions}
                  onChange={(e) => setAiCustomInstructions(e.target.value)}
                  placeholder="Ej: Siempre busca aportar valor concreto, destacar la ventaja de tener web con botón a WhatsApp y ofrecer una breve demo de 5 minutos."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 leading-relaxed text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Estas reglas se agregan a todas las propuestas generadas para los prospectos.
                </span>
              </div>
            </div>
          </div>

          {/* CRM Automation */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Automatización de Tiempos en CRM</h3>
                <p className="text-[11px] text-slate-500">Configuración de recordatorios para prospectos nuevos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Días sugeridos para Próximo Seguimiento:
                </label>
                <select
                  value={defaultFollowUpDays}
                  onChange={(e) => setDefaultFollowUpDays(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-semibold text-xs cursor-pointer"
                >
                  <option value={1}>1 día (Seguimiento prioritario)</option>
                  <option value={2}>2 días (Recomendado estándar)</option>
                  <option value={3}>3 días</option>
                  <option value={5}>5 días</option>
                  <option value={7}>7 días (1 semana)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Al abrir la ventana de prospección se autocompletará la fecha de seguimiento con este intervalo.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
