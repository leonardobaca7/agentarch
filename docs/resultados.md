# Resultados y evidencia

Los registros originales, los resúmenes y los formularios permanecen en `results/`. La edición editorial no vuelve a ejecutar modelos ni modifica esos archivos. Los metadatos y verificaciones anteriores describen la versión en que se generaron; la comprobación del manuscrito actual está en [paper/verification.json](../paper/verification.json).

## Detección

| Conjunto | Infractoras / sesiones | B1: VP y primer paso | B2: VP y primer paso | AgentArch: VP y primer paso |
| --- | --- | --- | --- | --- |
| Guionizado | 40 / 50 | 0; 0/40 | 10; 10/40 | 40; 40/40 |
| Piloto por rol | 12 / 24 | 0; 0/12 | 6; 6/12 | 12; 12/12 |
| Pedidos, 0.6B | 57 / 60 | 0; 0/57 | 33; 13/57 | 57; 57/57 |
| Pedidos, 1.7B | 12 / 12 | 0; 0/12 | 12; 9/12 | 12; 12/12 |
| Consulta general | 26 / 30 | 0; 0/26 | 25; 16/26 | 26; 26/26 |

No hubo falsos positivos en los conformes de esas condiciones. Los denominadores pequeños y las repeticiones impiden extrapolar una tasa general. Las treinta consultas tipadas fueron conformes y completas; no contienen positivos para estimar exhaustividad.

Las etiquetas automáticas y el monitor comparten políticas, por lo que su concordancia mide consistencia. En pedidos hay 141 pares operador/paso; M1 concentra 84, en 46 sesiones. Los cortes recalculan etiquetas, alertas y primer paso:

| Corte | Sesiones | Infractoras | Pares coincidentes | Primer paso |
| --- | ---: | ---: | ---: | ---: |
| Todas | 60 | 57 | 141/141 | 57/57 |
| Sin M1 | 60 | 38 | 57/57 | 38/38 |
| Sin W10/W11 | 50 | 47 | 112/112 | 47/47 |
| Sin ambos | 50 | 28 | 38/38 | 28/28 |

Los 22 casos conformes al retirar M1 corresponden a las reglas restantes; no son negativos nuevos del monitor completo. Fuente: [exclusions.json](../results/consolidated_analysis/exclusions.json).

## Finalización e interfaces

Ningún pedido del modelo pequeño (60) ni del mayor (12) se completó. Los doce controles escritos a mano sí completaron la tarea; diez fueron conformes y dos conservaron perturbaciones de prompt. Los controles comprueban que el ejecutor admite trayectorias completas.

La interfaz tipada produjo 30/30 consultas conformes y completas. La general produjo 4/30 conformes y ninguna completa. Las cuatro conformes pertenecen a cuatro plantillas y permanecen separadas del resto de cohortes. Se conservaron todos los intentos y no hubo errores de inferencia en ambos lotes. El contraste entre interfaces es descriptivo: las variantes comparten diez plantillas y las condiciones se ejecutaron en momentos distintos.

El lote tipado observa 90 turnos canónicos, 90 llamadas restringidas y 90 lecturas anteriores al TTL. Sus 30 escrituras son inicializaciones verificadas. No contiene conflictos P2, reemplazos M2 ni objetivos de precedencia Π3; no comprueba cobertura adversa de las nueve reglas. Véanse [alcance por operador](../results/final_audit/typed_scope.json) y [comparación de interfaces](../results/final_audit/query_interfaces.json).

## Revisión de diez sesiones

Leonardo Baca Calsin y German Arturo Chipana Jeronimo revisaron una muestra dirigida: las tres sesiones conformes del conjunto principal y siete infractoras. Se conservaron los [formularios de Leonardo](../results/consolidated_analysis/revision_Leonardo.csv), [de German](../results/consolidated_analysis/revision_German.csv) y el [consenso](../results/consolidated_analysis/consenso_revision.csv), sin modificar sus bytes.

Los conjuntos iniciales de operador/paso coinciden exactamente en 9/10 sesiones: catorce pares comunes de quince en la unión. En W04-R1, German expresó la duda de contar M1@16 en una escritura repetida. El consenso la incluye porque la consulta del paso 10 falló y el paso 16 seguía sin respaldo. La remisión a III-C en el CSV original corresponde a III-B en el artículo; esta aclaración no altera el formulario.

Ambos revisores coinciden en presencia de infracción en 10/10 sesiones (siete positivas, tres negativas; kappa de Cohen = 1). Coinciden también en que las diez tareas están incompletas; para esta decisión kappa es indefinido por categoría única. Los quince pares del consenso coinciden con el monitor. La discusión de W09-R1 conserva mensajes de éxito sin efectos reales que no son clasificados por las nueve reglas.

La revisión corresponde a los dos autores y a una muestra dirigida; no se documentó cegamiento ni la independencia de recogida de formularios. Los acuerdos describen la muestra, sin validación poblacional de las políticas. El [análisis con hashes](../results/human_review/analysis.json) conserva el desacuerdo inicial y el consenso por separado.

## Costo y metadatos

Las medianas conformes del núcleo van de 0,012 a 0,416 µs en las entradas medidas. El adaptador de turno tiene medianas de 0,301 µs conforme y 0,475 µs con alerta. Las cien medias por lote, dispersión y percentiles están en los directorios de [núcleo](../results/latency_paths/) y [suplemento](../results/latency_supplement/). La tabla del artículo se genera directamente de ellos.

La sensibilidad a metadatos contiene cuatro casos. El resumen correcto del texto alterado activa P3 y la marca no verificada activa M1. Informar el resumen canónico o una verificación falsa oculta esas infracciones: son dos omisiones controladas. La precisión del monitor depende de la evidencia entregada por el instrumentador.
