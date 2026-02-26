import type { ProductionOrder } from './store';

interface ProductionStoreActions {
  // Using 'any' to avoid complex type definition that would require more refactoring
  addOrder: (order: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at' | 'status' | 'progress' | 'current_workstation' | 'current_operation'>) => Promise<void>;
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
      console.warn('Order Management API unavailable');
      return [];
    } catch (error) {
      console.warn('Failed to fetch orders from API:', error);
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
  private convertToProductionOrder(order: OrderManagementOrder): Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at' | 'status' | 'progress' | 'current_workstation' | 'current_operation'> {
    const clientName = order.client ? `${order.client.firstName} ${order.client.lastName}` : 'Cliente Desconhecido';
    const products = order.lines.map(line => ({
      product_id: line.productId,
      quantity: line.quantity
    }));

    return {
      order_number: `OM-${order.id.slice(-6)}`,
      related_order_id: order.id,
      client: { id: order.clientId, name: clientName },
      products: products,
      start_date: new Date().toISOString().split('T')[0],
      due_date: order.estimatedCompletion.toISOString().split('T')[0],
      routing: null,
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
          .filter(order => !productionStore.orders.some(po => po.order_number === `OM-${order.id.slice(-6)}`))
          .map((order): ProductionOrder => {
            const baseOrder = this.convertToProductionOrder(order);
            return {
              ...baseOrder,
              id: Date.now().toString() + Math.random(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              status: 'in-progress' as const,
              progress: 0,
              current_workstation: 'preparacao',
              current_operation: 'Escolha da Madeira',
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
          storeOrder => storeOrder.order_number === `OM-${apiOrder.id.slice(-6)}`
        )
      );

      // Add new orders to the store
      for (const order of newOrders) {
        const productionOrder = this.convertToProductionOrder(order);
        await productionStore.addOrder(productionOrder);
        console.log(`✅ Synced new order: ${productionOrder.order_number}`);
      }
    } catch (error) {
      console.error('❌ Failed to sync orders from order management system:', error);
      // Don't throw - periodic sync should continue even if one attempt fails
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