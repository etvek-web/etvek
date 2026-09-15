import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Primera barrera para /admin: redirige a login si no hay cookie de sesión.
 * La verificación real (firma, sesión en base, usuario activo) ocurre siempre
 * en el servidor, en cada página y en cada server action.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];
  if (!pathname.startsWith("/admin") || PUBLIC_ADMIN_PATHS.includes(pathname)) return NextResponse.next();

  if (!request.cookies.get(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
