"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

// Tipo para representar um item na tabela de preços
type Item = {
  id: string;
  name: string;
  basePrice: number;
};

// Dados de exemplo. Isto será substituído por uma chamada à API.
const mockData: Record<string, Item[]> = {
  Geral: [
    { id: "1", name: "Item Geral 1", basePrice: 150.0 },
    { id: "2", name: "Item Geral 2", basePrice: 220.5 },
  ],
  "Platina SO": [
    { id: "3", name: "Componente Platina SO A", basePrice: 85.0 },
  ],
  Extras: [
    { id: "4", name: "Gravação Personalizada", basePrice: 50.0 },
    { id: "5", name: "Caixa de Luxo", basePrice: 120.0 },
  ],
};

interface PriceTableProps {
  tableName: string;
}

export function PriceTable({ tableName }: PriceTableProps) {
  // Esta função buscaria os dados da API com base no tableName
  const items = mockData[tableName] || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="w-48 text-right">Preço Base</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">
                {item.basePrice.toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {items.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          Nenhum item encontrado para esta tabela.
        </div>
      )}
    </div>
  );
}