import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Caché en memoria de 5 segundos para estadísticas rápidas
let cachedStats: { data: any; timestamp: number } | null = null;
const STATS_CACHE_TTL = 5000;

export async function GET() {
  try {
    const nowTime = Date.now();
    if (cachedStats && nowTime - cachedStats.timestamp < STATS_CACHE_TTL) {
      return NextResponse.json(cachedStats.data, {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
        },
      });
    }

    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Ejecutar todas las consultas de forma concurrente con Promise.all
    const [
      totalBusinesses,
      withWeb,
      highPriority,
      statusGroups,
      requierenSeguimientoHoy,
      recentLogs,
      recentAdded,
      categoryStats,
      recentProspects,
    ] = await Promise.all([
      db.business.count(),
      db.business.count({
        where: {
          website: { not: null },
          NOT: { website: "" },
        },
      }),
      db.business.count({
        where: {
          OR: [
            { priority: "ALTA" },
            { commercialScore: { gte: 70 } },
          ],
        },
      }),
      // Una sola consulta agrupada para todos los estados de CRM en lugar de 8 consultas individuales
      db.business.groupBy({
        by: ["crmStatus"],
        _count: { id: true },
      }),
      db.business.count({
        where: {
          nextFollowUp: { lte: endOfToday },
          crmStatus: { notIn: ["GANADO", "PERDIDO", "NO_CONTACTAR"] },
        },
      }),
      db.contactLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { business: { select: { name: true } } },
      }),
      db.business.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          crmStatus: true,
          createdAt: true,
        },
      }),
      db.business.groupBy({
        by: ["category"],
        _count: { id: true },
        _avg: { commercialScore: true },
        orderBy: { _count: { id: "desc" } },
        take: 6,
      }),
      db.business.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          name: true,
          category: true,
          city: true,
          crmStatus: true,
          commercialScore: true,
          priority: true,
          phone: true,
          website: true,
          nextFollowUp: true,
        },
      }),
    ]);

    const withoutWeb = totalBusinesses - withWeb;

    // Mapear los grupos de estado rápidamente con Map O(1)
    const statusMap = new Map<string, number>();
    for (const g of statusGroups) {
      statusMap.set(g.crmStatus, g._count.id);
    }

    const nuevo = statusMap.get("NUEVO") || 0;
    const contactados = statusMap.get("CONTACTADO") || 0;
    const interesados = statusMap.get("INTERESADO") || 0;
    const cotizaciones = (statusMap.get("COTIZACION") || 0) + (statusMap.get("PROPUESTA_ENVIADA") || 0);
    const seguimiento = statusMap.get("SEGUIMIENTO") || 0;
    const ganados = statusMap.get("GANADO") || 0;
    const perdidos = statusMap.get("PERDIDO") || 0;

    // Conversion rate
    const totalGestionados = contactados + interesados + cotizaciones + seguimiento + ganados + perdidos;
    const conversionRate = totalGestionados > 0 ? Number(((ganados / totalGestionados) * 100).toFixed(1)) : 0;

    // Status breakdown for graph
    const statusDistribution = [
      { status: "Nuevo", count: nuevo, color: "#64748b" },
      { status: "Contactado", count: contactados, color: "#2563eb" },
      { status: "Interesado", count: interesados, color: "#f59e0b" },
      { status: "Cotización", count: cotizaciones, color: "#9333ea" },
      { status: "Seguimiento", count: seguimiento, color: "#4f46e5" },
      { status: "Ganado", count: ganados, color: "#10b981" },
      { status: "Perdido", count: perdidos, color: "#ef4444" },
    ];

    const recentActivity = [
      ...recentLogs.map((l) => ({
        text: `${l.business.name} contactado vía ${l.channel}`,
        date: l.createdAt,
      })),
      ...recentAdded.map((a) => ({
        text: `${a.name} registrado en CRM (${a.crmStatus})`,
        date: a.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const payload = {
      success: true,
      totals: {
        totalBusinesses,
        withWeb,
        withoutWeb,
        highPriority,
        nuevo,
        contactados,
        interesados,
        cotizaciones,
        seguimiento,
        ganados,
        perdidos,
        conversionRate,
        requierenSeguimientoHoy,
      },
      statusDistribution,
      recentActivity,
      nicheRadar: categoryStats.map((c) => ({
        category: c.category,
        count: c._count.id,
        avgScore: Math.round(c._avg.commercialScore || 0),
      })),
      recentProspects,
    };

    cachedStats = { data: payload, timestamp: nowTime };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
      },
    });
  } catch (error: any) {
    console.error("Error en estadísticas CRM:", error);
    return NextResponse.json(
      { error: error.message || "Error al calcular estadísticas." },
      { status: 500 }
    );
  }
}

