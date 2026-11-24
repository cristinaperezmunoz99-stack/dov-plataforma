import { LEGAL_ENTITY as E } from "@/lib/legal/documents";

const titular = `${E.name}, con NIF ${E.taxId} y domicilio en ${E.address}`;

export const TERMS_MD = `
Estas condiciones regulan el uso de Asistentes, un espacio de trabajo con asistentes de inteligencia artificial para profesionales de la psicología. Lo presta ${titular} (en adelante, "nosotros"). Contacto: ${E.email}.

## 1. Qué es el servicio

Asistentes es una herramienta de apoyo al trabajo profesional. Permite organizar casos, guardar trabajo clínico y conversar con asistentes de IA que usan el contexto de cada caso.

No es un producto sanitario, no diagnostica y no decide tratamientos. Lo que proponen los asistentes son borradores y sugerencias. El criterio clínico y las decisiones son siempre tuyas.

## 2. Quién puede usarlo

Profesionales de la psicología y de la salud mental, mayores de edad, que lo usen para su actividad profesional. Al registrarte declaras que cumples estos requisitos y que los datos de tu cuenta son ciertos.

## 3. Tu cuenta

Eres responsable de custodiar tu contraseña. Te recomendamos activar la verificación en dos pasos. Si sospechas un acceso no autorizado, cambia la contraseña y escríbenos.

## 4. Uso correcto y datos de tus pacientes

- Identifica los casos con códigos, no con nombres ni datos que permitan reconocer al paciente. La plataforma bloquea el guardado cuando detecta algunos datos identificativos, pero esa detección es una ayuda y no garantiza el anonimato.
- Sobre los datos de tus pacientes, tú eres el responsable del tratamiento y nosotros actuamos como encargados, según el contrato de encargo del tratamiento que aceptas al registrarte.
- Te corresponde contar con base legal para tratar esos datos e informar a tus pacientes.
- Revisa siempre lo que generan los asistentes antes de usarlo. Pueden cometer errores.
- No uses el servicio para situaciones de urgencia ni como sustituto de la atención directa.
- No intentes acceder a datos de otros usuarios, alterar el servicio ni usarlo para fines ilícitos.

## 5. Suscripción

El acceso a los asistentes requiere una suscripción de pago. Precio, límites de uso y funciones de cada plan se muestran antes de contratar. Puedes cancelar en cualquier momento desde la gestión de tu suscripción; mantienes el acceso hasta el final del periodo pagado. Sin suscripción activa puedes entrar, consultar y gestionar tus casos, pero no usar los asistentes.

## 6. Disponibilidad y cambios

Trabajamos para que el servicio esté disponible y seguro, pero puede haber interrupciones por mantenimiento o incidencias. Podemos cambiar funciones o estas condiciones. Si el cambio es relevante, te avisaremos y tendrás que aceptarlo para seguir usando el servicio.

## 7. Propiedad

El contenido que introduces y lo que generan los asistentes para ti es tuyo. Nosotros conservamos los derechos sobre la plataforma, su diseño y las instrucciones de los asistentes.

## 8. Responsabilidad

El servicio se ofrece como apoyo. No respondemos de las decisiones clínicas tomadas a partir de lo que generan los asistentes. Nuestra responsabilidad se limita, en lo que permita la ley, al importe pagado en los últimos doce meses. Nada de esto limita los derechos que la ley reconoce a los consumidores ni la responsabilidad por dolo o culpa grave.

## 9. Baja

Puedes eliminar tu cuenta desde Ajustes. Antes puedes exportar tus datos. Podemos suspender una cuenta que incumpla estas condiciones, avisándote salvo que haya un riesgo de seguridad.

## 10. Ley aplicable

Se aplica la ley española. Para cualquier conflicto, los juzgados que correspondan según la normativa aplicable.
`;

