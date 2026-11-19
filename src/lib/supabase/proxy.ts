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

/**
 * Refresca la sesión de Supabase en cada petición y aplica redirecciones básicas.
 * Es una comprobación optimista: cada página y acción vuelve a verificar al usuario.
 */
export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });
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
        response = NextResponse.next({ request });
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
