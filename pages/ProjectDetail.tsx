
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, LayoutList, Plus, CheckCircle, 
  Trash2, Zap, GripVertical, ChevronDown, 
  HardHat, Building2, MapPin, Users, 
  FileBox, ChevronRight, Tag, FilePlus, Loader2, 
  Camera, X, Send, Mail, Phone, ListChecks, History, 
  UserPlus, Check, BookmarkPlus
} from 'lucide-react';
import { 
  Project, Stage, Task, TimelineItem, User, Comment, 
  ProjectField, DocumentTemplate, ProjectTemplateLink, ItemStatus,
  SiteReport, AppSettings, Stakeholder, TradeLot,
  StakeholderTemplate, TradeLotTemplate, TimelineTemplate
} from '../types';

interface ProjectDetailProps {
  currentUser: User;
  allUsers: User[];
  projects: Project[];
  stages: Stage[];
  tasks: Task[];
  timelineItems: TimelineItem[];
  timelineTemplates: TimelineTemplate[];
  comments: Comment[];
  projectFields: ProjectField[];
  templates: DocumentTemplate[];
  templateLinks: ProjectTemplateLink[];
  settings: AppSettings;
  stakeholders: Stakeholder[];
  tradeLots: TradeLot[];
  siteReports: SiteReport[];
  stakeholderTemplates: StakeholderTemplate[];
  tradeLotTemplates: TradeLotTemplate[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onAddStage: (projectId: string, stageName: string) => void;
  onAddTask: (projectId: string, taskName: string, type: 'free' | 'system' | 'auto') => void;
  onDeleteStage: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddReport: (projectId: string, reportData: Partial<SiteReport>) => SiteReport;
  onUpdateStage: (id: string, updates: Partial<Stage>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onUpdateReport: (id: string, updates: Partial<SiteReport>) => void;
  onReorderTimeline: (projectId: string, items: TimelineItem[]) => void;
  onAddComment: (comment: Partial<Comment>) => void;
  onUpdateField: (id: string, value: string) => void;
  onActivateTemplate: (projectId: string, templateId: string) => void;
  onAddStakeholder: (projectId: string, data: Partial<Stakeholder>) => void;
  onUpdateStakeholder: (id: string, updates: Partial<Stakeholder>) => void;
  onDeleteStakeholder: (id: string) => void;
  onAddLot: (projectId: string, name: string) => void;
  onDeleteLot: (id: string) => void;
  onSaveStakeholderTemplate: (projectId: string, name: string) => void;
  onLoadStakeholderTemplate: (projectId: string, templateId: string) => void;
  onSaveLotTemplate: (projectId: string, name: string) => void;
  onLoadLotTemplate: (projectId: string, templateId: string) => void;
  onSaveTimelineTemplate: (projectId: string, name: string) => void;
  onLoadTimelineTemplate: (projectId: string, templateId: string) => void;
}

// Couleurs dynamiques basées sur le statut pour toute la carte
const statusStyles: Record<ItemStatus, { bg: string; text: string; border: string; accent: string }> = {
  'pas commencé': { bg: 'bg-white', text: 'text-slate-500', border: 'border-slate-200', accent: 'bg-slate-200' },
  'en cours': { bg: 'bg-blue-50/50', text: 'text-blue-700', border: 'border-blue-200', accent: 'bg-blue-600' },
  'terminé': { bg: 'bg-emerald-50/50', text: 'text-emerald-700', border: 'border-emerald-200', accent: 'bg-emerald-600' },
  'abandonné': { bg: 'bg-red-50/50', text: 'text-red-700', border: 'border-red-200', accent: 'bg-red-600' },
  'pas concerné': { bg: 'bg-slate-100/50', text: 'text-slate-400', border: 'border-slate-200', accent: 'bg-slate-300' },
  'autre': { bg: 'bg-white', text: 'text-slate-500', border: 'border-slate-200', accent: 'bg-slate-200' },
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  currentUser, allUsers, projects, stages, tasks, timelineItems,
  projectFields, templates, templateLinks, settings, timelineTemplates,
  stakeholders, tradeLots, siteReports, stakeholderTemplates, tradeLotTemplates,
  onAddStage, onAddTask, onDeleteStage, onDeleteTask, onUpdateStage, onUpdateTask,
  onUpdateReport, onUpdateField, onActivateTemplate,
  onAddStakeholder, onUpdateStakeholder, onDeleteStakeholder,
  onAddLot, onDeleteLot, onAddReport, onAddComment, comments,
  onSaveStakeholderTemplate, onLoadStakeholderTemplate, onSaveLotTemplate, onLoadLotTemplate,
  onSaveTimelineTemplate, onLoadTimelineTemplate
}) => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'timeline' | 'comments' | 'fields' | 'documents' | 'equipe' | 'chantier'>('timeline');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  
  const project = useMemo(() => projects.find(p => p.id === id), [projects, id]);
  const currentTimeline = useMemo(() => {
    return timelineItems.filter(ti => ti.project_id === id).sort((a, b) => a.position - b.position);
  }, [timelineItems, id]);

