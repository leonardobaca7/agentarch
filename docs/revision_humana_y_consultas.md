# Incorporación de la revisión de los autores y consultas prospectivas

Fecha: 25 de noviembre de 2026

Se incorporaron los dos formularios individuales y el consenso entregados por los
autores, se preparó un lote prospectivo de consultas sin selección por las alertas
y se corrigieron los puntos editoriales de la auditoría. Los formularios originales
se conservan sin modificar. El artículo mantiene IEEEtran; los autores confirmaron
que no hay un límite de páginas establecido.

## 1 Revisión humana recibida

Leonardo Baca Calsin y German Arturo Chipana Jeronimo anotaron diez sesiones en sus
formularios. Los conjuntos iniciales de operador y paso coinciden exactamente en
nueve sesiones, con catorce pares comunes de quince en la unión. Ambos coinciden
en presencia de infracción en diez de diez: siete con infracciones y tres conformes.
Coinciden también en que las diez tareas están incompletas.

La diferencia está en W04-R1. German no incluyó M1@16 en su columna de etiquetas
y expresó una reserva de juicio sobre contar la escritura repetida. El consenso
considera cada escritura por separado: como la consulta de inventario del paso 10
falló, el paso 16 seguía careciendo de respaldo. Se conserva tanto la duda inicial
como su resolución. En W09-R1 se documenta también la discusión sobre mensajes
que afirman éxitos sin efectos reales, fuera de las nueve reglas actuales.

Los quince pares del consenso coinciden con el anotador y el monitor. También
coinciden los diez resultados de tarea. El acuerdo binario de presencia tiene
kappa de Cohen igual a uno; para finalización, kappa es indefinido porque ambos
revisores emplean una sola categoría. El artículo separa estas medidas del acuerdo
exacto inicial de conjuntos, que es nueve de diez.

La muestra es dirigida y los revisores son autores del sistema. No se verificó la
independencia de recogida ni el acceso previo a resultados automáticos. Por tanto,
se informa una revisión por autores, sin llamarla externa ni completamente ciega.
Esta evidencia no valida independientemente todas las políticas ni convierte los
cortes automáticos sin M1 y W10/W11 en resultados humanos.

Los originales están en results/consolidated_analysis/revision_Leonardo.csv,
revision_German.csv y consenso_revision.csv. El análisis con SHA-256 está en
results/human_review/analysis.json. Se añadió una regla de Git para preservar
los bytes de los tres CSV entre plataformas. El consenso remite a III-C para M1;
su definición corresponde a III-B. Se aclara esa remisión sin alterar lo entregado.

## 2 Negativos prospectivos y su alcance

El protocolo fijó treinta intentos antes de ejecutar: diez plantillas de petición
benigna con tres variantes de pedido, producto y cantidad. Se utiliza Qwen3-0.6B-Q8_0,
temperatura 0,7 y semillas 200–229. Los tres roles intercambian sus mensajes,
resultados y memoria. No se descartan ni repiten sesiones según las alertas.

La interfaz está restringida antes de inferir: cada rol dispone de una consulta
con argumentos tipados y no hay escrituras, reservas ni pagos. El modelo genera
los argumentos y mensajes; no se reemplazan por planes escritos a mano. El esquema
limita permisos y rangos, pero no fija el pedido/producto ni obliga a cotizar cero.
Los servicios y el criterio de tarea comprueban estos resultados.

Este lote aporta evidencia sobre consultas tipadas del dominio local y conserva
todos sus intentos. La conformidad está favorecida por la interfaz, de modo que no
equivale a agentes con acciones libres. Sus negativos no se suman a los tres del
estudio original para publicar una tasa general. Las treinta sesiones están
agrupadas en diez plantillas. Los resultados completos se conservan en
results/prospective_queries/ y en la tabla por plantilla del artículo.

Se obtuvieron treinta sesiones válidas de treinta intentos, sin errores: treinta
conformes, cero alertas y treinta consultas completas. Se conservaron noventa
peticiones y respuestas del modelo y 420 tramos del SDK. Todas las plantillas
aportan sus tres sesiones, sin selección posterior. Al no haber infracciones en
este lote, no se estima exhaustividad de detección ni se informa un F1 perfecto.

La necesidad de un conjunto conforme de agentes libres sin selección por alertas
sigue declarada en amenazas y trabajo futuro. Tampoco se extiende la revisión
humana de la muestra original a estas sesiones nuevas, que se analizan de forma
automática. Los éxitos de consulta no se comparan como una mejora de las tareas
originales de reserva y pago.

## 3 Referencias verificadas

ACL Anthology registra expresamente el DOI 10.18653/2026.aacl-long.44 sin añadir
v1/ y páginas 915–933. Se conserva el DOI publicado y se añade la URL del registro
a la referencia para facilitar su comprobación. El repositorio oficial de
OpenTelemetry semantic-conventions-genai existe y contiene las convenciones
citadas; el artículo aclara que es un repositorio separado.

Los metadatos editoriales de Crossref vuelven a confirmar las páginas de ClawVM
(1–12), TARV (1–6) y el artículo de MODELSWARD (33–44). El nombre del foro se
mantiene como Model-Based Software and Systems Engineering. GovMem se cita
expresamente como arXiv:2607.02579, versión 1; no se inventan páginas de actas.
Los registros consultados están en results/human_review/reference_metadata.json
y docs/verificacion_fuentes_consolidada.md. Los valores correctos no se cambian
por analogía con otros DOI o nombres de repositorios.

## 4 Redacción y presentación

Se eliminó la frase sobre una inspección asistida por IA que no se describía. Su
lugar lo ocupa el procedimiento y resultado de los formularios recibidos. Se
define M1 como admisión de memoria sin respaldo en el resumen, manteniéndolo por
debajo de doscientas palabras. La Tabla IV utiliza una columna y colocación fija
junto a V-C, con el mismo contenido numérico. El trabajo futuro solicita de forma
explícita el conjunto conforme de agentes libres y revisión externa con recogida
independiente y cegamiento documentados.

Se mantiene el formato IEEE. La extensión refleja los experimentos y sus límites,
sin imponer un máximo que la cátedra no ha establecido. La verificación final
comprueba citas, referencias cruzadas, numeración, tablas y figuras renderizadas.

## 5 Versiones y reproducción

52eee33 fija el ejecutor y protocolo del lote de consultas antes de inferir.
adc207f conserva los formularios y el análisis de acuerdo. La revisión se fija
mediante v0.5.0-human-review y preserva las anteriores. Los scripts analizan las
evidencias sin modificar las opiniones de los revisores ni reescribir los datos
de los estudios originales.
