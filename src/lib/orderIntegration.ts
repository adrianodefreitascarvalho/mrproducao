/**
 * Serviço de Integração com Sistema de Produção
 * Dispara eventos quando encomendas são libertadas para produção
 */

import { getAuthHeaders } from './authHeaders';
import { supabase, type Database } from './supabase';

const EVENTS_SERVER_URL = import.meta.env.VITE_EVENTS_SERVER_URL || 'http://localhost:4001/events';

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

    const headers = await getAuthHeaders();
    const response = await fetch(EVENTS_SERVER_URL, {
      method: 'POST',
      headers,
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
 * Versão com fallback para Supabase
 * Se o servidor de eventos não estiver disponível, armazena em Supabase.
 */
export async function fireOrderReleaseEventWithFallback(payload: OrderReleasePayload): Promise<void> {
  const success = await fireOrderReleaseEvent(payload);

  if (success) {
    return;
  }

  // Fallback para Supabase
  console.log('Servidor de eventos indisponível. A gravar diretamente na base de dados (fallback).');

  // O fallback insere na tabela release_orders, imitando o fluxo do evento.
  type ReleaseOrderInsert = Database['public']['Tables']['release_orders']['Insert'];

  const orderToInsert: ReleaseOrderInsert = {
    external_order_id: payload.orderId,
    items: payload.items,
    status: 'blocked',
  };

  try {
    // Usar upsert para evitar erros de duplicados se o fallback for acionado várias vezes para a mesma encomenda.
    const { error } = await supabase.from('release_orders').upsert(orderToInsert, {
      onConflict: 'external_order_id',
    });

    if (error) {
      console.error('Erro ao inserir encomenda no Supabase (fallback):', error);
    } else {
      console.log('💾 Encomenda para liberação armazenada no Supabase com sucesso (fallback).');
    }
  } catch (error) {
    console.error('Erro inesperado ao comunicar com Supabase (fallback):', error);
  }
}
