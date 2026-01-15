
import React, { useMemo } from 'react';
import { Order } from '../types';

interface ReportsProps {
  orders: Order[];
  currencyContext: { primary: string, secondary: string, rate: number, show: boolean };
}

const Reports: React.FC<ReportsProps> = ({ orders, currencyContext }) => {
  /**
   * Phân tích ngày tháng linh hoạt, ưu tiên định dạng dd/mm/yyyy
   */
  const parseFlexibleDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const cleanStr = dateStr.trim().split(' ')[0];
    const parts = cleanStr.split(/[/\-\.]/);

    if (parts.length === 3) {
      const p1 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[1], 10);
      const p3 = parseInt(parts[2], 10);

      if (p3 > 1000) { // Định dạng DD/MM/YYYY
        if (p1 >= 1 && p1 <= 31 && p2 >= 1 && p2 <= 12) {
          const d = new Date(p3, p2 - 1, p1);
          if (!isNaN(d.getTime())) return d;
        }
      } else if (p1 > 1000) { // Định dạng YYYY/MM/DD
        if (p2 >= 1 && p2 <= 12 && p3 >= 1 && p3 <= 31) {
          const d = new Date(p1, p2 - 1, p3);
          if (!isNaN(d.getTime())) return d;
        }
      }
    }
    const fallbackDate = new Date(dateStr);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  };

  const stats = useMemo(() => {
    const totalCapital = orders.reduce((acc, o) => acc + (o.cost || 0), 0);
    const totalRevenue = orders.reduce((acc, o) => acc + (o.price || 0), 0);
    const totalProfit = orders.reduce((acc, o) => acc + (o.profit || 0), 0);
    
    return { totalCapital, totalRevenue, totalProfit };
  }, [orders]);

  const monthlyData = useMemo(() => {
    const groups: Record<string, { month: string, capital: number, revenue: number, profit: number, timestamp: number }> = {};
    
    orders.forEach(order => {
      const date = parseFlexibleDate(order.createdAt);
      if (!date) return;

      const monthLabel = `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (!groups[key]) {
        groups[key] = { 
          month: monthLabel, 
          capital: 0, 
          revenue: 0, 
          profit: 0,
          timestamp: new Date(date.getFullYear(), date.getMonth(), 1).getTime()
        };
      }

      groups[key].capital += (order.cost || 0);
      groups[key].revenue += (order.price || 0);
      groups[key].profit += (order.profit || 0);
    });

    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
  }, [orders]);

  const bestMonth = useMemo(() => {
    if (monthlyData.length === 0) return null;
    return [...monthlyData].sort((a, b) => b.profit - a.profit)[0];
  }, [monthlyData]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Báo cáo Tài chính</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Phân tích chi tiết theo {currencyContext.primary} {currencyContext.show ? `(${currencyContext.secondary})` : ''}.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
             <span className="material-symbols-outlined text-lg">picture_as_pdf</span> Xuất PDF
           </button>
           <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
             <span className="material-symbols-outlined text-lg">csv</span> Xuất CSV
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          label="Tổng vốn đầu tư" 
          value={stats.totalCapital} 
          trend="Đã đồng bộ" 
          icon="account_balance" 
          currencyContext={currencyContext}
        />
        <ReportCard 
          label="Tổng doanh thu" 
          value={stats.totalRevenue} 
          trend="Đã đồng bộ" 
          icon="trending_up" 
          currencyContext={currencyContext}
        />
        <ReportCard 
          label="Lợi nhuận ròng" 
          value={stats.totalProfit} 
          trend="Đã đồng bộ" 
          icon="monetization_on" 
          highlight 
          currencyContext={currencyContext}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 overflow-hidden shadow-sm">
         <div className="px-6 py-4 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-900 dark:text-white">Chi tiết theo tháng</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dữ liệu thời gian thực</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
               <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                     <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b dark:border-slate-800">Tháng</th>
                     <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b dark:border-slate-800">Vốn (H)</th>
                     <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b dark:border-slate-800">Doanh thu (I)</th>
                     <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-widest border-b dark:border-slate-800">Lợi nhuận (P)</th>
                  </tr>
               </thead>
               <tbody className="divide-y dark:divide-slate-800">
                  {monthlyData.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                       <td className="px-6 py-5 font-bold text-sm text-slate-900 dark:text-white">{row.month}</td>
                       <td className="px-6 py-5">
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{currencyContext.primary}{row.capital.toLocaleString()}</p>
                          {currencyContext.show && <p className="text-[10px] text-slate-400 font-bold">{currencyContext.secondary}{(row.capital * currencyContext.rate).toLocaleString()}</p>}
                       </td>
                       <td className="px-6 py-5">
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{currencyContext.primary}{row.revenue.toLocaleString()}</p>
                          {currencyContext.show && <p className="text-[10px] text-slate-400 font-bold">{currencyContext.secondary}{(row.revenue * currencyContext.rate).toLocaleString()}</p>}
                       </td>
                       <td className="px-6 py-5 bg-green-50/20 dark:bg-green-900/10">
                         <p className={`text-sm font-black ${row.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {row.profit >= 0 ? '+' : '-'}{currencyContext.primary}{Math.abs(row.profit).toLocaleString()}
                         </p>
                         {currencyContext.show && (
                           <p className={`text-[10px] font-bold ${row.profit >= 0 ? 'text-green-600/70' : 'text-red-600/70'}`}>
                             {row.profit >= 0 ? '+' : '-'}{currencyContext.secondary}{Math.abs(row.profit * currencyContext.rate).toLocaleString()}
                           </p>
                         )}
                       </td>
                    </tr>
                  ))}
                  {monthlyData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Đang chờ đồng bộ dữ liệu từ Sheet...</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      <div className="space-y-4">
         <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cột mốc tăng trưởng</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestMonth ? (
              <MilestoneCard 
                title={`Tháng cao điểm: ${bestMonth.month}`} 
                desc="Lợi nhuận ròng cao nhất ghi nhận" 
                val={bestMonth.profit} 
                icon="trending_up"
                color="text-green-600 bg-green-50 dark:bg-green-900/20"
                currencyContext={currencyContext}
              />
            ) : null}
            <MilestoneCard 
               title="Mục tiêu năm" 
               desc="Tiến độ dựa trên doanh thu thực tế" 
               val={stats.totalRevenue} 
               icon="stars"
               color="text-primary bg-primary/10"
               isPercentage
               currencyContext={currencyContext}
            />
         </div>
      </div>
    </div>
  );
};

