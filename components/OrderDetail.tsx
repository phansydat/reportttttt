
import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderDetailProps {
  order: Order;
  currency: string;
  onBack: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, currency, onBack }) => {
  const profit = order.profit || 0;
  const margin = order.price > 0 ? ((profit / order.price) * 100).toFixed(1) : '0.0';

  const formatMoney = (val: number) => {
    return `${currency}${val.toLocaleString()}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED: return 'Đã giao';
      case OrderStatus.SHIPPED: return 'Đang giao';
      case OrderStatus.CANCELLED: return 'Đã hủy';
      default: return 'Đang xử lý';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-3 bg-white dark:bg-slate-900 shadow-sm border dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black">Đơn hàng {order.id}</h2>
              <button onClick={() => copyToClipboard(order.id)} className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-base">content_copy</span></button>
            </div>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Đã đồng bộ lúc {order.createdAt}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="flex-1 px-4 py-3 border dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50">In đơn</button>
           <button className="flex-1 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20">Cập nhật</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 overflow-hidden shadow-sm">
             <div className="px-6 py-4 border-b dark:border-slate-800 flex justify-between bg-slate-50/50 dark:bg-slate-800/30">
               <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Thông tin sản phẩm</h3>
               <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">{order.store}</span>
             </div>
             <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <img src={order.productImage} className="w-full md:w-48 aspect-square rounded-2xl object-cover shadow-md" alt="" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6">
                     <DataField label="Tên sản phẩm" value={order.productName} />
                     <DataField label="SKU" value={order.sku} monospace />
                     <DataField label="Giá bán" value={formatMoney(order.price)} />
                     <DataField label="Số lượng" value={`${order.quantity} chiếc`} />
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 overflow-hidden shadow-sm">
             <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x dark:divide-slate-800">
                <div className="p-6"><p className="text-[9px] font-bold uppercase text-slate-400 mb-2">Vốn (H)</p><p className="text-2xl font-black">{formatMoney(order.cost)}</p></div>
                <div className="p-6"><p className="text-[9px] font-bold uppercase text-slate-400 mb-2">Doanh thu (I)</p><p className="text-2xl font-black">{formatMoney(order.price)}</p></div>
                <div className="p-6 bg-primary/[0.03] dark:bg-primary/[0.05]">
                   <div className="flex justify-between items-start mb-2">
                     <p className="text-[9px] font-black uppercase text-primary">Lợi nhuận ròng (P)</p>
                     <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-green-100 text-green-700">{margin}% ROI</span>
                   </div>
                   <p className="text-3xl font-black text-primary">{profit >= 0 ? '+' : '-'}{formatMoney(Math.abs(profit))}</p>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-6 flex items-center gap-6">
             <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl text-slate-400">local_shipping</span>
             </div>
             <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mã vận đơn (M)</p>
                <p className="text-sm font-mono mt-1 text-slate-700 dark:text-slate-300">{order.trackingNumber || 'CHƯA CẬP NHẬT'}</p>
             </div>
             <div className="text-right">
                <span className="text-xl font-black text-primary italic uppercase">{getStatusLabel(order.status)}</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 text-center">
             <img src={order.customerAvatar} className="size-24 rounded-full mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-xl" alt="" />
             <h3 className="text-xl font-black">{order.customerName}</h3>
             <p className="text-slate-400 font-bold text-[10px] uppercase mt-1">Người mua đã xác thực</p>
             <div className="mt-6 pt-6 border-t dark:border-slate-800 text-left">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Địa chỉ nhận hàng</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{order.customerAddress}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataField: React.FC<{ label: string, value: string, monospace?: boolean }> = ({ label, value, monospace }) => (
  <div className="space-y-1.5 px-2">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className={`text-sm font-bold text-slate-900 dark:text-white ${monospace ? 'font-mono' : ''}`}>{value}</div>
  </div>
);

export default OrderDetail;
