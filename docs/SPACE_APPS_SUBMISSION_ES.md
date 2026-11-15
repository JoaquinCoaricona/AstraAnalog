# AstraAnalog — contenido para el envío a NASA Space Apps

Preparado el 15 de noviembre de 2026 a partir del formulario aportado, el código disponible y los chats del proyecto. Este documento es un borrador para copiar al formulario; no constituye un envío ni una confirmación de funcionamiento de la última refactorización.

## Project Name

AstraAnalog

## Summary

AstraAnalog es una aplicación web que ayuda a identificar y comparar lugares de la Tierra donde ensayar condiciones relevantes para la exploración lunar y marciana. El usuario define el tipo de misión, la región, la época y requisitos de viento, temperatura, precipitación y pendiente. La plataforma propone sitios con apoyo de Gemini y búsqueda web, contrasta sus condiciones con climatologías de NASA POWER y elevaciones de Copernicus DEM a través de Open-Meteo, y presenta resultados con imágenes satelitales, mapas, fuentes y explicaciones. El sistema distingue coincidencias con los umbrales de alternativas que no los cumplen por completo, y compara meses para orientar futuras campañas. Su aporte es transformar datos dispersos en una experiencia guiada y transparente para explorar candidatos a análogos terrestres. Es una herramienta de preselección: cada comparación explicita sus límites y requiere validación local antes de organizar un ensayo.

## Project Demonstration

PENDIENTE: pegar la URL pública de una presentación de hasta 7 diapositivas en total, o de un video de hasta 30 segundos. No usar una URL local ni una que requiera iniciar sesión, permiso o contraseña.

Guion sugerido para un video de 30 segundos (aproximadamente 60 palabras; ajustar el montaje para no superar el límite):

> Antes de explorar otros mundos, necesitamos ensayar en la Tierra. AstraAnalog permite elegir una misión y condiciones de viento, frío, sequedad o pendiente. Gemini propone lugares; NASA POWER y Copernicus aportan datos para contrastarlos. Comparamos candidatos y meses, con imágenes, fuentes y limitaciones visibles. Así convertimos datos abiertos en un punto de partida para planificar ensayos.

Secuencia de captura sugerida: portada (0–4 s), criterios del recorrido (4–11 s), resultados de una búsqueda real terminada (11–21 s), ficha de clima y evidencia (21–27 s), cierre con nombre y enlace (27–30 s). Cortar los tiempos de espera sin simular resultados. Rotular el video de portada y cualquier fotograma derivado como generados con IA cuando aparezcan.

Alternativa de presentación, máximo 7 diapositivas incluyendo portada:

1. **AstraAnalog.** El viaje empieza antes del despegue. Exploración de candidatos terrestres para preparar ensayos.
2. **Problema.** Las condiciones útiles para un ensayo están repartidas entre fuentes climáticas, modelos de elevación y cartografía. El parecido visual por sí solo no justifica una analogía.
3. **Recorrido.** Elegir misión, condiciones, prioridad, región, mes y umbrales. Mostrar una captura del formulario.
4. **Método.** Gemini + Google Search proponen lugares; NASA POWER y Open-Meteo/Copernicus aportan datos; el código compara umbrales; Gemini explica las diferencias.
5. **Demostración.** Mostrar candidatos de una búsqueda efectivamente completada, con medidas y cumplimiento de requisitos. No inventar un hallazgo ni una búsqueda exitosa.
6. **Transparencia y límites.** Fuentes y meses consultables; alternativas identificadas; climatología regional y pendiente aproximada; validación de campo pendiente.
7. **Impacto y créditos.** Facilitar la preselección de sitios para estudiantes y equipos de robótica. Enlaces al proyecto, recursos y declaración de IA.

## Project

PENDIENTE: pegar la URL pública de la aplicación o del repositorio final. Un repositorio es una opción admitida por el formulario aportado. No publicar backend/.env ni credenciales. La aplicación necesita backend, acceso a proveedores y una credencial de Gemini; subir solo la carpeta frontend no proporciona la búsqueda completa.

## Project Details

### El problema y nuestra propuesta

