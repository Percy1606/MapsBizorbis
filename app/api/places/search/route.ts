import { NextRequest, NextResponse } from "next/server";
import { searchBusinessesUniversal, SearchParams, PlaceResult } from "@/lib/places";
import { calculateCommercialScore } from "@/lib/scoring";
import { db } from "@/lib/db";

const COUNTRY_NAMES: Record<string, string> = {
  PE: "Perú",
  MX: "México",
  CO: "Colombia",
  CL: "Chile",
  AR: "Argentina",
  EC: "Ecuador",
  ES: "España",
  US: "Estados Unidos",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let location = (body.location || "Sechura, Piura").trim();
    const category = (body.category || "").trim();
    const country = (body.country || "PE").trim().toUpperCase();
    const radiusKm = Number(body.radiusKm) || 15;
    const maxResults = Number(body.maxResults) || 25;

    if (!location) {
      return NextResponse.json({ error: "La ubicación es requerida." }, { status: 400 });
    }

    // Si se especificó un país (distinto a GLOBAL), asegurar anclaje geográfico
    if (country && country !== "GLOBAL" && COUNTRY_NAMES[country]) {
      const countryName = COUNTRY_NAMES[country];
      const locLower = location.toLowerCase();
      if (!locLower.includes(countryName.toLowerCase())) {
        location = `${location}, ${countryName}`;
      }
    }

    const isAllCategories =
      !category ||
      ["todos", "todas", "all", "todos los rubros", "todas las empresas", "empresas", "general"].includes(
        category.toLowerCase()
      );

    let rawResults: PlaceResult[] = [];
    let sourceUsed: "google_places" | "openstreetmap" = "openstreetmap";
    let notice: string | undefined = undefined;

    // 1. Ejecutar búsqueda comercial universal (Overpass OSM, Google Places o Directorio Verificado)
    const effectiveCategory = isAllCategories ? "todos" : category;
    const searchData = await searchBusinessesUniversal({
      location,
      category: effectiveCategory,
      radiusKm,
      maxResults,
    });
    rawResults = searchData.results;
    sourceUsed = searchData.sourceUsed;
    notice = searchData.notice;

    // 2. Obtener lista de IDs ya guardados en MySQL para sincronizar estado
    const placeIds = rawResults.map((r) => r.placeId);
    const existingInDb = await db.business.findMany({
      where: {
        placeId: { in: placeIds },
      },
      select: {
        id: true,
        placeId: true,
        crmStatus: true,
        doNotContact: true,
        commercialScore: true,
        email: true,
        phone: true,
      },
    });

    const dbMap = new Map(existingInDb.map((e) => [e.placeId, e]));

    // Extracción automática de correos para los negocios con web al momento de la búsqueda
    const emailPromises = rawResults.map(async (item) => {
      const existing = item.placeId ? dbMap.get(item.placeId) : null;
      if (existing?.email && existing.email.includes("@")) return existing.email;
      if (item.email && item.email.includes("@")) return item.email;

      // Si tiene web, escanear rápidamente la página de inicio
      if (item.website && item.website.trim().length > 4) {
        try {
          const { safeFetchWebsite } = await import("@/lib/ssrf");
          const siteRes = await safeFetchWebsite(item.website, 256 * 1024, 2500);
          if (siteRes?.body) {
            const mailtoMatch = /href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i.exec(siteRes.body);
            if (mailtoMatch) return mailtoMatch[1].toLowerCase().trim();

            const textMatch = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.exec(siteRes.body);
            if (
              textMatch &&
              !textMatch[0].includes(".png") &&
              !textMatch[0].includes(".jpg") &&
              !textMatch[0].includes("example.com")
            ) {
              return textMatch[0].toLowerCase().trim();
            }
          }
        } catch {
          // Ignorar si el sitio web no responde a tiempo
        }
      }
      return undefined;
    });

    const detectedEmails = await Promise.all(emailPromises);

    // 3. Enriquecer con cálculo de score y estado en DB
    const enrichedResults = rawResults.map((item, idx) => {
      const existing = item.placeId ? dbMap.get(item.placeId) : null;
      const finalEmail = detectedEmails[idx] || existing?.email || item.email || undefined;
      const finalPhone = existing?.phone || item.phone || undefined;

      const scoreCalc = calculateCommercialScore({
        name: item.name,
        category: item.category,
        website: item.website,
        phone: finalPhone,
        rating: item.rating,
        userRatingsTotal: item.userRatingsTotal,
      });

      return {
        ...item,
        email: finalEmail,
        phone: finalPhone,
        isSaved: !!existing,
        savedId: existing?.id,
        crmStatus: existing?.crmStatus || "NUEVO",
        doNotContact: existing?.doNotContact || false,
        commercialScore: existing ? existing.commercialScore : scoreCalc.score,
        scoreConfidence: scoreCalc.confidence,
        opportunityLevel: scoreCalc.opportunityLevel,
        motivos: scoreCalc.motivos,
        recommendedBadges: scoreCalc.recommendedBadges,
        scoreFactors: scoreCalc.factors,
        negativeFactors: scoreCalc.negativeFactors,
        recommendedServices: scoreCalc.recommendedServices,
      };
    });

    // 3.5 Priorizar negocios con canales de comunicación (teléfono, correo, web) primero
    enrichedResults.sort((a, b) => {
      const getCommTier = (item: typeof a) => {
        const hasPhone = !!(item.phone && item.phone.trim().length >= 6);
        const hasEmail = !!(item.email && item.email.trim().length >= 4);
        const hasWeb = !!(item.website && item.website.trim().length >= 4);

        if (hasPhone && (hasEmail || hasWeb)) return 3;
        if (hasPhone || hasEmail) return 2;
        if (hasWeb) return 1;
        return 0;
      };

      const tierA = getCommTier(a);
      const tierB = getCommTier(b);

      if (tierB !== tierA) {
        return tierB - tierA; // Los que tienen medios de contacto aparecen primero
      }

      return (b.commercialScore || 50) - (a.commercialScore || 50);
    });

    // 4. Guardar registro en historial de búsquedas en segundo plano
    db.searchHistory.create({
      data: {
        queryLocation: location,
        queryCategory: isAllCategories ? "Todos los rubros" : category,
        radiusKm,
        resultsCount: enrichedResults.length,
        source: sourceUsed,
      },
    }).catch(() => {
      // Ignorar error no crítico
    });

    return NextResponse.json({
      success: true,
      query: {
        location,
        category: isAllCategories ? "Todos los rubros" : category,
        radiusKm,
        isAllCategories,
      },
      sourceUsed,
      notice,
      total: enrichedResults.length,
      results: enrichedResults,
    });
  } catch (error: any) {
    console.error("Error en API /api/places/search:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la búsqueda de negocios." },
      { status: 500 }
    );
  }
}