export const PRIVACY_MD = `
Esta política explica qué datos tratamos, para qué y qué derechos tienes.

## 1. Quién es el responsable

${titular}. Contacto para privacidad: ${E.email}.

Hay dos situaciones distintas:

- **Datos de tu cuenta** (nombre, email, suscripción, uso y seguridad): nosotros somos responsables del tratamiento.
- **Datos de los casos** que introduces sobre tus pacientes: tú eres el responsable y nosotros los tratamos por tu cuenta como encargados, según el contrato de encargo del tratamiento.

## 2. Qué datos tratamos y para qué

| Datos | Finalidad | Base legal |
|---|---|---|
| Nombre, email y contraseña (cifrada) | Crear y mantener tu cuenta | Ejecución del contrato |
| Suscripción y facturación | Cobrar y gestionar el plan | Contrato y obligaciones legales |
| Registro de uso de la IA (tokens, coste, sin contenido) | Aplicar los límites del plan y controlar costes | Ejecución del contrato |
| Registro de seguridad (accesos, cambios de contraseña, IP y navegador) | Proteger tu cuenta y detectar accesos indebidos | Interés legítimo en la seguridad del servicio |
| Contenido de los casos y conversaciones | Prestar el servicio por tu cuenta | Contrato de encargo (art. 28 RGPD) |

No usamos tus datos para publicidad, no los vendemos y no los usamos para entrenar modelos de IA.

## 3. Uso de inteligencia artificial

Cuando hablas con un asistente, enviamos al proveedor de IA tu mensaje, el historial reciente de esa conversación y el contexto del caso necesario. La memoria del caso vive en nuestra base de datos, no en el modelo.

El proveedor actual es Anthropic (Estados Unidos). Según sus condiciones comerciales, no usa estos datos para entrenar modelos y los elimina en un máximo de 30 días, salvo que detecte un posible incumplimiento de su política de uso.

No se toman decisiones automatizadas con efectos sobre ti ni sobre tus pacientes. La IA propone; tú decides.

## 4. Proveedores y transferencias

Trabajamos con proveedores que tratan datos por nuestra cuenta, con contrato de encargo. La lista actualizada está en la página de proveedores. Te avisaremos antes de añadir o cambiar un proveedor que trate datos de los casos.

La base de datos está en la Unión Europea. Algunos proveedores, como el de IA, tratan datos en Estados Unidos. En esos casos se aplican las cláusulas contractuales tipo de la Comisión Europea u otras garantías válidas.

## 5. Cuánto tiempo los conservamos

- Cuenta y casos: mientras la cuenta esté activa. Al eliminarla se borran de forma inmediata de la base de datos.
- Copias de seguridad: los datos borrados pueden permanecer en ellas hasta que se sobrescriben en su ciclo, normalmente unos días.
- Registro de seguridad y de uso: 12 meses.
- Intentos de acceso para frenar abusos: 24 horas, guardados como huella cifrada, sin la IP ni el email en claro.
- Facturación: los plazos que exige la ley.
- En el proveedor de IA: máximo 30 días, según sus condiciones.

## 6. Seguridad

Conexión cifrada, aislamiento de los datos de cada usuario en la base de datos, verificación en dos pasos opcional, límites de intentos de acceso y registro de eventos de seguridad. El equipo no accede al contenido de tus casos salvo que lo pidas para resolver una incidencia, y queda registrado. Ningún sistema es infalible; si hubiera una brecha que te afecte, te avisaremos según marca la ley.

## 7. Tus derechos

Puedes acceder, rectificar, suprimir, oponerte, limitar el tratamiento y pedir la portabilidad de tus datos.

- Exportar todos tus datos y eliminar tu cuenta lo puedes hacer tú mismo desde Ajustes.
- Para lo demás, escríbenos a ${E.email} desde el email de tu cuenta. Respondemos en un plazo máximo de un mes.

Si tus pacientes quieren ejercer sus derechos sobre los datos de un caso, deben dirigirse a ti. Te ayudaremos a atenderlos.

Si no estás de acuerdo con nuestra respuesta, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es) o la autoridad de tu país.

## 8. Cookies

En la aplicación solo usamos las cookies necesarias para mantener tu sesión. No usamos cookies de analítica ni de publicidad.

## 9. Cambios

Si cambiamos esta política de forma relevante, te lo diremos al entrar y tendrás que aceptarla de nuevo.
`;

