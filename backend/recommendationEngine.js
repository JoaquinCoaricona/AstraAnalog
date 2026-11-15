/**
 * Motor puro de planificación: el catálogo y sus perfiles se pasan como datos.
 * Primero aplicar restricciones físicas con matchingEngine. No se mezcla su
 * índice de terreno despejado con los puntajes especializados de los ensayos.
 * Los perfiles actuales son sintéticos; las fórmulas son explícitas y trazables.
 */
export const COVERAGE_THRESHOLD = 65;
const validScore = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
const round = value => Math.round(value * 10) / 10;

export function getSeasonAssessment(assessment, month = 0) {
  const season = assessment?.season;
  // Un intervalo solo se presenta como respaldado si incluye evidencia y meses válidos.
  const supported = season?.status === 'supported' && typeof season.source === 'string' && season.source.trim() &&
    Array.isArray(season.months) && season.months.length > 0 && season.months.every(m => Number.isInteger(m) && m >= 1 && m <= 12);
  if (!supported) return { status: 'unknown', months: [], source: null, selectedMonth: month,
    label: month ? 'Mes elegido sin evidencia estacional' : 'Época todavía no validada' };
  const inWindow = !month || season.months.includes(month);
  return { status: inWindow ? 'supported' : 'outside-window', months: [...season.months], source: season.source, selectedMonth: month,
    label: month ? (inWindow ? 'Mes dentro de la ventana documentada' : 'Mes fuera de la ventana documentada') : 'Ventana documentada disponible' };
}

export function recommendSites(sites, tests, profiles, options = {}) {
  const { selectedTestIds = [], priorities = {}, month = 0 } = options;
  if (!Number.isInteger(month) || month < 0 || month > 12) throw new RangeError('El mes debe estar entre 0 y 12.');
  const ids = [...new Set(selectedTestIds)];
  if (ids.some(id => !tests.some(test => test.id === id))) throw new RangeError('Hay un ensayo no reconocido.');
  const selectedTests = ids.map(id => tests.find(test => test.id === id));
  const weights = Object.fromEntries(ids.map(id => {
    const weight = priorities[id] ?? 3;
    if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 1 || weight > 5) throw new RangeError('Las prioridades deben estar entre 1 y 5.');
    return [id, weight];
  }));
  if (!ids.length) return { overall: [], specialists: [], selectedTests: [], campaign: [], month, coverageThreshold: COVERAGE_THRESHOLD };
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const profileBySite = new Map(profiles.map(profile => [profile.siteId, profile]));
  const overall = sites.map(site => {
    const profile = profileBySite.get(site.id);
    const assessments = selectedTests.map(test => {
      const raw = profile?.assessments?.[test.id];
      const score = validScore(raw?.score) ? raw.score : null;
      return { testId: test.id, testName: test.name, shortName: test.shortName, score,
        weight: weights[test.id], contribution: score === null ? 0 : score * weights[test.id] / totalWeight,
        covered: score !== null && score >= COVERAGE_THRESHOLD,
        reason: raw?.reason || 'Sin perfil disponible para este ensayo.',
        season: getSeasonAssessment(raw, month), evidenceNeeded: test.seasonEvidenceNeeded, limitation: test.limitation };
    });
    const weightedMean = assessments.reduce((sum, a) => sum + a.contribution, 0);
    // Los vacíos no se presentan como evidencia negativa: se identifican por separado,
    // pero impiden recomendar con confianza un candidato para la campaña completa.
    const weakestScore = Math.min(...assessments.map(a => a.score ?? 0));
    const balanceFactor = 0.7 + 0.3 * weakestScore / 100;
    const score = round(weightedMean * balanceFactor);
    const covered = assessments.filter(a => a.covered).length;
    return { site, score, weightedMean: round(weightedMean), balanceFactor: round(balanceFactor * 100),
      coverage: { covered, total: assessments.length, percent: round(covered / assessments.length * 100) },
      weakestTest: assessments.reduce((weakest, a) => (a.score ?? 0) < (weakest.score ?? 0) ? a : weakest),
      missingTestIds: assessments.filter(a => a.score === null).map(a => a.testId), assessments,
      seasonalEvidence: assessments.every(a => a.season.status === 'supported') ? 'supported' : 'incomplete',
      dataStatus: 'illustrative' };
  }).sort((a, b) => b.score - a.score || b.coverage.covered - a.coverage.covered || a.site.id.localeCompare(b.site.id));
  const specialists = selectedTests.map(test => {
    const candidates = overall.map(recommendation => ({ site: recommendation.site,
      assessment: recommendation.assessments.find(a => a.testId === test.id) }))
      .filter(candidate => candidate.assessment.score !== null)
      .sort((a, b) => b.assessment.score - a.assessment.score || a.site.id.localeCompare(b.site.id));
    return { test, candidates, best: candidates[0] ?? null };
  });
  const campaign = [];
  for (const specialist of specialists) {
    if (!specialist.best) continue;
    const existing = campaign.find(item => item.site.id === specialist.best.site.id);
    const assignment = { testId: specialist.test.id, testName: specialist.test.name, score: specialist.best.assessment.score, season: specialist.best.assessment.season };
    if (existing) existing.assignments.push(assignment);
    else campaign.push({ site: specialist.best.site, assignments: [assignment] });
  }
  return { overall, specialists, selectedTests, campaign, month, coverageThreshold: COVERAGE_THRESHOLD };
}
