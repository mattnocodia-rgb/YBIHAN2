
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Tag,
  Pencil,
  X,
  Save,
  FileCheck,
  ChevronRight,
  Upload,
  FileCode,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { DocumentTemplate, TemplateType, User } from '../types';
import { TEMPLATE_TYPES } from '../constants';

// On déclare mammoth qui vient de la balise script dans index.html
declare var mammoth: any;

interface TemplatesProps {
  templates: DocumentTemplate[];
  currentUser: User;
  onAddTemplate: (temp: Partial<DocumentTemplate>) => void;
  onUpdateTemplate: (id: string, updates: Partial<DocumentTemplate>) => void;
}

const Templates: React.FC<TemplatesProps> = ({ templates, currentUser, onAddTemplate, onUpdateTemplate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFreelance = currentUser.role === 'freelance';

  const [editFormData, setEditFormData] = useState({
    template_name: '',
    template_type: 'CONTRACT' as TemplateType,
  });

  const extractVariablesFromFile = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          const text = result.value;
          const regex = /{{(.*?)}}/g;
          const matches = (text.match(regex) || []) as string[];
          const variables: string[] = Array.from(new Set(
            matches.map((m: string) => m.replace(/{{|}}/g, '').trim())
          )).filter((v: string) => v.length > 0);
          resolve(variables);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleOpenEdit = (template: DocumentTemplate) => {
    if (isFreelance) return;
    setSelectedTemplate(template);
    setEditFormData({
      template_name: template.template_name,
      template_type: template.template_type,
    });
    setSelectedFile(null);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (selectedTemplate) {
      onUpdateTemplate(selectedTemplate.id, editFormData);
      setIsEditing(false);
      setSelectedTemplate(null);
    }
  };

  const handleAdd = async () => {
    if (isFreelance) return;
    
    // Pour une nouvelle création, on simule l'ID pour l'analyse immédiate
    const tempId = 't_' + Math.random().toString(36).substr(2, 9);
    
    onAddTemplate({
      ...editFormData,
      id: tempId,
      analysis_status: selectedFile ? 'processing' : 'pending'
    } as any);
    
    if (selectedFile) {
      triggerRealAnalysis(tempId, selectedFile);
    }

    setIsAdding(false);
    setEditFormData({ template_name: '', template_type: 'CONTRACT' });
    setSelectedFile(null);
  };

  const triggerRealAnalysis = async (id: string, file: File) => {
    onUpdateTemplate(id, { analysis_status: 'processing' });
    try {
      const variables = await extractVariablesFromFile(file);
      // Petite attente pour l'effet visuel
      await new Promise(r => setTimeout(r, 1000));
      onUpdateTemplate(id, { 
        analysis_status: 'ok', 
        variables: variables
      });
    } catch (error) {
      onUpdateTemplate(id, { analysis_status: 'error' });
    }
  };

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    if (!editFormData.template_name) {
      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setEditFormData(prev => ({ ...prev, template_name: nameWithoutExt }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bibliothèque de Modèles</h1>
          <p className="text-slate-500 font-medium">Détection réelle des balises <span className="text-blue-600 font-bold">{"{{...}}"}</span> dans vos .docx</p>
        </div>
        {!isFreelance && (
          <button 
            onClick={() => {
              setEditFormData({ template_name: '', template_type: 'CONTRACT' });
              setSelectedFile(null);
              setIsAdding(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 font-black uppercase text-[11px] tracking-widest active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Modèle
          </button>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Rechercher un modèle..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map(t => (
          <div 
            key={t.id} 
            onClick={() => handleOpenEdit(t)}
            className={`bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group cursor-pointer relative flex flex-col h-full ${isFreelance ? 'pointer-events-none opacity-80' : ''}`}
          >
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">W</div>
                <div className={`px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest border ${
                  t.analysis_status === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  t.analysis_status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 
                  'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {t.analysis_status === 'ok' ? 'VALIDE' : t.analysis_status === 'processing' ? 'ANALYSE...' : 'ATTENTE'}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{t.template_name}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{TEMPLATE_TYPES.find(type => type.value === t.template_type)?.label || t.template_type}</p>

              {t.variables.length > 0 ? (
                <div className="mt-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-2" />
                    Variables détectées ({t.variables.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t.variables.slice(0, 4).map(v => (
                      <span key={v} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-mono border border-slate-100 font-bold">
                        {v}
                      </span>
                    ))}
                    {t.variables.length > 4 && <span className="text-[10px] text-slate-400 font-bold self-center">+{t.variables.length - 4}</span>}
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    {t.analysis_status === 'processing' ? 'Lecture du fichier...' : 'Aucune variable'}
                  </p>
                </div>
              )}
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                <Pencil className="w-3.5 h-3.5" />
                Modifier le modèle
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal Ajout / Edition */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl border border-white relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-3xl font-black text-slate-900">{isEditing ? 'Éditer le Modèle' : 'Nouveau Modèle'}</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">Configurez les paramètres de votre document .docx</p>
                </div>
                <button onClick={() => { setIsAdding(false); setIsEditing(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 pb-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nom du template</label>
                <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                      placeholder="Ex: Contrat de Maîtrise d'Oeuvre"
                      value={editFormData.template_name}
                      onChange={e => setEditFormData({...editFormData, template_name: e.target.value})}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Type de document</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                  value={editFormData.template_type}
                  onChange={e => setEditFormData({...editFormData, template_type: e.target.value as TemplateType})}
                >
                  {TEMPLATE_TYPES.map(tt => (
                    <option key={tt.value} value={tt.value}>{tt.label}</option>
                  ))}
                </select>
              </div>

              {isEditing && selectedTemplate && (
                <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                        <div>
                            <p className="text-xs font-black text-blue-900">Analyse locale</p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Lecture réelle des balises</p>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="file" 
                            className="hidden" 
                            id="analysis-file" 
                            accept=".docx"
                            onChange={(e) => e.target.files && triggerRealAnalysis(selectedTemplate.id, e.target.files[0])}
                          />
                          <button 
                              onClick={() => document.getElementById('analysis-file')?.click()}
                              disabled={selectedTemplate.analysis_status === 'processing'}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
                          >
                              <RefreshCw className={`w-3.5 h-3.5 ${selectedTemplate.analysis_status === 'processing' ? 'animate-spin' : ''}`} />
                              Analyser
                          </button>
                        </div>
                    </div>

                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                        <FileCheck className="w-10 h-10 text-slate-300 group-hover:scale-110 transition-transform" />
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Mettre à jour le fichier .docx</p>
                    </div>
                </div>
              )}

              {!isEditing && (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-10 border-2 border-dashed rounded-[2rem] text-center transition-all group cursor-pointer ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept=".docx"
                      onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                    />
                    
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <FileCode className="w-12 h-12 text-blue-600 mb-3" />
                        <p className="text-xs font-black text-slate-700 truncate max-w-xs">{selectedFile.name}</p>
                        <p className="text-[9px] text-emerald-600 font-black mt-2 tracking-widest uppercase flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Prêt pour lecture</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Déposer votre Word ici</p>
                        <p className="text-[10px] text-slate-400 mt-2">Les balises {"{{...}}"} seront extraites</p>
                      </>
                    )}
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-auto pt-6 border-t border-slate-100">
              <button 
                onClick={isEditing ? handleSaveEdit : handleAdd}
                disabled={!editFormData.template_name || (!isEditing && !selectedFile)}
                className="flex-1 py-5 bg-slate-900 text-white font-black uppercase text-[12px] tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isEditing ? 'Enregistrer' : 'Créer et Analyser'}
              </button>
              <button 
                onClick={() => { setIsAdding(false); setIsEditing(false); }} 
                className="px-8 py-5 bg-slate-100 text-slate-500 font-black uppercase text-[12px] tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
