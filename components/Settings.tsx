
import React, { useState } from 'react';
import { MappingConfig, ConnectionMethod } from '../types';

interface SettingsProps {
  initialUrl: string;
  initialSheetName: string;
  initialConnectionMethod: ConnectionMethod;
  initialMapping: MappingConfig;
  initialCurrency: string;
  initialSecondaryCurrency: string;
  initialExchangeRate: number;
  initialShowConversion: boolean;
  initialAutoSync: boolean;
  initialAutoInterval: number;
  onSave: (url: string, sheetName: string, mapping: MappingConfig, currency: string, secondary: string, rate: number, show: boolean, method: ConnectionMethod, auto: boolean, interval: number) => void;
}

const APPS_SCRIPT_CODE = `function doGet(e) {
  var sheetName = e.parameter.sheet || "Sheet1";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

const Settings: React.FC<SettingsProps> = (props) => {
  const [sheetUrl, setSheetUrl] = useState(props.initialUrl);
  const [sheetName, setSheetName] = useState(props.initialSheetName);
  const [mapping, setMapping] = useState<MappingConfig>(props.initialMapping);
  const [currency, setCurrency] = useState(props.initialCurrency);
  const [secondaryCurrency, setSecondaryCurrency] = useState(props.initialSecondaryCurrency);
  const [exchangeRate, setExchangeRate] = useState(props.initialExchangeRate);
  const [showConversion, setShowConversion] = useState(props.initialShowConversion);
  const [autoSync, setAutoSync] = useState(props.initialAutoSync);
  const [autoInterval, setAutoInterval] = useState(props.initialAutoInterval);
  
  const [activeTab, setActiveTab] = useState<'connection' | 'mapping' | 'currency'>('connection');
  const [showScript, setShowScript] = useState(false);

  const handleSave = () => {
    props.onSave(sheetUrl, sheetName, mapping, currency, secondaryCurrency, exchangeRate, showConversion, 'bot', autoSync, autoInterval);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    alert("Đã sao chép mã Script! Hãy dán vào Tiện ích mở rộng > Apps Script trong Google Sheet của bạn.");
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-32">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Cấu hình hệ thống</h2>
        <p className="text-slate-500 text-sm font-medium">Kết nối an toàn và tự động hóa dữ liệu.</p>
      </div>

      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit shadow-inner">
        <TabButton active={activeTab === 'connection'} onClick={() => setActiveTab('connection')} label="Kết nối" icon="hub" />
        <TabButton active={activeTab === 'mapping'} onClick={() => setActiveTab('mapping')} label="Cấu trúc" icon="view_column" />
        <TabButton active={activeTab === 'currency'} onClick={() => setActiveTab('currency')} label="Tiền tệ" icon="payments" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden min-h-[450px]">
        {activeTab === 'connection' && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            <div className="space-y-6">
              <div className="bg-sheet-green/5 dark:bg-sheet-green/10 p-6 rounded-[2rem] border border-sheet-green/20 border-dashed">
                 <div className="flex items-start gap-4 mb-4">
                    <div className="size-10 rounded-xl bg-sheet-green text-white flex items-center justify-center shrink-0 shadow-lg">
                      <span className="material-symbols-outlined filled text-xl">smart_toy</span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white">Cách làm Bot hoạt động:</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">Để app có thể đọc Sheet riêng tư, hãy cài đặt một "Cầu nối" nhỏ qua Google Apps Script.</p>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <button 
                      onClick={() => setShowScript(!showScript)}
                      className="w-full py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">{showScript ? 'visibility_off' : 'code'}</span>
                      {showScript ? 'Ẩn hướng dẫn mã' : 'Xem mã Script & Hướng dẫn'}
                    </button>

                    {showScript && (
                      <div className="p-4 bg-slate-900 rounded-2xl space-y-4 animate-in zoom-in-95 duration-200">
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight space-y-1">
                            <p>1. Trong Google Sheet: Menu <span className="text-white">Tiện ích mở rộng</span> &gt; <span className="text-white">Apps Script</span></p>
                            <p>2. Dán mã dưới đây, đặt tên dự án và nhấn biểu tượng <span className="text-white">Lưu</span></p>
                            <p>3. Nhấn <span className="text-white">Triển khai</span> &gt; <span className="text-white">Tạm triển khai mới</span></p>
                            <p>4. Chọn loại: <span className="text-white">Ứng dụng web</span>. Quyền truy cập: <span className="text-white">Bất kỳ ai (Anyone)</span></p>
                            <p>5. Copy URL nhận được và dán vào ô bên dưới.</p>
                         </div>
                         <div className="relative group">
                            <pre className="text-[10px] text-green-400 font-mono overflow-x-auto p-3 bg-black/50 rounded-lg border border-white/10 max-h-40">
                              {APPS_SCRIPT_CODE}
                            </pre>
                            <button onClick={copyScript} className="absolute top-2 right-2 size-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"><span className="material-symbols-outlined text-sm">content_copy</span></button>
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className={`material-symbols-outlined text-2xl ${autoSync ? 'text-primary filled' : 'text-slate-400'}`}>bolt</span>
                       <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Đồng bộ Real-time</p>
                          <p className="text-[10px] text-slate-500 font-bold">Tự động cập nhật dữ liệu khi có thay đổi</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setAutoSync(!autoSync)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${autoSync ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                       <div className={`absolute top-1 size-5 bg-white rounded-full transition-all shadow-sm ${autoSync ? 'left-8' : 'left-1'}`} />
                    </button>
                 </div>
                 {autoSync && (
                    <div className="flex items-center gap-4 pt-2 border-t dark:border-slate-700">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tần suất quét:</p>
                       <div className="flex gap-2">
                          {[30, 60, 300].map(s => (
                             <button 
                               key={s} 
                               onClick={() => setAutoInterval(s)}
                               className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${autoInterval === s ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-500'}`}
                             >
                                {s < 60 ? `${s} Giây` : `${s/60} Phút`}
                             </button>
                          ))}
                       </div>
                    </div>
                 )}
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="size-6 rounded-full bg-sheet-green text-white text-[10px] flex items-center justify-center">URL</span>
                  URL Web App của Script
                </h4>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-sheet-green rounded-2xl text-sm font-bold transition-all outline-none"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                />
              </div>

              <div className="pt-4 border-t dark:border-slate-800 space-y-4">
                 <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                   <span className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-[10px] flex items-center justify-center">Tab</span>
                   Tên trang tính (Sheet Name)
                 </h4>
                 <div className="flex gap-4">
                   <div className="flex-1 space-y-2">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Tên chính xác của Tab dữ liệu (Ví dụ: Trang tính1, DonHang...)</p>
                     <input 
                       type="text" 
                       className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-2xl text-sm font-bold transition-all outline-none"
                       value={sheetName}
                       onChange={(e) => setSheetName(e.target.value)}
                       placeholder="Trang tính1"
                     />
                   </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className="divide-y dark:divide-slate-800 animate-in fade-in duration-300 overflow-y-auto max-h-[500px]">
            <MappingInput label="Ngày tạo đơn" value={mapping.createdAt} onChange={(v) => setMapping(p => ({...p, createdAt: v}))} />
            <MappingInput label="Mã đơn hàng" required value={mapping.id} onChange={(v) => setMapping(p => ({...p, id: v}))} />
            <MappingInput label="Kênh bán hàng" value={mapping.store} onChange={(v) => setMapping(p => ({...p, store: v}))} />
            <MappingInput label="Tên khách hàng" value={mapping.customerName} onChange={(v) => setMapping(p => ({...p, customerName: v}))} />
            <MappingInput label="Địa chỉ khách hàng" value={mapping.customerAddress} onChange={(v) => setMapping(p => ({...p, customerAddress: v}))} />
            <MappingInput label="Tên sản phẩm" value={mapping.productName} onChange={(v) => setMapping(p => ({...p, productName: v}))} />
            <MappingInput label="Trạng thái đơn hàng" value={mapping.status} onChange={(v) => setMapping(p => ({...p, status: v}))} />
            <MappingInput label="Mã vận đơn" value={mapping.tracking} onChange={(v) => setMapping(p => ({...p, tracking: v}))} />
            <MappingInput label="Giá bán" value={mapping.price} onChange={(v) => setMapping(p => ({...p, price: v}))} />
            <MappingInput label="Vốn" value={mapping.cost} onChange={(v) => setMapping(p => ({...p, cost: v}))} />
            <MappingInput label="Lợi nhuận" value={mapping.profit} onChange={(v) => setMapping(p => ({...p, profit: v}))} />
          </div>
        )}

        {activeTab === 'currency' && (
          <div className="p-8 space-y-10 animate-in fade-in duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tiền tệ chính</label>
                   <div className="flex gap-3">
                      {['$', '₫', '€'].map(s => (
                        <button key={s} onClick={() => setCurrency(s)} className={`size-14 rounded-2xl border-2 font-black text-lg transition-all ${currency === s ? 'border-primary text-primary bg-primary/5' : 'border-transparent bg-slate-50 dark:bg-slate-800'}`}>{s}</button>
                      ))}
                   </div>
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tiền tệ quy đổi (Phụ)</label>
                   <div className="flex gap-3">
                      {['₫', '$', '€'].map(s => (
                        <button key={s} onClick={() => setSecondaryCurrency(s)} className={`size-14 rounded-2xl border-2 font-black text-lg transition-all ${secondaryCurrency === s ? 'border-primary text-primary bg-primary/5' : 'border-transparent bg-slate-50 dark:bg-slate-800'}`}>{s}</button>
                      ))}
                   </div>
                </div>
                <div className="space-y-4 md:col-span-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tỉ giá quy đổi (1 {currency} = ? {secondaryCurrency})</label>
                   <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">{secondaryCurrency}</span>
                      <input type="number" className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-primary text-2xl focus:ring-2 focus:ring-primary/20 transition-all" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} />
                   </div>
                </div>
             </div>

             <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-between border dark:border-slate-700">
                <div className="flex items-center gap-4">
                   <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${showConversion ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      <span className="material-symbols-outlined filled">swap_horiz</span>
                   </div>
                   <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Hiển thị quy đổi</h4>
                      <p className="text-xs text-slate-500">Hiển thị song song {currency} và {secondaryCurrency} trong báo cáo.</p>
                   </div>
                </div>
                <button 
                  onClick={() => setShowConversion(!showConversion)}
                  className={`relative w-16 h-8 rounded-full transition-colors focus:outline-none ${showConversion ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 size-6 bg-white rounded-full transition-all shadow-md ${showConversion ? 'left-9' : 'left-1'}`} />
                </button>
             </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 md:static md:p-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md md:bg-transparent z-40 border-t md:border-none dark:border-slate-800">
        <button 
          onClick={handleSave}
          className="w-full max-w-4xl mx-auto py-5 text-white rounded-3xl font-black shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm bg-sheet-green shadow-sheet-green/40"
        >
          <span className="material-symbols-outlined">bolt</span>
          Lưu & Đồng bộ ngay
        </button>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, label: string, icon: string }> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-500'}`}>
    <span className="material-symbols-outlined text-lg">{icon}</span>
    {label}
  </button>
);

const MappingInput: React.FC<{ label: string, value: string, required?: boolean, onChange: (v: string) => void }> = ({ label, value, required, onChange }) => (
  <div className="p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
    <div className="flex items-center gap-3">
      <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <span className="material-symbols-outlined text-slate-400 text-sm group-hover:text-primary">view_column</span>
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label} {required && <span className="text-red-500">*</span>}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cột</span>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="w-16 text-center py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-black text-primary uppercase focus:ring-2 focus:ring-primary/20"
        maxLength={2}
      />
    </div>
  </div>
);

export default Settings;
