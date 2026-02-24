// Re-export from main store to maintain compatibility
// This file is deprecated and should be removed once all references are updated
export { useProductionStore as useUserProductionStore } from './store';
export type { OrderPayload, UserProductionOrder } from './store';
