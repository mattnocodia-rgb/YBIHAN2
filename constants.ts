
import { TemplateType, TaskType } from './types';

export const DEFAULT_STAGES = [
  'APS',
  'APD',
  'PC',
  'Consultation',
  'Chantier'
];

export const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/7mfh2vpvynij4gdjpirxykeao5w5m7ce';

export const SYSTEM_ACTIONS = {
  GENERATE_CONTRACT: 'Génération du document',
  GENERATE_DOC_PACK: 'Générer pack lancement'
};

export const TEMPLATE_TYPES: { label: string; value: TemplateType }[] = [
  { label: 'Contrat', value: 'CONTRACT' },
  { label: 'Commande Thermique', value: 'ORDER_THERMAL' },
  { label: 'Commande Sols', value: 'ORDER_SOIL' },
  { label: 'Demande DO', value: 'DO_REQUEST' },
  { label: 'Contact Courtier', value: 'BROKER_CONTACT' },
  { label: 'Autre', value: 'OTHER' }
];

export const SERVICE_TOKEN = 'MAITRISEA_SECRET_V1';