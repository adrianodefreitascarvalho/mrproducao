import { create } from 'zustand';
import { ProductionOrder, OrderStatus, ProductType, WoodGrade, sampleOrders } from '@/data/workstations';
// import { integrationService } from './integration';

interface ProductionStore {
  orders: ProductionOrder[];
  productTypes: ProductType[];
  woodGrades: WoodGrade[];
  addOrder: (order: Omit<ProductionOrder, 'id' | 'status' | 'progress' | 'currentWorkstation' | 'currentOperation'>) => void;
  updateOrder: (id: string, updates: Partial<ProductionOrder>) => void;
  removeOrder: (id: string) => void;
  moveOrderToNextWorkstation: (orderId: string) => void;
  getOrdersByWorkstation: (workstationId: string) => ProductionOrder[];
  getOrdersByStatus: (status: OrderStatus) => ProductionOrder[];
  syncFromOrderManagement: () => Promise<void>;
}

export const useProductionStore = create<ProductionStore>((set, get) => ({
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
  orders: sampleOrders,

  addOrder: (orderData) => {
    const newOrder: ProductionOrder = {
      ...orderData,
      id: Date.now().toString(),
      status: 'pending',
      progress: 0,
      currentWorkstation: 'preparacao',
      currentOperation: 'Escolha da Madeira',
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
    // TODO: implement integration service
    console.log('syncFromOrderManagement not yet implemented');
  },
}));