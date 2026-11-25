# Resultados de la revisión realizada por los autores

Se recibieron los formularios individuales de Leonardo Baca Calsin y German Arturo
Chipana Jeronimo y el consenso fechado el 25 de noviembre de 2026. Los originales
se conservan sin modificar en `results/consolidated_analysis/`. El análisis y sus
SHA-256 están en `results/human_review/analysis.json`.

Se trata de una revisión por dos autores, según los documentos entregados. No se
verificó cómo se recogieron las anotaciones, si hubo acceso previo a las etiquetas
automáticas ni si las respuestas individuales se completaron sin intercambio.
No se presenta como revisión externa ni completamente ciega.

La muestra dirigida incluye diez sesiones: tres conformes y siete con infracciones.
Los conjuntos de pares operador/paso de los dos formularios iniciales coinciden
exactamente en nueve sesiones. Sus conjuntos contienen 14 pares comunes de 15 en
la unión. En W04-R1, el formulario de German no incluye M1@16 en la columna de
etiquetas y expresa la duda de si una escritura repetida debe contarse otra vez.
Se informa esa reserva de juicio; no se convierte silenciosamente en una etiqueta
negativa definitiva ni se borra del documento original.

Ambos formularios coinciden en presencia de infracción en diez de diez sesiones
(siete positivas y tres negativas; kappa binario de Cohen igual a 1). También
coinciden en que las diez tareas están incompletas. Para esa segunda decisión,
kappa no está definido porque ambos revisores usan una sola categoría.

El consenso trata cada escritura según la evidencia existente en su propio paso.
En W04-R1 la consulta de inventario del paso 10 falla, por lo que la escritura del
paso 16 sigue sin respaldo. El consenso contiene 15 pares, todos coincidentes con
las anotaciones automáticas y el monitor. También se conserva la discusión de
W09-R1 sobre afirmaciones incorrectas en los mensajes, que las nueve reglas actuales
no clasifican por su contenido libre. Esa discusión no alteró los pares anotados.

El texto original del consenso de W04-R1 remite a III-C para M1. La definición de
memoria está en III-B del manuscrito revisado; se aclara aquí sin reescribir lo
entregado por los revisores. La correspondencia de operadores y pasos es correcta.

Estos resultados aportan una comprobación humana de una muestra del estudio, pero
no una validación independiente amplia de las políticas ni una estimación de falsos
positivos: los autores diseñaron el sistema y la muestra se seleccionó de forma
dirigida. Los análisis de exclusión de M1 y W10/W11 siguen siendo automáticos.

Reproducción con Python 3 desde la raíz del repositorio:

```text
python experiments/analyze_human_review.py
```

El script valida identificadores y pasos, compara las etiquetas declaradas y los
resultados de tarea, calcula acuerdos y conserva los resúmenes. No rellena ni
reescribe las opiniones de los revisores.
