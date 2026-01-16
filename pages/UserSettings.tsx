
import React, { useState } from 'react';
import { Save, LayoutList, FileText, Users, HardHat, CheckCircle } from 'lucide-react';
import { UserPreferences, TimelineTemplate, DocumentTemplate, StakeholderTemplate, TradeLotTemplate } from '../types';

interface UserSettingsProps {
  preferences: UserPreferences;
  timelineTemplates: TimelineTemplate[];
  documentTemplates: DocumentTemplate[];
  stakeholderTemplates: StakeholderTemplate[];
  tradeLotTemplates: TradeLotTemplate[];
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ 
    preferences, timelineTemplates, documentTemplates, 
    stakeholderTemplates, tradeLotTemplates, onUpdatePreferences 
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>({ ...preferences });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdatePreferences(prefs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const toggleDoc = (id: string) => {
    const next = prefs.default_document_template_ids.includes(id)
        ? prefs.default_document_template_ids.filter(i => i !== id)
        : [...prefs.default_document_template_ids, id];
    setPrefs({ ...prefs, default_document_template_ids: next });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mes Paramètres</h1>
          <p className="text-slate-500 font-medium">Configurez vos modèles par défaut pour chaque nouveau projet.</p>
        </div>
        {isSaved && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in zoom-in">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Préférences enregistrées</span>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Modèle de fil conducteur */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <LayoutList className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase">Fil Conducteur</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">Timeline appliquée automatiquement à la création.</p>
            <select 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer"
                value={prefs.default_timeline_template_id || ''}
                onChange={(e) => setPrefs({ ...prefs, default_timeline_template_id: e.target.value })}
            >
                <option value="">Aucun (vierge)</option>
                {timelineTemplates.map(t => <option key={t.id} value={t.id}>{t.template_name}</option>)}
            </select>
        </div>

        {/* Modèle de Lots */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                    <HardHat className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase">Lots Chantier</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">Liste de corps d'état par défaut pour les rapports.</p>
            <select 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer"
                value={prefs.default_trade_lot_template_id || ''}
                onChange={(e) => setPrefs({ ...prefs, default_trade_lot_template_id: e.target.value })}
            >
                <option value="">Aucun</option>
                {tradeLotTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
        </div>

        {/* Modèle d'Intervenants */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase">Intervenants Type</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">Rôles pré-créés pour l'annuaire projet.</p>
            <select 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer"
                value={prefs.default_stakeholder_template_id || ''}
                onChange={(e) => setPrefs({ ...prefs, default_stakeholder_template_id: e.target.value })}
            >
                <option value="">Aucun</option>
                {stakeholderTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
        </div>

        {/* Documents à initialiser */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase">Documents Initiaux</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">Sélectionnez les modèles Word à lier par défaut.</p>
            <div className="grid grid-cols-1 gap-2">
                {documentTemplates.map(t => (
                    <label key={t.id} className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-slate-50">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 mr-3"
                            checked={prefs.default_document_template_ids.includes(t.id)}
                            onChange={() => toggleDoc(t.id)}
                        />
                        <span className="text-xs font-bold text-slate-700">{t.template_name}</span>
                    </label>
                ))}
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-10">
        <button 
            onClick={handleSave}
            className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 flex items-center gap-3"
        >
            <Save className="w-5 h-5" />
            Enregistrer mes Préférences
        </button>
      </div>
    </div>
  );
};

export default UserSettings;
