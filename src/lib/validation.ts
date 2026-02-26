/**
 * Zod validation schemas for form inputs across the application.
 * Prevents injection attacks, data corruption, and logic errors.
 */
import { z } from 'zod';

// Sanitize text to prevent XSS - strips HTML tags
export function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

// ===== Sales Order Validation =====

export const OrderItemSchema = z.object({
  id: z.string().min(1),
  weaponId: z.string().optional(),
  productId: z.string().optional(),
  woodId: z.string().optional(),
  quantity: z.number().int().positive('A quantidade deve ser positiva.').max(10000, 'Quantidade máxima: 10.000'),
  unitPrice: z.number().min(0, 'O preço não pode ser negativo.').optional(),
  gripType: z.string().max(100).optional(),
  stockLength: z.number().min(0).max(5000).optional(),
  lengthOfPull: z.number().min(0).max(5000).optional(),
  dropAtComb: z.number().min(-500).max(500).optional(),
  dropAtHeel: z.number().min(-500).max(500).optional(),
  castHeel: z.number().min(-500).max(500).optional(),
  castToe: z.number().min(-500).max(500).optional(),
  pitchAngle: z.number().min(-90).max(90).optional(),
  checkeringType: z.string().max(50).optional(),
  lpi: z.number().min(0).max(100).optional(),
});

export const SalesOrderSchema = z.object({
  orderNumber: z.string().max(50).optional(),
  status: z.enum(['pending', 'confirmed', 'processing', 'completed', 'cancelled']),
  priority: z.enum(['Alta', 'Media', 'Baixa']),
  clientId: z.string().min(1, 'Selecione um cliente.'),
  weaponId: z.string().optional(),
  clientName: z.string().max(200).optional(),
  clientEmail: z.string().email('Email inválido.').max(255).or(z.literal('')).optional(),
  shippingAddress: z.string().max(500).optional(),
  deliveryDate: z.string().max(20).optional(),
  observations: z.string().max(1000, 'Observações não podem exceder 1000 caracteres.').optional(),
  totalAmount: z.number().min(0).optional(),
  items: z.array(OrderItemSchema).min(1, 'A encomenda deve ter pelo menos um item.'),
});

export type ValidatedSalesOrder = z.infer<typeof SalesOrderSchema>;

// ===== Production Order Validation =====

export const ProductionOrderFormSchema = z.object({
  orderNumber: z.string().max(50),
  clientId: z.string().min(1, 'Selecione um cliente.'),
  workstationId: z.string().optional(),
  operation: z.string().optional(),
  products: z.array(z.object({
    productId: z.string().min(1, 'Selecione um produto.'),
    quantity: z.string().regex(/^\d+$/, 'Quantidade inválida.'),
  })).min(1, 'Adicione pelo menos um produto.'),
  dueDate: z.string().min(1, 'Selecione uma data de entrega.'),
  notes: z.string().max(1000).optional(),
});

export type ValidatedProductionOrder = z.infer<typeof ProductionOrderFormSchema>;
