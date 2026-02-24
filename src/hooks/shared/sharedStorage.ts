export interface Order {
  id: string;
  createdAt: string;
  items: Array<{ sku: string; quantity: number }>;
  status: "pending" | "in-production" | "released";
}

// In-memory storage for released orders (shared via localStorage events)
const listeners = new Set<(orders: Order[]) => void>();
let releasedOrdersStore: Order[] = [];

// Load from localStorage if available
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('releasedOrders');
  if (stored) {
    try {
      releasedOrdersStore = JSON.parse(stored);
    } catch (e) {
      console.error('[SHARED] Erro ao carregar encomendas do localStorage:', e);
    }
  }
}

function notifyListeners() {
  const orders = getReleasedOrders();
  listeners.forEach(listener => listener(orders));
}

export function saveReleasedOrder(order: Order): boolean {
  try {
    const exists = releasedOrdersStore.find((o) => o.id === order.id);
    if (exists) {
      console.log(`[SHARED] Encomenda ${order.id} já existe, ignorando...`);
      return false;
    }

    releasedOrdersStore.push({ ...order, status: "released" });
    
    // Persist to localStorage
    localStorage.setItem('releasedOrders', JSON.stringify(releasedOrdersStore));
    
    console.log(`[SHARED] Encomenda ${order.id} guardada com sucesso!`);
    notifyListeners();
    return true;
  } catch (error) {
    console.error(`[SHARED] Erro ao guardar encomenda ${order.id}:`, error);
    return false;
  }
}

export function getReleasedOrders(): Order[] {
  return releasedOrdersStore;
}

export function getReleasedOrder(orderId: string): Order | undefined {
  return releasedOrdersStore.find((o) => o.id === orderId);
}

export function clearReleasedOrders(): void {
  releasedOrdersStore = [];
  localStorage.removeItem('releasedOrders');
  console.log("[SHARED] Armazenamento de encomendas libertadas limpo!");
  notifyListeners();
}

export function subscribeToReleasedOrders(callback: (orders: Order[]) => void): () => void {
  listeners.add(callback);
  // Immediately call with current orders
  callback(releasedOrdersStore);
  // Return unsubscribe function
  return () => listeners.delete(callback);
}
