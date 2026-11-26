# Arquitectura y reglas de AgentArch

AgentArch observa eventos de ejecución y los contrasta con una especificación de comportamiento B = ⟨P, M, Π⟩. P contiene obligaciones de prompt, M describe operaciones de memoria y Π reúne permisos, validadores y precedencias de herramientas. La especificación del dominio de pedidos está en [architecture_order_support.yaml](../spec/architecture_order_support.yaml).

## Condiciones de violación

| Regla | Se activa cuando… |
| --- | --- |
| P1 | Falta un identificador de cláusula obligatorio para el rol. |
| P2 | Están activas dos cláusulas declaradas incompatibles. |
| P3 | El resumen SHA-256 de una cláusula difiere de su texto canónico. |
| M1 | Una escritura se declara no verificada. |
| M2 | Se cambia el valor de una clave existente sin autorización de reemplazo. |
| M3 | Se lee una clave conocida después de su TTL. |
| Π1 | La herramienta no pertenece al conjunto permitido para el rol. |
| Π2 | Los argumentos no satisfacen el validador de la herramienta. |
| Π3 | Se llama una herramienta sin una aparición anterior de su predecesora en la sesión. |

La marca `verified` procede de la aplicación. El monitor no deduce si una afirmación es verdadera. En los experimentos, las escrituras se contrastan con los resultados efectivos de servicios y las autorizaciones del caso. Una escritura repetida sin respaldo puede volver a activar M1 en su propio paso.

Π3 conserva nombres de herramientas observados. No exige éxito de la llamada previa ni identifica el recurso sobre el que actuó. Por ejemplo, haber observado `verify_inventory` satisface la precedencia de una reserva aunque la consulta haya fallado. Esta semántica es la usada en la evaluación y debe distinguirse de una dependencia causal de negocio más estricta.

## Recorrido de la evidencia

Los agentes producen turnos, lecturas, escrituras y llamadas a herramientas. El núcleo JavaScript recibe tramos normalizados en `onEnd`, evalúa la familia correspondiente, actualiza su estado y encola eventos de infracción. El consumidor obtiene las alertas mediante el drenaje de la cola. Los eventos identifican traza, tramo, paso, instante y operadores.

El adaptador de OpenTelemetry recibe `ReadableSpan`, separa el estado por `traceId` y lo libera al finalizar la sesión. Las pruebas incluyen sesiones intercaladas. El chequeo es pasivo: la aplicación ejecuta sus acciones y los servicios pueden rechazarlas por sus propias validaciones. Un HTTP 400 no borra del registro el intento observado.

Los atributos `agentarch.*` son extensiones del dominio. Se reutiliza `gen_ai.request.model`, pero no se declara conformidad completa con todas las convenciones GenAI. La exportación del experimento es local y síncrona; los tiempos de la cola y del SDK dependen del camino medido.

## Dominio de pedidos

OrderTriage consulta y deriva el pedido; InventoryAgent consulta o reserva inventario; BillingAgent calcula un reembolso o realiza un pago. Cada turno recibe mensajes, resultados de herramientas y memoria de los anteriores. El ejecutor conserva las peticiones y respuestas del modelo, sus acciones estructuradas y los efectos de los servicios.

Las reglas de conformidad y la finalización de tarea responden preguntas distintas. Una sesión puede no infringir ninguna regla y dejar el pedido incompleto. La finalización exige efectos concretos: cantidades reservadas, importe correcto de un pago único, dirección final y ausencia de créditos no solicitados, según el caso.

## Alcance de la observación

El instrumento debe registrar el texto y los argumentos realmente usados. En la prueba de sensibilidad, informar un resumen canónico para un prompt alterado o marcar como verificada una escritura sin respaldo ocultó infracciones. El monitor evalúa la evidencia recibida; los resultados de esta prueba están en [instrumentation_sensitivity.json](../results/instrumentation_sensitivity.json).

El costo depende de las estructuras recorridas y de la cantidad de eventos. Las mediciones publicadas caracterizan entradas y caminos concretos; no establecen complejidad constante universal ni costo extremo a extremo de la inferencia.
