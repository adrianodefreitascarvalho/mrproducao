import { ProductionOrder, generateDefaultRouting } from '@/data/workstations';
import { PRODUCTION_ROUTING } from '@/config';

interface ProductionStoreActions {
  addOrder: (order: Omit<ProductionOrder, 'id' | 'status' | 'progress'>) => void;
  loadOrdersFromStorage: (orders: ProductionOrder[]) => void;
  orders: ProductionOrder[];
}

// Interface for order data from the order management system
export interface OrderManagementOrder {
  id: string;
  clientId: string;
  lines: OrderManagementOrderLine[];
  status: 'pending' | 'in-production' | 'quality-check' | 'completed' | 'shipped';
  priority: 'low' | 'medium' | 'high';
  notes: string;
  createdAt: Date;
  estimatedCompletion: Date;
  client?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface OrderManagementOrderLine {
  id: string;
  productId: string;
  quantity: number;
  customization?: {
    length: number;
    gripStyle: string;
    checkering: string;
  };
  product?: {
    name: string;
    category: string;
  };
}

// Interface for orders stored in localStorage
interface StoredProductionOrder {
  id: string;
  orderNumber: string;
  client: string;
  product: string;
  quantity: number;
  startDate: string;
  dueDate: string;
  status: string;
  progress: number;
  currentWorkstation: string;
  currentOperation: string;
  createdAt: string;
}

// Mock API service to simulate communication with order management system
class OrderManagementAPI {
  private baseUrl = 'http://localhost:3001/api'; // Order management system URL

  /**
   * Fetch orders in production from the order management system
   * Falls back to localStorage if API is unavailable
   */
  async getOrdersInProduction(): Promise<OrderManagementOrder[]> {
    try {
      // Try to fetch from actual API first
      const response = await fetch(`${this.baseUrl}/orders/in-production`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        return await response.json();
      }
      
      // API unavailable, fall back to localStorage
      console.warn('Order Management API unavailable, using localStorage fallback');
      return this.getOrdersFromLocalStorageFallback();
    } catch (error) {
      console.warn('Failed to fetch orders from API, using localStorage fallback:', error);
      return this.getOrdersFromLocalStorageFallback();
    }
  }

