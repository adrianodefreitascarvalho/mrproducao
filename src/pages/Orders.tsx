import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductionStore } from "@/lib/store";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function Orders() {
  const navigate = useNavigate();
  const orders = useProductionStore((state) => state.orders);
  const removeOrder = useProductionStore((state) => state.removeOrder);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((oId) => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(`Tem a certeza que pretende eliminar ${selectedOrders.length} ordens?`)) {
      selectedOrders.forEach((id) => removeOrder(id));
      setSelectedOrders([]);
    }
  };

  type BadgeVariant = 'success' | 'destructive' | 'default' | 'secondary';
  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'completed': return 'success';
      case 'delayed': return 'destructive';
      case 'in-progress': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in-progress': return 'Em Produção';
      case 'completed': return 'Concluída';
      case 'delayed': return 'Atrasada';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Ordens de Produção"
        subtitle="Acompanhe todas as ordens de produção"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-end gap-2">
          {selectedOrders.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar ({selectedOrders.length})
            </Button>
          )}
          <Button onClick={handleNewOrder}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Ordem
          </Button>
        </div>
        
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12.5">
                  <Checkbox
                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Arma</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => toggleSelectOrder(order.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.client?.name}</TableCell>
                  <TableCell>{order.weapon?.model}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma ordem encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}