import { LoginForm } from "@/modules/auth/components/auth-forms";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, confirmado, cuenta } = await searchParams;
  return <LoginForm linkError={error === "enlace"} confirmed={confirmado === "1"} accountDeleted={cuenta === "borrada"} />;
}
