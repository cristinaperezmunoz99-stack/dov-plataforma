import { LoginForm } from "@/modules/auth/components/auth-forms";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return <LoginForm linkError={error === "enlace"} />;
}
