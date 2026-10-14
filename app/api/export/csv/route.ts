import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatPhone } from "@/lib/utils";

function buildCsvContent(businesses: any[], columns?: string[]) {
  const delimiter = ";";

  const allColsMap: Record<string, { label: string; getValue: (b: any) => any }> = {
    name: { label: "Nombre", getValue: (b) => b.name },
    category: { label: "Categoria", getValue: (b) => b.category || "General" },
    address: { label: "Direccion", getValue: (b) => b.address || b.city || "No detectado" },
    phone: { label: "Telefono", getValue: (b) => b.phone || "No detectado" },
    whatsapp: { label: "EnlaceWhatsApp", getValue: (b) => formatPhone(b.phone).waLink || "Sin numero" },
    email: { label: "CorreoElectronico", getValue: (b) => b.email || "No detectado" },
    website: { label: "SitioWeb", getValue: (b) => b.website || "No detectado" },
    instagram: { label: "Instagram", getValue: (b) => b.instagram || "No detectado" },
    facebook: { label: "Facebook", getValue: (b) => b.facebook || "No detectado" },
    rating: { label: "Rating", getValue: (b) => b.rating || "Sin calificar" },
    commercialScore: { label: "ScoreComercial", getValue: (b) => b.commercialScore ?? 50 },
    opportunityLevel: { label: "Oportunidad", getValue: (b) => b.opportunityLevel || (b.commercialScore >= 70 ? "ALTA" : b.commercialScore >= 45 ? "MEDIA" : "BAJA") },
    crmStatus: { label: "EstadoCRM", getValue: (b) => b.crmStatus || "NUEVO" },
    notes: { label: "Notas", getValue: (b) => b.notes || "" },
  };

  const selectedColKeys = columns && columns.length > 0
    ? columns.filter((c) => allColsMap[c])
    : Object.keys(allColsMap);

  const headerRow = selectedColKeys.map((k) => `"${allColsMap[k].label}"`).join(delimiter);

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const clean = String(val).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = businesses.map((b) => {
    return selectedColKeys.map((k) => escapeCsv(allColsMap[k].getValue(b))).join(delimiter);
  });

  return "\uFEFF" + [headerRow, ...rows].join("\r\n");
}

export async function GET() {
  try {
    const businesses = await db.business.findMany({
      orderBy: { commercialScore: "desc" },
    });

    const csvContent = buildCsvContent(businesses);

    return new NextResponse(csvContent, {
      headers: {
        "Content-Disposition": `attachment; filename="radar_clientes_excel_${new Date().toISOString().split("T")[0]}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al generar CSV" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let businesses = body.businesses;
    const columns = body.columns;

    if (!businesses || !Array.isArray(businesses) || businesses.length === 0) {
      businesses = await db.business.findMany({
        orderBy: { commercialScore: "desc" },
      });
    }

    const csvContent = buildCsvContent(businesses, columns);

    return new NextResponse(csvContent, {
      headers: {
        "Content-Disposition": `attachment; filename="radar_clientes_excel_${new Date().toISOString().split("T")[0]}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al generar CSV" }, { status: 500 });
  }
}
