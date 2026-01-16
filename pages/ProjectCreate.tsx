
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  CloudIcon, 
  ChevronRight,
  Info,
  Image as ImageIcon,
  FileText,
  Upload,
  X
} from 'lucide-react';
import { Project, User, DocumentTemplate, UserPreferences } from '../types';
import { db } from '../store';
import { extractDriveId } from '../utils/drive';

interface ProjectCreateProps {
  users: User[];
  currentUser: User;
  userPreferences: UserPreferences;
  onProjectCreated: (newProject: Project) => void;
}

const ProjectCreate: React.FC<ProjectCreateProps> = ({ users, currentUser, userPreferences, onProjectCreated }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableTemplates, setAvailableTemplates] = useState<DocumentTemplate[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    project_name: '',
    client_name: '',
    client_email: '',
    project_address: '',
    image_url: '',
    assigned_users: [currentUser.id],
    initialTemplateIds: userPreferences.default_document_template_ids || []
  });
  
  const [isCreated, setIsCreated] = useState(false);
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [driveUrl, setDriveUrl] = useState('');
  const [driveWarning, setDriveWarning] = useState('');

  useEffect(() => {
    setAvailableTemplates(db.templates.filter(t => t.is_active));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject = db.createProject(formData, currentUser.id);
    setCreatedProject(newProject);
    onProjectCreated(newProject);
    setIsCreated(true);
  };

  const handleLinkDrive = () => {
    if (!createdProject) return;
    
    const extraction = extractDriveId(driveUrl);
    if (!extraction || extraction.error) {
      alert(extraction?.error || "Lien Google Drive invalide");
      return;
    }

    if (extraction.is_file) {
      setDriveWarning("Attention : vous avez collé un lien de fichier, pas de dossier.");
    }

    createdProject.drive_folder_id = extraction.id;
    createdProject.drive_folder_url = extraction.url;
    db.save();
    
    alert("Dossier Google Drive lié avec succès !");
    navigate(`/projects/${createdProject.id}`);
  };

  const toggleTemplate = (id: string) => {
    setFormData(prev => ({
      ...prev,
      initialTemplateIds: prev.initialTemplateIds.includes(id)
        ? prev.initialTemplateIds.filter(tId => tId !== id)
        : [...prev.initialTemplateIds, id]
    }));
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, image_url: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isCreated && createdProject) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center shadow-lg shadow-emerald-500/5">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Projet Initialisé !</h1>
          <p className="text-slate-600 mt-2 text-lg">
            Le fil conducteur de <span className="font-bold text-slate-900">{createdProject.project_name}</span> est prêt.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <CloudIcon className="w-6 h-6 mr-2 text-blue-600" />
            Lier le dossier Drive
          </h2>
          <p className="text-slate-500 mb-6 text-sm">
            Obligatoire pour utiliser les automatisations documentaires Make.
          </p>

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Coller l'URL du dossier Drive..." 
              className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-medium"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
            />

            {driveWarning && (
              <div className="flex items-start p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs">
                <Info className="w-4 h-4 mr-2 shrink-0" />
                {driveWarning}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button 
                onClick={handleLinkDrive}
                disabled={!driveUrl}
                className="flex-1 bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-xl shadow-blue-500/20"
              >
                Lier et Continuer
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
              <button 
                onClick={() => navigate(`/projects/${createdProject.id}`)}
                className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 px-6 rounded-2xl hover:bg-slate-200 transition-all"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-400 hover:text-slate-900 mb-8 transition-colors text-xs font-black uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-10 py-10 text-white">
          <h1 className="text-3xl font-bold">Nouveau Dossier Projet</h1>
          <p className="text-slate-400 mt-2">Configurez les bases de votre collaboration et de vos documents.</p>
        </div>

        <form onSubmit={handleSave} className="p-10 space-y-12">
          <section className="space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Informations Générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Nom du projet *</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ex: Villa Bioclimatique Annecy"
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-medium"
                  value={formData.project_name}
                  onChange={e => setFormData({...formData, project_name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Client *</label>
                <input 
                  required
                  type="text" 
                  placeholder="M. et Mme. Martin"
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-medium"
                  value={formData.client_name}
                  onChange={e => setFormData({...formData, client_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Photo de couverture</label>
                <div 
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative h-32 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  />
                  
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={removeImage}
                          className="bg-white/90 text-red-600 p-2 rounded-full hover:bg-white shadow-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-slate-300'}`} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isDragging ? 'Relâchez pour charger' : 'Glisser ou cliquer pour charger une photo'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Adresse du projet *</label>
                <input 
                  required
                  type="text" 
                  placeholder="123 rue de la Paix, 75000 Paris"
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-medium"
                  value={formData.project_address}
                  onChange={e => setFormData({...formData, project_address: e.target.value})}
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Modèles de documents initiaux</h2>
                <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">Initialise la fiche projet</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTemplates.map(t => {
                const isSelected = formData.initialTemplateIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTemplate(t.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                        isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-50/50' 
                            : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>W</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{t.template_name}</p>
                      <p className={`text-[9px] font-black uppercase tracking-tighter ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{t.template_type}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Équipe Projet</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {users.map(u => (
                <label key={u.id} className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${formData.assigned_users.includes(u.id) ? 'bg-slate-50 border-blue-500 ring-2 ring-blue-50' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded mr-4 focus:ring-blue-500"
                    checked={formData.assigned_users.includes(u.id)}
                    onChange={(e) => {
                      const newUsers = e.target.checked 
                        ? [...formData.assigned_users, u.id]
                        : formData.assigned_users.filter(id => id !== u.id);
                      setFormData({...formData, assigned_users: newUsers});
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{u.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{u.role}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="flex justify-end pt-10 border-t border-slate-100">
            <button 
              type="submit"
              className="inline-flex items-center px-10 py-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all font-bold shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Save className="w-5 h-5 mr-3" />
              Initialiser le Projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreate;
