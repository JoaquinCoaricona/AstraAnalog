# AstraAnalog

[▶ Ver el video demo](Media/AstraAnalog%20%C2%B7%20Demo.mp4)

**Demo de duración breve**, preparado en este formato para ajustarse a los requisitos de presentación de la entrega del evento NASA Space Apps Challenge.

## Acerca del proyecto

AstraAnalog es una aplicación web que ayuda a encontrar lugares de la Tierra para preparar ensayos de exploración lunar y marciana. En lugar de buscar un sitio idéntico en todas sus condiciones, permite priorizar la característica que se necesita poner a prueba y comparar alternativas.

Un recorrido guiado reúne la misión, las condiciones, la prioridad, la región y los valores objetivo. A partir de esa información propone candidatos y contrasta clima y elevación mediante servicios de datos. Cada lugar reúne una explicación, sus mediciones, una vista satelital y una comparación mensual.

La interfaz está disponible en **español e inglés** mediante el botón de idioma. Las explicaciones se solicitan al modelo en el idioma elegido.

## Recorrido de la aplicación

### Landing

Portada de AstraAnalog y acceso al recorrido de búsqueda.

![Landing](Media/Landing.png)

### Seleccion de Mision

Elección de la misión para orientar la búsqueda de entornos de ensayo.

![Seleccion de Mision](Media/Seleccion%20de%20Mision.png)

### Seleccion de Condiciones

Selección de las condiciones que se quieren reproducir: viento, frío, sequedad o pendientes.

![Seleccion de Condiciones](Media/Seleccion%20de%20Condiciones.png)

### Seleccion de Region

Búsqueda global o concentrada en una región.

![Seleccion de Region](Media/Seleccion%20de%20Region.png)

### Seleccion de Intervalos de Cada Condicion Climatica

Definición de los valores objetivo de cada condición seleccionada.

![Seleccion de Intervalos de Cada Condicion Climatica](Media/Seleccion%20de%20Intervalos%20de%20Cada%20Condicion%20Climatica.png)

### Resumen Previo a la Busqueda

Revisión de la misión y de los requisitos antes de comenzar.

![Resumen Previo a la Busqueda](Media/Resumen%20Previo%20a%20la%20Busqueda.png)

### Vista de Resultados

Candidatos organizados por lugar, con su ubicación, imagen, argumento y mediciones.

![Vista de Resultados](Media/Vista%20de%20Resultados.png)

### Vista Satelital del Lugar

Vista satelital del entorno del punto analizado.

![Vista Satelital del Lugar](Media/Vista%20Satelital%20del%20Lugar.png)

### Localizacion en mapa del resultado

Ubicación de los candidatos en un mapa interactivo.

![Localizacion en mapa del resultado](Media/Localizacion%20en%20mapa%20del%20resultado.png)

### Indicacion por mes de la situacion climatica del lugar

Comparación de los promedios mensuales para orientar la elección de la época del ensayo.

![Indicacion por mes de la situacion climatica del lugar](Media/Indicacion%20por%20mes%20de%20la%20situacion%20climatica%20del%20lugar.png)

## Tecnologías y datos

- **React, Vite y Tailwind CSS:** interfaz y recorrido guiado.
- **Node.js y Express:** API y coordinación de las consultas.
- **Gemini 3.5 Flash-Lite:** propuestas y argumentos en una sola solicitud por búsqueda, sin Google Search.
- **NASA POWER:** promedios climáticos mensuales.
- **Open-Meteo y Copernicus DEM:** elevación y estimación de pendientes.
- **Natural Earth:** identificación aproximada de países y subdivisiones.
- **Esri World Imagery y React-Leaflet:** imágenes satelitales y mapa interactivo.

Las propuestas del modelo son orientativas. Los promedios climáticos no son pronósticos ni garantizan tormentas u otros eventos; antes de organizar un ensayo se deben confirmar las condiciones locales, el acceso y los permisos.

## Ejecutar localmente

Requiere **Node.js 22 o posterior**.

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

Crear `backend/.env` a partir de `backend/.env.example` y completar la clave del servicio:

```dotenv
GEMINI_API_KEY=tu_clave
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3001
```

La clave se configura únicamente en el backend; el archivo `.env` está excluido del repositorio.

```bash
npm run dev
```

## Compilar y servir

```bash
npm run build
npm start
```

Node sirve la interfaz compilada y la API desde el mismo proceso. El puerto se configura mediante `PORT`; los archivos de límites administrativos de `backend/data` deben acompañar al despliegue.
