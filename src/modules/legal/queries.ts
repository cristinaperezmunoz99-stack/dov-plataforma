import "server-only";
import { LEGAL_DOCUMENTS, LEGAL_VERSIONS, type LegalDocument } from "@/lib/legal/documents";
import { createClient } from "@/lib/supabase/server";

/** Documentos cuya versión vigente el usuario aún no ha aceptado. */
export async function missingLegalAcceptances(userId: string): Promise<LegalDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_acceptances")
    .select("document, version")
    .eq("user_id", userId);
  if (error) {
    console.error("legal acceptances", error.code);
    // Si no se puede comprobar, se pide aceptar: es el lado seguro.
    return LEGAL_DOCUMENTS;
  }
  const accepted = new Set((data ?? []).map((r) => `${r.document}:${r.version}`));
  return LEGAL_DOCUMENTS.filter((doc) => !accepted.has(`${doc}:${LEGAL_VERSIONS[doc]}`));
}
