import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { safeFetchWebsite } from "@/lib/ssrf";

const INVALID_EMAIL_PATTERNS = [
  /\.(png|jpg|jpeg|gif|webp|svg|css|js|ico|woff|woff2)$/i,
  /example\.com/i,
  /domain\.com/i,
  /email\.com/i,
  /sentry\.io/i,
  /wixpress\.com/i,
  /yourdomain/i,
  /test@/i,
  /placeholder/i,
  /bootstrap/i,
  /wordpress/i,
];

function extractEmails(html: string): string[] {
  const emails: Set<string> = new Set();

  // 1. Buscar en mailto:
  const mailtoRegex = /href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/gi;
  let match;
  while ((match = mailtoRegex.exec(html)) !== null) {
    const email = match[1].toLowerCase().trim();
    if (!INVALID_EMAIL_PATTERNS.some((p) => p.test(email))) {
      emails.add(email);
    }
  }

  // 2. Expresión regular en texto HTML
  const textRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  while ((match = textRegex.exec(html)) !== null) {
    const email = match[0].toLowerCase().trim();
    if (!INVALID_EMAIL_PATTERNS.some((p) => p.test(email))) {
      emails.add(email);
    }
  }

  return Array.from(emails);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const business = await db.business.findUnique({
      where: { id: params.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });
    }

    // Si ya tiene correo guardado, retornarlo
    if (business.email && business.email.trim().length > 4) {
      return NextResponse.json({ success: true, email: business.email, source: "database" });
    }

    let foundEmail: string | null = null;

    // 1. Escaneo en sitio web si tiene URL
    if (business.website && business.website.trim().length > 3) {
      try {
        const homeRes = await safeFetchWebsite(business.website);
        if (homeRes.body) {
          const homeEmails = extractEmails(homeRes.body);
          if (homeEmails.length > 0) {
            foundEmail = homeEmails[0];
          } else {
            // Probar subpáginas comunes de contacto
            const baseUrl = homeRes.finalUrl.replace(/\/$/, "");
            for (const sub of ["/contacto", "/contact", "/contactenos", "/nosotros"]) {
              try {
                const subRes = await safeFetchWebsite(`${baseUrl}${sub}`, 1024 * 1024, 4000);
                if (subRes.body) {
                  const subEmails = extractEmails(subRes.body);
                  if (subEmails.length > 0) {
                    foundEmail = subEmails[0];
                    break;
                  }
                }
              } catch {
                // ignorar timeout de subpágina
              }
            }
          }
        }
      } catch (e) {
        console.warn("Error al escanear sitio web para email:", e);
      }
    }

    // 2. Si no se encontró en web, consultar a Gemini AI si conoce el contacto público
    if (!foundEmail && process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Negocio: "${business.name}", Rubro: "${business.category}", Ciudad: "${business.city || 'Perú'}".
¿Tiene este negocio algún correo electrónico corporativo o de contacto público verificado en internet?
Si conoces con alta probabilidad el correo oficial de este negocio, responde únicamente con el correo (ej: contacto@empresa.pe).
Si no lo conoces con certeza, responde únicamente con "NO_ENCONTRADO".`;
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        if (text.includes("@") && !text.includes("NO_ENCONTRADO") && !text.includes(" ") && text.length < 60) {
          foundEmail = text.toLowerCase().trim();
        }
      } catch (err) {
        // ignorar fallo de IA
      }
    }

    if (foundEmail) {
      await db.business.update({
        where: { id: business.id },
        data: { email: foundEmail },
      });
      return NextResponse.json({ success: true, email: foundEmail, source: "detected" });
    }

    return NextResponse.json({
      success: false,
      message: "No se detectó correo público en su web o canales registrados.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al buscar correo." },
      { status: 500 }
    );
  }
}
