
export type UserRole = 'super_admin' | 'admin' | 'user';

export interface Workspace {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
}

export interface User {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface AppSettings {
  make_webhook_url: string;
}

export interface UserPreferences {
  default_timeline_template_id?: string;
  default_document_template_ids: string[];
  default_stakeholder_template_id?: string;
  default_trade_lot_template_id?: string;
}

export type ProjectCategory = 'Prospect' | 'Client';

export interface Project {
  id: string;
  workspace_id: string;
  project_name: string;
  client_name: string;
  client_email?: string;
  project_address: string;
  status_global: string; // Utilisé pour la phase technique auto
  category: ProjectCategory; // Prospect ou Client
  assigned_users: string[]; 
  drive_folder_id?: string;
  drive_folder_url?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type ItemStatus = 'pas commencé' | 'en cours' | 'terminé' | 'abandonné' | 'pas concerné' | 'autre';

export interface Stage {
  id: string;
  workspace_id: string;
  project_id: string;
  stage_name: string;
  status: ItemStatus;
  date?: string; 
  created_at: string;
  updated_at: string;
}

export type TaskType = 'free' | 'system' | 'auto';

export interface Task {
  id: string;
  workspace_id: string;
  project_id: string;
  task_name: string;
  task_type: TaskType;
  system_action_key?: string; 
  status: ItemStatus;
  assigned_to_user_id?: string;
  due_date?: string;
  is_auto_relance?: boolean; 
  created_at: string;
  done_at?: string;
  reminder_status?: 'scheduled' | 'sent';
  reminder_date?: string;
}

export interface TimelineItem {
  id: string;
  workspace_id: string;
  project_id: string;
  item_type: 'stage' | 'task' | 'document' | 'report';
  stage_id?: string;
  task_id?: string;
  template_id?: string;
  report_id?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export type TemplateType = 'CONTRACT' | 'ORDER_THERMAL' | 'ORDER_SOIL' | 'DO_REQUEST' | 'BROKER_CONTACT' | 'OTHER';

export interface DocumentTemplate {
  id: string;
  workspace_id: string;
  template_name: string;
  template_type: TemplateType;
  file_url: string;
  variables: string[];
  is_active: boolean;
  analysis_status: 'pending' | 'processing' | 'ok' | 'error';
  created_at: string;
  updated_at: string;
}

export interface ProjectField {
  id: string;
  workspace_id: string;
  project_id: string;
  key: string;
  label: string;
  value?: string;
  used_in_template_ids: string[];
  created_from_template_id?: string;
  updated_at: string;
}

export interface ProjectTemplateLink {
  id: string;
  workspace_id: string;
  project_id: string;
  template_id: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Comment {
  id: string;
  workspace_id: string;
  project_id: string;
  author_user_id: string;
  body: string;
  mentions_user_ids: string[];
  created_at: string;
}

export interface TimelineTemplate {
  id: string;
  workspace_id: string;
  template_name: string;
  items: {
    name: string;
    item_type: 'stage' | 'task' | 'document';
    task_type?: TaskType;
    system_action_key?: string;
  }[];
  created_at: string;
}

export interface Stakeholder {
  id: string;
  project_id: string;
  role: string;
  company_name: string;
  representative_name: string;
  email: string;
  phone: string;
  is_from_template?: boolean;
}

export interface TradeLot {
  id: string;
  project_id: string;
  lot_name: string;
}

export interface LotObservation {
  lot_id: string;
  lot_name: string;
  observations: string;
  decisions: string;
  photos: string[];
}

export interface SiteReport {
  id: string;
  project_id: string;
  report_number: number;
  visit_date: string;
  summary: string;
  lot_observations: LotObservation[];
  attendances: any[];
  status: 'draft' | 'sent';
  created_at: string;
}

export interface StakeholderTemplate {
  id: string;
  workspace_id: string;
  name: string;
  roles: string[];
}

export interface TradeLotTemplate {
  id: string;
  workspace_id: string;
  name: string;
  lots: string[];
}
