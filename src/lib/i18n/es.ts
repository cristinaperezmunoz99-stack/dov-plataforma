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
  dashboard: {
    greeting: (name: string) => (name ? `Hola, ${name}` : "Hola"),
    placeholder:
      "Aquí verás tus casos recientes. La gestión de casos llega en la siguiente fase.",
  },
} as const;

export type Dictionary = typeof es;
