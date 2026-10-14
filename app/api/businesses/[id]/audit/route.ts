import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditWebsite } from "@/lib/audit";
import { calculateCommercialScore } from "@/lib/scoring";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const business = await db.business.findUnique({
      where: { id: params.id },
      include: { audits: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });
    }

    if (!business.website || business.website.trim() === "") {
      return NextResponse.json({ error: "Este negocio no tiene registrado un sitio web para auditar." }, { status: 400 });
    }

    // 1. Ejecutar auditoría protegida contra SSRF y con métricas PageSpeed
    const auditData = await auditWebsite(business.website);

    // 2. Guardar auditoría en MySQL
    const savedAudit = await db.websiteAudit.create({
      data: {
        businessId: business.id,
        url: auditData.url,
        httpStatus: auditData.httpStatus,
        hasHttps: auditData.hasHttps,
        performanceScore: auditData.performanceScore,
        mobileScore: auditData.mobileScore,
        desktopScore: auditData.desktopScore,
        fcp: auditData.fcp,
        lcp: auditData.lcp,
        cls: auditData.cls,
        isResponsive: auditData.isResponsive,
        hasWhatsAppButton: auditData.hasWhatsAppButton,
        hasContactForm: auditData.hasContactForm,
        hasBookingSystem: auditData.hasBookingSystem,
        detectedTech: auditData.detectedTech,
        opportunities: JSON.stringify(auditData.opportunities),
      },
    });

    // 3. Recalcular puntuación comercial con los nuevos hallazgos
    const scoreCalc = calculateCommercialScore({
      name: business.name,
      category: business.category,
      website: business.website,
      phone: business.phone,
      rating: business.rating,
      userRatingsTotal: business.userRatingsTotal,
      audits: [
        {
          httpStatus: auditData.httpStatus,
          hasHttps: auditData.hasHttps,
          performanceScore: auditData.performanceScore,
          hasWhatsAppButton: auditData.hasWhatsAppButton,
          hasContactForm: auditData.hasContactForm,
          hasBookingSystem: auditData.hasBookingSystem,
          detectedTech: auditData.detectedTech,
        },
      ],
    });

    const updatedBusiness = await db.business.update({
      where: { id: business.id },
      data: {
        commercialScore: scoreCalc.score,
        scoreConfidence: scoreCalc.confidence,
        scoreBreakdown: JSON.stringify(scoreCalc.factors),
        recommendedServices: JSON.stringify(scoreCalc.recommendedServices),
        priority: scoreCalc.score >= 70 ? "ALTA" : scoreCalc.score >= 45 ? "MEDIA" : "BAJA",
        crmStatus: business.crmStatus === "NUEVO" ? "ANALIZADO" : business.crmStatus,
      },
      include: {
        audits: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({
      success: true,
      audit: savedAudit,
      business: updatedBusiness,
    });
  } catch (error: any) {
    console.error("Error en auditoría:", error);
    return NextResponse.json(
      { error: error.message || "Error al ejecutar la auditoría digital." },
      { status: 500 }
    );
  }
}
