import type { Metadata } from "next";
import localFont from "next/font/local";
import { es } from "@/lib/i18n/es";
import "./globals.css";

// Fuentes alojadas en el propio proyecto (licencia OFL): sin peticiones a Google.
const dmSans = localFont({
  src: [
    { path: "../fonts/dm-sans-latin-wght-normal.woff2", style: "normal" },
    { path: "../fonts/dm-sans-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-dm-sans",
  weight: "400 700",
  display: "swap",
});

const instrumentSerif = localFont({
  src: [
    { path: "../fonts/instrument-serif-latin-400-normal.woff2", style: "normal" },
    { path: "../fonts/instrument-serif-latin-400-italic.woff2", style: "italic" },
  ],
  variable: "--font-instrument-serif",
  weight: "400",
  display: "swap",
});

// Variable en peso y anchura: la marca usa mayúsculas estrechas (font-stretch 85-88%).
const bricolage = localFont({
  src: "../fonts/bricolage-grotesque-latin-standard-normal.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});

// Todas las páginas se generan por petición: necesario para aplicar el nonce de la CSP.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: es.app.name,
  description: es.app.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${instrumentSerif.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
