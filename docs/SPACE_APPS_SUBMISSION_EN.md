# AstraAnalog — NASA Space Apps Project Submission

## Project Name

AstraAnalog

## Summary

AstraAnalog connects space exploration goals with places on Earth. Our interactive web platform helps users discover and compare terrestrial locations for rover, surface station, and robotics testing. Users select their mission, environmental priorities, region, and time of year. Gemini and Google Search identify relevant locations, while NASA POWER climatology and Copernicus DEM elevations accessed through Open-Meteo provide the data behind the comparison. AstraAnalog checks wind, temperature, precipitation, and estimated slope against user-defined requirements, compares monthly conditions, and presents each candidate through maps, satellite imagery, and clear explanations. Its distinctive strength is traceability: users can see why a place is recommended, which requirements it meets, and how alternatives differ. By bringing discovery, environmental data, and visual comparison into one guided experience, AstraAnalog makes terrestrial analog research more accessible and gives exploration teams a focused way to investigate where and when to test on Earth.

## Project Details

### The journey begins before liftoff

Every exploration mission starts with questions that can be investigated on Earth: Where can a rover encounter a useful range of slopes? Which locations combine cold and low precipitation? How do those conditions change throughout the year?

AstraAnalog brings those questions into a single interactive platform. It connects mission goals to environmental evidence and turns the search for terrestrial analog candidates into a clear, visual process.

Our approach defines an analog through the specific conditions needed for a test. Users investigate places according to their mission requirements, with the underlying values, sources, and comparisons available alongside the recommendation.

### From mission requirements to location insights

The experience begins with a guided sequence. Users choose a Martian rover, lunar rover, surface station, or robotics context; select wind, cold, dryness, or slopes; identify their main priority; and define a region, month or annual average, and relevant thresholds.

The platform then connects four stages:

1. **Discover relevant places.** Gemini, grounded with Google Search, proposes named terrestrial locations with geographic coordinates, supporting references, and a reason to investigate each one. Regional searches focus the discovery, while worldwide searches seek geographically diverse candidates.
2. **Bring in environmental evidence.** NASA POWER supplies annual and monthly climatological values for mean temperature at 2 meters, mean wind speed at 10 meters, and precipitation. Open-Meteo supplies Copernicus DEM GLO-90 elevations. The application estimates slope using a central elevation and four cardinal samples 180 meters away. Natural Earth polygons support geographic identification.
3. **Compare conditions and timing.** The comparison engine checks the selected requirements and evaluates monthly conditions. It distinguishes threshold matches from the closest measured alternatives, showing the specific differences. A normalized deviation method gives additional weight to the user's main priority when ranking alternatives.
4. **Explain the choice.** Gemini interprets the retrieved values and comparison results in a combined analysis. Each location receives an explanation of its relevance, comparative advantages, tradeoffs, and seasonal context. Maps and satellite views make the geographic setting easy to explore.

### What users get

Each result brings together a place name, coordinates, satellite context imagery, relevant environmental values, a mission-focused explanation, and monthly comparisons. Detailed views organize the information into an overview, climate and months, terrain and map, and evidence.

Users can inspect the requirements met by a candidate, compare its monthly values, and open the original NASA POWER response. Source metadata, units, and retrieval information keep the reasoning connected to its evidence. Adjusting the search preserves the user's choices and lets them explore a different set of requirements.

The environmental comparison uses regional historical climate averages and DEM-derived slope estimates. Those quantities define the scale and meaning of the results. Mission selection supplies the testing context, while recommendations express how the terrestrial candidates relate to the chosen environmental requirements.

### What makes AstraAnalog distinctive

AstraAnalog combines location discovery, quantitative comparison, seasonal exploration, and explanation in one experience. Its recommendations are tied to explicit thresholds and traceable sources. Users can follow the reasoning from their mission goals to the underlying values and understand how priorities change the outcome.

The combination of NASA climate resources, Copernicus terrain data, geographic context, and AI-assisted interpretation makes complex information easier to explore. The guided interface keeps the experience approachable while detailed evidence remains available within each location's record.

### Impact

AstraAnalog is built for students, robotics teams, educators, and exploration researchers investigating terrestrial testing environments. It gives them a structured way to discover locations, compare conditions, and frame their field research around specific requirements.

Our intended impact is to make open Earth observation resources more useful for mission preparation: connecting a question about exploration to places, environmental evidence, and a clear explanation of why they deserve attention.

### Technology and user experience

The application uses JavaScript, React, React DOM, Vite, and Tailwind CSS on the frontend, with Node.js and Express on the backend. Leaflet and React Leaflet provide interactive mapping with OpenStreetMap and Esri World Imagery. NASA POWER and Open-Meteo supply environmental data, Natural Earth provides administrative boundaries, and Gemini supports discovery and interpretation.

Frontend and backend are organized separately. Progressive loading, responsive layouts, reduced-motion support, compact result cards, and expandable evidence keep the experience focused. Temporary caching, cancellation, response validation, and time limits support the search workflow. AI generation requests are deduplicated per job and use explicit request budgets.

The landing page introduces AstraAnalog through an AI-generated artistic video. FFmpeg was used to optimize playback, create desktop and mobile versions, extract the poster, and prepare a forward-and-reverse loop.

## Use of Super Intelligence (SI)

### Uses to declare

