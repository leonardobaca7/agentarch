# Respuesta a la revisión C2

Autores: Leonardo Baca Calsin y German Arturo Chipana Jeronimo
Documento del docente: Revision-articulo-C2-Baca-Chipana.docx, 23 de noviembre de 2026
Revisión realizada el 24 de noviembre de 2026
Versión de entrega: v0.2.0-c2-review

Se revisaron las observaciones de presentación, referencias, reproducibilidad y alcance metodológico.
La revisión incorpora además un piloto ejecutado con un modelo abierto local y captura mediante
el SDK de OpenTelemetry. La evidencia del piloto se conserva separadamente del corpus guionizado.

## Referencias y orden IEEE

Se reorganizó la primera aparición de las referencias en el texto. La tabla de ejes ya no introduce
citas que se desplazan con los flotantes. La bibliografía sigue el orden de lectura del PDF.
Se uniformaron conectores y términos bibliográficos en inglés y se añadieron los DOI y páginas
confirmados. La referencia sobre observabilidad e inyección de fallos conserva correctamente
el título y el foro, con páginas 211–215 y DOI 10.1109/ICST69053.2026.00037.

Se cotejaron los metadatos con los artículos locales, Crossref, páginas de editoriales y fuentes
de autores. Miranda quedó en pp. 33–44. AgentSpec incluye pp. 2938–2950. SALLMA incluye pp. 5–8.
Para ediciones del corpus sin metadatos editoriales confirmados se cita la versión arXiv concreta.
GovMem se identifica por arXiv:2607.02579; Watson, por arXiv:2411.03455v3; y Pro2Guard,
por arXiv:2508.00500v2 de 2026.

La bibliografía contiene 26 trabajos de investigación y tres fuentes oficiales del SDK, del modelo
y del ejecutor. El archivo paper/reference_audit.csv registra la fuente de comprobación por entrada.

## Tabla IV y figuras

La tabla global usa ahora el ancho de ambas columnas con ocho campos alineados y filas completas.
El generador de resultados conserva esa disposición al regenerar el archivo LaTeX. Se revisaron
las Figuras 2 a 4, la separación de pies y tablas, el PDF renderizado y la extracción de texto.
La numeración y las referencias cruzadas se comprobaron sobre el PDF compilado.

## Reproducibilidad y licencia

Se distingue entre el código medido y el commit que almacena los resultados. bd1c1a1 corresponde al
microbenchmark original; 73dd953 incorpora sus salidas y el manuscrito previo; 647f45f identifica
el ejecutor utilizado en el piloto del modelo. La etiqueta v0.2.0-c2-review fija los archivos
de esta entrega. El protocolo del piloto registra parámetros, modelo, SHA-256, equipo y reproducción.

Se normalizó la atribución de copyright de LICENSE para conservar el texto estándar MIT.
El reconocimiento de licencia de GitHub se verifica después de publicar la revisión.

## Interpretación del cien por ciento

El resumen, el análisis y las conclusiones expresan que el 100 % guionizado corresponde a cobertura
de los patrones preparados para las reglas. Se distingue el conteo de escenarios de la cantidad de
patrones. Se conserva el resultado observado de 40/40 y 0/10, acompañado de sus condiciones.

B1 se identifica expresamente como control negativo de HTTP >= 500. B2 se presenta como una
implementación propia de permisos y argumentos inspirada en AgentSpec. La diferencia de resultados
se interpreta como cobertura de las configuraciones implementadas.

## Incertidumbre de falsos positivos

Se añadió el límite superior binomial exacto unilateral al 95 % para cero alertas en diez ensayos,
que es 1 − 0,05^(1/10) = 25,9 %. Se indica la aproximación de la regla del tres, 30 %, y que ambas
lecturas requieren supuestos de muestreo que los patrones nominales repetidos no aseguran.
El conteo del corpus se presenta descriptivamente. Las réplicas del piloto tampoco se tratan como
24 observaciones independientes.

## Modelo en ejecución

Se descargaron los pesos oficiales Qwen3-0.6B en GGUF Q8_0, de 639446688 bytes, y se ejecutaron con
llama.cpp b12704 sobre CPU en el equipo de 16 GB. El modelo generó los planes de herramientas.
OpenTelemetry SDK 2.12.1 capturó los turnos y las llamadas ejecutadas por funciones locales de prueba.

Se ejecutaron ocho solicitudes, cuatro nominales y cuatro adversariales, con tres repeticiones,
temperatura cero y semillas 42, 43 y 44. Hubo 24 respuestas válidas, cero errores y cero planes vacíos.
Las réplicas produjeron los mismos planes, por lo que la diversidad efectiva fue de ocho secuencias.

Un oráculo separado del monitor etiquetó las acciones realmente producidas. Se observaron 12 sesiones
con infracciones y 12 conformes. AgentArch detectó y localizó las 12 anómalas y emitió cero alertas en
las otras 12. A nivel de solicitud, son cuatro secuencias anómalas y cuatro conformes. B1 detectó
cero y B2 detectó seis de las doce sesiones anómalas. El piloto produjo 78 tramos del SDK.
Se conservaron mensajes, respuestas HTTP completas, planes, etiquetas, alertas y metadatos.

La evaluación añadida abarca herramientas y precedencia, con un rol asignado por sesión. Las
herramientas representan servicios de prueba. Los operadores completos de prompts y memoria siguen
evaluados mediante el corpus guionizado. El piloto aporta evidencia exploratoria de integración
bajo estas condiciones y mantiene explícitos sus límites.

## Supuesto de instrumentación

Se añadió una prueba separada de cuatro casos. Un prompt alterado con su hash fiel produjo P3.
El mismo cambio con un hash canónico obsoleto se omitió. Una escritura sin respaldo produjo M1
con verified=false y se omitió al informar incorrectamente verified=true.
Los resultados muestran dos omisiones atribuibles a metadatos incorrectos y motivan evaluar
la integridad del instrumentador. Se conservan en results/instrumentation_sensitivity.json.

## Alcance de la medición temporal

La tabla de tiempo identifica el costo del núcleo sobre entradas conformes y con hashes preparados.
Se conserva la medición original y su entorno. El artículo declara expresamente que exportación,
consumo de alertas e inferencia requieren un experimento adicional para estimar el costo completo.
Los tiempos del piloto se conservan como duraciones observadas. Una medición incremental exigirá
un diseño emparejado con y sin monitor.

## Trabajo futuro

Se añadió una sección propia sobre modelos y solicitudes adicionales, interacción entre agentes,
instrumentación incompleta, correlación por recurso y mediciones de costo operativo.
Los ensayos ejecutados con el modelo se describen en metodología y resultados.

## Comprobaciones de la entrega

La revisión comprueba las nueve pruebas unitarias, el aislamiento de sesiones mediante el SDK,
la propagación de errores de conexión y la consistencia de los artefactos del piloto.
El verificador de artefactos contrasta las 24 respuestas con las 24 etiquetas y los 78 tramos,
incluidos operadores y primeros pasos. Las métricas se recalculan a partir de esos registros.
El PDF se compila, se revisa visualmente y se verifica el orden de las 29 primeras citas.

El artículo conserva el alcance de una evaluación controlada con piloto local. La diversidad
de modelos, la coordinación libre entre agentes y el costo operativo completo siguen pendientes.
