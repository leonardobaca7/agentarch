# Respuesta a la auditoría final de AgentArch

Fecha: 26 de noviembre de 2026

Se revisó Auditoría final — AgentArch (versión con revisión humana y consultas
prospectivas). Se precisó el alcance de los operadores, se facilitaron las evidencias
desde el PDF, se redujo la densidad del cuerpo y se añadió un lote prospectivo con
el esquema general de acciones. La revisión humana sigue siendo la realizada por
Leonardo Baca Calsin y German Arturo Chipana Jeronimo, autores del trabajo.

## 1 Alcance de la revisión de los autores

El artículo se presenta como un estudio de verificación interna del prototipo.
Los dos autores revisaron la muestra de diez sesiones y conservaron sus formularios,
desacuerdo inicial y consenso. No se atribuye una revisión externa ni cegamiento
que no se haya documentado. El trabajo futuro se centra en ampliar dentro del
proyecto los casos, modelos y anotaciones individuales registradas antes del
consenso. No se plantea la participación de terceros como requisito para cerrar
esta versión.

Esto conserva la limitación científica: quienes revisan conocen el sistema y la
muestra es dirigida. El acuerdo inicial de nueve de diez, la presencia de infracción
de diez de diez y los quince pares del consenso se interpretan sobre esa muestra.
El kappa igual a uno es descriptivo; diez casos no justifican una conclusión
poblacional sobre la calidad de las etiquetas. Las cifras recibidas no se alteraron.

## 2 Qué comprueba realmente el lote tipado

El registro de eventos confirma noventa turnos con comprobaciones P1/P3, noventa
lecturas de dirección antes del TTL para M3 y noventa llamadas sometidas a Π1/Π2.
Los nombres de herramientas y tipos/rangos ya estaban restringidos por el esquema.
Los prompts permanecieron canónicos y no se inyectaron fallos en ese lote.

P2 no tiene pares conflictivos. Hay treinta escrituras verificadas de inicialización,
pero ninguna escritura de memoria decidida por el modelo para evaluar admisión M1,
ningún reemplazo M2 y ningún objetivo de reserva o pago que ejercite Π3. Por eso los
cero falsos positivos describen compatibilidad de esos caminos conformes, sin
demostrar detección de las nueve clases. El artículo y
results/final_audit/typed_scope.json hacen explícita esta diferencia.

## 3 Consultas con esquema general sin selección posterior

Se fijó el protocolo en a52165e antes de inferir. Se utilizaron las treinta solicitudes
del lote tipado, sus semillas 200–229, Qwen3-0.6B-Q8_0, temperatura 0,7 y los mismos
roles, servicios e instrucciones de consulta. Se cambió el esquema de generación:
el general permite hasta cuatro llamadas con nombre libre y argumentos de objeto,
dos escrituras y dos lecturas por rol. Puede producir herramientas fuera de rol,
argumentos inválidos, escrituras sin respaldo, reservas y pagos, aunque la petición
benigna instruye a realizar consultas.

Se conservaron todos los intentos y errores, sin repetir ni descartar por alertas,
y sin sustituir planes por respuestas manuales. Los intentos rechazados por los
servicios también se registran. Los resultados de conformidad y finalización se
mantienen separados y se comparan descriptivamente con los tipados.

Los treinta intentos fueron válidos, sin errores de inferencia: cuatro conformes,
veintiséis con infracciones y cero tareas completas. AgentArch coincidió en las
veintiséis sesiones infractoras y no alertó en las cuatro conformes; B2 detectó
veinticinco y coincidió en el primer paso de dieciséis. Las cuatro conformes
también dejaron tareas incompletas. Proceden de cuatro plantillas distintas y no
se seleccionaron para formar un subconjunto nuevo: se informa el lote completo.
El número de negativos sigue siendo reducido y no se suma a otros denominadores.

La libertad se refiere al esquema de acciones, dentro de un sobre JSON y una
orquestación fija. El dominio sigue siendo consulta de pedidos: no se presenta
como cobertura de cualquier agente o tarea. La anotación del lote nuevo es
automática y no se extiende a él la revisión humana de diez sesiones anteriores.
Los datos están en results/free_queries/ y el desglose por plantilla y condición
en results/final_audit/query_interfaces.json.

## 4 Referencias y evidencias accesibles desde el artículo

El PDF contiene enlaces activos y fijados a la versión del repositorio para abrir
docs/verificacion_fuentes_consolidada.md y docs/evidence_manifest.md. El índice
enlaza los registros editoriales, licencia MIT, tres CSV originales, análisis de
acuerdo, hashes, regla de Git, protocolos y resultados. Se comprobó nuevamente
que GitHub identifica LICENSE como MIT.

Los valores bibliográficos respaldados por las fuentes se conservan. ACL Anthology
registra el DOI 10.18653/2026.aacl-long.44 sin v1/; el repositorio oficial
semantic-conventions-genai contiene las convenciones citadas. Las páginas de
MODELSWARD, ClawVM y TARV son 33–44, 1–12 y 1–6 según los registros editoriales
conservados. GovMem se cita expresamente como arXiv versión 1. Una falta de acceso
del auditor a esas fuentes no se interpreta como un error de sus datos.

## 5 Conservación del consenso y aclaración de III-B

Se confirmó que la fila W04-R1 del consenso original menciona III-C para M1. La
definición de memoria está en III-B del artículo. Se aclara la remisión en el
manuscrito y el índice de evidencias, sin modificar el archivo entregado. Los
SHA-256 siguen coincidiendo y .gitattributes conserva los bytes de los tres CSV.
Las etiquetas y su resolución no cambian.

## 6 Lectura y organización del manuscrito

Los detalles de microbenchmarks pasan al Apéndice A, y la sensibilidad a metadatos
al Apéndice B. El cuerpo contiene referencias y resúmenes de sus alcances, y la
Sección V queda con diez subsecciones. Se condensan las salvedades repetidas y
la interpretación común se concentra en amenazas a la validez. Se conserva IEEEtran
y se revisan las páginas renderizadas; la cátedra no ha establecido un máximo de
páginas según lo indicado por los autores.

La versión v0.6.0-final-audit conserva las revisiones anteriores. Las evidencias
respaldan las comprobaciones internas descritas y mantienen explícito el alcance
de los resultados, sin atribuir validación independiente ni una calificación nueva.
