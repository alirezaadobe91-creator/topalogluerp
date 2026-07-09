/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum OrderStatus {
  PENDING = 'BEKLEMEDE',
  WORKSHOP = 'ATÖLYEDE',
  SHIPPED = 'KARGOYA VERİLDİ',
  DELIVERED = 'TESLİM EDİLDİ',
  CANCELLED = 'İPTAL EDİLDİ'
}

export type Marketplace = 'E-Topaloglu' | 'Trendyol' | 'Hepsiburada' | 'N11' | 'Pazarama' | 'Idefix';

export interface OrderHistory {
  status: OrderStatus;
  timestamp: number;
  note?: string;
}

export enum ShippingStatus {
  NOT_SHIPPED = 'NOT_SHIPPED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED'
}

export interface Order {
  id: string;
  productName: string;
  quantity: number;
  customerName: string;
  marketplace: Marketplace;
  orderNote: string;
  createdAt: number;
  updatedAt: number;
  status: OrderStatus;
  erpProcessed: boolean;
  progress: number;
  history: OrderHistory[];
}

export type Theme = 'light' | 'dark';

export interface DashboardStats {
  totalOrders: number;
  preparing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  todayCount: number;
  completionRate: number;
}
