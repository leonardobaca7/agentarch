# Respuesta a la auditoría consolidada de AgentArch

Autores: Leonardo Baca Calsin y German Arturo Chipana Jeronimo

Fecha: 25 de noviembre de 2026

Se atendió el informe Auditoría consolidada — AgentArch (C2, segunda revisión). Se añadieron controles del ejecutor, análisis por exclusión y evidencia con un modelo mayor. El artículo mantiene IEEEtran y distingue cobertura de reglas, concordancia automática y finalización de tareas. La revisión humana sigue pendiente y no se declara realizada por el asistente.

## 1 Control positivo del ejecutor

Se escribieron doce planes, uno por solicitud, que usan el mismo ejecutor, servicios de prueba, memoria, tramos y criterio de finalización que los planes del modelo. Los doce completaron la tarea. Diez fueron conformes y dos conservaron las perturbaciones de prompt de W10/W11, detectadas como P1/P3. Las entradas identifican su origen como control escrito a mano y no simulan respuestas HTTP del modelo.

Este resultado demuestra que existen trayectorias que el arnés puede ejecutar y aceptar como completas. No demuestra que toda su implementación esté libre de errores ni que su interfaz permita a cualquier modelo resolver los pedidos. Los controles se mantienen separados de la evidencia de inferencia.

## 2 Evidencia de falsos positivos

Se añadió el resultado cero FP en tres sesiones conformes, con cota ilustrativa unilateral al 95 % de aproximadamente 63,2 % bajo independencia. Los casos son W02-R1, W02-R4 y W06-R3, procedentes de solo dos solicitudes. No se mezclan con los nominales guionizados ni con los controles para producir una cota más favorable. La dependencia y la selección del dominio impiden interpretar esa cifra como tasa poblacional.

Las seis solicitudes antes llamadas nominales se denominan peticiones benignas. Ese término describe la intención de entrada: 27 de sus 30 ejecuciones generaron infracciones. La denominación interna nominal se conserva en los datos históricos para no reescribir las evidencias, pero la tabla y el texto aclaran su significado.

## 3 Detección con y sin M1

M1 representa 84 de 141 pares de operador y paso, el 59,6 %, en 46 sesiones. Se filtraron tanto las etiquetas como las alertas y se calculó nuevamente el primer paso de cada sesión. Con todas las reglas se obtienen 57 sesiones infractoras y 141 pares coincidentes. Sin M1 quedan 38 sesiones y 57 pares; sin W10/W11, 47 sesiones y 112 pares; sin ambas fuentes, 28 sesiones y 38 pares. Todas las variantes coinciden respecto de su criterio filtrado, sin FP, FN ni pares extra.

Las 22 sesiones conformes al retirar M1 no son negativos adicionales del monitor completo: se evalúan con reglas más débiles. El modelo generó acciones que ejercitan M1, M2, Π1, Π2 y Π3. P1/P3 son perturbaciones inyectadas; P2/M3 no aparecieron en las sesiones de inferencia de la ampliación principal. Se preserva esta distinción en los resultados y las conclusiones.

## 4 Modelo mayor y resultados de tarea

Se fijó un protocolo previo para Qwen3-1.7B-Q8_0 oficial: doce solicitudes, una muestra por solicitud, temperatura 0,7 y semilla 100. Se conservaron prompts, roles, servicios, cuantización Q8_0, contexto de 8192 y límite de 512 tokens de salida. El SHA-256 del archivo descargado coincidió con los metadatos oficiales antes de iniciar el servidor.

La comparación se realiza con la primera muestra de las mismas doce solicitudes de Qwen3-0.6B, no con el total de 60 como si fueran tamaños equivalentes. Se conservan las respuestas y errores sin reintentar selectivamente para mejorar los conteos. Los resultados de inventario, finanzas, dirección y finalización se publican por separado. El contraste es exploratorio; aumentar el tamaño del modelo no se interpreta como garantía de completar tareas.

Las doce sesiones del modelo mayor fueron válidas, sin errores de inferencia, pero ninguna fue conforme ni completó la tarea. En la primera muestra del modelo pequeño hubo una conforme y ninguna tarea completa. Ambos satisficieron la condición de inventario en cero casos y la financiera en uno; la dirección fue correcta en diez y once casos, respectivamente. El monitor coincidió en las doce sesiones infractoras del modelo mayor. B2 también detectó las doce, aunque localizó el primer paso en nueve. No se afirma que este contraste haya mejorado la validez externa mediante tareas exitosas.

