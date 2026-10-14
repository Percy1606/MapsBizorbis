import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";
import { formatPhone } from "@/lib/utils";

function buildExportRows(businesses: any[], columns?: string[]) {
  return businesses.map((b, index) => {
    const phoneInfo = formatPhone(b.phone);
    const row: any = { "N°": index + 1 };

    const includeCol = (colKey: string) => !columns || columns.includes(colKey);

    if (includeCol("name")) row["Nombre del Negocio"] = b.name;
    if (includeCol("category")) row["Rubro / Categoría"] = b.category || "General";
    if (includeCol("address")) row["Dirección"] = b.address || b.city || "No detectado";
    if (includeCol("phone")) row["Teléfono"] = b.phone || "No detectado";
    if (includeCol("whatsapp")) row["Enlace WhatsApp"] = phoneInfo.waLink || "Sin número";
    if (includeCol("email")) row["Correo Electrónico"] = b.email || "No detectado";
    if (includeCol("website")) row["Sitio Web"] = b.website || "No detectado";
    if (includeCol("instagram")) row["Instagram"] = b.instagram || "No detectado";
    if (includeCol("facebook")) row["Facebook"] = b.facebook || "No detectado";
    if (includeCol("rating")) row["Calificación (Estrellas)"] = b.rating ? `${b.rating} ★ (${b.userRatingsTotal || 0} reseñas)` : "Sin información";
    if (includeCol("commercialScore")) row["Score Comercial (0-100)"] = b.commercialScore ?? 50;
    if (includeCol("opportunityLevel")) row["Nivel de Oportunidad"] = b.opportunityLevel || (b.commercialScore >= 70 ? "ALTA" : b.commercialScore >= 45 ? "MEDIA" : "BAJA");
    if (includeCol("crmStatus")) row["Estado en CRM"] = b.crmStatus || "NUEVO";
    if (includeCol("notes")) row["Notas"] = b.notes || "";

    return row;
  });
}

export async function GET() {
  try {
    const businesses = await db.business.findMany({
      orderBy: { commercialScore: "desc" },
    });

    const data = buildExportRows(businesses);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prospectos Radar");
    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Disposition": `attachment; filename="radar_clientes_${new Date().toISOString().split("T")[0]}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al exportar a Excel" }, { status: 500 });
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

    const data = buildExportRows(businesses, columns);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prospectos Radar");
    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Disposition": `attachment; filename="radar_clientes_${new Date().toISOString().split("T")[0]}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al exportar a Excel" }, { status: 500 });
  }
}
