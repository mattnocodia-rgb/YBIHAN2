
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Bell, 
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  pendingRemindersCount: number;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout, pendingRemindersCount }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();

  const isSuperAdmin = currentUser.role === 'super_admin';

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    { name: 'Projets', href: '/projects', icon: FolderKanban },
    { name: 'Modèles de documents', href: '/templates', icon: FileText },
    { name: 'Paramètres', href: '/user-settings', icon: SettingsIcon },
  ];

  if (isSuperAdmin) {
    navigation.push({ name: 'Paramètres (admin)', href: '/settings', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 z-50 flex flex-col w-64 bg-slate-900 transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center h-16 px-6 bg-slate-950">
          <span className="text-xl font-bold text-white tracking-tight">Maitrisea <span className="text-blue-500">Digitale</span></span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = item.href === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 bg-slate-800/50 m-4 rounded-xl border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="mt-4 flex items-center w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <button 
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="relative">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                <Bell className="w-5 h-5" />
                {pendingRemindersCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold animate-pulse">
                    {pendingRemindersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