## 5 Tiempos y diferencias históricas

Las medias conformes de turno, escritura y herramienta pasan de 0,189/0,079/0,582 a 0,086/0,020/0,439 µs, razones aproximadas de 2,2, 4,0 y 1,3. Ambos ejecutores históricos ya calentaban cada lote. Cambian el número y orden de lotes, los caminos, algunas entradas y el drenaje; el estado de optimización también puede variar entre procesos. Sin un diseño emparejado no se atribuye la diferencia al calentamiento ni se declara una aceleración del verificador.

Se añadieron mediciones de lectura vigente y expirada para M3 y del adaptador AgentArchOtelProcessor con turnos conformes y con alerta. Cada camino conserva cien medias de lote de mil llamadas, calentamiento y comprobación del conteo de alertas. El adaptador incluye conversión, búsqueda de sesión, comprobación, temporización interna, drenaje y callback de auditoría. Recibe objetos con la forma de ReadableSpan y excluye creación de tramos con el SDK, exportación e inferencia. No se presenta como costo extremo a extremo.

El artículo informa los alcances diferentes del drenaje y que p99, con cien observaciones, depende de las dos mayores medias. Los percentiles describen medias de lote y no llamadas individuales. Las mediciones anteriores se conservan.

Las medianas complementarias fueron 0,013 µs para lectura vigente, 0,148 para expirada, 0,301 para el adaptador con turno conforme y 0,475 para el adaptador con alerta. Sus muestras y estadísticos completos están en results/latency_supplement/.

## 6 Referencias y revisión de literatura

Se contrastaron MODELSWARD, los fundamentos de conformidad y verificación, ClawVM, TARV, GovMem, el benchmark AgentArch empresarial y la URL oficial de las convenciones GenAI. ACL Anthology registra el DOI 10.18653/2026.aacl-long.44 sin v1/ y páginas 915–933: se conservan esos datos. Los registros editoriales de ACM e IEEE depositados en Crossref confirman 1–12 y 1–6 para ClawVM y TARV. No se sustituyeron por rangos inventados.

GovMem se cita deliberadamente mediante arXiv:2607.02579v1, cuya ficha indica aceptación en MLISE; no se añaden páginas de actas no verificadas. Springer confirma el capítulo de verificación y TU Eindhoven los datos del artículo de conformidad. Se corrigieron las comas antes de and en las referencias señaladas y se añadió la fuente oficial del modelo mayor. Las comprobaciones y enlaces están en docs/verificacion_fuentes_consolidada.md.

La revisión de literatura se identifica como narrativa sobre PDF reunidos por los autores. Se explica su agrupación por ejes y la ausencia de un registro reproducible de las búsquedas originales. No se inventa retrospectivamente un protocolo sistemático.

## 7 Revisión humana que sigue pendiente

No se ha realizado una revisión humana de etiquetas. Se entregan diez sesiones con contexto y un formulario: los tres conformes y siete casos con infracciones. Es una selección dirigida, no una muestra aleatoria. Los campos de revisor, fecha, pares anotados y justificación permanecen vacíos.

El procedimiento está en docs/procedimiento_revision_humana.md y los archivos en results/consolidated_analysis/human_review_packet.json y human_review_form.csv. Una persona debe anotar antes de consultar los veredictos y documentar las discrepancias. Solo entonces podrá incorporarse al artículo un resultado humano. La inspección asistida por IA no se atribuye a los autores ni sustituye esa validación.

## 8 Presentación y trazabilidad

Se redujo el resumen a menos de 200 palabras y se dividió la evaluación principal en protocolo, anotador, criterios de negocio y resultados. Se unificó el nombre AgentArch y se ajustó la colocación de la tabla por dimensión. Según los autores no hay un límite de páginas establecido; se mantiene el formato IEEE y se revisa el PDF renderizado.

cd6dc65 fija benchmark_paths.js y el ejecutor principal; f93051a, analyze_multiagent.js; 9261a10, el control y la configuración del modelo mayor; 9ca896f, las exclusiones y el benchmark complementario. Los metadatos conservan el commit utilizado en cada ejecución. La API pública de GitHub identificó la licencia como MIT el 25 de noviembre; no fue necesario modificarla otra vez.

La revisión se identifica con v0.4.0-consolidated-review. Se mantienen las versiones anteriores. Los cambios fortalecen la evidencia y su interpretación, pero no permiten prometer aceptación editorial, una nueva calificación o validación humana ya realizada.
