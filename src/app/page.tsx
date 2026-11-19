import { redirect } from "next/navigation";

// El proxy ya redirige "/"; esto es solo una red de seguridad.
export default function Home() {
  redirect("/dashboard");
}