Preparar una misión espacial también implica decidir qué se puede ensayar previamente en la Tierra. Un lugar puede reproducir alguna condición útil —una pendiente, un entorno frío o una baja precipitación— sin reproducir todas las condiciones de otro mundo. AstraAnalog organiza esa búsqueda como una experiencia web guiada, con criterios explícitos y evidencia consultable.

El proyecto aborda el desafío de los análogos terrestres mediante la preselección y caracterización inicial de candidatos para ensayos de rovers, estaciones de superficie y robótica. Su alcance actual permite explorar distintas regiones del mundo y enfocar cada búsqueda en una necesidad concreta.

### Cómo funciona

El usuario elige una misión, las condiciones que quiere ensayar y una prioridad. Después define la región, un mes climatológico o la media anual, y los umbrales correspondientes. Solo se solicitan parámetros relacionados con las condiciones elegidas.

El flujo implementado se divide en cuatro etapas:

1. **Proponer lugares.** Una primera consulta a Gemini con Google Search solicita lugares con nombre, coordenadas aproximadas, justificación y referencias. Son hipótesis que deben contrastarse; no mediciones ni sitios certificados.
2. **Obtener datos externos.** El backend consulta NASA POWER para temperatura media a 2 m, viento medio a 10 m y precipitación media, con valores anuales y mensuales. Open-Meteo aporta elevaciones procedentes de Copernicus DEM GLO-90. Con cinco muestras —centro y vecinos cardinales a 180 m— calculamos una pendiente aproximada. Natural Earth permite contrastar país y subdivisión administrativa.
3. **Comparar requisitos y épocas.** Nuestro código aplica los umbrales y evalúa qué meses los cumplen. Si no hay coincidencias exactas, puede mostrar hasta tres alternativas medidas, ordenadas por desviación normalizada y con mayor peso para la prioridad elegida. Los incumplimientos permanecen visibles. Si no hay datos suficientes, se informa esa situación.
4. **Explicar resultados.** Una segunda consulta conjunta a Gemini interpreta las mediciones disponibles y sus diferencias. Las fichas presentan motivos, limitaciones, medidas, meses destacados, mapas e imágenes satelitales de contexto. La IA no reemplaza las respuestas de las APIs ni recibe las imágenes para analizarlas.

### Beneficios e impacto previsto

AstraAnalog busca facilitar la investigación inicial de estudiantes y equipos de robótica o exploración. Reúne fuentes dispersas, permite ajustar condiciones y ayuda a comprender por qué cambia una selección. El impacto que buscamos es reducir la fricción de una primera comparación y orientar investigaciones posteriores, sin presentar ese beneficio como una reducción de costes ya demostrada.

La propuesta creativa combina un recorrido accesible con una separación explícita entre hipótesis, datos externos, cálculo y explicación. Una misma región puede resultar interesante para una condición y poco adecuada para otra; la interfaz permite entender esas diferencias y la variación mensual.

### Tecnología y diseño

Desarrollamos una aplicación web con JavaScript, React, React DOM, Vite y Tailwind CSS en el frontend, y Node.js con Express en el backend. Leaflet y React Leaflet permiten explorar los puntos sobre mapas de OpenStreetMap y vistas de Esri World Imagery. El proyecto separa frontend y backend. FFmpeg se utilizó para optimizar el video de portada y preparar su bucle de ida y vuelta.

Priorizamos la carga progresiva, la adaptación a móvil y escritorio, el respeto de las preferencias de movimiento reducido y la presentación inmediata de los resultados. El backend incorpora validación de respuestas, caché temporal, cancelación y límites de espera; las solicitudes de IA se deduplican por trabajo y no tienen reintentos automáticos de generación.

### Alcance y limitaciones

La elección de misión lunar o marciana define el contexto del ensayo: esta versión no calcula similitud con un perfil numérico medido de la Luna o Marte. NASA POWER aporta climatología regional, no pronósticos, ráfagas ni extremos locales. La pendiente derivada de GLO-90 no describe obstáculos a escala de rover, capacidad portante o tracción. No se miden NDVI, granulometría, polvo, composición del suelo, permisos ni accesibilidad efectiva.

