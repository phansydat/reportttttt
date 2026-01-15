
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, PageState } from '../types';

interface OrderListProps {
  onNavigate: (view: PageState['currentView'], orderId?: string) => void;
  orders: Order[];
  currency: string;
}

type TimeFilter = 'All' | 'Today' | 'Yesterday' | 'Last 7 Days' | 'This Month';

const OrderList: React.FC<OrderListProps> = ({ onNavigate, orders, currency }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [storeFilter, setStoreFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('All');

  const uniqueStores = useMemo(() => {
    const stores = orders.map(o => o.store).filter(Boolean);
    return ['All', ...Array.from(new Set(stores))];
  }, [orders]);

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
    if (!isNaN(fallbackDate.getTime())) return fallbackDate;
    return null;
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
      case 'Yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return orderDay.getTime() === yesterday.getTime();
      }
      case 'Last 7 Days': {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        return orderDay >= sevenDaysAgo && orderDay <= today;
      }
      case 'This Month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return orderDay >= startOfMonth && orderDay <= today;
      }
      default: return true;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = (o.customerName?.toLowerCase() || '').includes(search.toLowerCase()) || 
                           (o.id?.toLowerCase() || '').includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
      const matchesStore = storeFilter === 'All' || o.store === storeFilter;
      const matchesTime = isWithinTimeRange(o.createdAt, timeFilter);
      return matchesSearch && matchesStatus && matchesStore && matchesTime;
    });
  }, [orders, search, statusFilter, storeFilter, timeFilter]);

  const stats = useMemo(() => {
    return filteredOrders.reduce((acc, o) => ({
      revenue: acc.revenue + (o.price || 0),
      cost: acc.cost + (o.cost || 0),
      profit: acc.profit + (o.profit || 0),
    }), { revenue: 0, cost: 0, profit: 0 });
  }, [filteredOrders]);

  const hasActiveFilters = statusFilter !== 'All' || storeFilter !== 'All' || timeFilter !== 'All' || search !== '';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Danh sách đơn hàng</h2>
          <p className="text-slate-500 text-xs font-medium">Quản lý các đơn hàng đã đồng bộ ({currency})</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Tìm theo ID hoặc tên khách..." 
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">filter_list</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 appearance-none cursor-pointer">
              <option value="All">Tất cả trạng thái</option>
              <option value={OrderStatus.PROCESSING}>Đang xử lý</option>
              <option value={OrderStatus.SHIPPED}>Đang giao</option>
              <option value={OrderStatus.DELIVERED}>Đã giao</option>
              <option value={OrderStatus.CANCELLED}>Đã hủy</option>
            </select>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">storefront</span>
            <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 appearance-none cursor-pointer">
              {uniqueStores.map(s => <option key={s} value={s}>{s === 'All' ? 'Tất cả kênh bán' : s}</option>)}
            </select>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">calendar_today</span>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 appearance-none cursor-pointer">
              <option value="All">Tất cả thời gian</option>
              <option value="Today">Hôm nay</option>
              <option value="Yesterday">Hôm qua</option>
              <option value="Last 7 Days">7 ngày qua</option>
              <option value="This Month">Tháng này</option>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <button onClick={() => {setSearch(''); setStatusFilter('All'); setStoreFilter('All'); setTimeFilter('All');}} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:text-red-600 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">refresh</span> Đặt lại
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryStat label="Tổng doanh thu" value={stats.revenue} currency={currency} color="text-slate-900 dark:text-white" />
        <SummaryStat label="Tổng vốn" value={stats.cost} currency={currency} color="text-slate-500" />
        <SummaryStat label="Lợi nhuận ròng" value={stats.profit} currency={currency} color="text-primary" highlight />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const displayProfit = order.profit || 0;
          return (
            <div key={order.id} onClick={() => onNavigate('detail', order.id)} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col h-full relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">#{order.id}</span>
                    <StatusChip status={order.status} />
                  </div>
                  <h4 className="text-sm font-bold group-hover:text-primary transition-colors truncate text-slate-900 dark:text-white leading-tight">{order.customerName}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[12px] text-slate-400">schedule</span>
                    <span className="text-[10px] font-medium text-slate-400">{order.createdAt}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-slate-900 dark:text-white">{currency}{order.price.toLocaleString()}</p>
                  <p className={`text-[10px] font-black ${displayProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {displayProfit >= 0 ? '+' : '-'}{currency}{Math.abs(displayProfit).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-4 border-y border-slate-50 dark:border-slate-800/50 mb-4 mt-auto">
                 <div className="size-12 rounded-xl overflow-hidden shrink-0 shadow-sm bg-slate-100 dark:bg-slate-800">
                    <img src={order.productImage} className="w-full h-full object-cover" alt="" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">{order.productName}</p>
                   <p className="text-[9px] text-slate-400 font-black uppercase mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] filled text-primary">store</span>
                      {order.store}
                   </p>
                 </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">
                 <span>Xem chi tiết</span>
                 <span className="material-symbols-outlined text-base transform group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
              </div>
            </div>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800">
            <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
            <p className="font-bold">Không tìm thấy đơn hàng nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryStat: React.FC<{ label: string, value: number, currency: string, color: string, highlight?: boolean }> = ({ label, value, currency, color, highlight }) => (
  <div className={`p-4 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-1 transition-all ${highlight ? 'ring-1 ring-primary/20 bg-primary/5' : ''}`}>
    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{label}</span>
    <span className={`text-xl font-black ${color}`}>
      {value < 0 ? '-' : ''}{currency}{Math.abs(value).toLocaleString()}
    </span>
  </div>
);

const StatusChip: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const configs = {
    [OrderStatus.PROCESSING]: { label: 'Đang xử lý', class: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' },
    [OrderStatus.SHIPPED]: { label: 'Đang giao', class: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
    [OrderStatus.DELIVERED]: { label: 'Đã giao', class: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' },
    [OrderStatus.CANCELLED]: { label: 'Đã hủy', class: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
  };
  const config = configs[status] || configs[OrderStatus.PROCESSING];
  return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight border ${config.class}`}>{config.label}</span>;
};

export default OrderList;
