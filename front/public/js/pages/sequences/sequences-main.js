// sequences-main.js
// Point d'entrée principal pour la page des séquences

import { createState } from './sequences-state.js';
import { fetchSequences } from './sequences-module1.js';
import { redirectToSequenceDetail } from './sequences-module2.js';

export function sequencesMain() {
  const state = createState();

  function init() {
    console.log('Initialisation de la page des séquences');
    fetchSequences(state);
  }

  return {
    state,
    init,
    fetchSequences,
    redirectToSequenceDetail
  };
}