import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Solo rutas internas: evita redirecciones abiertas a otros dominios. */
function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/dashboard";
  }
  return next;
}

/**
 * Destino de los enlaces de los emails (confirmación de cuenta y recuperación).
 * Admite los dos formatos de Supabase:
 *  - token_hash + type (recomendado: funciona aunque se abra en otro dispositivo)
 *  - code (PKCE: solo funciona en el mismo navegador donde se pidió)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  const supabase = await createClient();
  let ok = false;
  let codeExchangeFailed = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
    if (error) console.error("auth/confirm verifyOtp", error.code ?? error.name);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    if (error) {
      codeExchangeFailed = true;
      console.error("auth/confirm exchangeCode", error.code ?? error.name);
    }
  }

  const target = request.nextUrl.clone();
  target.search = "";
  if (ok) {
    target.pathname = next;
  } else if (codeExchangeFailed && next === "/dashboard") {
    // Con "code", Supabase ya ha confirmado el email antes de redirigir aquí.
    // Si no se puede abrir sesión (p. ej. enlace abierto en otro navegador),
    // la cuenta está confirmada igualmente: basta con iniciar sesión.
    target.pathname = "/login";
    target.searchParams.set("confirmado", "1");
  } else {
    target.pathname = "/login";
    target.searchParams.set("error", "enlace");
  }
  return NextResponse.redirect(target);
}