export const DPA_MD = `
Contrato de encargo del tratamiento conforme al artículo 28 del Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).

**Responsable del tratamiento:** el profesional titular de la cuenta ("el Responsable").
**Encargado del tratamiento:** ${titular} ("el Encargado").

## 1. Objeto

El Encargado trata, por cuenta del Responsable, los datos que este introduce en la plataforma sobre sus casos, con el único fin de prestar el servicio: guardarlos, mostrarlos, enviarlos al proveedor de IA para generar respuestas y permitir su exportación y borrado.

## 2. Duración

Mientras la cuenta esté activa. Al finalizar, se aplica la cláusula 10.

## 3. Datos y personas afectadas

- **Personas:** pacientes o clientes del Responsable.
- **Datos:** información clínica y de evolución, objetivos, formulación, observaciones y materiales de trabajo. Pueden incluir datos de salud (categoría especial, art. 9 RGPD).
- El servicio está pensado para trabajar con casos identificados por código. El Responsable se compromete a no introducir datos identificativos directos de sus pacientes.

## 4. Instrucciones

El Encargado trata los datos solo siguiendo las instrucciones documentadas del Responsable, que son las de este contrato y el uso que hace de la plataforma. Si una instrucción infringe la normativa, el Encargado lo comunicará.

## 5. Confidencialidad

Las personas autorizadas por el Encargado están obligadas a guardar secreto. No acceden al contenido de los casos salvo petición del Responsable para resolver una incidencia, y ese acceso queda registrado.

## 6. Seguridad

El Encargado aplica las medidas del artículo 32 RGPD adecuadas al riesgo, entre ellas: cifrado en tránsito y en reposo, aislamiento de datos por usuario en la base de datos, verificación en dos pasos, control de accesos, límites frente a abusos, registro de eventos de seguridad y copias de seguridad.

## 7. Subencargados

El Responsable autoriza de forma general a los subencargados de la página de proveedores. El Encargado informará con antelación de cualquier alta o cambio y el Responsable podrá oponerse; si no hay acuerdo, podrá dar de baja su cuenta. Cada subencargado queda sujeto por contrato a obligaciones equivalentes a estas.

## 8. Transferencias internacionales

Cuando un subencargado trate datos fuera del Espacio Económico Europeo, se aplicarán garantías del capítulo V del RGPD, como las cláusulas contractuales tipo de la Comisión Europea.

## 9. Asistencia al Responsable

El Encargado ayudará al Responsable a:
- Atender los derechos de los interesados. Las herramientas de exportación y borrado de la plataforma cubren la mayoría de los casos.
- Cumplir sus obligaciones de seguridad, evaluación de impacto y consulta previa, cuando proceda.
- Gestionar brechas: el Encargado notificará al Responsable, sin dilación indebida y en un máximo de 24 horas desde que tenga conocimiento, cualquier brecha que afecte a sus datos, con la información disponible para que el Responsable pueda notificar a la autoridad de control en plazo.

## 10. Fin del servicio

Al eliminar la cuenta, los datos se borran de la base de datos de forma inmediata. Pueden permanecer en copias de seguridad hasta que se sobrescriben en su ciclo. Antes de eliminarla, el Responsable puede exportarlos.

## 11. Auditoría

El Encargado pondrá a disposición del Responsable la información necesaria para demostrar el cumplimiento de este contrato, mediante documentación de sus medidas técnicas y organizativas y, cuando sea razonable, respondiendo a sus preguntas.

## 12. Responsabilidad y prevalencia

Si el Encargado trata los datos para fines propios o incumple este contrato, será considerado responsable de ese tratamiento. En materia de protección de datos, este contrato prevalece sobre las condiciones de uso.
`;
