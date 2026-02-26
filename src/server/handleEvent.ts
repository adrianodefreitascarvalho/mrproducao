import { useProductionStore } from '../lib/store';

export function handleEvent(event: any) {
  console.log("[EVENTS] Processando evento:", {
    type: event.type,
    orderId: event.payload?.orderId,
  });

  try {
    if (event.type === "OrderCreated" || event.type === "OrderReleased") {
      const store = useProductionStore.getState();
      // Check if order already exists
      const exists = store.orders.some(
        (o) => o.order_number === `OM-${event.payload.orderId}`
      );
      if (!exists) {
        store.addOrder({
          order_number: `OM-${event.payload.orderId}`,
          related_order_id: event.payload.orderId,
          client: { id: 'unknown', name: `Cliente ${event.payload.orderId}` } as any,
          products: (event.payload.items || []).map((item: any) => ({
            product_id: item.sku,
            quantity: item.quantity,
          })) as any,
          start_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          routing: null,
        });
      }
    } else {
      console.warn("[EVENT] Tipo de evento desconhecido:", event.type);
    }
  } catch (error) {
    console.error("[EVENT] Erro ao processar evento:", error);
    throw error;
  }
}
