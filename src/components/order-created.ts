export type OrderCreatedEvent = {
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
