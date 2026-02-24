/**
 * Serviço de Integração com Sistema de Produção
 * Dispara eventos quando encomendas são libertadas para produção
 */

const EVENTS_SERVER_URL = 'http://localhost:4001/events';

export interface OrderReleasePayload {
  orderId: string;
  createdAt: string;
  items: Array<{
    sku: string;
    quantity: number;
  }>;
}

/**
 * Dispara evento de encomenda libertada para o servidor de eventos
 * Este evento será recebido pela Aplicação de Produção
 */
export async function fireOrderReleaseEvent(payload: OrderReleasePayload): Promise<boolean> {
  try {
    const event = {
      type: 'OrderCreated',
      payload,
    };

    console.log('📤 Disparando evento OrderCreated:', event);

    const response = await fetch(EVENTS_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error('Erro ao disparar evento:', response.statusText);
      return false;
    }

    console.log('✅ Evento disparado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao conectar com servidor de eventos:', error);
    return false;
  }
}

/**
 * Versão síncrona com fallback para localStorage
 * Se o servidor de eventos não estiver disponível, armazena em localStorage
 */
export function fireOrderReleaseEventWithFallback(payload: OrderReleasePayload): void {
  fireOrderReleaseEvent(payload)
    .then((success) => {
      if (!success) {
        // Fallback para localStorage
        const pendingOrders = JSON.parse(
          localStorage.getItem('pendingProductionOrders') || '[]'
        );
        pendingOrders.push({
          id: payload.orderId,
          orderNumber: `ENC-${payload.orderId}`,
          client: 'Cliente Desconhecido',
          product: payload.items[0]?.sku || 'Produto',
          quantity: payload.items[0]?.quantity || 0,
          startDate: payload.createdAt,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          progress: 0,
          currentWorkstation: 'preparacao',
          currentOperation: 'Escolha da Madeira',
          createdAt: payload.createdAt,
        });
        localStorage.setItem('pendingProductionOrders', JSON.stringify(pendingOrders));
        console.log('💾 Encomenda armazenada localmente (fallback)');
      }
    });
}
