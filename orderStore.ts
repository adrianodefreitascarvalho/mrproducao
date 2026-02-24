import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, CreateOrderDTO, OrderStatus } from './order';

interface OrderStore {
  orders: Order[];
  addOrder: (data: CreateOrderDTO) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      
      addOrder: (data) => set((state) => {
        const newOrder: Order = {
          id: crypto.randomUUID(),
          orderNumber: `ENC-${new Date().getFullYear()}-${(state.orders.length + 1).toString().padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          status: 'pending',
          ...data,
          totalAmount: 0 // Lógica de preço pode ser adicionada depois
        };
        return { orders: [newOrder, ...state.orders] };
      }),

      updateStatus: (id, status) => set((state) => ({
        orders: state.orders.map((o) => 
          o.id === id ? { ...o, status } : o
        )
      })),

      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter((o) => o.id !== id)
      })),
    }),
    {
      name: 'order-management-store',
    }
  )
);