import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permitir archivos estáticos e internos de Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon") ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|map)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Permitir rutas públicas de autenticación
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token && pathname === "/login") {
      const { valid } = await verifySessionToken(token);
      if (valid) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  // 3. Validar sesión para todas las demás rutas
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const { valid } = await verifySessionToken(token);
  if (!valid) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Sesión expirada o no autorizada." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas las rutas excepto recursos estáticos
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
