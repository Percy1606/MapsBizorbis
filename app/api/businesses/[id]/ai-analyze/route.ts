import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeBusinessWithGemini } from "@/lib/gemini";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const business = await db.business.findUnique({
      where: { id: params.id },
      include: {
        audits: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });
    }

    const latestAudit = business.audits[0];

    // 1. Ejecutar análisis estructurado con Gemini AI
    const analysis = await analyzeBusinessWithGemini({
      name: business.name,
      category: business.category,
      city: business.city || "",
      address: business.address,
      phone: business.phone,
      website: business.website,
      rating: business.rating,
      reviewsCount: business.userRatingsTotal,
      audit: latestAudit
        ? {
            hasHttps: latestAudit.hasHttps,
            performanceScore: latestAudit.performanceScore,
            hasWhatsAppButton: latestAudit.hasWhatsAppButton,
            hasContactForm: latestAudit.hasContactForm,
            hasBookingSystem: latestAudit.hasBookingSystem,
            detectedTech: latestAudit.detectedTech,
            opportunities: latestAudit.opportunities ? JSON.parse(latestAudit.opportunities) : [],
          }
        : null,
    });

    // 2. Persistir en MySQL
    const savedAI = await db.aIAnalysis.create({
      data: {
        businessId: business.id,
        summary: analysis.summary,
        digitalStrengths: JSON.stringify(analysis.digitalStrengths),
        digitalWeaknesses: JSON.stringify(analysis.digitalWeaknesses),
        negativeFactors: JSON.stringify(analysis.negativeFactors || []),
        recommendedServices: JSON.stringify(analysis.recommendedServices),
        pitchProfessional: analysis.pitchProfessional,
        pitchFriendly: analysis.pitchFriendly,
        pitchDirect: analysis.pitchDirect,
        phoneScript: analysis.phoneScript,
        confidenceLevel: analysis.confidenceLevel,
      },
    });

    // 3. Actualizar estado en CRM si corresponde
    let nextStatus = business.crmStatus;
    if (["NUEVO", "PENDIENTE_ANALISIS", "ANALIZADO"].includes(business.crmStatus)) {
      nextStatus = "CONTACTO_PREPARADO";
    }

    const serviceNames = analysis.recommendedServices.map((s) => s.service);

    const updatedBusiness = await db.business.update({
      where: { id: business.id },
      data: {
        crmStatus: nextStatus,
        recommendedServices: JSON.stringify(serviceNames),
      },
    });

    return NextResponse.json({
      success: true,
      aiAnalysis: savedAI,
      business: updatedBusiness,
    });
  } catch (error: any) {
    console.error("Error en análisis con IA:", error);
    return NextResponse.json(
      { error: error.message || "Error al generar análisis con inteligencia artificial." },
      { status: 500 }
    );
  }
}