Los resultados son candidatos de preselección y requieren observación local y evaluación de acceso antes de organizar un ensayo. La herramienta no afirma haber descubierto análogos científicamente validados ni el mejor sitio del planeta. La última refactorización de descubrimiento con Gemini y Google Search está escrita en el código; al preparar este documento no se comprobó su funcionamiento de extremo a extremo.

## Use of Super Intelligence (SI)

Las opciones exactas del desplegable no estaban incluidas en el texto aportado. Seleccionar las equivalentes a los usos siguientes; no seleccionar “I did not use SI”:

- **Código:** asistencia de ChatGPT/Codex para arquitectura, implementación, refactorización y documentación.
- **Texto y análisis:** apoyo en la conceptualización y redacción del proyecto; Gemini para proponer lugares con referencias e interpretar las mediciones de los candidatos.
- **Video:** el equipo confirmó que el video de portada fue generado con IA.
- **Imágenes:** el póster de portada es un fotograma derivado de ese video. Los fondos NASA y las vistas satelitales consultadas en Esri son recursos externos reales.
- **Datos sintéticos de desarrollo:** las primeras versiones incluyeron catálogos ilustrativos elaborados con asistencia de IA. Permanecen identificados como demostración y fuera del recorrido actual; los valores consultados a NASA POWER y Open-Meteo no son datos generados por IA.

Texto de declaración para incluir en la descripción o documentación pública:

> Utilizamos ChatGPT/Codex como apoyo para la conceptualización, redacción, desarrollo y refactorización del software. La aplicación integra Gemini para proponer lugares con referencias de búsqueda y elaborar explicaciones a partir de mediciones obtenidas de proveedores externos. El video artístico de la portada y el póster derivado de él fueron generados con IA; no constituyen imágenes científicas ni evidencia de los lugares recomendados. Las primeras versiones incluyeron datos sintéticos de demostración, identificados como tales y excluidos del recorrido actual. Los datos climáticos y de elevación de esta versión proceden de NASA POWER y Open-Meteo/Copernicus DEM. Las propuestas y explicaciones de IA son interpretaciones, no mediciones ni validaciones de campo.

Pendiente de confirmar: nombre y enlace de la herramienta que generó el video. La declaración documental está en este archivo y los metadatos en SI_USAGE.json; no se añadió ni se verificó una marca incrustada en los archivos audiovisuales.

El formulario aportado exige una marca de agua visible para imágenes y videos generados con SI. Antes del envío, incorporar y comprobar “Video generado con IA” o “SI-generated” en el video de portada y rotular también su póster. Mantener la indicación en las capturas o clips de la demo que los incluyan. El contenido generado no debe contener ni modificar elementos de identidad de NASA según ese mismo formulario.

## NASA Data

Cada fila corresponde a un recurso para añadir mediante “Add New Link”. El enlace es el valor de Link Url y el nombre es Link Text.

| Link Text | Link Url | Uso en el proyecto |
| --- | --- | --- |
| NASA POWER — Climatology API | https://power.larc.nasa.gov/docs/services/api/temporal/climatology/ | Consulta de T2M, WS10M y PRECTOTCORR; climatologías anuales y mensuales para los candidatos. |
| NASA Photojournal — Namibia Dunes / Terra ASTER (PIA24551) | https://science.nasa.gov/photojournal/namibia-dunes/ | Imagen temática de fondo del recorrido. Crédito: NASA/METI/AIST/Japan Space Systems, and U.S./Japan ASTER Science Team. |
| NASA Earth Observatory — High-Resolution Mosaic of Antarctica / MODIS | https://science.nasa.gov/earth/earth-observatory/high-resolution-mosaic-of-antarctica-6087/ | Imagen temática de hielo para el recorrido. Crédito: imagen cortesía de NSIDC, basada en datos de los sensores MODIS de NASA Aqua y Terra. |

Los dos fondos son recursos visuales de contexto: no son fotografías de los candidatos ni entradas del cálculo. NASA POWER es la integración climática del recorrido actual. NASADEM, Sentinel-2, PDS, LRO, Diviner, Google Earth y Earth Engine se consideraron durante la planificación; no atribuirles datos o análisis que no se implementaron.

## Space Agency Partner & Other Data

### Datos, imágenes e IA

