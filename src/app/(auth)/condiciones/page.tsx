import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AcceptLegalForm } from "@/modules/legal/components/accept-form";
import { missingLegalAcceptances } from "@/modules/legal/queries";

export default async function AcceptLegalPage() {
  const user = await requireUser();
  if ((await missingLegalAcceptances(user.id)).length === 0) redirect("/dashboard");
  return <AcceptLegalForm />;
}
