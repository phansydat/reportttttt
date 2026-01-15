
export enum OrderStatus {
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export type ConnectionMethod = 'bot' | 'public';
export type Language = 'vi' | 'en';

export interface MappingConfig {
  createdAt: string;
  store: string;
  id: string;
  customerName: string;
  customerAddress: string;
  productName: string;
  cost: string;
  price: string;
  status: string;
  tracking: string;
  profit: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerAvatar: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  productName: string;
  productImage: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  status: OrderStatus;
  trackingNumber: string;
  notes: string;
  store: string;
  createdAt: string;
  profit?: number;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  bannerImage: string;
  totalProfit: number;
  orders: number;
  capital: number;
  lastSynced: string;
  isMostProfitable?: boolean;
}

export interface PageState {
  currentView: 'dashboard' | 'orders' | 'detail' | 'reports' | 'stores' | 'settings';
  selectedOrderId?: string;
}

export interface AppSettings {
  sheetUrl: string;
  sheetName: string;
  connectionMethod: ConnectionMethod;
  mapping: MappingConfig;
  currency: string;
  secondaryCurrency: string;
  exchangeRate: number;
  showConversion: boolean;
  autoSyncEnabled: boolean;
  autoSyncInterval: number;
  language: Language;
}
