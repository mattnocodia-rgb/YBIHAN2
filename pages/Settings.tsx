
import React, { useState } from 'react';
import { Save, Webhook, ShieldCheck, HelpCircle } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const [webhookUrl, setWebhookUrl] = useState(settings.make_webhook_url);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdateSettings({ make_webhook_url: webhookUrl });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres de l'Application</h1>
        <p className="text-slate-500 font-medium">Configurez les intégrations et les automatisations globales.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Webhook className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Intégration Make.com</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Webhook de génération documentaire</p>
                </div>
            </div>
            {isSaved && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in zoom-in">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Configuration enregistrée</span>
                </div>
            )}
        </div>

        <div className="p-10 space-y-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        URL du Webhook *
                        <div className="group relative">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[9px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium leading-relaxed shadow-2xl z-50">
                                Cette URL reçoit les données du projet et les variables pour générer vos documents Word via un scénario Make.
                            </div>
                        </div>
                    </label>
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="https://hook.eu2.make.com/..." 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-700 shadow-sm"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Vérifiez que le webhook est configuré pour accepter les requêtes <strong>POST JSON</strong>.</p>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-3">Payload de test</h3>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-[9px] text-blue-300 leading-relaxed overflow-x-auto">
                    {`{
  "project_id": "p_123",
  "project_name": "Villa Annecy",
  "client_name": "M. Martin",
  "template_id": "t_456",
  "template_name": "Contrat Architecte",
  "variables": { "client_nom": "Jean Martin", ... }
}`}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={handleSave}
                    disabled={!webhookUrl}
                    className="inline-flex items-center px-10 py-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all font-black uppercase text-[12px] tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
                >
                    <Save className="w-5 h-5 mr-3" />
                    Enregistrer la Configuration
                </button>
            </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-[2rem] border border-amber-200 p-8 flex items-start gap-5">
        <div className="p-3 bg-amber-100 rounded-xl text-amber-600 shrink-0">
            <HelpCircle className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-lg font-black text-amber-900 tracking-tight">Note sur la sécurité</h3>
            <p className="text-sm text-amber-800/80 leading-relaxed mt-1">
                Le webhook est stocké localement dans votre navigateur. Si vous changez de poste ou videz votre cache, vous devrez le configurer à nouveau. 
                Une synchronisation cloud sera disponible dans la version V2.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
