import { useUserProductionStore } from "../lib/UserProductionStore";

export function handleEvent(event: any) {
  console.log("[EVENTS] Processando evento:", {
    type: event.type,
    orderId: event.payload?.orderId,
  });

  try {
    if (event.type === "OrderCreated") {
      const store = useUserProductionStore.getState();
      store.createProductionFromOrder(event.payload);
    } else if (event.type === "OrderReleased") {
      const store = useUserProductionStore.getState();
      const production = store.productions.find(
        (p) => p.externalOrderId === event.payload.orderId
      );
      if (!production) {
        store.createProductionFromOrder(event.payload);
      }
    } else {
      console.warn("[EVENT] Tipo de evento desconhecido:", event.type);
    }
  } catch (error) {
    console.error("[EVENT] Erro ao processar evento:", error);
    throw error;
  }
}
