
import React from 'react';
import { PageState, Language } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  currentView: PageState['currentView'];
  onNavigate: (view: PageState['currentView']) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  isSyncing: boolean;
  lastSync: Date;
  autoSyncEnabled: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, theme, onToggleTheme, language, onToggleLanguage, isSyncing, lastSync, autoSyncEnabled }) => {
  const t = translations[language];
  const navItems: { icon: string, label: string, view: PageState['currentView'] }[] = [
    { icon: 'grid_view', label: t.dashboard, view: 'dashboard' },
    { icon: 'receipt_long', label: t.orders, view: 'orders' },
    { icon: 'storefront', label: t.channels, view: 'stores' },
    { icon: 'monitoring', label: t.analytics, view: 'reports' },
    { icon: 'sync_alt', label: t.settings, view: 'settings' },
  ];

  const timeStr = lastSync.toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 h-screen shrink-0">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-primary size-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined filled">cloud_sync</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SheetSync</h1>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.view 
                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className={`material-symbols-outlined transition-transform duration-200 ${currentView === item.view ? 'filled' : 'group-hover:scale-110'}`}>
              {item.icon}
            </span>
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2 mt-auto">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${autoSyncEnabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                {isSyncing ? (language === 'vi' ? 'Đang tải...' : 'Syncing...') : autoSyncEnabled ? 'Live' : 'Manual'}
              </span>
           </div>
           <span className="text-[10px] font-bold text-slate-400">{timeStr}</span>
        </div>
        
        <button 
          onClick={onToggleLanguage}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined">language</span>
          <span className="font-semibold text-sm">{language === 'vi' ? 'English' : 'Tiếng Việt'}</span>
        </button>

        <button 
          onClick={onToggleTheme}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
          <span className="font-semibold text-sm">{theme === 'light' ? t.themeDark : t.themeLight}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
