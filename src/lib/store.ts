import { create } from 'zustand';
import { toast } from 'sonner';
import { OrderStatus, ProductType, WoodGrade, WoodSpecies, woodSpecies as sampleWoodSpecies } from '@/data/workstations';
import { integrationService } from './integration';
import { PRODUCTION_ROUTING } from '@/config';
import { supabase, type Database, type Json } from './supabase';
export type { Database };
import { getSafeErrorMessage } from './errorHandler';
export type Product = Database['public']['Tables']['products']['Row'] & { category?: string | null };
export type { Json };

// Define Operation and Workstation types based on the database schema
export type Operation = Database['public']['Tables']['operations']['Row'];
export type Workstation = Database['public']['Tables']['workstations']['Row'] & { operations: Operation[] };
export type ReleaseOrder = Database['public']['Tables']['release_orders']['Row'];
export type PriceTable = Database['public']['Tables']['price_tables']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Weapon = Database['public']['Tables']['weapons']['Row'];
export type ClientWeapon = Database['public']['Tables']['client_weapons']['Row'];

// Define ProductionOrder type based on the database schema for use within the app
export type ProductionOrder = Database['public']['Tables']['production_orders']['Row'];
export type OrderPayload = {
  orderId: string;
  createdAt: string;
  items: Array<{
    sku: string;
    quantity: number;
  }>;
};

