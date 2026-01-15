
import { Order, OrderStatus, MappingConfig, ConnectionMethod } from './types';

const columnToIndex = (col: string): number => {
  let index = 0;
  const s = col.toUpperCase().replace(/[^A-Z]/g, '');
  for (let i = 0; i < s.length; i++) {
    index = index * 26 + s.charCodeAt(i) - 64;
  }
  return index - 1;
};

const getSheetId = (url: string) => {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

const parseCurrency = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  let s = String(val).trim().replace(/[^\d,.-]/g, '');
  if (!s) return 0;
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (s.includes(',')) {
    if (s.split(',').pop()?.length !== 3) s = s.replace(',', '.');
    else s = s.replace(/,/g, '');
  }
  const result = parseFloat(s);
  return isNaN(result) ? 0 : result;
};

const parseCSV = (text: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (inQuotes && char === '"' && nextChar === '"') {
      cell += '"'; i++;
    } else if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { row.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(cell.trim()); result.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  if (cell || row.length > 0) { row.push(cell.trim()); result.push(row); }
  return result.filter(r => r.length > 1);
};

export const fetchSheetData = async (
  url: string, 
  config: MappingConfig, 
  accessToken?: string, 
  sheetName: string = '',
  method: ConnectionMethod = 'bot'
): Promise<Order[]> => {
  let rawRows: string[][] = [];

  if (method === 'bot') {
    if (!url || !url.includes('script.google.com')) {
      throw new Error("Bot yêu cầu URL Apps Script. Hãy kiểm tra cài đặt.");
    }
    
    try {
      // Đảm bảo fetch xử lý đúng redirect của Google Apps Script
      const fetchUrl = `${url}?sheet=${encodeURIComponent(sheetName || "")}`;
      const response = await fetch(fetchUrl, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      rawRows = await response.json();
    } catch (err: any) {
      console.error("Fetch failed:", err);
      if (err.message.includes('Failed to fetch')) {
        throw new Error("Lỗi mạng hoặc CORS. Hãy đảm bảo Script đã được Triển khai cho 'Bất kỳ ai'.");
      }
      throw new Error("Lỗi kết nối Bot. Hãy kiểm tra URL Script và quyền truy cập.");
    }
  } 
  else {
    const sheetId = getSheetId(url);
    if (!sheetId) throw new Error("URL Sheet không hợp lệ.");
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error("Sheet đang ở chế độ riêng tư hoặc URL sai.");
    const text = await response.text();
    rawRows = parseCSV(text);
  }

  if (rawRows.length < 2) return [];

  const idx = {
    createdAt: columnToIndex(config.createdAt),
    store: columnToIndex(config.store),
    id: columnToIndex(config.id),
    customerName: columnToIndex(config.customerName),
    customerAddress: columnToIndex(config.customerAddress),
    productName: columnToIndex(config.productName),
    cost: columnToIndex(config.cost),
    price: columnToIndex(config.price),
    status: columnToIndex(config.status),
    tracking: columnToIndex(config.tracking),
    profit: columnToIndex(config.profit),
  };

  return rawRows.slice(1)
    .filter(row => row[idx.id] && String(row[idx.id]).length > 0)
    .map((row) => {
      const price = parseCurrency(row[idx.price]);
      const cost = parseCurrency(row[idx.cost]);
      const profit = parseCurrency(row[idx.profit]);
      const rawStatus = String(row[idx.status] || '').toLowerCase();
      
      let status = OrderStatus.PROCESSING;
      if (rawStatus.includes('ship') || rawStatus.includes('đang giao') || rawStatus.includes('gửi')) {
        status = OrderStatus.SHIPPED;
      } else if (rawStatus.includes('deliv') || rawStatus.includes('đã giao') || rawStatus.includes('hoàn thành') || rawStatus.includes('thành công')) {
        status = OrderStatus.DELIVERED;
      } else if (rawStatus.includes('can') || rawStatus.includes('hủy') || rawStatus.includes('huỷ')) {
        status = OrderStatus.CANCELLED;
      } else if (rawStatus.includes('đang xử lý') || rawStatus.includes('mới') || rawStatus.includes('chờ')) {
        status = OrderStatus.PROCESSING;
      }

      return {
        id: String(row[idx.id]),
        createdAt: String(row[idx.createdAt] || new Date().toLocaleDateString('vi-VN')),
        customerName: String(row[idx.customerName] || `Khách #${row[idx.id]}`).split('\n')[0].trim(),
        customerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${row[idx.id]}`,
        customerPhone: '',
        customerEmail: '',
        customerAddress: String(row[idx.customerAddress] || 'N/A'),
        store: String(row[idx.store] || 'Cửa hàng'),
        productName: String(row[idx.productName] || 'Sản phẩm').split('/').pop()?.trim() || 'Sản phẩm',
        productImage: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80`,
        sku: `SKU-${row[idx.id]}`,
        price, cost, quantity: 1, status,
        trackingNumber: String(row[idx.tracking] || ''),
        notes: '',
        profit
      };
    });
};
