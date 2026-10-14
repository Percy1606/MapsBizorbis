import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIAnalysisOutput {
  summary: string;
  digitalStrengths: string[];
  digitalWeaknesses: string[];
  negativeFactors: string[];
  recommendedServices: {
    service: string;
    rationale: string;
  }[];
  pitchProfessional: string;
  pitchFriendly: string;
  pitchDirect: string;
  phoneScript: string;
  confidenceLevel: "ALTA" | "MEDIA" | "BAJA";
}

interface AIAnalysisInput {
  name: string;
  category: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
  audit?: {
    hasHttps?: boolean;
    performanceScore?: number | null;
    hasWhatsAppButton?: boolean;
    hasContactForm?: boolean;
    hasBookingSystem?: boolean;
    detectedTech?: string | null;
    opportunities?: string[];
  } | null;
}

export async function analyzeBusinessWithGemini(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  const companyServices = process.env.COMPANY_SERVICES || "Desarrollo web, Sistemas de gestión ERP/CRM, Chatbots de WhatsApp con IA, Automatización de procesos";

  if (!apiKey || apiKey.trim().length < 10) {
    return generateFallbackAIAnalysis(input);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Eres un consultor senior de ventas B2B y especialista en software para empresas de tecnología.
Tu tarea es analizar los siguientes datos REALES de un negocio prospecto y generar un diagnóstico comercial honesto, sin exagerar ni inventar datos que no se hayan verificado.
Identifica tanto las oportunidades como los FACTORES NEGATIVOS O RIESGOS COMERCIALES que puedan dificultar el cierre.

DATOS DEL NEGOCIO:
- Nombre: "${input.name}"
- Rubro/Categoría: "${input.category}"
- Ubicación: "${input.city || input.address || 'Perú'}"
- Teléfono: "${input.phone || 'No registrado'}"
- Sitio Web: "${input.website || 'No tiene sitio web detectado'}"
- Valoración: ${input.rating ? `${input.rating} estrellas (${input.reviewsCount || 0} reseñas)` : 'Sin reseñas'}
- Auditoría Web: ${
      input.audit
        ? JSON.stringify({
            https: input.audit.hasHttps,
            rendimientoPageSpeed: input.audit.performanceScore,
            botonWhatsApp: input.audit.hasWhatsAppButton,
            formularioContacto: input.audit.hasContactForm,
            sistemaReservas: input.audit.hasBookingSystem,
            tecnologia: input.audit.detectedTech,
            oportunidadesDetectadas: input.audit.opportunities,
          })
        : 'Pendiente de auditoría o sin sitio web'
    }

CATÁLOGO DE SERVICIOS DE MI EMPRESA:
${companyServices}

INSTRUCCIONES CLAVE:
1. Sé 100% realista: Si no tiene web, la oportunidad principal es crear su presencia digital o catálogo online.
2. Identifica los FACTORES NEGATIVOS reales (ej. falta de canal telefónico directo, bajo presupuesto aparente, malas reseñas si existen, o sitio web ya muy avanzado que no requiere rediseño).
3. Genera 3 borradores de mensajes de contacto para WhatsApp o correo:
   - Profesional (formal, respetuoso)
   - Cercano (amigable, enfocado en ayudarle a conseguir más clientes)
   - Directo (corto, al grano, con llamado a la acción claro)
4. Crea un guion de llamada telefónica (phoneScript) con puntos clave para romper el hielo.

RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO CON ESTA ESTRUCTURA EXACTA (SIN MARKDOWN NI TEXTO EXTRA):
{
  "summary": "Resumen conciso del giro del negocio",
  "digitalStrengths": ["Fortaleza 1 real comprobada"],
  "digitalWeaknesses": ["Carencia 1 con evidencia comprobada"],
  "negativeFactors": ["Factor negativo o riesgo comercial 1", "Factor negativo 2"],
  "recommendedServices": [
    { "service": "Nombre del servicio", "rationale": "Por qué le aportará valor a este negocio específico" }
  ],
  "pitchProfessional": "Texto del mensaje profesional...",
  "pitchFriendly": "Texto del mensaje cercano...",
  "pitchDirect": "Texto del mensaje directo...",
  "phoneScript": "Puntos clave para llamada comercial...",
  "confidenceLevel": "ALTA" | "MEDIA" | "BAJA"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanJson = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed: AIAnalysisOutput = JSON.parse(cleanJson);
    if (!parsed.negativeFactors) {
      parsed.negativeFactors = [];
    }
    return parsed;
  } catch (error) {
    console.warn("Fallo o cuota en Gemini API, utilizando motor de diagnóstico heurístico:", error);
    return generateFallbackAIAnalysis(input);
  }
}

function generateFallbackAIAnalysis(input: AIAnalysisInput): AIAnalysisOutput {
  const hasWeb = !!(input.website && input.website.trim().length > 3);
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const negativeFactors: string[] = [];
  const services: { service: string; rationale: string }[] = [];

  if (input.rating && input.rating >= 4.0) {
    strengths.push(`Buena reputación local (${input.rating}★ con ${input.reviewsCount || 0} reseñas).`);
  } else if (input.rating && input.rating < 3.2 && (input.reviewsCount || 0) >= 2) {
    negativeFactors.push(`Calificación baja de usuarios (${input.rating}★). Posibles quejas en la atención al cliente.`);
  }

  if (input.phone) {
    strengths.push(`Canal telefónico accesible para contacto directo.`);
  } else {
    negativeFactors.push(`Sin número telefónico oficial en los registros abiertos. Dificulta el contacto rápido.`);
  }

  if (!hasWeb) {
    weaknesses.push(`No dispone de página web oficial verificada en internet.`);
    negativeFactors.push(`Poca familiaridad aparente con canales digitales. Puede requerir mayor educación sobre el retorno de inversión.`);
    services.push({
      service: "Desarrollo de Página Web y Catálogo Digital",
      rationale: `Permite a los clientes de ${input.name} encontrar sus servicios, horarios y contactarlos directamente en Google sin intermediarios.`,
    });
  } else {
    strengths.push(`Cuenta con sitio web activo (${input.website}).`);
    if (input.audit) {
      if (!input.audit.hasWhatsAppButton) {
        weaknesses.push("La página web no cuenta con botón directo de WhatsApp visible.");
        services.push({
          service: "Agente de WhatsApp con Inteligencia Artificial",
          rationale: `Automatiza la atención y captación de clientes las 24 horas del día respondiendo dudas y cotizaciones al instante.`,
        });
      }
      if (input.audit.performanceScore && input.audit.performanceScore < 50) {
        weaknesses.push(`Velocidad de carga móvil deficiente (${input.audit.performanceScore}/100 PageSpeed).`);
        services.push({
          service: "Optimización de Rendimiento y Core Web Vitals",
          rationale: `Acelera la carga en celulares para no perder clientes que abandonan el sitio por lentitud.`,
        });
      } else if (input.audit.performanceScore && input.audit.performanceScore >= 85) {
        negativeFactors.push(`El sitio web actual tiene muy buen rendimiento (${input.audit.performanceScore}/100). No hay dolor evidente en rediseño web.`);
      }
    }
  }

  // Servicio de gestión para categorías operativas
  services.push({
    service: "Sistema de Gestión y Automatización de Procesos",
    rationale: `Optimiza el control interno de citas, inventario o seguimiento de clientes para ${input.name}.`,
  });

  const pitchProfessional = `Estimados ${input.name}, espero se encuentren muy bien. Mi nombre es especialista de soluciones tecnológicas. Notamos la destacada actividad de su empresa en el rubro de ${input.category} en ${input.city || "su zona"} y hemos identificado una gran oportunidad para potenciar su captación de clientes mediante ${services[0].service.toLowerCase()}. Nos encantaría presentarles una breve propuesta sin compromiso. ¿Tendrían 5 minutos esta semana para conversar?`;

  const pitchFriendly = `¡Hola equipo de ${input.name}! Un gusto saludarlos. Vemos que vienen haciendo un gran trabajo en ${input.category}. Revisando su presencia digital, preparamos unas mejoras puntuales para ayudarles a conseguir más clientes con ${services[0].service.toLowerCase()}. Si les parece interesante, les comparto el detalle por aquí. ¡Saludos!`;

  const pitchDirect = `Hola ${input.name}. Ayudamos a empresas de ${input.category} a captar más clientes y automatizar procesos con soluciones de software a medida. ¿Tienen disponibilidad mañana para una rápida llamada de 5 minutos y mostrarles cómo podemos apoyarlos?`;

  const phoneScript = `1. Saludo breve y confirmar que hablas con el encargado comercial de ${input.name}.\n2. Elogiar su posición en el sector de ${input.category}.\n3. Plantear problema identificado: "${weaknesses[0] || 'la necesidad de automatizar la atención a clientes'}".\n4. Proponer solución: "${services[0].service}".\n5. Solicitar reunión virtual de 10 minutos.`;

  return {
    summary: `Empresa del sector ${input.category} con actividad comercial identificada en ${input.city || "la región"}.`,
    digitalStrengths: strengths.length > 0 ? strengths : ["Negocio con presencia comercial activa."],
    digitalWeaknesses: weaknesses.length > 0 ? weaknesses : ["Oportunidades de automatización comercial por evaluar."],
    negativeFactors: negativeFactors.length > 0 ? negativeFactors : ["Ningún riesgo crítico detectado en la información disponible."],
    recommendedServices: services,
    pitchProfessional,
    pitchFriendly,
    pitchDirect,
    phoneScript,
    confidenceLevel: hasWeb && input.audit ? "ALTA" : "MEDIA",
  };
}
