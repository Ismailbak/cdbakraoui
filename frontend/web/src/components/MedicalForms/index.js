// Export all medical forms
export { FormCsRic, FormCsOs, FormCsEcho, FormCsGeste, FormCsSeances, FormCsDxa } from './AllForms';
export { default } from './AllForms';

// Form mapping for dynamic rendering
export const FORM_COMPONENTS = {
  'form_cs_ric': 'FormCsRic',
  'form_cs_os': 'FormCsOs',
  'form_cs_echo': 'FormCsEcho',
  'form_cs_geste': 'FormCsGeste',
  'form_cs_seances': 'FormCsSeances',
  'form_cs_dxa': 'FormCsDxa',
};

// Form metadata
export const FORMS_METADATA = {
  form_cs_ric: {
    name: 'FormCsRic',
    label: 'Rhumatismes Inflammatoires',
    description: 'Consultation pour arthrite inflammatoire chronique',
    icon: null,
    fields: ['CRP', 'ESR', 'DAS28', 'Marqueurs d\'inflammation']
  },
  form_cs_os: {
    name: 'FormCsOs',
    label: 'Ostéopathies Fragilisantes',
    description: 'Évaluation de la santé osseuse et du risque de fracture',
    icon: null,
    fields: ['DXA T-scores', 'FRAX', 'Vitamin D', 'Risque de chute']
  },
  form_cs_echo: {
    name: 'FormCsEcho',
    label: 'Échographie',
    description: 'Documentation d\'examen ultrasonore',
    icon: null,
    fields: ['Synovite', 'Effusion', 'Érosions', 'Doppler']
  },
  form_cs_geste: {
    name: 'FormCsGeste',
    label: 'Gestes Techniques',
    description: 'Procédures interventionnelles et injections',
    icon: null,
    fields: ['Type de procédure', 'Guidage', 'Produits', 'Complications']
  },
  form_cs_seances: {
    name: 'FormCsSeances',
    label: 'Séances Thérapeutiques',
    description: 'Suivi de physiothérapie et rééducation',
    icon: null,
    fields: ['Type de séance', 'Douleur', 'Amélioration', 'Compliance']
  },
  form_cs_dxa: {
    name: 'FormCsDxa',
    label: 'Ostéodensitométrie (DXA)',
    description: 'Scan de densité minérale osseuse',
    icon: null,
    fields: ['T-scores', 'Classification WHO', 'FRAX', 'VFA']
  }
};
