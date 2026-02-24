import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WoodStock, CreateWoodStockDTO } from '../../wood';

interface WoodStockStore {
  woodStockItems: WoodStock[];
  addWoodStockItem: (data: CreateWoodStockDTO) => void;
  deleteWoodStockItem: (id: string) => void;
}

export const useWoodStockStore = create<WoodStockStore>()(
  persist(
    (set) => ({
      woodStockItems: [],

      addWoodStockItem: (data) => set((state) => {
        const newWoodStockItem: WoodStock = {
          id: crypto.randomUUID(),
          stockNumber: `MAD-${new Date().getFullYear()}-${(state.woodStockItems.length + 1).toString().padStart(4, '0')}`,
          createdAt: new Date().toISOString(),
          ...data,
        };
        return { woodStockItems: [newWoodStockItem, ...state.woodStockItems] };
      }),

      deleteWoodStockItem: (id) => set((state) => ({
        woodStockItems: state.woodStockItems.filter((item) => item.id !== id),
      })),
    }),
    {
      name: 'wood-stock-management-store',
    }
  )
);