
import React, { useState, useEffect } from 'react';
import { PageState, Order, MappingConfig, ConnectionMethod, Language } from './types';
import { MOCK_ORDERS } from './constants';
import Dashboard from './components/Dashboard';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import StorePerformance from './components/StorePerformance';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import { fetchSheetData } from './sheetService';
import { translations } from './translations';

const DEFAULT_MAPPING: MappingConfig = {
  createdAt: 'A',
  store: 'B',
  id: 'C',
  productName: 'D',
  customerName: 'E',
  customerAddress: 'E', 
  cost: 'H',
  price: 'I',
  status: 'K', 
  tracking: 'M',
  profit: 'P'
};

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_d-djgJFYAbcjGDq7vuXBroth2uL4-SwdcpzgLjnkrbgfabS4yDtKtmeMm4niWhTr/exec';
const DEFAULT_SHEET_NAME = 'Trang tính1';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<PageState>({ currentView: 'dashboard' });
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'vi');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  
  const [currency, setCurrency] = useState(() => localStorage.getItem('appCurrency') || '$');
  const [secondaryCurrency, setSecondaryCurrency] = useState(() => localStorage.getItem('secondaryCurrency') || '₫');
  const [exchangeRate, setExchangeRate] = useState(() => Number(localStorage.getItem('exchangeRate')) || 25000);
  const [showConversion, setShowConversion] = useState(() => localStorage.getItem('showConversion') === 'true');

  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('sheetUrl') || DEFAULT_SCRIPT_URL);
  const [sheetName, setSheetName] = useState(() => {
    const saved = localStorage.getItem('sheetName');
    return saved !== null ? saved : DEFAULT_SHEET_NAME;
  });
  const [connectionMethod, setConnectionMethod] = useState<ConnectionMethod>(() => (localStorage.getItem('connectionMethod') as ConnectionMethod) || 'bot');

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => localStorage.getItem('autoSyncEnabled') !== 'false');
  const [autoSyncInterval, setAutoSyncInterval] = useState(() => Number(localStorage.getItem('autoSyncInterval')) || 60);

  const [mapping, setMapping] = useState<MappingConfig>(() => {
    const saved = localStorage.getItem('mappingConfig');
    return saved ? JSON.parse(saved) : DEFAULT_MAPPING;
  });

  const t = translations[language];

  const syncData = async (fUrl?: string, fMapping?: MappingConfig, fName?: string, fMethod?: ConnectionMethod) => {
    const urlToUse = fUrl ?? sheetUrl;
    if (!urlToUse) return;

    setIsSyncing(true);
    setSyncError(null);
    try {
      const freshData = await fetchSheetData(
        urlToUse, 
        fMapping ?? mapping, 
        undefined, 
        fName ?? sheetName,
        fMethod ?? connectionMethod
      );
      if (freshData && freshData.length > 0) {
        setOrders(freshData);
        setLastSyncedAt(new Date());
      }
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || (language === 'vi' ? "Đồng bộ thất bại." : "Sync failed."));
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (autoSyncEnabled && sheetUrl) {
      interval = setInterval(() => {
        if (!isSyncing) syncData();
      }, autoSyncInterval * 1000);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoSyncEnabled) {
        syncData();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoSyncEnabled, autoSyncInterval, sheetUrl, sheetName, mapping]);

  useEffect(() => {
    if (sheetUrl) syncData();
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => setLanguage(prev => prev === 'vi' ? 'en' : 'vi');

  const navigate = (view: PageState['currentView'], orderId?: string) => {
    setViewState({ currentView: view, selectedOrderId: orderId });
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const saveSettings = (
    newUrl: string, 
    newSheetName: string, 
    newMapping: MappingConfig, 
    newCurrency: string, 
    newSecondary: string, 
    newRate: number, 
    newShow: boolean, 
    newMethod: ConnectionMethod,
    newAutoSync: boolean,
    newInterval: number
  ) => {
    setSheetUrl(newUrl);
    setSheetName(newSheetName);
    setMapping(newMapping);
    setCurrency(newCurrency);
    setSecondaryCurrency(newSecondary);
    setExchangeRate(newRate);
    setShowConversion(newShow);
    setConnectionMethod(newMethod);
    setAutoSyncEnabled(newAutoSync);
    setAutoSyncInterval(newInterval);
    
    localStorage.setItem('sheetUrl', newUrl);
    localStorage.setItem('sheetName', newSheetName);
    localStorage.setItem('mappingConfig', JSON.stringify(newMapping));
    localStorage.setItem('appCurrency', newCurrency);
    localStorage.setItem('secondaryCurrency', newSecondary);
    localStorage.setItem('exchangeRate', newRate.toString());
    localStorage.setItem('showConversion', newShow.toString());
    localStorage.setItem('connectionMethod', newMethod);
    localStorage.setItem('autoSyncEnabled', newAutoSync.toString());
    localStorage.setItem('autoSyncInterval', newInterval.toString());
    
    syncData(newUrl, newMapping, newSheetName, newMethod);
  };

  const selectedOrder = orders.find(o => o.id === viewState.selectedOrderId);

  const currencyContext = {
    primary: currency,
    secondary: secondaryCurrency,
    rate: exchangeRate,
    show: showConversion
  };

  const renderView = () => {
    switch (viewState.currentView) {
      case 'dashboard': return <Dashboard onNavigate={navigate} orders={orders} currencyContext={currencyContext} language={language} />;
      case 'orders': return <OrderList onNavigate={navigate} orders={orders} currency={currency} language={language} />;
      case 'detail': return selectedOrder ? <OrderDetail order={selectedOrder} currency={currency} onBack={() => navigate('orders')} language={language} /> : null;
      case 'stores': return <StorePerformance onNavigate={navigate} orders={orders} currencyContext={currencyContext} language={language} />;
      case 'reports': return <Reports orders={orders} currencyContext={currencyContext} language={language} />;
      case 'settings': return (
        <Settings 
          initialUrl={sheetUrl} 
          initialSheetName={sheetName}
          initialConnectionMethod={connectionMethod}
          initialMapping={mapping} 
          initialCurrency={currency} 
          initialSecondaryCurrency={secondaryCurrency}
          initialExchangeRate={exchangeRate}
          initialShowConversion={showConversion}
          initialAutoSync={autoSyncEnabled}
          initialAutoInterval={autoSyncInterval}
          onSave={saveSettings} 
          language={language}
        />
      );
      default: return <Dashboard onNavigate={navigate} orders={orders} currencyContext={currencyContext} language={language} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background-light dark:bg-background-dark">
      {syncError && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-[10px] font-bold py-1.5 px-4 text-center animate-in slide-in-from-top duration-300 shadow-lg">
          ⚠️ {language === 'vi' ? 'LỖI ĐỒNG BỘ' : 'SYNC ERROR'}: {syncError}
          <button onClick={() => syncData()} className="ml-2 underline hover:no-underline font-black">{language === 'vi' ? 'Thử lại' : 'Retry'}</button>
        </div>
      )}
      <Sidebar 
        currentView={viewState.currentView} 
        onNavigate={navigate} 
        theme={theme} 
        onToggleTheme={toggleTheme}
        language={language}
        onToggleLanguage={toggleLanguage}
        isSyncing={isSyncing}
        lastSync={lastSyncedAt}
        autoSyncEnabled={autoSyncEnabled}
      />
      {isSidebarOpen && <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-[60] w-64 bg-white dark:bg-slate-900 transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-primary size-8 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-sm">cloud_sync</span>
              </div>
              <h2 className="text-primary text-xl font-bold">SheetSync</h2>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="flex-1 space-y-2">
             <NavButton icon="dashboard" label={t.dashboard} active={viewState.currentView === 'dashboard'} onClick={() => navigate('dashboard')} />
             <NavButton icon="receipt_long" label={t.orders} active={viewState.currentView === 'orders'} onClick={() => navigate('orders')} />
             <NavButton icon="bar_chart" label={t.channels} active={viewState.currentView === 'stores'} onClick={() => navigate('stores')} />
             <NavButton icon="analytics" label={t.analytics} active={viewState.currentView === 'reports'} onClick={() => navigate('reports')} />
             <NavButton icon="settings" label={t.settings} active={viewState.currentView === 'settings'} onClick={() => navigate('settings')} />
          </div>
          <div className="mt-auto space-y-2">
            <button onClick={toggleLanguage} className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">language</span>
              <span className="font-semibold text-sm">{language === 'vi' ? 'English' : 'Tiếng Việt'}</span>
            </button>
            <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
              <span className="font-semibold text-sm">{theme === 'light' ? t.themeDark : t.themeLight}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-500"><span className="material-symbols-outlined">menu</span></button>
            <h1 className="font-bold text-lg capitalize">{t[viewState.currentView as keyof typeof t] || viewState.currentView}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isSyncing && <span className="text-[8px] font-black text-primary uppercase animate-pulse">{t.syncing}</span>}
            <button onClick={() => syncData()} disabled={isSyncing} className={`p-2 bg-primary/10 rounded-full text-primary transition-transform ${isSyncing ? 'animate-spin' : 'active:rotate-180'}`}><span className="material-symbols-outlined">sync</span></button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">{renderView()}</main>
        <MobileNav currentView={viewState.currentView} onNavigate={navigate} language={language} />
      </div>
    </div>
  );
};

const NavButton: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><span className={`material-symbols-outlined ${active ? 'filled' : ''}`}>{icon}</span><span className="font-semibold">{label}</span></button>
);

export default App;
