export interface ScoreFactor {
  category: string;
  points: number; // positivo (+X) o negativo (-X)
  maxPoints?: number;
  type: "positive" | "negative";
  reason: string;
  evidence: string;
}

export interface ScoreResult {
  score: number; // 0 to 100
  confidence: number; // 0 to 100
  opportunityLevel: "ALTA" | "MEDIA" | "BAJA";
  motivos: string[];
  recommendedBadges: string[];
  factors: ScoreFactor[];
  negativeFactors: ScoreFactor[];
  recommendedServices: string[];
}

interface BusinessInput {
  name: string;
  category: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  rating?: number | null;
  userRatingsTotal?: number | null;
  doNotContact?: boolean;
  audits?: {
    httpStatus?: number | null;
    hasHttps?: boolean;
    performanceScore?: number | null;
    hasWhatsAppButton?: boolean;
    hasContactForm?: boolean;
    hasBookingSystem?: boolean;
    detectedTech?: string | null;
  }[];
}

const HIGH_NEED_CATEGORIES = [
  "restaurante", "restaurantes", "clinica", "clinicas", "dental", "odontologia",
  "hotel", "hoteles", "constructora", "constructoras", "inmobiliaria", "inmobiliarias",
  "ferreteria", "ferreterias", "taller", "talleres", "industrial", "educacion", "colegio"
];

