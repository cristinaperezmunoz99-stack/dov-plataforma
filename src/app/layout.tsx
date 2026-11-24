import type { Metadata } from "next";
import localFont from "next/font/local";
import { es } from "@/lib/i18n/es";
import "./globals.css";

// Fuentes alojadas en el propio proyecto (licencia OFL): sin peticiones a Google.
const instrumentSans = localFont({
  src: "../fonts/instrument-sans-latin-wght-normal.woff2",
  variable: "--font-instrument-sans",
  weight: "400 700",
  display: "swap",
});

const newsreader = localFont({
  src: "../fonts/newsreader-latin-wght-normal.woff2",
  variable: "--font-newsreader",
  weight: "200 800",
  display: "swap",
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
      className={`${instrumentSans.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
