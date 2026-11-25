# Respuesta a la segunda auditoría de AgentArch

Autores: Leonardo Baca Calsin y German Arturo Chipana Jeronimo

Revisión atendida: Revision-articulo-C2-segunda-auditoria, 24 de noviembre de 2026.

Se amplió la evaluación y se corrigió el manuscrito IEEE. Se conservan los datos de las evaluaciones anteriores. Esta respuesta distingue las correcciones realizadas de las limitaciones que siguen abiertas; no atribuye una nueva calificación al artículo.

## 1. Repeticiones y diversidad efectiva

El piloto anterior se identifica como ocho solicitudes distintas, con tres repeticiones idénticas a temperatura cero. Sus 24 sesiones no se presentan como 24 tareas independientes. También se explica que la diferencia de cobertura de ese piloto frente a B2 corresponde únicamente a la precedencia de herramientas, Π3.

Se fijó un nuevo protocolo antes de ejecutar: doce solicitudes distintas, cinco muestras por solicitud, temperatura 0,7 y semillas 100–104. Las 60 sesiones previstas fueron válidas y produjeron 60 planes distintos, excluyendo diferencias exclusivamente verbales de los mensajes. La Tabla VIII presenta resultados por solicitud. Son doce grupos de cinco muestras, no sesenta tareas independientes.

## 2. Interacción entre agentes y memoria

Cada nueva sesión ejecuta OrderTriage, InventoryAgent y BillingAgent. El siguiente rol recibe los mensajes generados, los resultados efectivos de herramientas y la memoria compartida de los anteriores. Las llamadas, lecturas y escrituras proceden del modelo. El análisis comprueba que ese contexto fue incluido en las peticiones posteriores y que las acciones coinciden con los tramos capturados.

Se conservan 180 peticiones y respuestas del modelo y 1 085 tramos del SDK. La orquestación sigue un orden fijo; el modelo no escoge libremente al destinatario. Se utiliza Qwen3-0.6B-Q8_0 con llama.cpp b12704, contexto de 8192 tokens, cuatro hilos de CPU y GPU desactivada. Los servicios de inventario y pagos son locales de prueba.

La Tabla VII documenta P1, P3, M1, M2, Π1, Π2 y Π3 observados. P2 y M3 no aparecieron en esta ampliación. W10/W11 introducen deliberadamente alteraciones del prompt en diez sesiones. Otras 47 sesiones presentan infracciones sin esas perturbaciones. No se atribuyen al modelo las alteraciones de prompt introducidas por el experimento.

## 3. Etiquetado y resultado real de la tarea

El anotador utiliza código separado y no consulta las alertas del monitor, pero codifica las mismas políticas. El resumen, la metodología, las amenazas y las conclusiones aclaran que la coincidencia comprueba consistencia de implementación y no valida independientemente la adecuación de las políticas. No se realizó una evaluación humana de las etiquetas. La plantilla para esa revisión conserva los campos del revisor vacíos.

El anotador registró 57 sesiones con infracciones y tres conformes. AgentArch obtuvo 57 VP, cero FP, tres VN y cero FN; el primer paso coincidió en las 57 sesiones anómalas. B2 obtuvo 33 VP y 24 FN y localizó el primer paso en 13 de 57. B1 no detectó ninguna de las 57 infracciones. La Tabla VI presenta estos conteos, que siguen sujetos al alcance del criterio automático.

Además, se comprobaron los efectos del pedido con criterios fijados antes de ejecutar: producto y cantidad, operación financiera e importe, dirección final y ausencia de créditos no solicitados. El resultado fue cero tareas completas de 60 sesiones. Las tres sesiones conformes también dejaron tareas incompletas. El artículo informa este resultado en el resumen, los resultados y las conclusiones. Una traza conforme no garantiza completar el pedido. El modelo pequeño, la generación de un plan por rol y la ausencia de reparación limitan la representatividad de esta prueba.

## 4. Medición temporal y unidades

Se conservaron las 50 observaciones históricas por tipo y se recalcularon mínimo, mediana, p95 y p99. En turnos, la media histórica es 0,189 µs, la mediana 0,112 µs y el p99 0,986 µs. La diferencia muestra por qué la media sola era insuficiente.

