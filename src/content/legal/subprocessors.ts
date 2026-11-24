export type Subprocessor = {
  name: string;
  purpose: string;
  location: string;
  safeguards: string;
  status: "active" | "planned";
};

/** Fuente única de proveedores: la usan la página pública y los documentos. */
export const SUBPROCESSORS: Subprocessor[] = [
  {
    name: "Supabase",
    purpose: "Base de datos y autenticación. Aquí se guardan los casos y las conversaciones.",
    location: "Unión Europea (Irlanda)",
    safeguards: "Acuerdo de tratamiento de datos (DPA). Cifrado en tránsito y en reposo.",
    status: "active",
  },
  {
    name: "Vercel",
    purpose: "Alojamiento y ejecución de la aplicación.",
    location: "Ejecución en la Unión Europea (Irlanda); red de distribución global",
    safeguards: "DPA y cláusulas contractuales tipo de la Comisión Europea.",
    status: "active",
  },
  {
    name: "Anthropic",
    purpose:
      "Modelo de IA (Claude) que genera las respuestas de los asistentes. Recibe solo el contexto del caso necesario para cada respuesta.",
    location: "Estados Unidos",
    safeguards:
      "DPA y cláusulas contractuales tipo. Por sus condiciones comerciales, no usa estos datos para entrenar modelos y los elimina de sus sistemas en un máximo de 30 días, salvo que detecte un posible incumplimiento de su política de uso, en cuyo caso puede conservarlos más tiempo.",
    status: "active",
  },
  {
    name: "Stripe",
    purpose: "Cobro de suscripciones. Los datos de tarjeta no pasan por nuestros servidores.",
    location: "Unión Europea y Estados Unidos",
    safeguards: "DPA y cláusulas contractuales tipo.",
    status: "planned",
  },
  {
    name: "[Proveedor de email]",
    purpose: "Envío de emails de la cuenta (confirmación, recuperación de contraseña).",
    location: "[Por definir]",
    safeguards: "[Por definir]",
    status: "planned",
  },
];
