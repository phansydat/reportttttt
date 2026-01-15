
import { Order, OrderStatus, Store } from './types';

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const fourDaysAgo = new Date();
fourDaysAgo.setDate(today.getDate() - 4);
const tenDaysAgo = new Date();
tenDaysAgo.setDate(today.getDate() - 10);

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-8821',
    customerName: 'Johnathan Doe',
    customerAvatar: 'https://picsum.photos/seed/john/200',
    customerPhone: '+1 (555) 0123-4567',
    customerEmail: 'johnathan.doe@example.com',
    customerAddress: '123 Business Ave, Suite 400, New York, NY 10001',
    productName: 'Premium Wireless Headphones',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    sku: 'PH-WRL-001-BK',
    price: 249.00,
    cost: 180.00,
    quantity: 1,
    status: OrderStatus.SHIPPED,
    trackingNumber: 'FEDEX-998122341',
    notes: 'Customer requested gift wrapping. Already handled and noted in master sheet row 242.',
    store: 'Amazon US',
    createdAt: today.toLocaleDateString('en-US'),
  },
  {
    id: 'ORD-5582',
    customerName: 'Alex Johnson',
    customerAvatar: 'https://picsum.photos/seed/alex/200',
    customerPhone: '+1 (555) 0987-6543',
    customerEmail: 'alex.j@example.com',
    customerAddress: '456 Oak Lane, Austin, TX 78701',
    productName: 'Mechanical Keyboard G-Pro',
    productImage: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
    sku: 'KB-PRO-RG-01',
    price: 245.00,
    cost: 176.60,
    quantity: 1,
    status: OrderStatus.DELIVERED,
    trackingNumber: 'UPS-772100492',
    notes: 'Include extra keycaps as promotional gift.',
    store: 'Amazon US',
    createdAt: yesterday.toLocaleDateString('en-US'),
  },
  {
    id: 'ORD-5581',
    customerName: 'Sarah Miller',
    customerAvatar: 'https://picsum.photos/seed/sarah/200',
    customerPhone: '+1 (555) 2345-6789',
    customerEmail: 'sarah.m@web.com',
    customerAddress: '789 Pine St, Seattle, WA 98101',
    productName: 'Ergonomic Desk Chair',
    productImage: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&q=80',
    sku: 'CH-ERG-BK-02',
    price: 112.50,
    cost: 88.35,
    quantity: 1,
    status: OrderStatus.PROCESSING,
    trackingNumber: '',
    notes: 'Shipping pending supplier restock.',
    store: 'Shopify Global',
    createdAt: fourDaysAgo.toLocaleDateString('en-US'),
  },
  {
    id: 'ORD-5580',
    customerName: 'David Chen',
    customerAvatar: 'https://picsum.photos/seed/david/200',
    customerPhone: '+1 (555) 3456-7890',
    customerEmail: 'dchen@tech.net',
    customerAddress: '101 Bay View, San Francisco, CA 94105',
    productName: 'USB-C Docking Station',
    productImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
    sku: 'DK-USB-C-09',
    price: 89.00,
    cost: 93.20,
    quantity: 1,
    status: OrderStatus.DELIVERED,
    trackingNumber: 'DHL-11223344',
    notes: 'Customer reported minor scratch on packaging.',
    store: 'Etsy Store',
    createdAt: tenDaysAgo.toLocaleDateString('en-US'),
  }
];

export const MOCK_STORES: Store[] = [
  {
    id: 'shopee-01',
    name: 'Shopee Store',
    logo: 'https://picsum.photos/seed/shopee/100',
    bannerImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
    totalProfit: 4200.00,
    orders: 1240,
    capital: 12500,
    lastSynced: '2m ago',
    isMostProfitable: true,
  },
  {
    id: 'tiktok-01',
    name: 'TikTok Shop',
    logo: 'https://picsum.photos/seed/tiktok/100',
    bannerImage: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80',
    totalProfit: 1850.00,
    orders: 850,
    capital: 5000,
    lastSynced: '15m ago',
  },
  {
    id: 'lazada-01',
    name: 'Lazada',
    logo: 'https://picsum.photos/seed/lazada/100',
    bannerImage: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
    totalProfit: 2100.00,
    orders: 620,
    capital: 9800,
    lastSynced: '1h ago',
  }
];
