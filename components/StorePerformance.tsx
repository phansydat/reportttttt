
import React, { useMemo } from 'react';
import { Store, Order, PageState } from '../types';

interface StorePerformanceProps {
  onNavigate: (view: PageState['currentView'], orderId?: string) => void;
  orders: Order[];
  currencyContext: { primary: string, secondary: string, rate: number, show: boolean };
}

const StorePerformance: React.FC<StorePerformanceProps> = ({ onNavigate, orders, currencyContext }) => {
  const storesData = useMemo(() => {
    const storeMap: Record<string, Store> = {};
    
    orders.forEach(order => {
      const storeName = order.store || 'Unknown Store';
      if (!storeMap[storeName]) {
        storeMap[storeName] = {
          id: `store-${storeName.toLowerCase().replace(/\s+/g, '-')}`,
          name: storeName,
          logo: `https://api.dicebear.com/7.x/initials/svg?seed=${storeName}`,
          bannerImage: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80`,
          totalProfit: 0,
          orders: 0,
          capital: 0,
          lastSynced: 'Just now',
        };
      }
      
      const s = storeMap[storeName];
      s.totalProfit += (order.profit || 0);
      s.orders += 1;
      s.capital += (order.cost || 0);
    });

    const list = Object.values(storeMap);
    
    if (list.length > 0) {
      const maxProfit = Math.max(...list.map(s => s.totalProfit));
      list.forEach(s => {
        if (s.totalProfit === maxProfit && maxProfit > 0) s.isMostProfitable = true;
      });
    }

    return list.sort((a, b) => b.totalProfit - a.totalProfit);
  }, [orders]);

  const aggregateStats = useMemo(() => {
    const totalProfit = orders.reduce((acc, o) => acc + (o.profit || 0), 0);
    const totalVolume = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.price || 0), 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return { totalProfit, totalVolume, avgMargin };
  }, [orders]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sales Channels</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Performance breakdown with conversion support.</p>
        </div>
        <button className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-lg">add</span>
          Add New Channel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatSummary 
          title="Total Net Profit" 
          value={aggregateStats.totalProfit} 
          trend="Synced" 
          color="primary" 
          currencyContext={currencyContext}
        />
        <StatSummary 
          title="Total Orders" 
          value={aggregateStats.totalVolume} 
          trend="Real-time" 
          color="sheet-green" 
          currencyContext={{ ...currencyContext, show: false }} 
        />
        <StatSummary 
          title="Avg. Profit Margin" 
          value={aggregateStats.avgMargin} 
          trend="Calculated" 
          color="amber-500" 
          suffix="%"
          currencyContext={{ ...currencyContext, show: false }}
        />
      </div>

      <div className="space-y-6">
        {storesData.map(store => (
          <div key={store.id} className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-300">
             <div className="relative h-32 md:h-40 overflow-hidden">
                <img src={store.bannerImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 dark:opacity-40" alt={store.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                {store.isMostProfitable && (
                  <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                    Top Performer
                  </div>
                )}
                <div className="absolute bottom-4 left-6 flex items-center gap-4">
                   <div className="size-14 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg bg-white p-1">
                      <img src={store.logo} className="w-full h-full object-contain" alt="" />
                   </div>
                   <div className="text-white">
                      <h3 className="text-xl font-bold drop-shadow-md">{store.name}</h3>
                      <p className="text-xs text-white/70">Last Sync: {store.lastSynced}</p>
                   </div>
                </div>
             </div>
             
             <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-4 border-b dark:border-slate-800">
                   <StoreMetric label="Net Profit (P)" value={store.totalProfit} currencyContext={currencyContext} />
                   <StoreMetric label="Total Orders" value={store.orders} currencyContext={{...currencyContext, show: false}} />
                   <StoreMetric label="Total Capital (H)" value={store.capital} currencyContext={currencyContext} />
                </div>
                <div className="flex gap-3 pt-6">
                   <button className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
                     <span className="material-symbols-outlined text-base">settings</span> Sync Config
                   </button>
                   <button 
                    onClick={() => onNavigate('orders')}
                    className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                   >
                     <span className="material-symbols-outlined text-base">visibility</span> Order List
                   </button>
                </div>
             </div>
          </div>
        ))}

        {storesData.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">storefront</span>
            <h3 className="text-lg font-bold">No sales channels found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">Sales channel data will appear when orders are detected in Column B of your Sheet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StoreMetric: React.FC<{ 
  label: string, 
  value: number, 
  currencyContext: { primary: string, secondary: string, rate: number, show: boolean } 
}> = ({ label, value, currencyContext }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${label.includes('Profit') && value >= 0 ? 'text-primary' : (label.includes('Profit') && value < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white')}`}>
      {!label.includes('Orders') ? currencyContext.primary : ''}{value.toLocaleString()}
    </p>
    {currencyContext.show && (
      <p className="text-[11px] font-bold text-slate-400 mt-0.5">
        {currencyContext.secondary}{(value * currencyContext.rate).toLocaleString()}
      </p>
    )}
  </div>
);

const StatSummary: React.FC<{ 
  title: string, 
  value: number, 
  trend: string, 
  color: string, 
  suffix?: string, 
  currencyContext: { primary: string, secondary: string, rate: number, show: boolean } 
}> = ({ title, value, trend, color, suffix = '', currencyContext }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm transition-all hover:border-primary/50 group">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{title}</p>
    <div className="space-y-1">
      <div className="flex items-end justify-between">
        <h4 className={`text-3xl font-black tracking-tighter ${color === 'primary' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
          {!suffix && !title.includes('Orders') ? currencyContext.primary : ''}{suffix ? value.toFixed(1) : value.toLocaleString()}{suffix}
        </h4>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
           <span className="material-symbols-outlined text-xs">sync</span>
           {trend}
        </div>
      </div>
      {currencyContext.show && (
        <p className="text-xs font-bold text-slate-400">
          {currencyContext.secondary}{(value * currencyContext.rate).toLocaleString()}
        </p>
      )}
    </div>
  </div>
);

export default StorePerformance;
