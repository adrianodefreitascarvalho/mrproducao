import { useProductionStore } from "./store";

type OrderEvent = {
  type: "OrderCreated" | "OrderReleased";
  payload: {
    orderId: string;
    createdAt?: string;
    items?: Array<{
      sku: string;
      quantity: number;
    }>;
  };
};

export function handleEvent(event: OrderEvent) {
  if (event.type === "OrderCreated" || event.type === "OrderReleased") {
    const payload = {
      orderId: event.payload.orderId,
      createdAt: event.payload.createdAt || new Date().toISOString(),
      items: event.payload.items || [],
    };
    useProductionStore
      .getState()
      .createReleaseOrder(payload);
  }
}
