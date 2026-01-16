
import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, AlertCircle, FileWarning, FolderKanban, X, Save, ChevronRight, Building2, MapPin, CloudIcon, Image as ImageIcon, CheckCircle2, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Project, User, Task, ProjectCategory } from '../types';
import ProjectCard from '../components/ProjectCard';

interface DashboardProps {
  projects: Project[];
  users: User[];
  tasks: Task[];
  currentUser: User;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, users, tasks, currentUser, onUpdateProject }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [onlyDelayedReminders, setOnlyDelayedReminders] = useState(false);
  const [onlyMissingDrive, setOnlyMissingDrive] = useState(false);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (p.workspace_id !== currentUser.workspace_id) return false;

      if (currentUser.role === 'user' && !p.assigned_users.includes(currentUser.id)) {
        return false;
      }

      const matchesSearch = p.project_name.toLowerCase().includes(search.toLowerCase()) || 
                           p.client_name.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      const projectTasks = tasks.filter(t => t.project_id === p.id);
      
      const hasManualDelayedReminders = projectTasks.some(t => 
        t.due_date && 
        new Date(t.due_date) < new Date() && 
        t.status !== 'terminé' && 
        !t.is_auto_relance
      );

      const matchesDelayed = !onlyDelayedReminders || hasManualDelayedReminders;
      const matchesDrive = !onlyMissingDrive || !p.drive_folder_id;

      return matchesSearch && matchesCategory && matchesDelayed && matchesDrive;
    });
  }, [projects, search, categoryFilter, onlyDelayedReminders, onlyMissingDrive, tasks, currentUser]);

  const delayedCount = projects.filter(p => 
    tasks.filter(t => t.project_id === p.id).some(t => 
        t.due_date && 
        new Date(t.due_date) < new Date() && 
        t.status !== 'terminé' && 
        !t.is_auto_relance
    )
  ).length;

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setOnlyDelayedReminders(false);
    setOnlyMissingDrive(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Espace Projets</h1>
          <p className="text-slate-500 font-medium">Gestion opérationnelle et automatisation</p>
        </div>
        <Link 
          to="/projects/new" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 font-black uppercase text-[11px] tracking-widest"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Dossier
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={resetFilters}
          className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-blue-400 transition-all text-left group"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Projets</p>
            <p className="text-2xl font-black text-slate-900">{projects.length}</p>
          </div>
        </button>

        <button 
          onClick={() => setOnlyDelayedReminders(!onlyDelayedReminders)}
          className={`p-6 rounded-[2rem] border transition-all flex items-center space-x-4 text-left group ${onlyDelayedReminders ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-500/20' : 'bg-white border-slate-200 shadow-sm hover:border-red-300'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${onlyDelayedReminders ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white'}`}>
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${onlyDelayedReminders ? 'text-red-100' : 'text-slate-400'}`}>Urgences manuelles</p>
            <p className="text-2xl font-black">{delayedCount}</p>
          </div>
        </button>

        <button 
          onClick={() => setOnlyMissingDrive(!onlyMissingDrive)}
          className={`p-6 rounded-[2rem] border transition-all flex items-center space-x-4 text-left group ${onlyMissingDrive ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-white border-slate-200 shadow-sm hover:border-amber-300'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${onlyMissingDrive ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'}`}>
            <FileWarning className="w-7 h-7" />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${onlyMissingDrive ? 'text-amber-100' : 'text-slate-400'}`}>Sans Drive</p>
            <p className="text-2xl font-black">{projects.filter(p => !p.drive_folder_id).length}</p>
          </div>
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Rechercher un projet, un client..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-slate-400 w-5 h-5 shrink-0" />
          <select 
            className="flex-1 md:w-48 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-black uppercase text-[10px] tracking-widest cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Toutes catégories</option>
            <option value="Prospect">Prospects</option>
            <option value="Client">Clients</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProjects.map((project) => {
          const projectTasks = tasks.filter(t => t.project_id === project.id);
          const hasDelayed = projectTasks.some(t => 
            t.due_date && 
            new Date(t.due_date) < new Date() && 
            t.status !== 'terminé' && 
            !t.is_auto_relance
          );

          return (
            <ProjectCard 
              key={project.id} 
              project={project} 
              assignedUsers={users.filter(u => project.assigned_users.includes(u.id))}
              hasPendingReminders={hasDelayed}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FolderKanban className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Aucun projet trouvé</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Essayez de modifier vos filtres ou de créer un nouveau dossier.</p>
            <button 
              onClick={resetFilters}
              className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
