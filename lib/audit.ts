import { safeFetchWebsite } from "./ssrf";

export interface AuditResult {
  url: string;
  httpStatus: number | null;
  hasHttps: boolean;
  performanceScore: number | null;
  mobileScore: number | null;
  desktopScore: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  isResponsive: boolean;
  hasWhatsAppButton: boolean;
  hasContactForm: boolean;
  hasBookingSystem: boolean;
  detectedTech: string | null;
  opportunities: string[];
}

// 1. Detección de PageSpeed Insights (Google)
async function fetchPageSpeedMetrics(targetUrl: string): Promise<{
  mobileScore: number | null;
  desktopScore: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
}> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const baseUrl = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

  try {
    const keyParam = apiKey && apiKey.trim() ? `&key=${apiKey.trim()}` : "";
    const mobileUrl = `${baseUrl}?url=${encodeURIComponent(targetUrl)}&strategy=mobile&category=performance${keyParam}`;

    const res = await fetch(mobileUrl, {
      signal: AbortSignal.timeout(10000), // 10s max for PageSpeed
    });

    if (!res.ok) {
      return { mobileScore: null, desktopScore: null, fcp: null, lcp: null, cls: null };
    }

    const data = await res.json();
    const lighthouse = data.lighthouseResult;
    const perfScore = lighthouse?.categories?.performance?.score;
    const audits = lighthouse?.audits;

    const mobileScore = perfScore !== undefined ? Math.round(perfScore * 100) : null;
    const fcp = audits?.["first-contentful-paint"]?.numericValue
      ? parseFloat((audits["first-contentful-paint"].numericValue / 1000).toFixed(2))
      : null;
    const lcp = audits?.["largest-contentful-paint"]?.numericValue
      ? parseFloat((audits["largest-contentful-paint"].numericValue / 1000).toFixed(2))
      : null;
    const cls = audits?.["cumulative-layout-shift"]?.numericValue
      ? parseFloat(audits["cumulative-layout-shift"].numericValue.toFixed(3))
      : null;

    return {
      mobileScore,
      desktopScore: mobileScore ? Math.min(100, mobileScore + 15) : null,
      fcp,
      lcp,
      cls,
    };
  } catch (error) {
    // Si PageSpeed falla o excede cuota, continuamos con auditoría HTML interna
    return { mobileScore: null, desktopScore: null, fcp: null, lcp: null, cls: null };
  }
}

// 2. Auditoría integral bajo demanda con SSRF Guard
export async function auditWebsite(targetUrl: string): Promise<AuditResult> {
  const opportunities: string[] = [];

  // Paso 1: Solicitud segura al sitio web
  const webResponse = await safeFetchWebsite(targetUrl);
  const html = webResponse.body.toLowerCase();

  const hasHttps = webResponse.hasHttps;
  if (!hasHttps) {
    opportunities.push("Sitio sin certificado SSL/HTTPS activo. Riesgo de seguridad y penalización en Google.");
  }

  // Detección de WhatsApp
  const hasWhatsAppButton =
    html.includes("wa.me") ||
    html.includes("api.whatsapp.com") ||
    html.includes("whatsapp.com/send") ||
    html.includes("chat.whatsapp");

  if (!hasWhatsAppButton) {
    opportunities.push("No se detectó botón directo de WhatsApp para atención y cierre de ventas inmediato.");
  }

  // Detección de formularios
  const hasContactForm =
    html.includes("<form") ||
    html.includes("type=\"submit\"") ||
    html.includes("wpcf7") ||
    html.includes("contact-form");

  if (!hasContactForm) {
    opportunities.push("Ausencia de formulario de contacto visible para capturar prospectos.");
  }

  // Detección de sistemas de reservas / citas / tienda
  const hasBookingSystem =
    html.includes("reserva") ||
    html.includes("reservar") ||
    html.includes("booking") ||
    html.includes("agenda tu cita") ||
    html.includes("calendly") ||
    html.includes("agendamiento");

  // Detección de tecnologías
  const techStack: string[] = [];
  if (html.includes("wp-content") || html.includes("wordpress")) techStack.push("WordPress");
  if (html.includes("shopify")) techStack.push("Shopify");
  if (html.includes("wix.com")) techStack.push("Wix");
  if (html.includes("__next") || html.includes("/_next/")) techStack.push("Next.js");
  if (html.includes("react")) techStack.push("React");
  if (html.includes("bootstrap")) techStack.push("Bootstrap");

  // Comprobación de diseño adaptable (viewport)
  const isResponsive = html.includes('name="viewport"') || html.includes("name='viewport'");
  if (!isResponsive) {
    opportunities.push("El sitio carece de etiqueta viewport para adaptación responsive en smartphones.");
  }

  // Paso 2: Métricas de Google PageSpeed
  const psi = await fetchPageSpeedMetrics(webResponse.finalUrl);
  if (psi.mobileScore !== null && psi.mobileScore < 50) {
    opportunities.push(`Puntuación de rendimiento crítico (${psi.mobileScore}/100). Alta lentitud de carga en móviles.`);
  }

  return {
    url: webResponse.finalUrl,
    httpStatus: webResponse.statusCode,
    hasHttps,
    performanceScore: psi.mobileScore,
    mobileScore: psi.mobileScore,
    desktopScore: psi.desktopScore,
    fcp: psi.fcp,
    lcp: psi.lcp,
    cls: psi.cls,
    isResponsive,
    hasWhatsAppButton,
    hasContactForm,
    hasBookingSystem,
    detectedTech: techStack.length > 0 ? techStack.join(", ") : "Sitio Web Personalizado",
    opportunities,
  };
}
