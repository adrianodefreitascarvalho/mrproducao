export type OrderStatus = 'pending' | 'confirmed' | 'in-production' | 'completed' | 'cancelled';

export interface OrderItem {
  sku: string;
  quantity: number;
  price?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  createdAt: string;
  deliveryDate?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount?: number;
}

export interface CreateOrderDTO {
  clientName: string;
  items: OrderItem[];
  deliveryDate?: string;
}