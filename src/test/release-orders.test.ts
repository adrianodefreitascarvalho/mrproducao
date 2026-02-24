import { describe, it, expect, beforeEach } from 'vitest';
import { useUserProductionStore } from '@/lib/UserProductionStore';
import { useProductionStore } from '@/lib/store';

describe('Release Orders Integration', () => {
  beforeEach(() => {
    // Reset stores - no need to do anything, stores are fresh for each test
  });

  it('should create a production order in blocked state', () => {
    const userStore = useUserProductionStore.getState();
    
    userStore.createProductionFromOrder({
      orderId: 'ORD-001',
      createdAt: new Date().toISOString(),
      items: [
        { sku: 'coronha-1', quantity: 5 },
        { sku: 'fuste-1', quantity: 3 },
      ],
    });

    expect(userStore.productions).toHaveLength(1);
    expect(userStore.productions[0].status).toBe('BLOCKED');
    expect(userStore.productions[0].externalOrderId).toBe('ORD-001');
  });

  it('should sync released production order to main production store', () => {
    const userStore = useUserProductionStore.getState();
    const mainStore = useProductionStore.getState();

    // Create a production order
    userStore.createProductionFromOrder({
      orderId: 'ORD-002',
      createdAt: new Date().toISOString(),
      items: [
        { sku: 'coronha-1', quantity: 10 },
      ],
    });

    const productionId = userStore.productions[0].id;

    // Release the production
    userStore.releaseProduction(productionId);

    // Verify it's released in user store
    expect(userStore.productions[0].status).toBe('RELEASED');

    // Verify it appears in main production store
    const releasedOrders = mainStore.orders.filter((o) => o.orderNumber.startsWith('OM-'));
    expect(releasedOrders).toHaveLength(1);
    expect(releasedOrders[0].orderNumber).toContain('ORD-002');
  });

  it('should not create duplicate orders when releasing same production', () => {
    const userStore = useUserProductionStore.getState();
    const mainStore = useProductionStore.getState();

    // Create and release
    userStore.createProductionFromOrder({
      orderId: 'ORD-003',
      createdAt: new Date().toISOString(),
      items: [{ sku: 'test', quantity: 1 }],
    });

    const productionId = userStore.productions[0].id;
    userStore.releaseProduction(productionId);

    const countBefore = mainStore.orders.filter((o) => o.orderNumber.includes('ORD-003')).length;
    expect(countBefore).toBe(1);

    // Try releasing again (should not add duplicate)
    userStore.releaseProduction(productionId);

    const countAfter = mainStore.orders.filter((o) => o.orderNumber.includes('ORD-003')).length;
    expect(countAfter).toBe(1);
  });

  it('should set correct properties when syncing to production store', () => {
    const userStore = useUserProductionStore.getState();
    const mainStore = useProductionStore.getState();

    userStore.createProductionFromOrder({
      orderId: 'ORD-004',
      createdAt: '2024-02-09T10:00:00Z',
      items: [
        { sku: 'coronha', quantity: 5 },
        { sku: 'fuste', quantity: 3 },
      ],
    });

    userStore.releaseProduction(userStore.productions[0].id);

    const syncedOrder = mainStore.orders.find((o) => o.orderNumber.includes('ORD-004'));
    expect(syncedOrder).toBeDefined();
    expect(syncedOrder?.products).toHaveLength(2);
    expect(syncedOrder?.status).toBe('in-progress');
    expect(syncedOrder?.client).toContain('ORD-004');
  });
});
