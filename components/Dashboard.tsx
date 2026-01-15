
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, PageState, Language } from '../types';
import { getBusinessInsights } from '../geminiService';
import { translations } from '../translations';

interface DashboardProps {
  onNavigate: (view: PageState['currentView'], orderId?: string) => void;
  orders: Order[];
  currencyContext: { primary: string, secondary: string, rate: number, show: boolean };
  language: Language;
}

type TimeFilter = 'All' | 'Today' | 'Last7Days' | 'ThisMonth';

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, orders, currencyContext, language }) => {
  const [aiInsights, setAiInsights] = useState<{ summary: string, strongestChannel: string, recommendation: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('All');
  const t = translations[language];

  const formatMoney = (val: number, symbol: string) => {
    return `${symbol}${val.toLocaleString()}`;
  };

  const parseFlexibleDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const cleanStr = dateStr.trim().split(' ')[0];
    const parts = cleanStr.split(/[/\-\.]/);

    if (parts.length === 3) {
      const p1 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[1], 10);
      const p3 = parseInt(parts[2], 10);

      if (p3 > 1000) {
        if (p1 >= 1 && p1 <= 31 && p2 >= 1 && p2 <= 12) {
          const d = new Date(p3, p2 - 1, p1);
          if (!isNaN(d.getTime())) return d;
        }
      } 
      else if (p1 > 1000) {
        if (p2 >= 1 && p2 <= 12 && p3 >= 1 && p3 <= 31) {
          const d = new Date(p1, p2 - 1, p3);
          if (!isNaN(d.getTime())) return d;
        }
      }
    }
    const fallbackDate = new Date(dateStr);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  };

  const isWithinTimeRange = (orderDateStr: string, range: TimeFilter) => {
    if (range === 'All') return true;
    const orderDate = parseFlexibleDate(orderDateStr);
    if (!orderDate) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

    switch (range) {
      case 'Today': return orderDay.getTime() === today.getTime();
      case 'Last7Days': {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        return orderDay >= sevenDaysAgo && orderDay <= today;
      }
      case 'ThisMonth': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return orderDay >= startOfMonth && orderDay <= today;
      }
      default: return true;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => isWithinTimeRange(o.createdAt, timeFilter));
  }, [orders, timeFilter]);

  const stats = useMemo(() => {
    const revenue = filteredOrders.reduce((a, b) => a + (b.price || 0), 0);
    const cost = filteredOrders.reduce((a, b) => a + (b.cost || 0), 0);
    const profit = filteredOrders.reduce((a, b) => a + (b.profit || 0), 0);
    const count = filteredOrders.length;
    const aov = count > 0 ? revenue / count : 0;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, cost, profit, count, aov, margin };
  }, [filteredOrders]);

  const channelStats = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const name = o.store || 'Unknown';
      map[name] = (map[name] || 0) + (o.price || 0);
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([name, val]) => ({ name, val, percent: (val / max) * 100 }));
  }, [filteredOrders]);

  const statusStats = useMemo(() => {
    const map: Record<OrderStatus, number> = {
      [OrderStatus.PROCESSING]: 0,
      [OrderStatus.SHIPPED]: 0,
      [OrderStatus.DELIVERED]: 0,
      [OrderStatus.CANCELLED]: 0,
    };
    filteredOrders.forEach(o => {
      if (map[o.status] !== undefined) map[o.status]++;
    });
    return map;
  }, [filteredOrders]);

  const generateAIInsight = async () => {
    setIsGenerating(true);
    const dataSummary = {
      totalRevenue: stats.revenue,
      totalProfit: stats.profit,
      currency: currencyContext.primary,
      orderCount: filteredOrders.length,
      stores: Array.from(new Set(filteredOrders.map(o => o.store))),
      language: language === 'vi' ? 'Vietnamese' : 'English',
      timeframe: timeFilter
    };
    const insight = await getBusinessInsights(dataSummary);
    setAiInsights(insight);
    setIsGenerating(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.businessOverview}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t.realTimeReport} ({currencyContext.primary}) {currencyContext.show ? `& ${currencyContext.secondary}` : ''}.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
           <FilterButton active={timeFilter === 'Today'} onClick={() => setTimeFilter('Today')} label={t.today} />
           <FilterButton active={timeFilter === 'Last7Days'} onClick={() => setTimeFilter('Last7Days')} label={t.last7Days} />
           <FilterButton active={timeFilter === 'ThisMonth'} onClick={() => setTimeFilter('ThisMonth')} label={t.thisMonth} />
           <FilterButton active={timeFilter === 'All'} onClick={() => setTimeFilter('All')} label={t.allTime} />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generateAIInsight}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            <span className={`material-symbols-outlined text-lg ${isGenerating ? 'animate-spin' : 'filled'}`}>
              {isGenerating ? 'refresh' : 'auto_awesome'}
            </span>
            {isGenerating ? t.analyzing : t.aiInsights}
          </button>
        </div>
      </div>

      {aiInsights && (
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-primary/20 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-start gap-4">
              <span className="material-symbols-outlined filled text-3xl">auto_awesome</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">AI Business Health Check</h3>
                <p className="text-blue-50 text-sm mb-4 leading-relaxed">{aiInsights.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                    <p className="text-[10px] font-bold uppercase text-blue-200">{language === 'vi' ? 'Kênh mạnh nhất' : 'Strongest Channel'}</p>
                    <p className="font-semibold text-sm">{aiInsights.strongestChannel}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                    <p className="text-[10px] font-bold uppercase text-blue-200">{language === 'vi' ? 'Gợi ý AI' : 'AI Recommendation'}</p>
                    <p className="font-semibold text-sm">{aiInsights.recommendation}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setAiInsights(null)} className="text-white/60 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
           </div>
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <KPICard label={t.totalRevenue} value={stats.revenue} trend={t.syncing.replace('...', '')} positive={true} currencyContext={currencyContext} icon="payments" />
        <KPICard label={t.totalCost} value={stats.cost} trend={t.syncing.replace('...', '')} positive={false} currencyContext={currencyContext} icon="receipt" />
        <KPICard 
            label={t.netProfit} 
            value={stats.profit} 
            trend={`${stats.margin.toFixed(1)}% ROI`} 
            positive={stats.margin >= 0} 
            highlight={true} 
            currencyContext={currencyContext} 
            icon="account_balance_wallet" 
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.avgOrderValue}</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{currencyContext.primary}{stats.aov.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              </div>
              <div className="size-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">calculate</span>
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.orderCount}</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{stats.count}</p>
              </div>
              <div className="size-10 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">inventory_2</span>
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">ROI</p>
                  <p className={`text-xl font-black ${stats.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{stats.margin.toFixed(1)}%</p>
              </div>
              <div className="size-10 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">analytics</span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales by Channel & Status Distribution */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-slate-900 dark:text-white">{t.salesByChannel}</h3>
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase">{language === 'vi' ? 'HÀNG ĐẦU' : 'TOP'}</span>
                </div>
                <div className="space-y-6">
                    {channelStats.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white">{formatMoney(item.val, currencyContext.primary)}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                                    style={{ width: `${item.percent}%` }} 
                                />
                            </div>
                        </div>
                    ))}
                    {channelStats.length === 0 && <p className="text-center text-slate-400 py-4 text-xs">No channel data available.</p>}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white">{t.statusDistribution}</h3>
                    <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-sm">donut_large</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatusSummaryItem label={t.processing} count={statusStats[OrderStatus.PROCESSING]} color="bg-amber-500" />
                    <StatusSummaryItem label={t.shipped} count={statusStats[OrderStatus.SHIPPED]} color="bg-blue-500" />
                    <StatusSummaryItem label={t.delivered} count={statusStats[OrderStatus.DELIVERED]} color="bg-green-500" />
                    <StatusSummaryItem label={t.cancelled} count={statusStats[OrderStatus.CANCELLED]} color="bg-red-500" />
                </div>
            </div>
        </div>

        {/* Latest Orders Column */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white">{t.latestOrders}</h3>
                    <button onClick={() => onNavigate('orders')} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">{t.viewAll}</button>
                </div>
                <div className="space-y-4">
                    {filteredOrders.slice(0, 8).map(order => (
                    <div key={order.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-slate-100 dark:hover:border-slate-700" onClick={() => onNavigate('detail', order.id)}>
                        <div className="relative shrink-0">
                            <img src={order.customerAvatar} className="size-10 rounded-full border dark:border-slate-700" alt={order.customerName} />
                            <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center
                                ${order.status === OrderStatus.DELIVERED ? 'bg-green-500' : order.status === OrderStatus.CANCELLED ? 'bg-red-500' : 'bg-amber-500'}`}>
                                <span className="material-symbols-outlined text-[8px] text-white filled">
                                    {order.status === OrderStatus.DELIVERED ? 'check' : order.status === OrderStatus.CANCELLED ? 'close' : 'schedule'}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-slate-900 dark:text-white group-hover:text-primary transition-colors">{order.customerName}</p>
                            <p className="text-[10px] text-slate-500 truncate font-medium uppercase">{order.store} • {order.createdAt}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{formatMoney(order.price, currencyContext.primary)}</p>
                        </div>
                    </div>
                    ))}
                    {filteredOrders.length === 0 && <p className="text-center text-slate-400 py-10 text-xs">No data for this period.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const FilterButton: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${active ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
  >
    {label}
  </button>
);

const StatusSummaryItem: React.FC<{ label: string, count: number, color: string }> = ({ label, count, color }) => (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-1">
        <div className={`size-2 rounded-full ${color} mb-1`} />
        <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{count}</p>
        <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{label}</p>
    </div>
);

const KPICard: React.FC<{ 
  label: string, 
  value: number, 
  trend: string, 
  positive: boolean, 
  highlight?: boolean, 
  currencyContext: { primary: string, secondary: string, rate: number, show: boolean },
  icon: string
}> = ({ label, value, trend, positive, highlight, currencyContext, icon }) => {
  const secondaryValue = value * currencyContext.rate;
  return (
    <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] duration-300 ${highlight ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:border-primary/30'}`}>
      <div className="flex justify-between items-start mb-4">
        <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-blue-100' : 'text-slate-400'}`}>{label}</p>
        <div className={`size-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
            <span className={`material-symbols-outlined text-lg ${highlight ? 'text-white' : 'text-slate-400'}`}>
            {icon}
            </span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-end gap-3 flex-wrap">
          <h4 className="text-3xl font-black tracking-tighter whitespace-nowrap">{currencyContext.primary}{value.toLocaleString()}</h4>
          <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${highlight ? 'bg-white/20 text-white' : positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {trend}
          </div>
        </div>
        {currencyContext.show && (
          <div className={`text-xs font-bold flex items-center gap-1.5 ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-sm">swap_horiz</span> {currencyContext.secondary}{secondaryValue.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
