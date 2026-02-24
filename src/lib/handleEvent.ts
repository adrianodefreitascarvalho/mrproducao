import { useProductionStore } from "./store";

type OrderCreatedEvent = {
  type: "OrderCreated";
  payload: {
    orderId: string;
    createdAt: string;
    items: Array<{
      sku: string;
      quantity: number;
    }>;
  };
};

export function handleEvent(event: OrderCreatedEvent) {
  if (event.type === "OrderCreated") {
    useProductionStore
      .getState()
      .createProductionFromOrder(event.payload);
  }
}