const ReportCard: React.FC<{ 
  label: string, 
  value: number, 
  trend: string, 
  icon: string, 
  highlight?: boolean, 
  currencyContext: { primary: string, secondary: string, rate: number, show: boolean } 
}> = ({ label, value, trend, icon, highlight, currencyContext }) => (
  <div className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] ${highlight ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white dark:bg-slate-900 dark:border-slate-800 border-slate-100 shadow-sm'}`}>
    <div className="flex justify-between items-start mb-4">
      <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-blue-100' : 'text-slate-400'}`}>{label}</p>
      <span className={`material-symbols-outlined ${highlight ? 'text-blue-200' : 'text-slate-300'}`}>{icon}</span>
    </div>
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black tracking-tight">
          {value < 0 ? '-' : ''}{currencyContext.primary}{Math.abs(value).toLocaleString()}
        </p>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${highlight ? 'bg-white/20 text-white' : 'bg-green-50 dark:bg-green-900/20 text-green-600'}`}>
          {trend}
        </span>
      </div>
      {currencyContext.show && (
        <p className={`text-sm font-bold ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>
          {value < 0 ? '-' : ''}{currencyContext.secondary}{Math.abs(value * currencyContext.rate).toLocaleString()}
        </p>
      )}
    </div>
  </div>
);

const MilestoneCard: React.FC<{ 
  title: string, 
  desc: string, 
  val: number, 
  icon: string, 
  color: string, 
  isPercentage?: boolean,
  currencyContext: { primary: string, secondary: string, rate: number, show: boolean } 
}> = ({ title, desc, val, icon, color, isPercentage, currencyContext }) => (
  <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors">
    <div className={`${color} size-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner`}>
      <span className="material-symbols-outlined filled">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-sm leading-none text-slate-900 dark:text-white truncate">{title}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1 truncate">{desc}</p>
    </div>
    <div className="text-right shrink-0">
      {isPercentage ? (
        <p className="text-primary font-black text-lg">{((val / 1000000) * 100).toFixed(1)}%</p>
      ) : (
        <>
          <p className={`font-black text-lg ${val >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {val < 0 ? '-' : ''}{currencyContext.primary}{Math.abs(val).toLocaleString()}
          </p>
          {currencyContext.show && <p className="text-[10px] font-bold text-slate-400">{val < 0 ? '-' : ''}{currencyContext.secondary}{Math.abs(val * currencyContext.rate).toLocaleString()}</p>}
        </>
      )}
    </div>
  </div>
);

export default Reports;
