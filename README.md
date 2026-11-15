# AstraAnalog

Aplicación web para encontrar lugares terrestres donde preparar ensayos de exploración lunar y marciana.

## Desarrollo

Instalar dependencias desde la raíz con npm install, luego npm --prefix backend install y npm --prefix frontend install. Configurar backend/.env a partir de backend/.env.example y ejecutar npm run dev.

## Despliegue

Requiere Node.js 22 o posterior. Configurar GEMINI_API_KEY en el entorno del servidor y GEMINI_MODEL=gemini-3.5-flash-lite. La clave nunca se incluye en el frontend. PORT define el puerto y HOST permite ajustar la interfaz de escucha.

Ejecutar npm run build para generar frontend/dist. Ejecutar npm start para servir frontend y API desde Node en modo producción. Publicar detrás de HTTPS mediante el proveedor de hosting o un proxy inverso. No publicar backend/.env ni usar el servidor de Vite en producción.

Los archivos backend/data/countries.geojson y backend/data/regions.geojson deben acompañar al backend. La instalación permite una búsqueda activa por proceso y conserva trabajos y cachés en memoria; se pierden al reiniciar. Un despliegue con varias instancias requiere almacenamiento compartido y control de acceso/consumo acorde a su audiencia.

## Servicios

Una solicitud a Gemini por búsqueda propone hasta seis lugares y sus argumentos, sin Google Search ni reintentos. NASA POWER entrega climatología; Open-Meteo entrega elevaciones; Natural Earth permite resolver país y subdivisión; Esri World Imagery muestra vistas satelitales con atribución. La comparación de requisitos y meses se realiza localmente. Las condiciones son orientativas y requieren validación local antes de realizar ensayos.

## Estado de entrega

Se prepararon el modo de producción y la interfaz sin ejecutar la compilación, pruebas, servidores ni llamadas adicionales al modelo, conforme a la indicación del usuario. El despliegue y la validación de producción permanecen a cargo del operador.