export function calculateCommercialScore(business: BusinessInput): ScoreResult {
  const factors: ScoreFactor[] = [];
  let totalScore = 0;
  let totalConfidence = 20; // Base de confianza inicial
  const recommendedServices: string[] = [];

  const latestAudit = business.audits && business.audits.length > 0 ? business.audits[0] : null;
  const categoryLower = (business.category || "").toLowerCase();
  const hasHighNeedCategory = HIGH_NEED_CATEGORIES.some((c) => categoryLower.includes(c));

  // ==========================================================
  // FACTORES POSITIVOS (OPORTUNIDADES DE VENTA)
  // ==========================================================

  // 1. Presencia Web y Necesidad de Desarrollo (Máx 35 pts)
  if (!business.website || business.website.trim() === "") {
    totalScore += 30;
    totalConfidence += 20;
    recommendedServices.push("Desarrollo de Página Web Corporativa / Landing Page");
    factors.push({
      category: "Presencia Web",
      points: 30,
      maxPoints: 35,
      type: "positive",
      reason: "No cuenta con sitio web registrado en mapas",
      evidence: "Sin URL en ficha pública. Oportunidad prioritaria para ofrecer desarrollo web y catálogo online.",
    });
  } else if (latestAudit) {
    totalConfidence += 35; // Auditoría técnica real ejecutada
    let auditPoints = 0;
    const auditEvidence: string[] = [];

    if (!latestAudit.hasHttps) {
      auditPoints += 10;
      auditEvidence.push("Sitio web sin certificado SSL/HTTPS activo");
      recommendedServices.push("Migración y Aseguramiento Web HTTPS");
    }

    if (latestAudit.performanceScore !== null && latestAudit.performanceScore !== undefined) {
      if (latestAudit.performanceScore < 50) {
        auditPoints += 15;
        auditEvidence.push(`Rendimiento móvil crítico (${latestAudit.performanceScore}/100 PageSpeed)`);
        recommendedServices.push("Rediseño y Optimización de Velocidad / Core Web Vitals");
      } else if (latestAudit.performanceScore < 75) {
        auditPoints += 8;
        auditEvidence.push(`Rendimiento web regular (${latestAudit.performanceScore}/100 PageSpeed)`);
      }
    }

    if (!latestAudit.hasBookingSystem && hasHighNeedCategory) {
      auditPoints += 8;
      auditEvidence.push("Sin sistema de reservas, citas o pedidos en línea detectado");
      recommendedServices.push("Sistema de Reservas y Citas Automatizadas");
    }

    if (!latestAudit.hasWhatsAppButton) {
      auditPoints += 5;
      auditEvidence.push("Sin botón directo de WhatsApp en la web");
      recommendedServices.push("Chatbot y Agente de WhatsApp con IA");
    }

    const cappedPoints = Math.min(35, auditPoints);
    totalScore += cappedPoints;
    factors.push({
      category: "Auditoría Web",
      points: cappedPoints,
      maxPoints: 35,
      type: "positive",
      reason: auditPoints > 0 ? "Oportunidades técnicas y de conversión detectadas en la web" : "Sitio web existente con buen desempeño",
      evidence: auditEvidence.length > 0 ? auditEvidence.join("; ") : "Sitio web activo con métricas aceptables.",
    });
  } else {
    // Tiene web pero pendiente de auditar
    totalScore += 10;
    totalConfidence += 15;
    factors.push({
      category: "Presencia Web",
      points: 10,
      maxPoints: 35,
      type: "positive",
      reason: "Cuenta con sitio web pero pendiente de auditoría profunda",
      evidence: `URL: ${business.website}. Requiere auditar Core Web Vitals y formularios.`,
    });
  }

  // 2. Canales de Contacto Directo (Máx 25 pts)
  if (business.phone && business.phone.trim().length >= 7) {
    totalScore += 20;
    totalConfidence += 20;
    factors.push({
      category: "Canal Telefónico / WhatsApp",
      points: 20,
      maxPoints: 25,
      type: "positive",
      reason: "Dispone de número telefónico verificado",
      evidence: `Teléfono ${business.phone} disponible para prospección comercial directa o WhatsApp.`,
    });
    if (!recommendedServices.includes("Chatbot y Agente de WhatsApp con IA")) {
      recommendedServices.push("Chatbot y Agente de WhatsApp con IA");
    }
  }

  // 3. Actividad y Solvencia Comercial (Máx 20 pts)
  const rating = business.rating || 0;
  const reviews = business.userRatingsTotal || 0;

  if (rating >= 4.0 && reviews >= 10) {
    totalScore += 20;
    totalConfidence += 15;
    factors.push({
      category: "Solvencia y Reputación",
      points: 20,
      maxPoints: 20,
      type: "positive",
      reason: "Negocio activo con alta reputación y clientela establecida",
      evidence: `${rating} ★ basado en ${reviews} opiniones de clientes reales. Alta probabilidad de presupuesto.`,
    });
  } else if (reviews > 0) {
    totalScore += 12;
    totalConfidence += 10;
    factors.push({
      category: "Solvencia y Reputación",
      points: 12,
      maxPoints: 20,
      type: "positive",
      reason: "Negocio con actividad moderada",
      evidence: `${rating} ★ con ${reviews} opiniones.`,
    });
  }

  // 4. Afinidad del Sector con Soluciones de Software (Máx 20 pts)
  if (hasHighNeedCategory) {
    totalScore += 20;
    totalConfidence += 10;
    factors.push({
      category: "Afinidad del Sector",
      points: 20,
      maxPoints: 20,
      type: "positive",
      reason: "Rubro con alta demanda de automatización y software especializado",
      evidence: `Sector '${business.category}' se beneficia directamente de sistemas ERP, CRM y reservas.`,
    });
    recommendedServices.push("Sistemas de Gestión, Inventarios y CRM");
  } else {
    totalScore += 10;
    factors.push({
      category: "Afinidad del Sector",
      points: 10,
      maxPoints: 20,
      type: "positive",
      reason: "Sector con potencial estándar de digitalización",
      evidence: `Categoría: ${business.category || "General"}.`,
    });
  }

  // ==========================================================
  // FACTORES NEGATIVOS Y PENALIZACIONES DE RIESGO COMERCIAL
  // ==========================================================

  // Penalización 1: Fricción Extrema de Contacto (-15 pts)
  // Si no tiene teléfono ni web ni correo electrónico
  const hasPhone = !!(business.phone && business.phone.trim().length >= 6);
  const hasWeb = !!(business.website && business.website.trim().length >= 4);
  const hasEmail = !!(business.email && business.email.trim().length >= 4);

  if (!hasPhone && !hasWeb && !hasEmail) {
    totalScore -= 15;
    factors.push({
      category: "Barrera de Contacto",
      points: -15,
      type: "negative",
      reason: "Sin canales de contacto digital o telefónico detectados",
      evidence: "No se encontró teléfono, correo ni web en los registros públicos. Requiere prospección presencial o búsqueda externa en Google Maps.",
    });
  }

  // Penalización 2: Reputación Crítica Negativa (-15 pts)
  // Negocios con calificación menor a 3.2 y varias quejas de clientes
  if (rating > 0 && rating < 3.2 && reviews >= 3) {
    totalScore -= 15;
    factors.push({
      category: "Riesgo de Reputación",
      points: -15,
      type: "negative",
      reason: "Baja calificación de clientes y quejas públicas",
      evidence: `Calificación deficiente de ${rating} ★ con ${reviews} opiniones. Riesgo de insolvencia o conflictos de servicio con proveedores.`,
    });
  }

  // Penalización 3: Web Ya Completamente Optimizada (-15 pts)
  // Si ya tiene un sitio moderno, rapidísimo (>80), seguro y con reservas
  if (latestAudit && latestAudit.hasHttps && (latestAudit.performanceScore || 0) >= 80 && latestAudit.hasBookingSystem && latestAudit.hasWhatsAppButton) {
    totalScore -= 15;
    factors.push({
      category: "Madurez Digital Avanzada",
      points: -15,
      type: "negative",
      reason: "Sitio web existente con alto nivel de optimización técnica y conversión",
      evidence: `PageSpeed ${latestAudit.performanceScore}/100 con HTTPS, botón WhatsApp y reservas activas. Muy baja necesidad de rediseño web tradicional.`,
    });
  }

  // Penalización 4: Lista de Exclusión (No Contactar) (-40 pts)
  if (business.doNotContact) {
    totalScore -= 40;
    factors.push({
      category: "Lista de Exclusión",
      points: -40,
      type: "negative",
      reason: "Negocio marcado como 'No Contactar' en el CRM",
      evidence: "El negocio solicitó formalmente no recibir propuestas comerciales o fue descartado por el equipo.",
    });
  }

  // Si no se asignaron servicios específicos, agregar estándar
  if (recommendedServices.length === 0) {
    recommendedServices.push("Desarrollo Web y Presencia Digital", "Automatización de Procesos");
  }

  const finalScore = Math.min(100, Math.max(0, totalScore));
  const negativeFactors = factors.filter((f) => f.type === "negative");

  // Nivel de oportunidad
  const opportunityLevel: "ALTA" | "MEDIA" | "BAJA" =
    finalScore >= 70 ? "ALTA" : finalScore >= 45 ? "MEDIA" : "BAJA";

  // Motivos claros con viñetas
  const motivos: string[] = [];
  if (!business.website || business.website.trim() === "") {
    motivos.push("No tiene página web");
  } else if (latestAudit && (!latestAudit.hasHttps || (latestAudit.performanceScore || 100) < 60)) {
    motivos.push("Página web con oportunidades de mejora técnica");
  }

  if (business.rating && business.rating >= 4.0) {
    motivos.push("Tiene buena reputación");
  } else if (business.rating && business.rating > 0) {
    motivos.push(`Calificación de clientes (${business.rating}★)`);
  }

  if (business.phone && business.phone.trim().length >= 6) {
    motivos.push("Tiene teléfono");
  }

  motivos.push("Tiene presencia en Google Maps");

  if (negativeFactors.length > 0) {
    negativeFactors.forEach((nf) => {
      motivos.push(`⚠️ Riesgo: ${nf.category}`);
    });
  }

  // Badges visuales de servicios recomendados
  const recommendedBadges: string[] = [];
  if (!business.website || business.website.trim() === "") {
    recommendedBadges.push("🌐 Página Web");
  }
  if (!latestAudit || !latestAudit.hasWhatsAppButton || business.phone) {
    recommendedBadges.push("📱 Integración WhatsApp");
  }
  if (hasHighNeedCategory) {
    recommendedBadges.push("💼 Sistema de Gestión / Citas");
  }

  return {
    score: finalScore,
    confidence: Math.min(100, Math.max(10, totalConfidence)),
    opportunityLevel,
    motivos: Array.from(new Set(motivos)),
    recommendedBadges: Array.from(new Set(recommendedBadges)),
    factors,
    negativeFactors,
    recommendedServices: Array.from(new Set(recommendedServices)),
  };
}
