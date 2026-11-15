import {useState} from 'react';
import {createSearch, SEARCH_STEPS, validateStep} from '../data/searchFlow.js';

export function useGuidedSearch(tests) {
  const [draft, setDraft] = useState(createSearch);
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [showResults, setShowResults] = useState(false);

  function update(patch) {
    setDraft(previous => {
      const next = {...previous, ...patch};
      if (patch.priorities && patch.focusTestId === undefined && next.selectedTestIds.length) {
        const maximum = Math.max(...next.selectedTestIds.map(id => next.priorities[id] ?? 3));
        if (!next.selectedTestIds.includes(next.focusTestId) || (next.priorities[next.focusTestId] ?? 3) < maximum) {
          next.focusTestId = next.selectedTestIds.find(id => (next.priorities[id] ?? 3) === maximum);
        }
      }
      return next;
    });
    setError('');
  }

  function goToStep(index) {
    if (index < 0 || index > furthestStep) return;
    setStep(index);
    setShowResults(false);
    setError('');
  }

  function next() {
    const message = validateStep(step, draft, tests);
    if (message) {setError(message); return;}
    const nextStep = Math.min(step + 1, SEARCH_STEPS.length - 1);
    setStep(nextStep);
    setFurthestStep(previous => Math.max(previous, nextStep));
    setError('');
  }

  function submit() {
    for (let index = 0; index < SEARCH_STEPS.length - 1; index++) {
      const message = validateStep(index, draft, tests);
      if (message) {setStep(index); setError(message); return;}
    }
    const orderedTests = draft.selectedTestIds.includes(draft.focusTestId) ? [draft.focusTestId, ...draft.selectedTestIds.filter(id => id !== draft.focusTestId)] : [...draft.selectedTestIds];
    setSubmitted({...draft, filters: {...draft.filters}, priorities: {...draft.priorities}, selectedTestIds: orderedTests});
    setShowResults(true);
    setError('');
  }

  function reset() {
    setDraft(createSearch());
    setStep(0);
    setFurthestStep(0);
    setSubmitted(null);
    setShowResults(false);
    setError('');
  }

  return {draft, step, furthestStep, error, submitted, showResults, update, next, submit, goToStep, reset};
}
