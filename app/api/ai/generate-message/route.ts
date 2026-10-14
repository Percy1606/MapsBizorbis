import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAppSettings, interpolateTemplate } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business, channel = "WhatsApp", objective = "Primer contacto" } = body;

    if (!business || !business.name) {
      return NextResponse.json({ error: "Datos del negocio incompletos" }, { status: 400 });
    }

    const settings = await getAppSettings();
    const apiKey = process.env.GEMINI_API_KEY;

    const companyName = settings.companyName || "Mi Agencia Tech";
    const companyServices = settings.companyServices || "Desarrollo web corporativo y automatización";
    const commercialSign = settings.commercialSign || "Atentamente,\nEquipo Comercial";

    const templateVariables = {
      nombre: business.name || "Equipo",
      rubro: business.category || "su rubro",
      ciudad: business.city || business.address || "su zona",
      mi_empresa: companyName,
      mi_firma: commercialSign,
      precio_web: settings.priceWeb || "Desde S/499",
      mi_telefono: settings.companyPhone || "",
      mi_portafolio: settings.companyPortfolioUrl || "",
    };

    const prompt = `
Eres un especialista en ventas consultivas B2B y redacción comercial para empresas de software y servicios digitales.
Tu objetivo es redactar un mensaje hiperpersonalizado, honesto y persuasivo para el siguiente negocio real:

DATOS VERIFICADOS DEL PROSPECTO:
- Nombre: "${business.name}"
- Rubro/Categoría: "${business.category || 'General'}"
- Ubicación: "${business.city || business.address || 'Perú'}"
- Sitio Web: ${business.website ? `Tiene web (${business.website})` : 'NO tiene página web detectada'}
- Teléfono: ${business.phone ? `Teléfono ${business.phone}` : 'No detectado en registros públicos'}
- Calificación: ${business.rating ? `${business.rating} ★ (${business.userRatingsTotal || 0} reseñas)` : 'Sin calificaciones registradas'}
- Score de Oportunidad Comercial: ${business.commercialScore || 50}/100

DATOS DE MI AGENCIA EMISORA:
- Nombre de la agencia: "${companyName}"
- Catálogo de servicios: "${companyServices}"
- Firma: "${commercialSign}"
${settings.companyPhone ? `- Teléfono de contacto de la agencia: "${settings.companyPhone}"` : ''}
${settings.companyPortfolioUrl ? `- Portafolio de la agencia: "${settings.companyPortfolioUrl}"` : ''}

PARÁMETROS DE LA COMUNICACIÓN:
- Canal seleccionado: ${channel}
- Objetivo de la comunicación: ${objective} (Opciones: Primer contacto, Ofrecer página web, Ofrecer marketing digital, Seguimiento, Cotización).
- Tono configurado: ${settings.aiTone || 'consultivo'} (estilo consultivo, empático, profesional y directo).
${settings.aiCustomInstructions ? `- Directivas comerciales obligatorias de la agencia: "${settings.aiCustomInstructions}"` : ''}

REGLAS ESTRICTAS:
1. NO inventes hechos, clientes o métricas inexistentes.
2. Si no tiene web, haz énfasis en la ventaja de crear su presencia en Google para captar más clientes.
3. Si ya tiene web, enfócate en optimización, automatización de WhatsApp o chatbots de atención rápida.
4. Mantén un tono respetuoso, empático y centrado en aportarle valor concreto a "${business.name}".
5. Devuelve ÚNICAMENTE el texto final del mensaje listo para ser enviado (incluyendo firma).
`;

    let generatedText = "";

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        generatedText = result.response.text().trim();
      } catch (geminiError) {
        console.warn("Fallo llamada a Gemini API, usando plantilla configurada en el sistema:", geminiError);
      }
    }

    if (!generatedText) {
      // Usar plantillas personalizadas configuradas en /configuracion con variables dinámicas
      if (channel === "WhatsApp") {
        if (objective === "Primer contacto" || objective === "Ofrecer página web" || objective === "Ofrecer marketing digital") {
          generatedText = interpolateTemplate(settings.templateWhatsAppFirst, templateVariables);
        } else if (objective === "Seguimiento") {
          generatedText = interpolateTemplate(settings.templateWhatsAppFollowup, templateVariables);
        } else if (objective === "Cotización") {
          generatedText = interpolateTemplate(settings.templateWhatsAppQuote, templateVariables);
        } else {
          generatedText = interpolateTemplate(settings.templateWhatsAppFirst, templateVariables);
        }
      } else if (channel === "Email") {
        const subject = interpolateTemplate(settings.templateEmailSubject, templateVariables);
        const bodyText = interpolateTemplate(settings.templateEmailBody, templateVariables);
        generatedText = `Asunto: ${subject}\n\n${bodyText}`;
      } else {
        // Redes sociales (Instagram, Facebook)
        generatedText = `¡Hola ${business.name}! Estuvimos revisando el gran trabajo que hacen en ${business.category || 'su rubro'}. Les escribe ${companyName}. Vemos una gran oportunidad para atraer más clientes directos con presencia web moderna. Si les interesa, con gusto les compartimos una propuesta rápida por aquí. ¡Éxitos!\n\n${commercialSign}`;
      }
    }

    return NextResponse.json({
      success: true,
      channel,
      objective,
      message: generatedText,
    });
  } catch (error: any) {
    console.error("Error al generar mensaje:", error);
    return NextResponse.json({ error: error.message || "Error al generar mensaje." }, { status: 500 });
  }
}
