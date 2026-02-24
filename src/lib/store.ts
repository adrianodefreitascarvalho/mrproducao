import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductionOrder, OrderStatus, ProductType, WoodGrade, WoodSpecies, Product, sampleProducts, generateDefaultRouting, workstations, Weapon, weapons as sampleWeapons, woodSpecies as sampleWoodSpecies, Client, clients as sampleClients } from '@/data/workstations';
import { integrationService } from './integration';
import { PRODUCTION_ROUTING } from '@/config';

export type OrderPayload = {
  orderId: string;
  createdAt: string;
  items: Array<{
    sku: string;
    quantity: number;
  }>;
};

export type UserProductionOrder = {
  id: string;
  externalOrderId: string;
  status: "BLOCKED" | "RELEASED";
  createdAt: string;
  items: Array<{
    sku: string;
    quantity: number;
  }>;
};

interface ProductionStore {
  orders: ProductionOrder[];
  productTypes: ProductType[];
  woodGrades: WoodGrade[];
  woodSpecies: WoodSpecies[];
  products: Product[];
  clients: Client[];
  weapons: Weapon[];
  productions: UserProductionOrder[];
  addOrder: (order: Omit<ProductionOrder, 'id' | 'status' | 'progress'>) => void;
  updateOrder: (id: string, updates: Partial<ProductionOrder>) => void;
  removeOrder: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
  addWeapon: (weapon: Omit<Weapon, 'id'>) => void;
  updateWeapon: (id: string, updates: Partial<Weapon>) => void;
  removeWeapon: (weaponId: string) => void;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  removeClient: (clientId: string) => void;
  moveOrderToNextWorkstation: (orderId: string) => void;
  getOrdersByWorkstation: (workstationId: string) => ProductionOrder[];
  getOrdersByStatus: (status: OrderStatus) => ProductionOrder[];
  syncFromOrderManagement: () => Promise<void>;
  loadOrdersFromStorage: (orders: ProductionOrder[]) => void;
  createProductionFromOrder: (order: OrderPayload) => void;
  releaseProduction: (id: string) => void;
  releaseProductionByOrderId: (orderId: string) => void;
}

export const useProductionStore = create<ProductionStore>()(
  persist(
    (set, get) => ({
      productTypes: [
        { id: 'coronha', name: 'Coronha' },
        { id: 'fuste', name: 'Fuste' },
      ],
      woodGrades: [
        { id: 'grade1', name: 'Grau 1' },
        { id: 'grade2', name: 'Grau 2' },
        { id: 'grade3', name: 'Grau 3' },
        { id: 'grade4', name: 'Grau 4' },
        { id: 'grade5', name: 'Grau 5' },
        { id: 'exhibition', name: 'Exhibition' },
      ],
      woodSpecies: sampleWoodSpecies,
      products: sampleProducts,
      clients: sampleClients,
      weapons: sampleWeapons,
      orders: [],
      productions: [],

  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),

  removeProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    })),

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, ...updates } : product
      ),
    }));
  },

  addWeapon: (weaponData) => {
    const newWeapon: Weapon = {
        id: crypto.randomUUID(),
        ...weaponData
    };
    set((state) => ({
        weapons: [...state.weapons, newWeapon],
    }));
  },

  updateWeapon: (id, updates) => {
    set((state) => ({
      weapons: state.weapons.map((weapon) =>
        weapon.id === id ? { ...weapon, ...updates } : weapon
      ),
    }));
  },

  removeWeapon: (weaponId) =>
    set((state) => ({ weapons: state.weapons.filter((w) => w.id !== weaponId) })),

  addClient: (clientData) => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      ...clientData
    };
    set((state) => ({
      clients: [...state.clients, newClient],
    }));
  },

  updateClient: (id, updates) => {
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === id ? { ...client, ...updates } : client
      ),
    }));
  },

  removeClient: (clientId) =>
    set((state) => ({ clients: state.clients.filter((c) => c.id !== clientId) })),

  addOrder: (orderData: Omit<ProductionOrder, 'id' | 'status' | 'progress'>) => {
    const routing = orderData.routing || generateDefaultRouting();
    const firstStep = routing.steps[0];
    const firstWorkstation = workstations.find(ws => ws.id === firstStep?.workstationId);
    const firstOperation = firstWorkstation?.operations[0];
    
    const newOrder: ProductionOrder = {
      ...orderData,
      routing,
      id: Date.now().toString(),
      status: 'in-progress',
      progress: 0,
      currentWorkstation: firstStep?.workstationId || PRODUCTION_ROUTING.DEFAULT_WORKSTATION,
      currentOperation: firstOperation?.name || PRODUCTION_ROUTING.DEFAULT_OPERATION,
    };

    set((state) => ({
      orders: [...state.orders, newOrder],
    }));
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, ...updates } : order
      ),
    }));
  },

  removeOrder: (id) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    }));
  },

  moveOrderToNextWorkstation: (orderId) => {
    // This is a simplified implementation
    // In a real app, you'd have logic to determine the next workstation based on the production flow
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    // For now, just update progress and potentially status
    const newProgress = Math.min(order.progress + 20, 100);
    const newStatus: OrderStatus = newProgress === 100 ? 'completed' : 'in-progress';

    get().updateOrder(orderId, {
      progress: newProgress,
      status: newStatus,
    });
  },

  getOrdersByWorkstation: (workstationId) => {
    return get().orders.filter(order => order.currentWorkstation === workstationId);
  },

  getOrdersByStatus: (status) => {
    return get().orders.filter(order => order.status === status);
  },

  syncFromOrderManagement: async () => {
    await integrationService.syncOrdersFromOrderManagement(get());
  },

  loadOrdersFromStorage: (orders: ProductionOrder[]) => {
    set({ orders });
  },

  createProductionFromOrder: (order) => {
    const exists = get().productions.some(
      (p) => p.externalOrderId === order.orderId
    );
    if (exists) return;

    set((state) => ({
      productions: [
        ...state.productions,
        {
          id: crypto.randomUUID(),
          externalOrderId: order.orderId,
          status: "BLOCKED",
          createdAt: new Date().toISOString(),
          items: order.items,
        },
      ],
    }));
  },

  releaseProduction: (id) => {
    const production = get().productions.find((p) => p.id === id);
    if (!production) return;

    // Update status in current store
    set((state) => ({
      productions: state.productions.map((p) =>
        p.id === id ? { ...p, status: "RELEASED" } : p
      ),
    }));

    // Sync to production orders
    const existingOrder = get().orders.find(
      (o) => o.orderNumber === `OM-${production.externalOrderId}`
    );

    if (!existingOrder) {
      get().addOrder({
        orderNumber: `OM-${production.externalOrderId}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client: `Cliente ${production.externalOrderId}` as any,
        products: production.items.map((item) => ({
          name: item.sku,
          quantity: item.quantity,
        })) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        routing: generateDefaultRouting(),
        currentWorkstation: PRODUCTION_ROUTING.DEFAULT_WORKSTATION,
        currentOperation: PRODUCTION_ROUTING.DEFAULT_OPERATION,
      });
    }
  },

  releaseProductionByOrderId: (orderId) => {
    const production = get().productions.find((p) => p.externalOrderId === orderId);
    if (production) get().releaseProduction(production.id);
  },
    }),
    {
      name: 'production-store',
      partialize: (state) => ({
        orders: state.orders,
        productions: state.productions,
      }),
    }
  )
);