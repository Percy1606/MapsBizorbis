import { NextResponse } from "next/server";
import { getAppSettings, updateAppSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getAppSettings();
    // No exponer la contraseña real en la respuesta JSON por seguridad
    const safeSettings = {
      ...settings,
      adminPassword: "",
    };
    return NextResponse.json(safeSettings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al cargar configuración" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Si la contraseña viene vacía o no se especificó, no sobrescribir la contraseña existente
    if (!body.adminPassword || typeof body.adminPassword !== "string" || body.adminPassword.trim() === "") {
      delete body.adminPassword;
    }
    const updated = await updateAppSettings(body);
    const safeUpdated = {
      ...updated,
      adminPassword: "",
    };
    return NextResponse.json({ success: true, settings: safeUpdated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al guardar configuración" }, { status: 500 });
  }
}
