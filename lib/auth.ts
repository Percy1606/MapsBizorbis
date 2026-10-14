/**
 * Sistema de Autenticación de Acceso Administrativo para Servidor
 * Utiliza HMAC-SHA256 nativo con tokens basados en caracteres seguros (sin dependencias ni problemas de base64).
 */

export const AUTH_COOKIE_NAME = "radar_auth_session";

const MASTER_SECRET = "radar_master_auth_secret_key_2026_x89_secure";

function getSecretKey(): string {
  return process.env.AUTH_SECRET || MASTER_SECRET;
}

/**
 * Valida credenciales contra variables de entorno o valores por defecto seguros
 */
export function verifyCredentials(user: string, pass: string): boolean {
  const targetUser = process.env.ADMIN_USER || "admin";
  const targetPass = process.env.ADMIN_PASSWORD || "admin123";
  return user.trim() === targetUser.trim() && pass === targetPass;
}

/**
 * Genera un token de sesión firmado criptográficamente: username.expiresAt.signatureHex
 */
export async function createSessionToken(username: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = getSecretKey();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sesión válida por 30 días
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const payload = `${username.trim()}.${expiresAt}`;
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${payload}.${signatureHex}`;
}

/**
 * Verifica si un token de sesión es legítimo y no ha expirado
 */
export async function verifySessionToken(
  token: string
): Promise<{ valid: boolean; username?: string }> {
  try {
    if (!token || typeof token !== "string") {
      return { valid: false };
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false };
    }

    const [username, expiresAtStr, signatureHex] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return { valid: false };
    }

    const encoder = new TextEncoder();
    const secretKey = getSecretKey();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const payload = `${username}.${expiresAtStr}`;
    const expectedBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

    const expectedHex = Array.from(new Uint8Array(expectedBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (signatureHex === expectedHex) {
      return { valid: true, username };
    }
  } catch (err) {
    console.error("Error al verificar token de sesión:", err);
    return { valid: false };
  }

  return { valid: false };
}