La nueva medición, realizada después de detener la inferencia, utiliza cien lotes de mil llamadas en seis caminos: turno, memoria y herramienta, cada uno conforme o con alerta. Se verifica el número de alertas y se vacía la cola fuera del intervalo cronometrado. La Tabla V publica media, desviación estándar muestral, mínimo, mediana, p95 y p99. Se corrigió la unidad a µs.

Las medianas nuevas, en µs por llamada, fueron 0,072 y 0,144 para turno; 0,012 y 0,112 para memoria; y 0,416 y 0,557 para herramienta, respectivamente sin y con alerta. Los percentiles se calculan mediante interpolación lineal R7 sobre medias de lote. No representan percentiles de llamadas individuales. La medición incluye creación y encolado de alertas, pero excluye inferencia, captura completa del SDK, exportación y consumo de la cola. El costo extremo a extremo permanece como trabajo futuro.

## 5. Literatura, nombre y posicionamiento

Se añadieron fundamentos de chequeo de conformidad de Rozinat y van der Aalst y de verificación en tiempo de ejecución de Bartocci y colaboradores. Se relaciona la extensión agentarch.* con las convenciones semánticas GenAI de OpenTelemetry. Usar su SDK no se presenta como conformidad completa con todas esas convenciones.

Se cita y diferencia el benchmark AgentArch de Bogavelli y colaboradores. Se conserva el nombre del verificador, identificando a sus autores y repositorio. Frente a AgentSpec, se precisa el alcance del modelo conjunto de cláusulas, memoria y herramientas. B2 se describe como una implementación propia de permisos y argumentos inspirada en ese trabajo, sin atribuirle los resultados de la herramienta original.

Se explican los criterios de inclusión de los 26 documentos del corpus local y el posible sesgo de selección. La Tabla I vuelve a incluir citas. Se expande MCP como Model Context Protocol y se identifica GovMem mediante el título When not to write memory.

Las páginas de ClawVM, 1–12, y TARV, 1–6, se conservaron tras contrastar los registros editoriales mediante sus DOI. Se confirmó el nombre de MODELSWARD 2026 como Model-Based Software and Systems Engineering. La bibliografía incorpora 33 entradas y el registro paper/reference_audit.csv conserva las fuentes de verificación.

## 6. Redacción, figuras y tabla de metadatos

La introducción ahora enumera el piloto, la ampliación multiagente y la prueba de metadatos entre los aportes. Se reemplazó la expresión ambigua por «cuando se cumple la condición de violación». La Figura 3 se ubica en la Sección IV, junto a su explicación. La Figura 4 representa el intercambio efectivo entre los tres roles.

La Tabla IX presenta los cuatro casos de metadatos: P3 detectada con resumen fiel y omitida con resumen canónico obsoleto; M1 detectada con verified=false y omitida con verified=true incorrecto. El artículo incluye el comando node experiments/instrumentation_sensitivity.js. Estas dos omisiones delimitan la confianza que puede depositarse en la instrumentación.

Se mantienen tablas a dos columnas cuando su contenido lo necesita, mediante table* de IEEEtran. Ese ancho es compatible con la estructura IEEE de dos columnas. La revisión visual comprueba legibilidad, separación, numeración y ubicación; la extensión final deberá ajustarse al límite del concurso o revista elegido.

## 7. Evidencias y reproducción

El commit cd6dc65 fija el ejecutor y el protocolo previos a la ampliación. Los datos nuevos están en results/multiagent_run/ y results/latency_paths/. Se conservan solicitudes, respuestas, efectos, tramos, anotaciones, alertas, observaciones temporales y parámetros. Las versiones anteriores permanecen disponibles.

Los comandos npm run test:unit y node experiments/analyze_multiagent.js verifican operadores, aislamiento de sesiones, efectos de negocio, estadísticos y coherencia de las evidencias. El benchmark se reproduce con node experiments/benchmark_paths.js en un directorio de salida nuevo. Repetir la inferencia requiere el servidor y los pesos indicados en docs/second_audit_protocol.md y docs/live_pilot_protocol.md.

La revisión se identifica con v0.3.0-c2-second-review. El artículo puede leerse en paper/articulo.pdf y editarse en paper/articulo.tex. Continúan pendientes una revisión humana independiente, modelos y dominios adicionales, precedencia correlacionada por recurso y éxito, y medición extremo a extremo. Las correcciones fortalecen la trazabilidad del trabajo sin convertir estos límites en resultados ya demostrados.
