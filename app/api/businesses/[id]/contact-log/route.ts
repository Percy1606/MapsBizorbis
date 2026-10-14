import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { channel, tone, messageContent, scheduledFollowUp, newCrmStatus } = body;

    const business = await db.business.findUnique({
      where: { id: params.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });
    }

    if (business.doNotContact) {
      return NextResponse.json(
        { error: "Este negocio está en la lista de exclusión (No Contactar)." },
        { status: 400 }
      );
    }

    const log = await db.contactLog.create({
      data: {
        businessId: business.id,
        channel: channel || "WHATSAPP",
        tone,
        messageContent,
        scheduledFollowUp: scheduledFollowUp ? new Date(scheduledFollowUp) : null,
      },
    });

    const statusToSet = newCrmStatus || (business.crmStatus === "NUEVO" || business.crmStatus === "CONTACTO_PREPARADO" ? "CONTACTADO" : business.crmStatus);

    const updatedBusiness = await db.business.update({
      where: { id: business.id },
      data: {
        crmStatus: statusToSet,
      },
    });

    return NextResponse.json({
      success: true,
      log,
      business: updatedBusiness,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al registrar contacto." },
      { status: 500 }
    );
  }
}
