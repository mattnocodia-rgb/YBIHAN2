
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectCreate from './pages/ProjectCreate';
import ProjectDetail from './pages/ProjectDetail';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import UserSettings from './pages/UserSettings';
import { 
  Project, Stage, Task, TimelineItem, User, Comment, 
  DocumentTemplate, ProjectField, ProjectTemplateLink, TimelineTemplate, SiteReport, AppSettings,
  Stakeholder, TradeLot, StakeholderTemplate, TradeLotTemplate, UserPreferences
} from './types';
import { db, MOCK_USERS } from './store';

const App: React.FC = () => {
  const [currentUser] = useState<User>(MOCK_USERS[0]); 

  const [projects, setProjects] = useState<Project[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [timelineTemplates, setTimelineTemplates] = useState<TimelineTemplate[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [projectFields, setProjectFields] = useState<ProjectField[]>([]);
  const [templateLinks, setTemplateLinks] = useState<ProjectTemplateLink[]>([]);
  const [settings, setSettings] = useState<AppSettings>(db.settings);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(db.userPreferences);
  
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [tradeLots, setTradeLots] = useState<TradeLot[]>([]);
  const [siteReports, setSiteReports] = useState<SiteReport[]>([]);
  const [stakeholderTemplates, setStakeholderTemplates] = useState<StakeholderTemplate[]>([]);
  const [tradeLotTemplates, setTradeLotTemplates] = useState<TradeLotTemplate[]>([]);

  useEffect(() => {
    syncState();
  }, []);

  const syncState = () => {
    setProjects([...db.projects]);
    setStages([...db.stages]);
    setTasks([...db.tasks]);
    setTimelineItems([...db.timelineItems]);
    setTimelineTemplates([...db.timelineTemplates]);
    setComments([...db.comments]);
    setTemplates([...db.templates]);
    setProjectFields([...db.projectFields]);
    setTemplateLinks([...db.templateLinks]);
    setSettings({ ...db.settings });
    setUserPreferences({ ...db.userPreferences });
    setStakeholders([...db.stakeholders]);
    setTradeLots([...db.tradeLots]);
    setSiteReports([...db.siteReports]);
    setStakeholderTemplates([...db.stakeholderTemplates]);
    setTradeLotTemplates([...db.tradeLotTemplates]);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    db.projects = db.projects.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p);
    db.save();
    syncState();
  };

  const handleActivateTemplate = (projectId: string, templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const existingLink = db.templateLinks.find(l => l.project_id === projectId && l.template_id === templateId);
    const now = new Date().toISOString();

    if (existingLink) {
        // DÉSÉLECTION : Supprimer le lien
        db.templateLinks = db.templateLinks.filter(l => l.id !== existingLink.id);
        // Nettoyage des champs de la fiche technique
        db.projectFields = db.projectFields.map(f => {
            if (f.project_id === projectId) {
                return { ...f, used_in_template_ids: (f.used_in_template_ids || []).filter(tid => tid !== templateId) };
            }
            return f;
        }).filter(f => f.project_id !== projectId || f.used_in_template_ids.length > 0);
    } else {
        // SÉLECTION : Créer le lien
        db.templateLinks.push({ 
          id: 'l_' + Math.random().toString(36).substr(2, 9), 
          workspace_id: currentUser.workspace_id, 
          project_id: projectId, 
          template_id: templateId, 
          status: 'active', 
          created_at: now 
        });
        // Ajouter les variables à la fiche technique
        template.variables.forEach(vKey => {
            let field = db.projectFields.find(f => f.project_id === projectId && f.key === vKey);
            if (!field) {
                db.projectFields.push({ 
                  id: 'f_' + Math.random().toString(36).substr(2, 9), 
                  workspace_id: currentUser.workspace_id, 
                  project_id: projectId, 
                  key: vKey, 
                  label: vKey.replace(/_/g, ' '), 
                  value: '', 
                  used_in_template_ids: [templateId], 
                  created_from_template_id: templateId, 
                  updated_at: now 
                });
            } else if (!field.used_in_template_ids.includes(templateId)) {
                field.used_in_template_ids.push(templateId);
            }
        });
    }
    db.save();
    syncState();
  };

  const handleSaveStakeholderTemplate = (projectId: string, name: string) => {
    const projectStk = db.stakeholders.filter(s => s.project_id === projectId);
    if (projectStk.length === 0) return;
    db.stakeholderTemplates.push({ 
      id: 'stt_' + Math.random().toString(36).substr(2, 9), 
      workspace_id: currentUser.workspace_id, 
      name, 
      roles: projectStk.map(s => s.role) 
    });
    db.save();
    syncState();
  };

  const handleLoadStakeholderTemplate = (projectId: string, templateId: string) => {
    const template = db.stakeholderTemplates.find(t => t.id === templateId);
    if (!template) return;
    template.roles.forEach(role => {
      db.stakeholders.push({ 
        id: 'stk_' + Math.random().toString(36).substr(2, 9), 
        project_id: projectId, 
        role, 
        company_name: '', 
        representative_name: '', 
        email: '', 
        phone: '' 
      });
    });
    db.save();
    syncState();
  };

  const handleSaveLotTemplate = (projectId: string, name: string) => {
    const projectLots = db.tradeLots.filter(l => l.project_id === projectId);
    if (projectLots.length === 0) return;
    db.tradeLotTemplates.push({ 
      id: 'tltt_' + Math.random().toString(36).substr(2, 9), 
      workspace_id: currentUser.workspace_id, 
      name, 
      lots: projectLots.map(l => l.lot_name) 
    });
    db.save();
    syncState();
  };

  const handleLoadLotTemplate = (projectId: string, templateId: string) => {
    const template = db.tradeLotTemplates.find(t => t.id === templateId);
    if (!template) return;
    template.lots.forEach(lot => {
      db.tradeLots.push({ 
        id: 'lot_' + Math.random().toString(36).substr(2, 9), 
        project_id: projectId, 
        lot_name: lot 
      });
    });
    db.save();
    syncState();
  };

  const pendingRemindersCount = useMemo(() => {
    return tasks.filter(t => (t.due_date && new Date(t.due_date) <= new Date() && t.status !== 'terminé')).length;
  }, [tasks]);

  return (
    <Router>
      <Layout currentUser={currentUser} onLogout={() => { localStorage.removeItem('maitrisea_db_v1'); window.location.reload(); }} pendingRemindersCount={pendingRemindersCount}>
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} users={MOCK_USERS} tasks={tasks} currentUser={currentUser} onUpdateProject={handleUpdateProject} />} />
          <Route path="/projects" element={<Dashboard projects={projects} users={MOCK_USERS} tasks={tasks} currentUser={currentUser} onUpdateProject={handleUpdateProject} />} />
          <Route path="/projects/new" element={<ProjectCreate users={MOCK_USERS} currentUser={currentUser} userPreferences={userPreferences} onProjectCreated={syncState} />} />
          <Route 
            path="/projects/:id" 
            element={
              <ProjectDetail 
                currentUser={currentUser} allUsers={MOCK_USERS} projects={projects}
                stages={stages} tasks={tasks} timelineItems={timelineItems}
                timelineTemplates={timelineTemplates} comments={comments} projectFields={projectFields}
                templates={templates} templateLinks={templateLinks} settings={settings}
                stakeholders={stakeholders} tradeLots={tradeLots} siteReports={siteReports}
                stakeholderTemplates={stakeholderTemplates} tradeLotTemplates={tradeLotTemplates}
                onUpdateProject={handleUpdateProject}
                onAddStage={(p, n) => { 
                  const sid = 's_'+Math.random().toString(36).substr(2,9);
                  db.stages.push({id: sid, workspace_id: currentUser.workspace_id, project_id: p, stage_name: n, status: 'pas commencé', created_at: new Date().toISOString(), updated_at: new Date().toISOString()});
                  db.timelineItems.push({id: 'ti_'+Math.random().toString(36).substr(2,9), workspace_id: currentUser.workspace_id, project_id: p, item_type: 'stage', stage_id: sid, position: db.timelineItems.filter(i=>i.project_id===p).length*100, created_at: new Date().toISOString(), updated_at: new Date().toISOString()});
                  db.save(); syncState();
                }}
                onAddTask={(p, n, t) => {
                  const tid = 't_'+Math.random().toString(36).substr(2,9);
                  db.tasks.push({id: tid, workspace_id: currentUser.workspace_id, project_id: p, task_name: n, task_type: t, status: 'pas commencé', due_date: '', created_at: new Date().toISOString()});
                  db.timelineItems.push({id: 'ti_'+Math.random().toString(36).substr(2,9), workspace_id: currentUser.workspace_id, project_id: p, item_type: 'task', task_id: tid, position: db.timelineItems.filter(i=>i.project_id===p).length*100, created_at: new Date().toISOString(), updated_at: new Date().toISOString()});
                  db.save(); syncState();
                }}
                onDeleteStage={id => { db.stages=db.stages.filter(s=>s.id!==id); db.timelineItems=db.timelineItems.filter(ti=>ti.stage_id!==id); db.save(); syncState(); }}
                onDeleteTask={id => { db.tasks=db.tasks.filter(t=>t.id!==id); db.timelineItems=db.timelineItems.filter(ti=>ti.task_id!==id); db.save(); syncState(); }}
                onAddReport={(p, d) => {
                  const rid = 'r_'+Math.random().toString(36).substr(2,9);
                  const report = {id: rid, project_id: p, report_number: db.siteReports.filter(r=>r.project_id===p).length+1, visit_date: d.visit_date || new Date().toISOString().split('T')[0], summary: '', lot_observations: [], attendances: [], status: 'draft', created_at: new Date().toISOString()};
                  db.siteReports.push(report as any);
                  db.timelineItems.push({id: 'ti_'+Math.random().toString(36).substr(2,9), workspace_id: currentUser.workspace_id, project_id: p, item_type: 'report', report_id: rid, position: db.timelineItems.filter(i=>i.project_id===p).length*100, created_at: new Date().toISOString(), updated_at: new Date().toISOString()});
                  db.save(); syncState(); return report as any;
                }}
                onUpdateStage={(id, u) => { db.stages=db.stages.map(s=>s.id===id?{...s,...u,updated_at:new Date().toISOString()}:s); db.save(); syncState(); }}
                onUpdateTask={(id, u) => { db.tasks=db.tasks.map(t=>t.id===id?{...t,...u}:t); db.save(); syncState(); }}
                onUpdateReport={(id, u) => { db.siteReports=db.siteReports.map(r=>r.id===id?{...r,...u}:r); db.save(); syncState(); }}
                onReorderTimeline={(p, i) => { db.timelineItems=db.timelineItems.map(ti => { const m=i.find(x=>x.id===ti.id); return m?m:ti; }); db.save(); syncState(); }}
                onAddComment={c => { db.comments.push({id: 'c_'+Math.random().toString(36).substr(2,9), workspace_id: currentUser.workspace_id, project_id: c.project_id||'', author_user_id: currentUser.id, body: c.body||'', mentions_user_ids: [], created_at: new Date().toISOString()}); db.save(); syncState(); }}
                onUpdateField={(id, v) => { db.projectFields=db.projectFields.map(f=>f.id===id?{...f,value:v,updated_at:new Date().toISOString()}:f); db.save(); syncState(); }}
                onActivateTemplate={handleActivateTemplate}
                onAddStakeholder={(p, d) => { db.stakeholders.push({id: 'stk_'+Math.random().toString(36).substr(2,9), project_id: p, role: d.role||'', company_name: '', representative_name: '', email: '', phone: ''}); db.save(); syncState(); }}
                onUpdateStakeholder={(id, u) => { db.stakeholders=db.stakeholders.map(s=>s.id===id?{...s,...u}:s); db.save(); syncState(); }}
                onDeleteStakeholder={id => { db.stakeholders=db.stakeholders.filter(s=>s.id!==id); db.save(); syncState(); }}
                onAddLot={(p, n) => { db.tradeLots.push({id: 'lot_'+Math.random().toString(36).substr(2,9), project_id: p, lot_name: n}); db.save(); syncState(); }}
                onDeleteLot={id => { db.tradeLots=db.tradeLots.filter(l=>l.id!==id); db.save(); syncState(); }}
                onSaveStakeholderTemplate={handleSaveStakeholderTemplate}
                onLoadStakeholderTemplate={handleLoadStakeholderTemplate}
                onSaveLotTemplate={handleSaveLotTemplate}
                onLoadLotTemplate={handleLoadLotTemplate}
                onSaveTimelineTemplate={(p, n) => {
                  const items = db.timelineItems.filter(ti => ti.project_id === p).sort((a,b) => a.position - b.position);
                  db.timelineTemplates.push({ id: 'tt_' + Math.random().toString(36).substr(2, 9), workspace_id: currentUser.workspace_id, template_name: n, items: items.filter(i => i.item_type !== 'report').map(item => {
                      if (item.item_type === 'stage') {
                        const stage = db.stages.find(s => s.id === item.stage_id);
                        return { name: stage?.stage_name || 'Étape', item_type: 'stage' };
                      } else {
                        const task = db.tasks.find(t => t.id === item.task_id);
                        return { name: task?.task_name || 'Tâche', item_type: 'task', task_type: task?.task_type, system_action_key: task?.system_action_key };
                      }
                    }), created_at: new Date().toISOString() });
                  db.save(); syncState();
                }}
                onLoadTimelineTemplate={(p, tid) => {
                  const template = db.timelineTemplates.find(tt => tt.id === tid);
                  if (!template) return;
                  db.timelineItems = db.timelineItems.filter(ti => ti.project_id === p && ti.item_type === 'report' ? true : ti.project_id !== p);
                  db.stages = db.stages.filter(s => s.project_id !== p);
                  db.tasks = db.tasks.filter(t => t.project_id !== p);
                  let currentPos = 100;
                  template.items.forEach(item => {
                    const now = new Date().toISOString();
                    if (item.item_type === 'stage') {
                      const stageId = 's_' + Math.random().toString(36).substr(2, 9);
                      db.stages.push({ id: stageId, workspace_id: currentUser.workspace_id, project_id: p, stage_name: item.name, status: 'pas commencé', created_at: now, updated_at: now });
                      db.timelineItems.push({ id: 'ti_' + Math.random().toString(36).substr(2, 9), workspace_id: currentUser.workspace_id, project_id: p, item_type: 'stage', stage_id: stageId, position: currentPos, created_at: now, updated_at: now });
                    } else {
                      const taskId = 't_' + Math.random().toString(36).substr(2, 9);
                      db.tasks.push({ id: taskId, workspace_id: currentUser.workspace_id, project_id: p, task_name: item.name, task_type: item.task_type || 'free', system_action_key: item.system_action_key, status: 'pas commencé', due_date: '', created_at: now });
                      db.timelineItems.push({ id: 'ti_' + Math.random().toString(36).substr(2, 9), workspace_id: currentUser.workspace_id, project_id: p, item_type: 'task', task_id: taskId, position: currentPos, created_at: now, updated_at: now });
                    }
                    currentPos += 100;
                  });
                  db.save(); syncState();
                }}
              />
            } 
          />
          <Route path="/templates" element={<Templates templates={templates} currentUser={currentUser} onAddTemplate={t => { db.templates.push({id: 't_'+Math.random().toString(36).substr(2,9), ...t} as any); db.save(); syncState(); }} onUpdateTemplate={(id, u) => { db.templates=db.templates.map(t=>t.id===id?{...t,...u}:t); db.save(); syncState(); }} />} />
          <Route path="/settings" element={<Settings settings={settings} onUpdateSettings={s => { db.settings=s; db.save(); syncState(); }} />} />
          <Route path="/user-settings" element={<UserSettings preferences={userPreferences} timelineTemplates={timelineTemplates} documentTemplates={templates} stakeholderTemplates={stakeholderTemplates} tradeLotTemplates={tradeLotTemplates} onUpdatePreferences={p => { db.userPreferences=p; db.save(); syncState(); }} />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
