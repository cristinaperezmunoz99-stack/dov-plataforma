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
  common: {
    email: "Email",
    password: "Contraseña",
    name: "Nombre",
    genericError: "Algo ha fallado. Inténtalo de nuevo en unos minutos.",
  },
  auth: {
    login: {
      title: "Inicia sesión",
      submit: "Entrar",
      pending: "Entrando…",
      forgot: "¿Has olvidado tu contraseña?",
      noAccount: "¿Aún no tienes cuenta?",
      toSignup: "Crear cuenta",
      invalid: "Email o contraseña incorrectos.",
      notConfirmed: "Confirma tu email antes de entrar. Revisa tu bandeja de entrada.",
    },
    signup: {
      title: "Crea tu cuenta",
      submit: "Crear cuenta",
      pending: "Creando cuenta…",
      hasAccount: "¿Ya tienes cuenta?",
      toLogin: "Inicia sesión",
      passwordHint: "Mínimo 10 caracteres.",
      checkEmail:
        "Te hemos enviado un email para confirmar tu cuenta. Abre el enlace para empezar.",
      privacyNote:
        "Esta plataforma apoya tu trabajo profesional. Identifica los casos con códigos, nunca con datos personales de tus pacientes.",
    },
    recover: {
      title: "Recupera tu contraseña",
      description: "Te enviaremos un enlace para crear una nueva.",
      submit: "Enviar enlace",
      pending: "Enviando…",
      sent: "Si existe una cuenta con ese email, recibirás un enlace en unos minutos.",
      back: "Volver a iniciar sesión",
    },
    update: {
      title: "Nueva contraseña",
      submit: "Guardar contraseña",
      pending: "Guardando…",
    },
    confirmed: "Tu cuenta está confirmada. Inicia sesión para continuar.",
    confirmError:
      "El enlace no es válido o ha caducado. Solicita uno nuevo.",
    validation: {
      email: "Introduce un email válido.",
      passwordMin: "La contraseña debe tener al menos 10 caracteres.",
      passwordMax: "La contraseña es demasiado larga.",
      required: "Este campo es obligatorio.",
      nameMax: "El nombre es demasiado largo.",
    },
    signOut: "Cerrar sesión",
  },
  privacy: {
    blocked: (kinds: string) =>
      `No se ha guardado: el texto parece incluir ${kinds}. Elimina cualquier dato que permita identificar al paciente y vuelve a guardar.`,
    kinds: {
      email: "un email",
      phone: "un número de teléfono",
      idDocument: "un documento de identidad",
    },
  },
  nav: {
    home: "Inicio",
    cases: "Mis casos",
  },
  dashboard: {
    greeting: (name: string) => (name ? `Hola, ${name}` : "Hola"),
    recent: "Casos recientes",
    viewAll: "Ver todos los casos",
    empty: "Aún no tienes casos. Crea el primero para empezar a trabajar.",
  },
  cases: {
    title: "Mis casos",
    new: "Nuevo caso",
    searchLabel: "Buscar casos",
    searchPlaceholder: "Código o título",
    search: "Buscar",
    clear: "Limpiar",
    noResults: (q: string) => `No hay casos que coincidan con "${q}".`,
    empty: "Aún no tienes casos.",
    untitled: "Sin título",
    updated: (date: string) => `Actualizado el ${date}`,
    notFound: "Este caso no existe o no tienes acceso a él.",
    back: "Mis casos",
    tabs: {
      summary: "Resumen",
      memory: "Memoria",
      sessions: "Sesiones",
      conversations: "Conversaciones",
      assistants: "Asistentes",
      soon: "Próximamente",
    },
    form: {
      newTitle: "Nuevo caso",
      newDescription:
        "El caso recibirá un código automático (por ejemplo, CASO-7F3A). Úsalo para referirte a él en lugar de datos del paciente.",
      titleLabel: "Título interno",
      titleHint: "Opcional. Algo que te ayude a reconocerlo, sin datos identificativos.",
      contextLabel: "Contexto general",
      contextHint:
        "Motivo de consulta, situación actual y lo que necesites tener presente. Los asistentes usarán este contexto.",
      create: "Crear caso",
      creating: "Creando…",
      save: "Guardar cambios",
      saving: "Guardando…",
      saved: "Cambios guardados.",
      cancel: "Cancelar",
      titleMax: "El título no puede superar los 120 caracteres.",
      contextMax: "El contexto no puede superar los 20.000 caracteres.",
    },
    delete: {
      title: "Eliminar caso",
      description:
        "Se eliminará el caso con toda su información. Esta acción no se puede deshacer.",
      confirmLabel: (code: string) => `Escribe ${code} para confirmar`,
      submit: "Eliminar caso",
      deleting: "Eliminando…",
      mismatch: "El código no coincide.",
    },
  },
  memory: {
    title: "Memoria del caso",
    description:
      "Lo que guardes aquí es lo que los asistentes tendrán presente sobre este caso. Tú decides qué se guarda.",
    empty: "Sin entradas.",
    add: "Añadir",
    adding: "Añadiendo…",
    addPlaceholder: (category: string) => `Añadir a ${category.toLowerCase()}…`,
    edit: "Editar",
    save: "Guardar",
    saving: "Guardando…",
    cancel: "Cancelar",
    delete: "Eliminar",
    confirmDelete: "¿Eliminar esta entrada?",
    confirm: "Sí, eliminar",
    required: "Escribe algo antes de guardar.",
    max: "El texto no puede superar los 10.000 caracteres.",
    updated: (date: string) => `Actualizado el ${date}`,
  },
  sessions: {
    title: "Sesiones",
    new: "Nueva sesión",
    empty: "Aún no hay sesiones registradas en este caso.",
    number: (n: number) => `Sesión ${n}`,
    noSummary: "Sin resumen.",
    back: "Sesiones",
    form: {
      date: "Fecha",
      summary: "Resumen",
      summaryHint: "Lo esencial de la sesión. Es lo que se usará como contexto.",
      notes: "Notas",
      relevant: "Información relevante",
      changes: "Cambios respecto a sesiones anteriores",
      create: "Guardar sesión",
      creating: "Guardando…",
      save: "Guardar cambios",
      saving: "Guardando…",
      saved: "Cambios guardados.",
      cancel: "Cancelar",
      invalidDate: "Introduce una fecha válida.",
      tooLong: "El texto es demasiado largo.",
    },
    delete: {
      title: "Eliminar sesión",
      description: "Se eliminará esta sesión. Esta acción no se puede deshacer.",
      confirmLabel: "Confirmo que quiero eliminar esta sesión",
      submit: "Eliminar sesión",
      deleting: "Eliminando…",
      notConfirmed: "Marca la casilla para confirmar.",
    },
    notFound: "Esta sesión no existe o no tienes acceso a ella.",
  },
} as const;

export type Dictionary = typeof es;
