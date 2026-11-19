import { requireUser } from "@/lib/auth";
import { UpdatePasswordForm } from "@/modules/auth/components/auth-forms";

export default async function UpdatePasswordPage() {
  await requireUser();
  return <UpdatePasswordForm />;
}
