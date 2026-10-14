import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const business = await db.business.findUnique({
      where: { id: params.id },
      include: {
        audits: { orderBy: { createdAt: "desc" } },
        aiAnalyses: { orderBy: { createdAt: "desc" } },
        contactLogs: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true, business });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al consultar negocio." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    // Si se marca como doNotContact, actualizar estado a NO_CONTACTAR
    if (body.doNotContact === true) {
      body.crmStatus = "NO_CONTACTAR";
    }

    const updated = await db.business.update({
      where: { id: params.id },
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        crmStatus: body.crmStatus,
        priority: body.priority,
        doNotContact: body.doNotContact,
        notes: body.notes,
        phone: body.phone,
        email: body.email,
        website: body.website,
        category: body.category,
        assignedTo: body.assignedTo,
        nextFollowUp: body.nextFollowUp !== undefined ? (body.nextFollowUp ? new Date(body.nextFollowUp) : null) : undefined,
        lastContactAt: body.lastContactAt !== undefined ? (body.lastContactAt ? new Date(body.lastContactAt) : null) : undefined,
        instagram: body.instagram,
        facebook: body.facebook,
        tiktok: body.tiktok,
      },
    });

    return NextResponse.json({ success: true, business: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al actualizar." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.business.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: "Negocio eliminado del CRM." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al eliminar." }, { status: 500 });
  }
}
