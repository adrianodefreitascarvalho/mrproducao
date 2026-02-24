import { useEffect, useState, useCallback } from "react";
import { subscribeToReleasedOrders, Order } from "./shared/sharedStorage";

export interface ReleasedOrder {
  externalOrderId: string;
  createdAt: string;
  items: Array<{ sku: string; quantity: number }>;
  status: "BLOCKED" | "RELEASED";
}

/**
 * Hook para Produção que monitora localStorage compartilhado
 * Busca encomendas libertadas em Encomendas
 */
export function useSharedReleasedOrders() {
  const [releasedOrders, setReleasedOrders] = useState<ReleasedOrder[]>([]);

  const mapToReleasedOrders = useCallback((orders: Order[]): ReleasedOrder[] => {
    return orders.map((order: Order) => ({
      externalOrderId: order.id,
      createdAt: order.createdAt,
      items: order.items,
      status: "BLOCKED" as const,
    }));
  }, []);

  useEffect(() => {
    // Subscribe to store changes - setState is called in callback, not effect body
    const unsubscribe = subscribeToReleasedOrders((orders) => {
      const mappedOrders = mapToReleasedOrders(orders);
      console.log(`[PRODUCAO] 📥 Encomendas libertadas: ${mappedOrders.length}`);
      setReleasedOrders(mappedOrders);
    });

    return unsubscribe;
  }, [mapToReleasedOrders]);

  return releasedOrders;
}
