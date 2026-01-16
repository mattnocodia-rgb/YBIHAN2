
import { 
  Workspace, User, Project, Stage, Task, TimelineItem, 
  DocumentTemplate, ProjectField, ProjectTemplateLink, Comment,
  TimelineTemplate, Stakeholder, TradeLot, SiteReport, StakeholderTemplate, TradeLotTemplate,
  AppSettings, UserPreferences
} from './types';
import { MAKE_WEBHOOK_URL, SYSTEM_ACTIONS } from './constants';

export const MOCK_WORKSPACE: Workspace = {
  id: 'ws_1',
  name: 'Maitrisea Architecture',
  owner_user_id: 'u_1',
  created_at: new Date().toISOString()
};

export const MOCK_USERS: User[] = [
  { id: 'u_1', workspace_id: 'ws_1', name: 'Alice SuperAdmin', email: 'alice@maitrisea.fr', role: 'super_admin', is_active: true },
  { id: 'u_2', workspace_id: 'ws_1', name: 'Bob Admin', email: 'bob@maitrisea.fr', role: 'admin', is_active: true },
  { id: 'u_3', workspace_id: 'ws_1', name: 'Charlie User', email: 'charlie@maitrisea.fr', role: 'user', is_active: true }
];

const STORAGE_KEY = 'maitrisea_db_v1';

class DataStore {
  projects: Project[] = [];
  stages: Stage[] = [];
  tasks: Task[] = [];
  timelineItems: TimelineItem[] = [];
  timelineTemplates: TimelineTemplate[] = [];
  templates: DocumentTemplate[] = [];
  projectFields: ProjectField[] = [];
  templateLinks: ProjectTemplateLink[] = [];
  comments: Comment[] = [];
  settings: AppSettings = {
    make_webhook_url: MAKE_WEBHOOK_URL
  };
  userPreferences: UserPreferences = {
    default_document_template_ids: []
  };
  
  stakeholders: Stakeholder[] = [];
  tradeLots: TradeLot[] = [];
  siteReports: SiteReport[] = [];
  stakeholderTemplates: StakeholderTemplate[] = [];
  tradeLotTemplates: TradeLotTemplate[] = [];

  constructor() {
    this.load();
    if (this.templates.length === 0) {
      this.seed();
    }
  }