| Link Text | Link Url | Uso |
| --- | --- | --- |
| ESA / Copernicus — Copernicus DEM GLO-90 | https://doi.org/10.5270/ESA-c5d3d65 | Modelo de elevación, consultado a través de Open-Meteo. |
| Open-Meteo — Elevation API | https://open-meteo.com/en/docs/elevation-api | Servicio de elevaciones utilizado para estimar pendiente y relieve. |
| Natural Earth — Admin 0 Countries, 1:110m | https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/ | Polígonos locales para identificar países de forma aproximada. |
| Natural Earth — Admin 1 States and Provinces, 1:10m | https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/ | Polígonos locales de subdivisiones administrativas. |
| Natural Earth — distribución GeoJSON | https://github.com/nvkelso/natural-earth-vector/tree/master/geojson | Distribución de los archivos cartográficos incorporados al backend. |
| Esri — World Imagery | https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer | Imágenes satelitales de contexto, fondo de terreno y capa de mapa; conservar atribuciones del proveedor. |
| OpenStreetMap contributors — cartografía y licencia | https://www.openstreetmap.org/copyright | Mapa base y enlaces a coordenadas. |
| Google Gemini API | https://ai.google.dev/gemini-api/docs | Propuestas de candidatos e interpretación de datos. |
| Gemini API — Grounding with Google Search | https://ai.google.dev/gemini-api/docs/google-search | Búsqueda con fuentes para el descubrimiento inicial de lugares. |
| OpenAI Codex | https://openai.com/codex/ | Asistencia de programación, refactorización y documentación. |
| ChatGPT | https://chatgpt.com/ | Apoyo en conceptualización y redacción. |

Añadir el nombre y enlace de la herramienta de generación del video cuando se confirme. Añadir también las referencias específicas de los lugares si se utilizan en el relato final o en la demo; las fuentes devueltas dinámicamente por Gemini se muestran en la propia búsqueda, pero no se inventó una lista de sitios que todavía no se revisó.

### Bibliotecas y herramientas de desarrollo

| Link Text | Link Url | Uso |
| --- | --- | --- |
| React / React DOM | https://react.dev/ | Interfaz de usuario. |
| Vite | https://vite.dev/ | Desarrollo y compilación del frontend. |
| Tailwind CSS | https://tailwindcss.com/ | Estilos de la interfaz. |
| Node.js | https://nodejs.org/ | Ejecución del backend y scripts. |
| Express | https://expressjs.com/ | API HTTP. |
| Leaflet | https://leafletjs.com/ | Mapas interactivos. |
| React Leaflet | https://react-leaflet.js.org/ | Integración de Leaflet con React. |
| FFmpeg | https://ffmpeg.org/ | Preparación y compresión del video y extracción del póster. |

## Project Submission Verification

Estas casillas son declaraciones personales del participante, no texto que este documento pueda confirmar por él:

- **Agree to Terms and Conditions:** marcar después de leer y aceptar las condiciones y la guía de envío enlazadas en el formulario.
- **Confirm All Work is Original:** marcar después de revisar los créditos y el derecho de uso de todos los recursos incluidos. Declarar el uso de bibliotecas, fuentes y SI; no presentar esos recursos como creaciones propias.

## Pendientes concretos antes del envío

1. Incorporar las dos URLs públicas: proyecto y demostración.
2. Confirmar la herramienta del video y añadir su crédito/enlace.
3. Incorporar y comprobar marcas visibles de SI en el video de portada, póster y derivados de la demo.
4. Comprobar que el resultado mostrado en la demo corresponde al flujo que efectivamente funciona; la última refactorización no se probó al preparar este borrador.
5. Revisar atribuciones, permisos y referencias específicas de los candidatos presentados. Natural Earth está en dominio público; OpenStreetMap exige atribución; Open-Meteo solicita atribuir tanto al servicio como a Copernicus. La disponibilidad pública de imágenes Esri no convierte todo ese material en dominio público.
6. Abrir los enlaces finales sin iniciar sesión y comprobar el límite de la demo indicado en el formulario.
7. Guardar los cambios y usar “Submit for Judging” en el formulario para efectuar el envío. Este trabajo no modificó ni envió el formulario.

