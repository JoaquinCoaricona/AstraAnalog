export const SEARCH_STEPS = [
  {label: 'Misión', title: '¿Qué tipo de misión querés preparar?', description: 'Elegí una misión para sugerir pruebas iniciales. Después podés ajustar el destino y las características que necesitás simular.'},
  {label: 'Pruebas', title: '¿Qué querés poner a prueba?', description: 'Elegí una o varias pruebas y marcá qué importancia tiene cada una para tu búsqueda.'},
  {label: 'Terreno', title: '¿Qué límites tiene tu búsqueda?', description: 'Definí las condiciones del terreno. Si todavía no las conocés, podés mantener los valores sugeridos.'},
  {label: 'Fecha', title: '¿Cuándo te gustaría hacer las pruebas?', description: 'Este paso es opcional. Podés continuar sin una fecha definida.'},
  {label: 'Revisión', title: 'Revisá tu búsqueda', description: 'Este es el perfil que vamos a usar para comparar los candidatos. Podés editar cualquier paso antes de buscar.'},
];

export const DESTINATIONS = [
  {id: 'moon', name: 'Luna', symbol: '☾', description: 'Preparar pruebas vinculadas con la exploración lunar.'},
  {id: 'mars', name: 'Marte', symbol: '◉', description: 'Preparar pruebas vinculadas con la exploración marciana.'},
  {id: 'undecided', name: 'Todavía no lo definí', symbol: '↗', description: 'Explorar lugares a partir de las condiciones de ensayo.'},
];

export const MONTHS = ['Sin fecha definida', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const DEFAULT_FILTERS = {maxSlope: 30, maxNdvi: 0.3, soilType: 'Todos'};
export const createSearch = () => ({scope:'global',missionType: '', focusTestId: '', destination: '', selectedTestIds: [], priorities: {}, filters: {...DEFAULT_FILTERS}, month: 0});
export const destinationName = id => DESTINATIONS.find(destination => destination.id === id)?.name || 'Sin elegir';

export function validateStep(step, search, tests) {
  if (step === 0 && !['mars-rover','lunar-rover','surface-station','robotics'].includes(search.missionType)) return 'Elegí un tipo de misión para que podamos guiar tus ensayos.';
  if (step === 0 && !DESTINATIONS.some(destination => destination.id === search.destination)) return 'Elegí un destino o la opción “Todavía no lo definí” para continuar.';
  if (step === 1 && (!search.selectedTestIds.length || search.selectedTestIds.some(id => !tests.some(test => test.id === id)))) return 'Elegí al menos una prueba para continuar.';
  if (step === 2) {
    const {maxSlope, maxNdvi} = search.filters;
    if (!Number.isFinite(maxSlope) || maxSlope < 0 || maxSlope > 45) return 'La pendiente máxima debe estar entre 0° y 45°.';
    if (!Number.isFinite(maxNdvi) || maxNdvi < -1 || maxNdvi > 1) return 'El NDVI máximo debe estar entre −1 y 1.';
  }
  if (step === 3 && (!Number.isInteger(search.month) || search.month < 0 || search.month > 12)) return 'Elegí un mes válido o continuá sin fecha.';
  return '';
}