  save() {
    const data = {
      projects: this.projects,
      stages: this.stages,
      tasks: this.tasks,
      timelineItems: this.timelineItems,
      timelineTemplates: this.timelineTemplates,
      templates: this.templates,
      projectFields: this.projectFields,
      templateLinks: this.templateLinks,
      comments: this.comments,
      settings: this.settings,
      userPreferences: this.userPreferences,
      stakeholders: this.stakeholders,
      tradeLots: this.tradeLots,
      siteReports: this.siteReports,
      stakeholderTemplates: this.stakeholderTemplates,
      tradeLotTemplates: this.tradeLotTemplates
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.projects = data.projects || [];
        this.stages = data.stages || [];
        this.tasks = data.tasks || [];
        this.timelineItems = data.timelineItems || [];
        this.timelineTemplates = data.timelineTemplates || [];
        this.templates = data.templates || [];
        this.projectFields = data.projectFields || [];
        this.templateLinks = data.templateLinks || [];
        this.comments = data.comments || [];
        this.settings = data.settings || { make_webhook_url: MAKE_WEBHOOK_URL };
        this.userPreferences = data.userPreferences || { default_document_template_ids: [] };
        
        this.stakeholders = data.stakeholders || [];
        this.tradeLots = data.tradeLots || [];
        this.siteReports = data.siteReports || [];
        this.stakeholderTemplates = data.stakeholderTemplates || [];
        this.tradeLotTemplates = data.tradeLotTemplates || [];
      } catch (e) {
        console.error("Erreur chargement DB", e);
      }
    }
  }

  seed() {
    this.templates.push({
      id: 't_contract_v1',
      workspace_id: 'ws_1',
      template_name: 'Contrat de Mission Architecte',
      template_type: 'CONTRACT',
      file_url: 'dummy',
      variables: ['client_nom', 'client_adresse', 'budget_travaux', 'surface_m2'],
      is_active: true,
      analysis_status: 'ok',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    this.timelineTemplates.push({
      id: 'tt_default',
      workspace_id: 'ws_1',
      template_name: 'Modèle Standard Architecte',
      items: [
        { name: 'APS', item_type: 'stage' },
        { name: 'APD', item_type: 'stage' },
        { name: 'Génération du document', item_type: 'task', task_type: 'system' }, 
        { name: 'PC', item_type: 'stage' },
        { name: 'Relancer devis', item_type: 'task', task_type: 'free' }
      ],
      created_at: new Date().toISOString()
    });

    this.stakeholderTemplates.push({
      id: 'stt_default',
      workspace_id: 'ws_1',
      name: 'Equipe Standard Chantier',
      roles: ["Maître d'ouvrage", "Maître d'œuvre", "Bureau de Contrôle", "CSPS"]
    });

    this.tradeLotTemplates.push({
      id: 'tlt_default',
      workspace_id: 'ws_1',
      name: 'Lots Rénovation Classique',
      lots: ["Démolition", "Gros œuvre", "Menuiseries", "Plâtrerie", "Electricité", "Plomberie", "Carrelage", "Peinture"]
    });

    this.userPreferences = {
        default_timeline_template_id: 'tt_default',
        default_document_template_ids: ['t_contract_v1'],
        default_stakeholder_template_id: 'stt_default',
        default_trade_lot_template_id: 'tlt_default'
    };

    this.save();
  }

  createProject(data: Partial<Project> & { initialTemplateIds?: string[] }, creatorId: string) {
    const projectId = 'p_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    const newProject: Project = {
      id: projectId,
      workspace_id: MOCK_WORKSPACE.id,
      project_name: data.project_name || 'Nouveau Projet',
      client_name: data.client_name || 'Client',
      client_email: data.client_email,
      project_address: data.project_address || '',
      image_url: data.image_url,
      status_global: 'Initialisation', // Phase technique auto au début
      category: 'Prospect', // Catégorie commerciale par défaut
      assigned_users: data.assigned_users || [creatorId],
      created_at: now,
      updated_at: now
    };
    
    this.projects.push(newProject);

    // 1. Initialisation des modèles et champs
    const selectedTemplateIds = data.initialTemplateIds || this.userPreferences.default_document_template_ids || [];
    selectedTemplateIds.forEach(templateId => {
      const template = this.templates.find(t => t.id === templateId);
      if (template) {
        this.templateLinks.push({ id: 'l_' + Math.random().toString(36).substr(2, 9), workspace_id: MOCK_WORKSPACE.id, project_id: projectId, template_id: templateId, status: 'active', created_at: now });
        template.variables.forEach(vKey => {
          let field = this.projectFields.find(f => f.project_id === projectId && f.key === vKey);
          if (!field) {
            this.projectFields.push({ id: 'f_' + Math.random().toString(36).substr(2, 9), workspace_id: MOCK_WORKSPACE.id, project_id: projectId, key: vKey, label: vKey.replace(/_/g, ' '), value: '', used_in_template_ids: [templateId], created_from_template_id: templateId, updated_at: now });
          } else if (!field.used_in_template_ids.includes(templateId)) {
            field.used_in_template_ids.push(templateId);
          }
        });
      }
    });

    // 2. Initialisation de la Timeline - Dates vides par défaut pour les tâches
    const timelineId = this.userPreferences.default_timeline_template_id;
    const selectedTimeline = this.timelineTemplates.find(tt => tt.id === (timelineId || 'tt_default'));
    if (selectedTimeline) {
      let currentPos = 100;
      selectedTimeline.items.forEach(item => {
        if (item.item_type === 'stage') {
          const stageId = 's_' + Math.random().toString(36).substr(2, 9);
          this.stages.push({ id: stageId, workspace_id: MOCK_WORKSPACE.id, project_id: projectId, stage_name: item.name, status: 'pas commencé', created_at: now, updated_at: now });
          this.timelineItems.push({ id: 'ti_' + Math.random().toString(36).substr(2, 9), workspace_id: MOCK_WORKSPACE.id, project_id: projectId, item_type: 'stage', stage_id: stageId, position: currentPos, created_at: now, updated_at: now });
        } else {
          const taskId = 't_' + Math.random().toString(36).substr(2, 9);
          this.tasks.push({ id: taskId, workspace_id: MOCK_WORKSPACE.id, project_id: projectId, task_name: item.name, task_type: item.task_type || 'free', system_action_key: item.system_action_key || '', status: 'pas commencé', due_date: '', created_at: now });
          this.timelineItems.push({ id: 'ti_' + Math.random().toString(36).substr(2, 9), workspace_id: MOCK_WORKSPACE.id, project_id: projectId, item_type: 'task', task_id: taskId, position: currentPos, created_at: now, updated_at: now });
        }
        currentPos += 100;
      });
    }

    // 3. Intervenants et Lots
    if (this.userPreferences.default_stakeholder_template_id) {
        this.stakeholderTemplates.find(t => t.id === this.userPreferences.default_stakeholder_template_id)?.roles.forEach(role => {
            this.stakeholders.push({ id: 'stk_' + Math.random().toString(36).substr(2, 9), project_id: projectId, role, company_name: '', representative_name: '', email: '', phone: '' });
        });
    }
    if (this.userPreferences.default_trade_lot_template_id) {
        this.tradeLotTemplates.find(t => t.id === this.userPreferences.default_trade_lot_template_id)?.lots.forEach(lot => {
            this.tradeLots.push({ id: 'lot_' + Math.random().toString(36).substr(2, 9), project_id: projectId, lot_name: lot });
        });
    }

    this.save();
    return newProject;
  }
}

export const db = new DataStore();
