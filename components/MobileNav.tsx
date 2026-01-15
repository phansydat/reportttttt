
import React from 'react';
import { PageState, Language } from '../types';
import { translations } from '../translations';

interface MobileNavProps {
  currentView: PageState['currentView'];
  onNavigate: (view: PageState['currentView']) => void;
  language: Language;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate, language }) => {
  const t = translations[language];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t dark:border-slate-800 px-6 py-2 flex justify-between items-center z-40">
      <NavItem 
        icon="grid_view" 
        label={t.dashboard.substring(0, 5)} 
        active={currentView === 'dashboard'} 
        onClick={() => onNavigate('dashboard')} 
      />
      <NavItem 
        icon="receipt_long" 
        label={t.orders} 
        active={currentView === 'orders'} 
        // Fixed: Use the 'onNavigate' prop provided to the component
        onClick={() => onNavigate('orders')} 
      />
      <div className="-mt-12 flex flex-col items-center">
         <button 
           onClick={() => onNavigate('settings')}
           className="size-14 bg-primary text-white rounded-full shadow-xl shadow-primary/40 flex items-center justify-center ring-4 ring-white dark:ring-slate-900"
         >
           <span className="material-symbols-outlined">sync</span>
         </button>
      </div>
      <NavItem 
        icon="bar_chart" 
        label={language === 'vi' ? 'Kênh' : 'Channels'} 
        active={currentView === 'stores'} 
        onClick={() => onNavigate('stores')} 
      />
      <NavItem 
        icon="analytics" 
        label={t.analytics.substring(0, 6)} 
        active={currentView === 'reports'} 
        onClick={() => onNavigate('reports')} 
      />
    </nav>
  );
};

const NavItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 ${active ? 'text-primary' : 'text-slate-400'}`}
  >
    <span className={`material-symbols-outlined text-2xl ${active ? 'filled' : ''}`}>{icon}</span>
    <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

export default MobileNav;