  const currentStakeholders = stakeholders.filter(s => s.project_id === id);
  const currentLots = tradeLots.filter(l => l.project_id === id);
  const currentReports = siteReports.filter(r => r.project_id === id).sort((a,b) => b.report_number - a.report_number);
  const currentFields = projectFields.filter(f => f.project_id === id);
  const projectComments = comments.filter(c => c.project_id === id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (!project) return null;

  const handleGenerateDocument = async (itemId: string, itemName: string) => {
    setIsGenerating(itemId);
    try {
      const vars: Record<string, string> = {};
      currentFields.forEach(f => { vars[f.key] = f.value || ''; });
      await fetch(settings.make_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id, project_name: project.project_name, client_name: project.client_name, vars, document_name: itemName })
      });
      alert(`Génération lancée pour : ${itemName}`);
    } catch (e) {
      alert("Erreur de connexion au Webhook Make");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* HEADER BANNER */}
      <div className="relative h-64 rounded-[3rem] overflow-hidden border border-slate-200 shadow-2xl bg-slate-950">
        {project.image_url && <img src={project.image_url} className="w-full h-full object-cover opacity-60" alt="" />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        <div className="absolute top-8 left-8">
          <Link to="/projects" className="flex items-center gap-3 text-white/90 hover:text-white bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
        <div className="absolute bottom-10 left-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${project.category === 'Prospect' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
                {project.category}
              </span>
              <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-white text-[9px] font-black uppercase tracking-widest">
                {project.status_global || 'Phase Initiale'}
              </div>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">{project.project_name}</h1>
            <div className="flex items-center gap-6 text-white/80 font-bold">
              <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-400" /> {project.client_name}</div>
              <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-red-400" /> {project.project_address}</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS MENU */}
      <div className="sticky top-0 z-[60] flex border-b border-slate-200 bg-white/95 backdrop-blur-xl px-8 gap-4 overflow-x-auto no-scrollbar shadow-sm">
        {[
          { id: 'timeline', label: 'Fil conducteur', icon: ListChecks },
          { id: 'comments', label: 'Journal & Notes', icon: MessageSquare },
          { id: 'fields', label: 'Fiche Technique', icon: Tag },
          { id: 'chantier', label: 'Suivi Chantier', icon: HardHat },
          { id: 'equipe', label: 'Intervenants & Lots', icon: Users },
          { id: 'documents', label: 'Modèles', icon: FileBox },
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => { setActiveTab(tab.id as any); setSelectedReportId(null); }} 
            className={`px-6 py-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-3 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="px-6 pb-20">
        {/* TIMELINE TAB - RESTAURATION COMPLÈTE */}
        {activeTab === 'timeline' && (
          <div className="max-w-4xl mx-auto py-12 space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Timeline du Dossier</h2>
                <p className="text-slate-400 font-medium">L'ensemble des jalons et tâches automatisées.</p>
              </div>
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl">
                    <Plus className="w-5 h-5" /> Ajouter <ChevronDown className={`w-4 h-4 transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
                </button>
                {showAddMenu && (
                  <div className="absolute right-0 mt-4 w-72 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[100] p-2 animate-in fade-in zoom-in duration-200">
                    <button onClick={() => { onAddStage(project.id, "Nouvelle Étape"); setShowAddMenu(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 text-slate-700 rounded-2xl transition-all text-left group">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><LayoutList className="w-5 h-5" /></div>
                      <span className="font-bold">Étape Technique</span>
                    </button>
                    <button onClick={() => { onAddTask(project.id, "Nouvelle Tâche", "free"); setShowAddMenu(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-purple-50 text-slate-700 rounded-2xl transition-all text-left group">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all"><CheckCircle className="w-5 h-5" /></div>
                      <span className="font-bold">Tâche Libre</span>
                    </button>
                    <button onClick={() => { onAddTask(project.id, "Génération de document", "system"); setShowAddMenu(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-emerald-50 text-slate-700 rounded-2xl transition-all text-left group">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all"><Zap className="w-5 h-5" /></div>
                      <span className="font-bold">Tâche Système (Doc)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 relative pl-10">
              <div className="absolute left-[1.125rem] top-10 bottom-10 w-0.5 bg-slate-100" />
              {currentTimeline.map((item) => {
                const stage = item.item_type === 'stage' ? stages.find(s => s.id === item.stage_id) : null;
                const task = item.item_type === 'task' ? tasks.find(t => t.id === item.task_id) : null;
                const report = item.item_type === 'report' ? siteReports.find(r => r.id === item.report_id) : null;
                if (!stage && !task && !report) return null;

                const status = stage?.status || task?.status || (report?.status === 'sent' ? 'terminé' : 'en cours');
                const style = statusStyles[status as ItemStatus] || statusStyles['pas commencé'];
                const isSystem = task?.task_type === 'system';
                const isStage = item.item_type === 'stage';

                return (
                  <div key={item.id} className="relative group">
                    <div className={`absolute -left-[3.25rem] top-10 w-4 h-4 rounded-full border-4 border-white z-10 ${style.accent}`} />
                    {/* LA CARTE CHANGE DE COULEUR SELON LE STATUT */}
                    <div className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-2xl flex flex-col md:flex-row md:items-center gap-8 shadow-sm ${style.bg} ${style.border}`}>
                      <GripVertical className="w-5 h-5 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab absolute left-3 top-1/2 -translate-y-1/2 transition-opacity" />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isStage ? 'bg-blue-600 text-white' : isSystem ? 'bg-emerald-600 text-white' : 'bg-purple-100 text-purple-600'}`}>
                            {isStage ? <LayoutList className="w-5 h-5" /> : isSystem ? <Zap className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${style.text}`}>{item.item_type === 'stage' ? 'Étape' : isSystem ? 'Automatisation' : 'Tâche'}</span>
                        </div>
                        <input 
                          type="text" 
                          className="w-full bg-transparent border-none outline-none font-black text-slate-900 tracking-tight text-2xl" 
                          value={stage?.stage_name || task?.task_name || `Compte-rendu n°${report?.report_number}`} 
                          onChange={(e) => { if (stage) onUpdateStage(stage.id, { stage_name: e.target.value }); else if (task) onUpdateTask(task.id, { task_name: e.target.value }); }} 
                        />
                      </div>

                      <div className="flex items-center gap-6">
                        {/* BOUTON GÉNÉRER POUR LES TÂCHES SYSTÈME */}
                        {isSystem && (
                          <button 
                            onClick={() => handleGenerateDocument(task.id, task.task_name)}
                            disabled={isGenerating === task.id}
                            className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                          >
                            {isGenerating === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Générer
                          </button>
                        )}

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Statut</label>
                          <select 
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase border outline-none cursor-pointer transition-all bg-white ${style.text} ${style.border}`} 
                            value={status} 
                            onChange={(e) => { if (stage) onUpdateStage(stage.id, { status: e.target.value as ItemStatus }); else if (task) onUpdateTask(task.id, { status: e.target.value as ItemStatus }); }}
                          >
                            {Object.keys(statusStyles).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        <button onClick={() => { if (stage) onDeleteStage(stage.id); else if (task) onDeleteTask(task.id); }} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INTERVENANTS & LOTS */}
        {activeTab === 'equipe' && (
          <div className="max-w-6xl mx-auto py-12 space-y-16">
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Annuaire du Projet</h2>
                        <p className="text-slate-400 font-medium">Gestion des intervenants et contacts clés.</p>
                    </div>
                    <button onClick={() => onAddStakeholder(project.id, { role: 'Nouveau Rôle' })} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 shadow-lg">
                        <UserPlus className="w-5 h-5" /> Ajouter Intervenant
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentStakeholders.map(stk => (
                        <div key={stk.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl transition-all relative group overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />
                            <button onClick={() => onDeleteStakeholder(stk.id)} className="absolute top-8 right-8 p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                            <div className="space-y-1">
                                <input type="text" className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-transparent outline-none w-full" value={stk.role} onChange={(e) => onUpdateStakeholder(stk.id, { role: e.target.value })} />
                                <input type="text" className="text-2xl font-black text-slate-900 bg-transparent outline-none w-full tracking-tight" placeholder="Société" value={stk.company_name} onChange={(e) => onUpdateStakeholder(stk.id, { company_name: e.target.value })} />
                            </div>
                            <div className="space-y-4 pt-6 border-t border-slate-50 font-bold">
                                <div className="flex items-center gap-4 text-slate-600"><Mail className="w-4 h-4 text-slate-300" /><input type="email" className="flex-1 bg-transparent text-xs outline-none" placeholder="Email" value={stk.email} onChange={(e) => onUpdateStakeholder(stk.id, { email: e.target.value })} /></div>
                                <div className="flex items-center gap-4 text-slate-600"><Phone className="w-4 h-4 text-slate-300" /><input type="text" className="flex-1 bg-transparent text-xs outline-none" placeholder="Téléphone" value={stk.phone} onChange={(e) => onUpdateStakeholder(stk.id, { phone: e.target.value })} /></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="max-w-6xl mx-auto py-12 space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Bibliothèque Projet</h2>
                    <p className="text-slate-400 font-medium">Activez les modèles pour débloquer les variables correspondantes.</p>
                </div>
                <Link to="/templates" className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-3">
                    <FilePlus className="w-6 h-6" /> Gérer les Modèles
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map(template => {
                    const isLinked = templateLinks.some(l => l.project_id === id && l.template_id === template.id);
                    return (
                        <div 
                            key={template.id} 
                            onClick={() => onActivateTemplate(project.id, template.id)}
                            className={`p-10 rounded-[3rem] border transition-all group relative overflow-hidden flex flex-col cursor-pointer ${isLinked ? 'bg-white border-blue-600 shadow-2xl ring-8 ring-blue-50/50' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-300 shadow-sm'}`}
                        >
                            <div className="flex items-start justify-between mb-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${isLinked ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-200 border border-slate-100'}`}>W</div>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all ${isLinked ? 'bg-emerald-500 border-emerald-100 text-white shadow-xl' : 'border-slate-100 text-transparent'}`}>
                                    <Check className="w-5 h-5" />
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{template.template_name}</h4>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 mb-10">{template.template_type}</p>
                            {isLinked && (
                                <button onClick={(e) => { e.stopPropagation(); handleGenerateDocument(template.id, template.template_name); }} className="mt-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                                    {isGenerating === template.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                    Lancer Génération
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>
        )}

        {/* FICHE TECHNIQUE */}
        {activeTab === 'fields' && (
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600" />
                <div className="mb-16">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Fiche Technique Dynamique</h2>
                    <p className="text-slate-400 font-medium">Remplissez les données pour l'automatisation des modèles actifs.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {currentFields.map(field => (
                        <div key={field.id} className="space-y-4 group">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                <Tag className="w-3.5 h-3.5" /> {field.label}
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-800 text-lg shadow-inner" 
                                value={field.value || ''} 
                                onChange={(e) => onUpdateField(field.id, e.target.value)} 
                            />
                        </div>
                    ))}
                    {currentFields.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                        <FileBox className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <p className="text-slate-400 font-black uppercase tracking-widest">Aucune variable détectée</p>
                        <p className="text-slate-300 text-[11px] mt-2 italic font-medium">Activez des modèles dans l'onglet bibliothèque pour initialiser les champs.</p>
                      </div>
                    )}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