- **Code:** ChatGPT/Codex assisted with architecture, implementation, refactoring, and documentation.
- **Text and analysis:** AI supported ideation and writing. Gemini supports location discovery with search references and interpretation of externally sourced environmental values.
- **Video:** the artistic landing video was generated with AI.
- **Images:** the landing poster is a frame extracted from the AI-generated video. The guided-search NASA backgrounds and Esri satellite imagery are externally sourced visual resources.
- **Development data:** AI-assisted illustrative catalogs were used during development and remain labeled as demonstration data outside the active search workflow.

### Public disclosure

We used ChatGPT/Codex to assist with project ideation, writing, software development, and refactoring. The application uses Gemini with Google Search to propose locations with supporting references, and Gemini to explain comparisons based on environmental data retrieved from external providers. The artistic landing video and its derived poster were generated with AI and serve as presentation assets. AI-assisted illustrative catalogs used during development are labeled as demonstration data and are separate from the active search workflow. Climate and elevation values come from NASA POWER and Open-Meteo/Copernicus DEM. The application distinguishes AI interpretation from provider data and calculated comparisons.

## NASA Data

| Link Text | Link Url | Use in the project |
| --- | --- | --- |
| NASA POWER — Climatology API | https://power.larc.nasa.gov/docs/services/api/temporal/climatology/ | T2M, WS10M, and PRECTOTCORR queries; annual and monthly climatology for candidate locations. |
| NASA Photojournal — Namibia Dunes / Terra ASTER (PIA24551) | https://science.nasa.gov/photojournal/namibia-dunes/ | Thematic background image in the guided search. Credit: NASA/METI/AIST/Japan Space Systems, and U.S./Japan ASTER Science Team. |
| NASA Earth Observatory — High-Resolution Mosaic of Antarctica / MODIS | https://science.nasa.gov/earth/earth-observatory/high-resolution-mosaic-of-antarctica-6087/ | Ice-themed background in the guided search. Credit: image courtesy of the National Snow and Ice Data Center, based on data from NASA Aqua and Terra MODIS sensors. |

NASA POWER supplies the climate data used in the comparison. NASA imagery provides visual context within the guided search.

## Space Agency Partner & Other Data

### Data, imagery, and AI tools

| Link Text | Link Url | Use |
| --- | --- | --- |
| ESA / Copernicus — Copernicus DEM GLO-90 | https://doi.org/10.5270/ESA-c5d3d65 | Elevation model accessed through Open-Meteo. |
| Open-Meteo — Elevation API | https://open-meteo.com/en/docs/elevation-api | Elevation service used to estimate slope and local relief. |
| Natural Earth — Admin 0 Countries, 1:110m | https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/ | Locally stored polygons for approximate country identification. |
| Natural Earth — Admin 1 States and Provinces, 1:10m | https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/ | Locally stored administrative subdivision polygons. |
| Natural Earth — GeoJSON distribution | https://github.com/nvkelso/natural-earth-vector/tree/master/geojson | Distribution of the geographic files incorporated into the backend. |
| Esri — World Imagery | https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer | Satellite context imagery, terrain background, and map layer; retain provider attribution. |
| OpenStreetMap contributors — map data and license | https://www.openstreetmap.org/copyright | Base map and coordinate links. |
| Google Gemini API | https://ai.google.dev/gemini-api/docs | Candidate proposals and interpretation of externally sourced data. |
| Gemini API — Grounding with Google Search | https://ai.google.dev/gemini-api/docs/google-search | Search references for initial location discovery. |
| OpenAI Codex | https://openai.com/codex/ | Assistance with programming, refactoring, and documentation. |
| ChatGPT | https://chatgpt.com/ | Assistance with ideation and writing. |

### Development libraries and tools

| Link Text | Link Url | Use |
| --- | --- | --- |
| React / React DOM | https://react.dev/ | User interface. |
| Vite | https://vite.dev/ | Frontend development and production builds. |
| Tailwind CSS | https://tailwindcss.com/ | Interface styling. |
| Node.js | https://nodejs.org/ | Backend and script execution. |
| Express | https://expressjs.com/ | HTTP API. |
| Leaflet | https://leafletjs.com/ | Interactive maps. |
| React Leaflet | https://react-leaflet.js.org/ | Leaflet integration with React. |
| FFmpeg | https://ffmpeg.org/ | Video preparation and compression, and poster extraction. |

## Project Demonstration — Narration

Before exploring other worlds, we test on Earth. AstraAnalog connects your mission to terrestrial locations using NASA climate data, Copernicus terrain data, and AI-assisted discovery. Choose your conditions, explore candidates, compare monthly values, and see the evidence behind each recommendation. From wind and cold to dryness and slopes, turn open data into a clear view of where to investigate your next field test.

## Project Demonstration — Seven-Slide Structure

1. **AstraAnalog.** The journey begins before liftoff.
2. **The challenge.** Connect exploration testing requirements to terrestrial environments.
3. **The experience.** Choose a mission, conditions, priority, region, and month.
4. **The method.** Discover places, retrieve NASA and Copernicus data, compare requirements, and explain results.
5. **The results.** Location cards with imagery, environmental values, monthly comparisons, and mission-focused explanations.
6. **The evidence.** Traceable sources, explicit thresholds, regional climatology, and estimated terrain slopes.
7. **The impact.** Help students, robotics teams, and researchers investigate terrestrial testing environments. Include project links and resource and AI credits.
