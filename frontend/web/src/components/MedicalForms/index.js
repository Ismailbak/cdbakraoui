export {
  FormDentExam,
  FormDentSoin,
  FormDentEndo,
  FormDentExtraction,
  FormDentProthese,
  FormDentParo,
  FormDentPlan,
  CLINICAL_FORM_AUTOSAVE_EVENT,
} from './DentalForms';
export { default } from './DentalForms';

export const FORM_COMPONENTS = {
  form_dent_exam: 'FormDentExam',
  form_dent_soin: 'FormDentSoin',
  form_dent_endo: 'FormDentEndo',
  form_dent_extraction: 'FormDentExtraction',
  form_dent_prothese: 'FormDentProthese',
  form_dent_paro: 'FormDentParo',
  form_dent_plan: 'FormDentPlan',
};

export const FORMS_METADATA = {
  form_dent_exam: {
    name: 'FormDentExam',
    label: 'Examen & Diagnostic',
    description: 'Examen clinique et diagnostic dentaire',
    fields: ['Motif', 'Hygiène', 'Radiographie', 'Diagnostic'],
  },
  form_dent_soin: {
    name: 'FormDentSoin',
    label: 'Soins Conservateurs',
    description: 'Obturations et soins conservateurs',
    fields: ['Dent', 'Matériau', 'Anesthésie'],
  },
  form_dent_endo: {
    name: 'FormDentEndo',
    label: 'Endodontie',
    description: 'Traitement endodontique',
    fields: ['Dent', 'Canaux', 'Obturation'],
  },
  form_dent_extraction: {
    name: 'FormDentExtraction',
    label: 'Extraction & Chirurgie',
    description: 'Extractions et chirurgie buccale',
    fields: ['Dent', 'Type', 'Complications'],
  },
  form_dent_prothese: {
    name: 'FormDentProthese',
    label: 'Prothèse',
    description: 'Prothèses fixes et amovibles',
    fields: ['Type', 'Matériau', 'Laboratoire'],
  },
  form_dent_paro: {
    name: 'FormDentParo',
    label: 'Parodontologie',
    description: 'Traitements parodontaux',
    fields: ['Sondage', 'Mobilité', 'Plan'],
  },
  form_dent_plan: {
    name: 'FormDentPlan',
    label: 'Plan de Traitement',
    description: 'Planification thérapeutique globale',
    fields: ['Résumé', 'Coût', 'Priorité'],
  },
};
