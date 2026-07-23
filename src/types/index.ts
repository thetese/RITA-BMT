export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stockLevel: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  taxExempt?: boolean;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: string;
  totalPrice: number;
  items: SaleItem[];
  paymentMethod: string;
  cashierId?: string;
  status: 'COMPLETED' | 'HELD' | 'REFUNDED';
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loyaltyPoints: number;
}

export interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}
