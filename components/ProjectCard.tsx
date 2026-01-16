
import React from 'react';
import { 
  Building2, 
  MapPin, 
  CloudCheck, 
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  UserCircle,
  ChevronRight
} from 'lucide-react';
import { Project, User } from '../types';

interface ProjectCardProps {
  project: Project;
  assignedUsers: User[];
  hasPendingReminders: boolean;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, assignedUsers, hasPendingReminders, onClick }) => {
  const isProspect = project.category === 'Prospect';

  return (
    <button 
      onClick={onClick}
      className="text-left w-full group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400 transition-all duration-500 flex flex-col h-full relative outline-none focus:ring-4 focus:ring-blue-500/10"
    >
      {hasPendingReminders && (
        <div className="absolute top-6 right-6 bg-red-500 text-white p-2.5 rounded-2xl shadow-xl animate-bounce z-20 border-4 border-white">
          <AlertCircle className="w-4 h-4" />
        </div>
      )}

      <div className="h-44 w-full bg-slate-100 relative overflow-hidden shrink-0">
        {project.image_url ? (
          <img 
            src={project.image_url} 
            alt={project.project_name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
        
        {/* Type Badge */}
        <div className="absolute top-5 left-5">
            <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border backdrop-blur-md flex items-center gap-2 ${isProspect ? 'bg-amber-500 border-amber-400 text-white' : 'bg-blue-600 border-blue-400 text-white'}`}>
              {isProspect ? <UserCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {isProspect ? 'Prospect' : 'Client'}
            </div>
        </div>

        {/* Technical Phase Badge */}
        <div className="absolute bottom-5 left-5">
          <div className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/30 bg-white/20 text-white backdrop-blur-md">
            {project.status_global || 'Initialisation'}
          </div>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1 space-y-4">
        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 tracking-tight">{project.project_name}</h3>
        
        <div className="space-y-3 flex-1">
          <div className="flex items-center text-slate-500 text-xs font-bold">
            <Building2 className="w-4 h-4 mr-3 shrink-0 text-blue-500" />
            <span className="truncate">{project.client_name}</span>
          </div>
          <div className="flex items-center text-slate-400 text-[11px] font-medium">
            <MapPin className="w-4 h-4 mr-3 shrink-0 text-slate-300" />
            <span className="truncate">{project.project_address}</span>
          </div>
        </div>

        <div className="mt-4 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex -space-x-2.5">
            {assignedUsers.map((user) => (
              <div 
                key={user.id} 
                className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-md"
                title={user.name}
              >
                {user.name.charAt(0)}
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            {project.drive_folder_id && (
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <CloudCheck className="w-4 h-4" />
                </div>
            )}
            <div className="p-2 bg-slate-50 text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-xl transition-all border border-transparent group-hover:border-blue-100">
                <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ProjectCard;
