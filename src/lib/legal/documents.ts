/**
 * Configuración central de los documentos legales.
 * Al cambiar un documento de forma relevante, sube su versión (fecha AAAA-MM-DD):
 * los usuarios tendrán que aceptarlo de nuevo al entrar.
 */
export const LEGAL_VERSIONS = {
  terms: "2026-11-24",
  privacy: "2026-11-24",
  dpa: "2026-11-24",
} as const;

export type LegalDocument = keyof typeof LEGAL_VERSIONS;
export const LEGAL_DOCUMENTS = Object.keys(LEGAL_VERSIONS) as LegalDocument[];

/** Datos del titular. PENDIENTE: completar antes del lanzamiento. */
export const LEGAL_ENTITY = {
  name: "[Nombre y apellidos o razón social]",
  taxId: "[NIF]",
  address: "[Domicilio]",
  email: "[Email de contacto para privacidad]",
};

/** Mientras sea true, las páginas legales muestran el aviso de borrador. */
export const LEGAL_IS_DRAFT = true;

export const LEGAL_PAGES = {
  terminos: "terms",
  privacidad: "privacy",
  encargo: "dpa",
  proveedores: "subprocessors",
} as const;

export type LegalSlug = keyof typeof LEGAL_PAGES;