interface ProductionStore {
  orders: ProductionOrder[];
  productTypes: ProductType[];
  woodGrades: WoodGrade[];
  woodSpecies: WoodSpecies[];
  workstations: Workstation[];
  products: Product[];
  isLoadingProducts: boolean;
  isLoadingOrders: boolean;
  isLoadingWorkstations: boolean;
  releaseOrders: ReleaseOrder[];
  isLoadingReleaseOrders: boolean;
  isLoadingClients: boolean;
 oid>;
  fetchReleaseOrders: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchClients: () => Promise<void>;
  fetchWeapons: () => Promise<void>;
  fetchPriceTables: () => Promise<void>;
  importProductsFromPriceTables: () => Promise<void>;
  updateOrder: (id: string, updates: Partial<ProductionOrder>) => void;
  addOrder: (order: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at' | 'status' | 'progress' | 'current_workstation' | 'current_operation'>) => Promise<void>;
  removeOrder: (id: string) => void;
  addProduct: (product: Database['public']['Tables']['products']['Insert'] & { category?: string | null }) => Promise<void>;
  updateProduct: (id: string, updates: Database['public']['Tables']['products']['Update'] & { category?: string | null }) => Promise<void>;
  removeProduct: (productId: string) => void;
  addWeapon: (weapon: Database['public']['Tables']['weapons']['Insert']) => Promise<Weapon | null>;
  updateWeapon: (id: string, updates: Database['public']['Tables']['weapons']['Update']) => Promise<void>;
  removeWeapon: (weaponId: string) => Promise<void>;
  addClient: (client: Database['public']['Tables']['clients']['Insert'], weapons?: { weapon_id: string; identification_number: string }[]) => Promise<void>;
  updateClient: (id: string, updates: Database['public']['Tables']['clients']['Update'], weapons?: { weapon_id: string; identification_number: string }[]) => Promise<void>;
  removeClient: (clientId: string) => Promise<void>;
  moveOrderToNextWorkstation: (orderId: string) => void;
  getOrdersByWorkstation: (workstationId: string) => ProductionOrder[];
  getOrdersByStatus: (status: OrderStatus) => ProductionOrder[];
  fetchProducts: () => Promise<void>;
  generateDefaultRouting: () => Json;
  syncFromOrderManagement: () => Promise<void>;
  loadOrdersFromStorage: (orders: ProductionOrder[]) => void;
  createReleaseOrder: (order: OrderPayload) => Promise<void>;
  releaseOrder: (id: string) => Promise<void>;
  releaseProductionByOrderId: (orderId: string) => void;
}

export const useProductionStore = create<ProductionStore>()(
    (set, get) => ({
      productTypes: [
        { id: 'coronha', name: 'Coronha' },
        { id: 'fuste', name: 'Fuste' },
      ],
      woodGrades: [
        { id: 'grade1', name: 'Grau 1' },
        { id: 'grade2', name: 'Grau 2' },
        { id: 'grade3', name: 'Grau 3' },
        { id: 'grade4', name: 'Grau 4' },
        { id: 'grade5', name: 'Grau 5' },
        { id: 'exhibition', name: 'Exhibition' },
      ],
      woodSpecies: sampleWoodSpecies,
      workstations: [],
      products: [],
      isLoadingProducts: false,
      clients: [],
      weapons: [],
      orders: [],
      isLoadingOrders: true,
      isLoadingWorkstations: true,
      releaseOrders: [],
      isLoadingReleaseOrders: true,
      isLoadingClients: false,
      isLoadingWeapons: false,
      priceTables: [],
      isLoadingPriceTables: false,

      fetchWorkstations: async () => {
        set({ isLoadingWorkstations: true });
        const { data, error } = await supabase
          .from('workstations')
          .select('*, operations(*)')
          .order('name', { ascending: true })
          .order('sequence', { foreignTable: 'operations', ascending: true });

        if (error) {
          console.error('Erro ao buscar postos de trabalho:', error);
          set({ isLoadingWorkstations: false });
          return;
        }
        set({ workstations: data as Workstation[] || [], isLoadingWorkstations: false });
      },

      fetchOrders: async () => {
        set({ isLoadingOrders: true });
        const { data, error } = await supabase
          .from('production_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar ordens de produção:', error);
          set({ isLoadingOrders: false });
          return;
        }
        set({ orders: (data as ProductionOrder[]) || [], isLoadingOrders: false });
      },

      fetchReleaseOrders: async () => {
        set({ isLoadingReleaseOrders: true });
        const { data, error } = await supabase
          .from('release_orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Erro ao buscar encomendas para liberação:', error);
          set({ isLoadingReleaseOrders: false });
          return;
        }
        set({ releaseOrders: (data as ReleaseOrder[]) || [], isLoadingReleaseOrders: false });
      },

      fetchProducts: async () => {
        set({ isLoadingProducts: true });
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (error) {
          console.error('Error fetching products:', error);
          set({ isLoadingProducts: false });
          return;
        }
        set({ products: (data as Product[]) || [], isLoadingProducts: false });
      },

      fetchClients: async () => {
        set({ isLoadingClients: true });
        const { data, error } = await supabase.from('clients').select('*').order('first_name');
        if (error) {
          console.error('Error fetching clients:', error);
          toast.error('Erro ao carregar clientes');
          set({ isLoadingClients: false });
          return;
        }
        set({ clients: (data as Client[]) || [], isLoadingClients: false });
      },

      fetchWeapons: async () => {
        set({ isLoadingWeapons: true });
        const { data, error } = await supabase.from('weapons').select('*').order('brand');
        if (error) {
          console.error('Error fetching weapons:', error);
          toast.error('Erro ao carregar armas');
          set({ isLoadingWeapons: false });
          return;
        }
        // Mapear os campos snake_case do banco para camelCase se necessário, 
        // mas aqui vamos assumir que o resto da app será atualizado para usar os tipos do banco.
        set({ weapons: (data as Weapon[]) || [], isLoadingWeapons: false });
      },

      fetchPriceTables: async () => {
        set({ isLoadingPriceTables: true });
        // Adicionado `count: 'exact'` para depuração.
        const { data, error, count } = await supabase.from('price_tables').select('*', { count: 'exact' }).order('name');

        if (error) {
          console.error('Error fetching price tables:', error);
          toast.error('Erro ao carregar tabelas de preços', {
            description: `[${error.code}] ${error.message}`
          });
          set({ isLoadingPriceTables: false });
          return;
        }
        console.log(`[store] Tabelas de preços carregadas: ${data?.length ?? 0} (Contagem da base de dados: ${count})`);
        set({ priceTables: (data as PriceTable[]) || [], isLoadingPriceTables: false });
      },

      importProductsFromPriceTables: async () => {
        set({ isLoadingProducts: true });
        try {
          const { data: priceTables, error: ptError } = await supabase.from('price_tables').select('*');
          if (ptError) throw ptError;

          if (!priceTables || priceTables.length === 0) {
            toast.info('Nenhuma tabela de preços encontrada.');
            set({ isLoadingProducts: false });
            return;
          }

          const productsToInsert: Database['public']['Tables']['products']['Insert'][] = [];

          (priceTables as PriceTable[]).forEach((pt) => {
            const items = pt.items as { description: string; price: number }[] | null;
            if (Array.isArray(items)) {
              items.forEach((item) => {
                productsToInsert.push({
                  name: item.description,
                  sku: `IMP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
                  description: `Importado de ${pt.name}. Preço Base: ${item.price}€`,
                  product_type: 'Outro',
                });
              });
            }
          });

          if (productsToInsert.length === 0) {
            toast.info('Nenhum item encontrado para importar.');
            set({ isLoadingProducts: false });
            return;
          }

          const { error: insertError } = await supabase.from('products').insert(productsToInsert);
          if (insertError) throw insertError;

          toast.success(`${productsToInsert.length} produtos importados com sucesso!`);
          await get().fetchProducts();
        } catch (error) {
          console.error('Erro ao importar produtos:', error);
          toast.error('Erro ao importar produtos das tabelas de preços.');
          set({ isLoadingProducts: false });
        }
      },

      addProduct: async (productData) => {
        // Remove id se estiver vazio ou indefinido para deixar o Supabase gerar o UUID
        const payload = { ...productData };
        if (!payload.id) {
          delete payload.id;
        }

        const { data, error } = await supabase.from('products').insert(payload).select().single();
        if (error) {
          console.error('Error adding product:', error);
          toast.error('Erro ao criar o produto', {
            description: getSafeErrorMessage(error, 'Product creation'),
          });
          return;
        }
        if (data) {
          set((state) => ({
            products: [...state.products, data as Product].sort((a, b) => a.name.localeCompare(b.name)),
          }));
          toast.success('Produto criado com sucesso!');
        }
      },

      updateProduct: async (id, updates) => {
        const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
        if (error) {
          console.error('Error updating product:', error);
          toast.error('Erro ao atualizar o produto', {
            description: getSafeErrorMessage(error, 'Product update'),
          });
          return;
        }
        if (data) {
          set((state) => ({
            products: state.products.map((p) => (p.id === id ? (data as Product) : p)),
          }));
          toast.success('Produto atualizado com sucesso!');
        }
      },

      removeProduct: async (productId) => {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) {
          console.error('Error removing product:', error);
          toast.error('Erro ao remover o produto.', { description: getSafeErrorMessage(error, 'Product removal') });
        } else {
          set((state) => ({ products: state.products.filter((p) => p.id !== productId) }));
          toast.success('Produto removido com sucesso.');
        }
      },

      addWeapon: async (weaponData) => {
        const payload = { ...weaponData };
        if (!payload.id) delete payload.id;

        const { data, error } = await supabase.from('weapons').insert(payload).select().single();
        if (error) {
          console.error('Error adding weapon:', error);
          toast.error('Erro ao adicionar arma', { description: getSafeErrorMessage(error, 'Weapon creation') });
          return null;
        }
        if (data) {
          set((state) => ({ weapons: [...state.weapons, data as Weapon] }));
          toast.success('Arma adicionada com sucesso!');
          return data as Weapon;
        }
        return null;
      },

      updateWeapon: async (id, updates) => {
        const { data, error } = await supabase.from('weapons').update(updates).eq('id', id).select().single();
        if (error) {
          console.error('Error updating weapon:', error);
          toast.error('Erro ao atualizar arma', { description: getSafeErrorMessage(error, 'Weapon update') });
          return;
        }
        if (data) {
          set((state) => ({
            weapons: state.weapons.map((w) => (w.id === id ? (data as Weapon) : w)),
          }));
          toast.success('Arma atualizada com sucesso!');
        }
      },

      removeWeapon: async (weaponId) => {
        const { error } = await supabase.from('weapons').delete().eq('id', weaponId);
        if (error) {
          console.error('Error removing weapon:', error);
          toast.error('Erro ao remover arma', { description: getSafeErrorMessage(error, 'Weapon removal') });
        } else {
          set((state) => ({ weapons: state.weapons.filter((w) => w.id !== weaponId) }));
          toast.success('Arma removida com sucesso.');
        }
      },

      addClient: async (clientData, weapons = []) => {
        const payload = { ...clientData };
        if (!payload.id) delete payload.id;

        const { data: client, error } = await supabase.from('clients').insert(payload).select().single();
        if (error) {
          console.error('Error adding client:', error);
          toast.error('Erro ao adicionar cliente', { description: getSafeErrorMessage(error, 'Client creation') });
          return;
        }

        if (client && weapons.length > 0) {
          const clientWeapons = weapons.map(w => ({
            client_id: (client as Client).id,
            weapon_id: w.weapon_id,
            identification_number: w.identification_number
          }));

          const { error: weaponsError } = await supabase.from('client_weapons').insert(clientWeapons);
          if (weaponsError) {
            console.error('Error adding client weapons:', weaponsError);
            toast.error('Cliente criado, mas erro ao associar armas', { description: weaponsError.message });
          }
        }

        if (client) {
          set((state) => ({ clients: [...state.clients, client as Client] }));
          toast.success('Cliente adicionado com sucesso!');
        }
      },

      updateClient: async (id, updates, weapons) => {
        const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
        if (error) {
          console.error('Error updating client:', error);
          toast.error('Erro ao atualizar cliente', { description: getSafeErrorMessage(error, 'Client update') });
          return;
        }

        if (weapons) {
          // Remove existing weapons association
          const { error: deleteError } = await supabase.from('client_weapons').delete().eq('client_id', id);
          if (deleteError) {
            console.error('Error removing existing client weapons:', deleteError);
          }

          // Add new weapons association
          if (weapons.length > 0) {
            const clientWeapons = weapons.map(w => ({
              client_id: id,
              weapon_id: w.weapon_id,
              identification_number: w.identification_number
            }));

            const { error: insertError } = await supabase.from('client_weapons').insert(clientWeapons);
            if (insertError) {
              console.error('Error updating client weapons:', insertError);
              toast.error('Cliente atualizado, mas erro ao atualizar armas', { description: insertError.message });
            }
          }
        }

        if (data) {
          set((state) => ({
            clients: state.clients.map((c) => (c.id === id ? (data as Client) : c)),
          }));
          toast.success('Cliente atualizado com sucesso!');
        }
      },

      removeClient: async (clientId) => {
        const { error } = await supabase.from('clients').delete().eq('id', clientId);
        if (error) {
          console.error('Error removing client:', error);
          toast.error('Erro ao remover cliente', { description: getSafeErrorMessage(error, 'Client removal') });
        } else {
          set((state) => ({ clients: state.clients.filter((c) => c.id !== clientId) }));
          toast.success('Cliente removido com sucesso.');
        }
      },

  generateDefaultRouting: () => {
    const workstations = get().workstations;
    const steps = workstations.flatMap(ws =>
      ws.operations.map(op => ({
        workstationId: ws.id,
        operationId: op.id,
        name: op.name,
        status: 'pending',
      }))
    );
    return { steps };
  },

  addOrder: async (orderData) => {
    const routing = orderData.routing ?? get().generateDefaultRouting();
    const firstStep = (routing as { steps?: { workstationId: string, name: string }[] })?.steps?.[0];

    const orderToInsert: Database['public']['Tables']['production_orders']['Insert'] = {
      ...orderData, // Assumes orderData is already snake_case
      routing,
      status: 'in-progress',
      progress: 0,
      current_workstation: firstStep?.workstationId || PRODUCTION_ROUTING.DEFAULT_WORKSTATION,
      current_operation: firstStep?.name || PRODUCTION_ROUTING.DEFAULT_OPERATION,
    };

    const { data, error } = await supabase
      .from('production_orders')
      .insert(orderToInsert)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar ordem de produção:', error);
      // TODO: Adicionar feedback de erro para o utilizador
      return;
    }
    if (data) {
      set((state) => ({
        orders: [data as ProductionOrder, ...state.orders],
      }));
    }
  },

  updateOrder: async (id, updates) => {
    const { data, error } = await supabase
      .from('production_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar ordem de produção:', error);
      return;
    }
    if (data) {
      set((state) => ({
        orders: state.orders.map((order) => (order.id === id ? (data as ProductionOrder) : order)),
      }));
    }
  },

  removeOrder: async (id) => {
    const { error } = await supabase.from('production_orders').delete().eq('id', id);
    if (error) console.error('Erro ao remover ordem de produção:', error);
    else set((state) => ({ orders: state.orders.filter((order) => order.id !== id) }));
  },

  moveOrderToNextWorkstation: (orderId) => {
    // This is a simplified implementation
    // In a real app, you'd have logic to determine the next workstation based on the production flow
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    // For now, just update progress and potentially status
    const newProgress = Math.min(order.progress + 20, 100);
    const newStatus: OrderStatus = newProgress === 100 ? 'completed' : 'in-progress';

    get().updateOrder(orderId, {
      progress: newProgress,
      status: newStatus,
    });
  },

  getOrdersByWorkstation: (workstationId) => {
    return get().orders.filter(order => order.current_workstation === workstationId && order.status !== 'completed');
  },

  getOrdersByStatus: (status) => {
    return get().orders.filter(order => order.status === status);
  },

  syncFromOrderManagement: async () => {
    await integrationService.syncOrdersFromOrderManagement(get());
  },

  loadOrdersFromStorage: (orders: ProductionOrder[]) => {
    set({ orders });
  },

  createReleaseOrder: async (order) => {
    const exists = get().releaseOrders.some(
      (p) => p.external_order_id === order.orderId
    );
    if (exists) return;

    const { data, error } = await supabase
      .from('release_orders')
      .insert({
        external_order_id: order.orderId,
        items: order.items,
        status: 'blocked'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar encomenda para liberação:', error);
      return;
    }
    set((state) => ({ releaseOrders: [data as ReleaseOrder, ...state.releaseOrders] }));
  },

  releaseOrder: async (id: string) => {
    const orderToRelease = get().releaseOrders.find((p) => p.id === id);
    if (!orderToRelease || orderToRelease.status !== 'blocked') return;

    try {
      // 1. Create the production order
      await get().addOrder({
        order_number: `OM-${orderToRelease.external_order_id}`,
        related_order_id: orderToRelease.external_order_id,
        client: { id: 'unknown', name: `Cliente ${orderToRelease.external_order_id}` },
        products: ((orderToRelease.items || []) as OrderPayload['items']).map((item) => ({
          product_id: item.sku,
          quantity: item.quantity,
        })),
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        routing: get().generateDefaultRouting(),
      });

      // 2. Update the release order status
      const { data, error } = await supabase.from('release_orders').update({ status: 'released' }).eq('id', id).select().single();
      if (error) throw error;

      // 3. Update local state
      set((state) => ({
        releaseOrders: state.releaseOrders.map((p) => (p.id === id ? (data as ReleaseOrder) : p)),
      }));
    } catch (error) {
      console.error('Erro ao liberar encomenda para produção:', error);
      // TODO: Add user feedback for the error
    }
  },

  releaseProductionByOrderId: (orderId) => {
    const orderToRelease = get().releaseOrders.find((p) => p.external_order_id === orderId);
    if (orderToRelease) get().releaseOrder(orderToRelease.id);
  },
    })
);