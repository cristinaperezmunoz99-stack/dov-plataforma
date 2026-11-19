/**
 * Textos de la interfaz en español neutro (España y Latinoamérica).
 * Tratamiento de "tú", nunca "vosotros".
 * Nunca lenguaje de diagnóstico ni de decisión de tratamiento.
 * Para añadir otro idioma: crear un archivo con la misma forma (p. ej. en.ts).
 */
export const es = {
  app: {
    name: "Asistentes",
    tagline: "Espacio de trabajo para psicólogos, caso a caso.",
  },
  setup: {
    status: "Entorno listo",
    description:
      "La base técnica de la plataforma está desplegada. Las siguientes fases añadirán el acceso, los casos y los asistentes.",
  },
} as const;

export type Dictionary = typeof es;
