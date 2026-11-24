import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/** Rutas accesibles sin sesión. */
const PUBLIC_PATHS = ["/login", "/registro", "/recuperar", "/auth"];
/** Rutas de acceso de las que se redirige a quien ya tiene sesión. */
const AUTH_ONLY_PATHS = ["/login", "/registro", "/recuperar"];

function matches(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Política de seguridad de contenido con nonce por petición. */
function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * Refresca la sesión de Supabase en cada petición, añade la CSP y aplica redirecciones básicas.
 * Es una comprobación optimista: cada página y acción vuelve a verificar al usuario.
 */
export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  // Pasa la CSP y el nonce a la petición (Next.js los aplica a sus scripts) y a la respuesta.
  const next = () => {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("Content-Security-Policy", csp);
    const res = NextResponse.next({ request: { headers } });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  };

  let response = next();
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = next();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        cacheHeaders = { ...cacheHeaders, ...headers };
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // getClaims verifica el token. No usar getSession para decidir acceso.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const target = request.nextUrl.clone();
    target.pathname = path;
    target.search = "";
    const redirect = NextResponse.redirect(target);
    // Conservar las cookies de sesión refrescadas.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    Object.entries(cacheHeaders).forEach(([key, value]) =>
      redirect.headers.set(key, value),
    );
    return redirect;
  };

  if (pathname === "/") {
    return redirectTo(isAuthenticated ? "/dashboard" : "/login");
  }
  if (!isAuthenticated && pathname.startsWith("/api/")) {
    // Las rutas de API responden con 401, no con una redirección a una página HTML.
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAuthenticated && !matches(pathname, PUBLIC_PATHS)) {
    return redirectTo("/login");
  }
  if (isAuthenticated && matches(pathname, AUTH_ONLY_PATHS)) {
    return redirectTo("/dashboard");
  }

  return response;
}
