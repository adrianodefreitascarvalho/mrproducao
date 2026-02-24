import { OrderCreatedEvent } from "../../shared/events/order-created";
import { OrderReleasedEvent } from "../../shared/events/order-released";
import { useUserProductionStore } from "../lib/UserProductionStore";

export function handleEvent(event: OrderCreatedEvent | OrderReleasedEvent) {
  console.log("[EVENTS] Processando evento:", {
    type: event.type,
    orderId: event.payload.orderId,
  });

  try {
    if (event.type === "OrderCreated") {
      console.log(
        `[EVENT] OrderCreated recebido para orderId: ${event.payload.orderId}`
      );
      const store = useUserProductionStore.getState();
      console.log(
        `[EVENT] Store atual tem ${store.productions.length} encomendas`
      );
      store.createProductionFromOrder(event.payload);
      const updatedStore = useUserProductionStore.getState();
      console.log(
        `[EVENT] Store atualizado tem ${updatedStore.productions.length} encomendas`
      );
    } else if (event.type === "OrderReleased") {
      console.log(
        `[EVENT] OrderReleased recebido para orderId: ${event.payload.orderId}`
      );
      // When OrderReleased is received, treat it as OrderCreated to ensure it appears in the list
      // This allows the user to see orders that were released in the Orders app and manually release them in Production
      const store = useUserProductionStore.getState();
      const production = store.productions.find(
        (p) => p.externalOrderId === event.payload.orderId
      );

      if (!production) {
        // Create as BLOCKED even though it was released in the order app
        // This allows manual release in production app as well
        console.log(
          `[EVENT] Criando encomenda libertada como BLOCKED para libertação em Produção: ${event.payload.orderId}`
        );
        store.createProductionFromOrder(event.payload);
      } else {
        console.log(
          `[EVENT] Encomenda já existe, não criando duplicada: ${event.payload.orderId}`
        );
      }
    } else {
      console.warn("[EVENT] Tipo de evento desconhecido:", (event as any).type);
    }
  } catch (error) {
    console.error("[EVENT] Erro ao processar evento:", error);
    throw error;
  }
}


