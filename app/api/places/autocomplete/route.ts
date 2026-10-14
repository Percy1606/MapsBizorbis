import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Suggestion {
  mainText: string;
  secondaryText: string;
  fullText: string;
}

// Lista instantánea offline de principales ciudades y distritos de Perú (0ms de latencia)
const POPULAR_PERU_CITIES: Suggestion[] = [
  { mainText: "Sechura", secondaryText: "Piura, Perú", fullText: "Sechura, Piura, Perú" },
  { mainText: "Piura", secondaryText: "Piura, Perú", fullText: "Piura, Piura, Perú" },
  { mainText: "Sullana", secondaryText: "Piura, Perú", fullText: "Sullana, Piura, Perú" },
  { mainText: "Talara", secondaryText: "Piura, Perú", fullText: "Talara, Piura, Perú" },
  { mainText: "Paita", secondaryText: "Piura, Perú", fullText: "Paita, Piura, Perú" },
  { mainText: "Chiclayo", secondaryText: "Lambayeque, Perú", fullText: "Chiclayo, Lambayeque, Perú" },
  { mainText: "Trujillo", secondaryText: "La Libertad, Perú", fullText: "Trujillo, La Libertad, Perú" },
  { mainText: "Chimbote", secondaryText: "Áncash, Perú", fullText: "Chimbote, Áncash, Perú" },
  { mainText: "Lima", secondaryText: "Lima Metropolitana, Perú", fullText: "Lima, Lima Metropolitana, Perú" },
  { mainText: "Miraflores", secondaryText: "Lima, Perú", fullText: "Miraflores, Lima, Perú" },
  { mainText: "San Isidro", secondaryText: "Lima, Perú", fullText: "San Isidro, Lima, Perú" },
  { mainText: "Santiago de Surco", secondaryText: "Lima, Perú", fullText: "Santiago de Surco, Lima, Perú" },
  { mainText: "Los Olivos", secondaryText: "Lima, Perú", fullText: "Los Olivos, Lima, Perú" },
  { mainText: "San Juan de Lurigancho", secondaryText: "Lima, Perú", fullText: "San Juan de Lurigancho, Lima, Perú" },
  { mainText: "Callao", secondaryText: "Provincia Constitucional del Callao, Perú", fullText: "Callao, Perú" },
  { mainText: "Arequipa", secondaryText: "Arequipa, Perú", fullText: "Arequipa, Arequipa, Perú" },
  { mainText: "Cusco", secondaryText: "Cusco, Perú", fullText: "Cusco, Cusco, Perú" },
  { mainText: "Huancayo", secondaryText: "Junín, Perú", fullText: "Huancayo, Junín, Perú" },
  { mainText: "Ica", secondaryText: "Ica, Perú", fullText: "Ica, Ica, Perú" },
  { mainText: "Tacna", secondaryText: "Tacna, Perú", fullText: "Tacna, Tacna, Perú" },
  { mainText: "Puno", secondaryText: "Puno, Perú", fullText: "Puno, Puno, Perú" },
  { mainText: "Juliaca", secondaryText: "Puno, Perú", fullText: "Juliaca, Puno, Perú" },
  { mainText: "Ayacucho", secondaryText: "Ayacucho, Perú", fullText: "Ayacucho, Ayacucho, Perú" },
  { mainText: "Cajamarca", secondaryText: "Cajamarca, Perú", fullText: "Cajamarca, Cajamarca, Perú" },
  { mainText: "Iquitos", secondaryText: "Maynas, Loreto, Perú", fullText: "Iquitos, Loreto, Perú" },
  { mainText: "Pucallpa", secondaryText: "Ucayali, Perú", fullText: "Pucallpa, Ucayali, Perú" },
  { mainText: "Tarapoto", secondaryText: "San Martín, Perú", fullText: "Tarapoto, San Martín, Perú" },
  { mainText: "Huaraz", secondaryText: "Áncash, Perú", fullText: "Huaraz, Áncash, Perú" },
  { mainText: "Tumbes", secondaryText: "Tumbes, Perú", fullText: "Tumbes, Tumbes, Perú" },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const country = (searchParams.get("country") || "PE").toUpperCase();

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const queryLower = q.toLowerCase();

    // 1. Si el país es Perú, verificar primero coincidencias en la lista de alta velocidad
    const localMatches =
      country === "PE" || country === "GLOBAL"
        ? POPULAR_PERU_CITIES.filter(
            (c) =>
              c.mainText.toLowerCase().includes(queryLower) ||
              c.secondaryText.toLowerCase().includes(queryLower)
          ).slice(0, 5)
        : [];

    if (localMatches.length >= 3) {
      return NextResponse.json({ suggestions: localMatches, source: "fast_index" });
    }

    // 2. Consulta en vivo a Nominatim OpenStreetMap (filtrado por país para precisión absoluta)
    try {
      const countryParam =
        country !== "GLOBAL" ? `&countrycodes=${country.toLowerCase()}` : "";
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&format=json&addressdetails=1&limit=6${countryParam}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(nominatimUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "RadarClientesApp/1.0 (contacto@empresa-software.com)",
          "Accept": "application/json",
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const apiSuggestions: Suggestion[] = [];
          const seen = new Set<string>();

          for (const item of data) {
            const addr = item.address || {};
            const main =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              item.name ||
              item.display_name.split(",")[0].trim();

            const state = addr.state || addr.region || addr.county || "";
            const countryName = addr.country || "";
            const secondary = [state, countryName].filter(Boolean).join(", ");
            const full = [main, secondary].filter(Boolean).join(", ");

            if (!seen.has(full.toLowerCase())) {
              seen.add(full.toLowerCase());
              apiSuggestions.push({
                mainText: main,
                secondaryText: secondary,
                fullText: full,
              });
            }
          }

          if (apiSuggestions.length > 0) {
            // Combinar coincidencias locales con las de la API sin duplicados
            const combined = [...localMatches];
            for (const s of apiSuggestions) {
              if (!combined.some((c) => c.fullText.toLowerCase() === s.fullText.toLowerCase())) {
                combined.push(s);
              }
            }
            return NextResponse.json({
              suggestions: combined.slice(0, 6),
              source: "nominatim",
            });
          }
        }
      }
    } catch {
      // Si Nominatim tarda o falla, usar coincidencias locales
    }

    return NextResponse.json({ suggestions: localMatches, source: "fallback" });
  } catch (error: any) {
    console.error("Error en autocomplete de lugares:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
