"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { es } from "@/lib/i18n/es";
import { LEGAL_VERSIONS } from "@/lib/legal/documents";
import { createClient } from "@/lib/supabase/server";
import { missingLegalAcceptances } from "./queries";

export type AcceptState = { error?: string };

export async function acceptCurrentLegal(_prev: AcceptState, formData: FormData): Promise<AcceptState> {
  const user = await requireUser();
  if (formData.get("acceptLegal") !== "on") return { error: es.legal.acceptRequired };

  const missing = await missingLegalAcceptances(user.id);
  if (missing.length > 0) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("legal_acceptances")
      .upsert(
        missing.map((document) => ({ document, version: LEGAL_VERSIONS[document] })),
        { onConflict: "user_id,document,version", ignoreDuplicates: true },
      );
    if (error) {
      console.error("accept legal", error.code);
      return { error: es.common.genericError };
    }
  }
  redirect("/dashboard");
}
