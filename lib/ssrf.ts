import { URL } from "url";

// IP regexes for private/internal networks
const PRIVATE_IP_RANGES = [
  /^127\./,                         // Loopback
  /^10\./,                          // RFC1918 Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC1918 Class B
  /^192\.168\./,                    // RFC1918 Class C
  /^169\.254\./,                    // Link-local
  /^0\./,                           // Current network
  /^::1$/,                          // IPv6 loopback
  /^fc00:/i,                        // IPv6 ULA
  /^fe80:/i,                        // IPv6 Link-local
];

export function validateSafeUrl(urlString: string): { isValid: boolean; url?: URL; error?: string } {
  try {
    let toParse = urlString.trim();
    if (!toParse.startsWith("http://") && !toParse.startsWith("https://")) {
      toParse = `https://${toParse}`;
    }

    const parsed = new URL(toParse);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isValid: false, error: "Solo se admiten protocolos http o https." };
    }

    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return { isValid: false, error: "Acceso a dominios internos o locales no permitido." };
    }

    // Check if hostname is an IP and matches private ranges
    for (const range of PRIVATE_IP_RANGES) {
      if (range.test(hostname)) {
        return { isValid: false, error: "Acceso a direcciones IP privadas no permitido (Protección SSRF)." };
      }
    }

    return { isValid: true, url: parsed };
  } catch (err) {
    return { isValid: false, error: "URL inválida." };
  }
}

export async function safeFetchWebsite(targetUrl: string, maxBytes: number = 2 * 1024 * 1024, timeoutMs: number = 7000): Promise<{
  statusCode: number;
  body: string;
  hasHttps: boolean;
  finalUrl: string;
}> {
  const check = validateSafeUrl(targetUrl);
  if (!check.isValid || !check.url) {
    throw new Error(check.error || "URL no válida");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(check.url.toString(), {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 RadarClientes/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es,en;q=0.9",
      },
    });

    clearTimeout(timer);

    const hasHttps = res.url.startsWith("https://");
    const reader = res.body?.getReader();

    if (!reader) {
      const text = await res.text();
      return {
        statusCode: res.status,
        body: text.slice(0, maxBytes),
        hasHttps,
        finalUrl: res.url,
      };
    }

    let received = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.length;
        chunks.push(value);
        if (received >= maxBytes) {
          reader.cancel();
          break;
        }
      }
    }

    const decoder = new TextDecoder("utf-8", { fatal: false });
    const fullBuffer = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      fullBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    const htmlBody = decoder.decode(fullBuffer);

    return {
      statusCode: res.status,
      body: htmlBody,
      hasHttps,
      finalUrl: res.url,
    };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new Error(`Tiempo de espera agotado (${timeoutMs / 1000}s) al consultar el sitio web.`);
    }
    throw new Error(`Error de conexión con el sitio web: ${err.message}`);
  }
}