  /**
   * Fallback method: Get orders from localStorage
   * This is only used when the API is unavailable
   */
  private getOrdersFromLocalStorageFallback(): OrderManagementOrder[] {
    try {
      const pendingOrders = JSON.parse(localStorage.getItem('pendingProductionOrders') || '[]');

      return pendingOrders.map((order: StoredProductionOrder) => ({
        id: order.orderNumber.replace('ENC-', '').replace('OM-', ''),
        clientId: 'client-1',
        lines: [{
          id: 'line-1',
          productId: order.product,
          quantity: order.quantity,
          product: {
            name: order.product,
            category: 'coronha',
          }
        }],
        status: 'in-production',
        priority: 'medium',
        notes: '',
        createdAt: new Date(order.createdAt || order.startDate),
        estimatedCompletion: new Date(order.dueDate),
        client: {
          firstName: order.client.split(' ')[0] || 'Cliente',
          lastName: order.client.split(' ').slice(1).join(' ') || 'Desconhecido',
          email: 'cliente@email.com'
        }
      }));
    } catch (error) {
      console.error('Failed to parse localStorage fallback:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }
}

/**
 * Integration service that coordinates between order management and production systems
 * Source of truth: AppStore (Zustand)
 * Fallback: localStorage (only when API is unavailable)
 */
export class IntegrationService {
  private orderAPI = new OrderManagementAPI();

  /**
   * Convert order management order to production order format
   */
  private convertToProductionOrder(order: OrderManagementOrder): Omit<ProductionOrder, 'id' | 'status' | 'progress'> {
    const clientName = order.client ? `${order.client.firstName} ${order.client.lastName}` : 'Cliente Desconhecido';
    const products = order.lines.map(line => ({
      name: line.product?.name || 'Produto Personalizado',
      quantity: line.quantity
    }));

    return {
      orderNumber: `OM-${order.id.slice(-6)}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client: clientName as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: products as any,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: order.estimatedCompletion.toISOString().split('T')[0],
      routing: generateDefaultRouting(),
      currentWorkstation: PRODUCTION_ROUTING.DEFAULT_WORKSTATION,
      currentOperation: PRODUCTION_ROUTING.DEFAULT_OPERATION,
    };
  }

  /**
   * Initialize production store from API/localStorage
   * This is called once when the app starts
   * AppStore becomes the source of truth after this point
   */
  async initializeProductionStore(productionStore: ProductionStoreActions): Promise<void> {
    try {
      console.log('🔄 Initializing production store from API/localStorage...');
      
      // Fetch orders from API (with localStorage fallback)
      const apiOrders = await this.orderAPI.getOrdersInProduction();
      
      if (apiOrders.length > 0) {
        console.log(`✅ Loaded ${apiOrders.length} orders from order management system`);
        
        // Convert to production orders
        const productionOrders: ProductionOrder[] = apiOrders
          .filter(order => !productionStore.orders.some(po => po.orderNumber === `OM-${order.id.slice(-6)}`))
          .map(order => {
            const baseOrder = this.convertToProductionOrder(order);
            return {
              ...baseOrder,
              id: Date.now().toString() + Math.random(),
              status: 'in-progress' as const,
              progress: 0,
              currentWorkstation: 'preparacao',
              currentOperation: 'Escolha da Madeira',
            };
          });

        // Load all orders into store (including persisted ones)
        const allOrders = [...productionStore.orders, ...productionOrders];
        productionStore.loadOrdersFromStorage(allOrders);
        
        console.log(`✅ Production store initialized with ${allOrders.length} total orders`);
      } else {
        console.log('ℹ️ No orders found in order management system');
      }
    } catch (error) {
      console.error('❌ Failed to initialize production store:', error);
      // Store remains with persisted data (from localStorage via Zustand persist)
    }
  }

  /**
   * Sync orders from order management system to production store
   * This is called periodically to check for new orders
   * AppStore is the source of truth
   */
  async syncOrdersFromOrderManagement(productionStore: ProductionStoreActions): Promise<void> {
    try {
      // Fetch latest orders from API (with fallback to localStorage)
      const apiOrders = await this.orderAPI.getOrdersInProduction();

      // Filter out orders that already exist in the production store
      const newOrders = apiOrders.filter(apiOrder => 
        !productionStore.orders.some(
          storeOrder => storeOrder.orderNumber === `OM-${apiOrder.id.slice(-6)}`
        )
      );

      // Add new orders to the store
      for (const order of newOrders) {
        const productionOrder = this.convertToProductionOrder(order);
        productionStore.addOrder(productionOrder);
        console.log(`✅ Synced new order: ${productionOrder.orderNumber}`);
      }

      // Clean up localStorage after successful sync (only remove processed orders)
      if (newOrders.length > 0) {
        await this.cleanupLocalStorageFallback(newOrders);
      }
    } catch (error) {
      console.error('❌ Failed to sync orders from order management system:', error);
      // Don't throw - periodic sync should continue even if one attempt fails
    }
  }

  /**
   * Remove processed orders from localStorage fallback
   * Keep unprocessed orders in case AppStore is lost
   */
  private async cleanupLocalStorageFallback(processedOrders: OrderManagementOrder[]): Promise<void> {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('pendingProductionOrders') || '[]');
      const processedOrderIds = processedOrders.map(o => o.id);
      
      // Keep only orders that haven't been processed yet
      const remainingOrders = storedOrders.filter((order: StoredProductionOrder) => 
        !processedOrderIds.includes(order.orderNumber.replace('OM-', '').replace('ENC-', ''))
      );

      if (remainingOrders.length < storedOrders.length) {
        localStorage.setItem('pendingProductionOrders', JSON.stringify(remainingOrders));
        console.log(`🧹 Cleaned up ${storedOrders.length - remainingOrders.length} processed orders from localStorage`);
      }
    } catch (error) {
      console.error('Failed to cleanup localStorage:', error);
      // Non-critical failure, continue
    }
  }

  /**
   * Update order status back to order management system
   */
  async updateOrderManagementStatus(orderId: string, status: string): Promise<void> {
    try {
      await this.orderAPI.updateOrderStatus(orderId, status);
      console.log(`✅ Updated order ${orderId} status to ${status} in order management system`);
    } catch (error) {
      console.error('Failed to update order status in order management system:', error);
      throw error;
    }
  }

  /**
   * Start periodic synchronization with order management system
   * Checks for new orders at regular intervals
   */
  startPeriodicSync(productionStore: ProductionStoreActions, intervalMs: number = 60000): () => void {
    const sync = () => {
      this.syncOrdersFromOrderManagement(productionStore).catch(console.error);
    };

    // Set up periodic sync (don't do initial sync here - let App.tsx handle initialization)
    const intervalId = setInterval(sync, intervalMs);
    console.log(`⏱️ Started periodic sync every ${intervalMs}ms`);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      console.log('⏹️ Stopped periodic sync');
    };
  }
}

export const integrationService = new IntegrationService();