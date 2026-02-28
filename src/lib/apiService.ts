/**
 * Serviço para comunicar com a API central
 * URL configurada via VITE_API_BASE_URL ou padrão para localhost:3000
 */

import { API_CONFIG } from '@/config';
import { getAuthHeaders } from './authHeaders';

// ===== Types =====
export interface OrderItem {
  id?: string;
  productType: 'coronha' | 'fuste' | 'reparacao' | 'garantia' | 'outro';
  woodGrade: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  client: { id: string; name: string };
  status: 'pending' | 'confirmed' | 'cancelled';
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionOrder {
  id: string;
  relatedOrderId?: string;
  orderNumber: string;
  client: { id: string; name: string };
  weapon?: { id: string; model: string };
  products: { productId: string; quantity: number }[];
  currentWorkstation: string;
  currentOperation: string;
  operationProgress?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  startDate: string;
  dueDate: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// ===== API Service =====
export const apiService = {
  // ===== Encomendas =====
  async getOrders(): Promise<Order[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders`, { headers });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${encodeURIComponent(id)}`, { headers });
      if (!response.ok) throw new Error('Order not found');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(order)
      });
      if (!response.ok) throw new Error('Failed to create order');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update order');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  },

  // ===== Ordens de Produção =====
  async getProductionOrders(): Promise<ProductionOrder[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/production-orders`, { headers });
      if (!response.ok) throw new Error('Failed to fetch production orders');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching production orders:', error);
      return [];
    }
  },

  async getRelatedProductionOrders(orderId: string): Promise<ProductionOrder[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/production-orders/related/${encodeURIComponent(orderId)}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch related orders');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching related orders:', error);
      return [];
    }
  },

  async createProductionOrder(order: Omit<ProductionOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductionOrder | null> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/production-orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(order)
      });
      if (!response.ok) throw new Error('Failed to create production order');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error creating production order:', error);
      return null;
    }
  },

  async updateProductionOrder(id: string, updates: Partial<ProductionOrder>): Promise<ProductionOrder | null> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/production-orders/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update production order');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error updating production order:', error);
      return null;
    }
  },

  // ===== Sincronização =====
  async convertOrderToProduction(orderId: string, weapon: unknown): Promise<ProductionOrder[] | null> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/sync/convert-order-to-production`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ orderId, weapon })
      });
      if (!response.ok) throw new Error('Failed to convert order');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error converting order:', error);
      return null;
    }
  },

  // ===== Health =====
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('API Health Check failed:', error);
      return false;
    }
  }
};
