import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateCommercialScore } from "@/lib/scoring";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const crmStatus = searchParams.get("crmStatus");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minScore = searchParams.get("minScore");

    const where: any = {};

    if (crmStatus && crmStatus !== "ALL") {
      where.crmStatus = crmStatus;
    }
    if (priority && priority !== "ALL") {
      where.priority = priority;
    }
    if (category) {
      where.category = { contains: category };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { address: { contains: search } },
      ];
    }
    if (minScore) {
      where.commercialScore = { gte: parseInt(minScore, 10) };
    }

    const businesses = await db.business.findMany({
      where,
      orderBy: { commercialScore: "desc" },
      include: {
        audits: { orderBy: { createdAt: "desc" }, take: 1 },
        aiAnalyses: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json({ success: true, count: businesses.length, businesses });
  } catch (error: any) {
    console.error("Error al obtener negocios:", error);
    return NextResponse.json({ error: error.message || "Error al consultar la base de datos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Permite guardar uno o varios negocios (batch import)
    const items = Array.isArray(body) ? body : [body];
    const saved = [];

    for (const item of items) {
      if (!item.name) continue;

      const scoreCalc = calculateCommercialScore({
        name: item.name,
        category: item.category || "General",
        website: item.website,
        phone: item.phone,
        rating: item.rating,
        userRatingsTotal: item.userRatingsTotal,
      });

      const priority = scoreCalc.score >= 70 ? "ALTA" : scoreCalc.score >= 45 ? "MEDIA" : "BAJA";

      const business = await db.business.upsert({
        where: {
          placeId: item.placeId || `custom_${Date.now()}_${Math.random()}`,
        },
        update: {
          name: item.name,
          category: item.category || "General",
          address: item.address,
          city: item.city,
          latitude: item.latitude || 0,
          longitude: item.longitude || 0,
          phone: item.phone,
          email: item.email,
          website: item.website,
          rating: item.rating,
          userRatingsTotal: item.userRatingsTotal,
          googleMapsUrl: item.googleMapsUrl,
          commercialScore: scoreCalc.score,
          scoreConfidence: scoreCalc.confidence,
          opportunityLevel: scoreCalc.opportunityLevel,
          scoreBreakdown: JSON.stringify(scoreCalc.factors),
          recommendedServices: JSON.stringify(scoreCalc.recommendedServices),
          crmStatus: item.crmStatus || undefined,
          notes: item.notes || undefined,
          assignedTo: item.assignedTo || undefined,
          nextFollowUp: item.nextFollowUp ? new Date(item.nextFollowUp) : undefined,
          lastContactAt: item.lastContactAt ? new Date(item.lastContactAt) : undefined,
          instagram: item.instagram || undefined,
          facebook: item.facebook || undefined,
          tiktok: item.tiktok || undefined,
        },
        create: {
          placeId: item.placeId || `custom_${Date.now()}_${Math.random()}`,
          name: item.name,
          category: item.category || "General",
          address: item.address,
          city: item.city,
          country: item.country || "Perú",
          latitude: item.latitude || 0,
          longitude: item.longitude || 0,
          phone: item.phone,
          email: item.email,
          website: item.website,
          rating: item.rating,
          userRatingsTotal: item.userRatingsTotal,
          googleMapsUrl: item.googleMapsUrl,
          source: item.source || "manual",
          isVerified: true,
          crmStatus: item.crmStatus || "NUEVO",
          priority,
          commercialScore: scoreCalc.score,
          scoreConfidence: scoreCalc.confidence,
          opportunityLevel: scoreCalc.opportunityLevel,
          scoreBreakdown: JSON.stringify(scoreCalc.factors),
          recommendedServices: JSON.stringify(scoreCalc.recommendedServices),
          notes: item.notes || null,
          assignedTo: item.assignedTo || "Sin asignar",
          nextFollowUp: item.nextFollowUp ? new Date(item.nextFollowUp) : null,
          lastContactAt: item.lastContactAt ? new Date(item.lastContactAt) : null,
          instagram: item.instagram || null,
          facebook: item.facebook || null,
          tiktok: item.tiktok || null,
        },
      });

      saved.push(business);
    }

    return NextResponse.json({ success: true, count: saved.length, businesses: saved });
  } catch (error: any) {
    console.error("Error al guardar negocio:", error);
    return NextResponse.json({ error: error.message || "Error al guardar en MySQL." }, { status: 500 });
  }
}
