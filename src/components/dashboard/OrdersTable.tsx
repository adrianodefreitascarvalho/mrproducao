import { ProductionOrder, workstations } from "@/data/workstations";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useProductionStore } from "@/lib/store";

interface OrdersTableProps {
  orders: ProductionOrder[];
  limit?: number;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  "in-progress": "Em Produção",
  completed: "Concluído",
  delayed: "Atrasado",
};

export function OrdersTable({ orders, limit }: OrdersTableProps) {
  const products = useProductionStore((state) => state.products);
  const displayOrders = limit ? orders.slice(0, limit) : orders;

  const getWorkstationName = (id: string) => {
    return workstations.find((w) => w.id === id)?.name || id;
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3 text-left">Ordem</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Arma</th>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="px-4 py-3 text-left">Posto Atual</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Progresso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/orders/${order.id}`}
                    className="font-medium text-sm text-foreground hover:text-primary"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {order.client?.name}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {order.weapon?.model || '—'}
                </td>
                <td className="px-4 py-3">
                  <div>
                    {order.products.map((product, index) => (
                      <div key={index}>
                        <p className="text-sm text-foreground">{products.find(p => p.id === product.productId)?.name || 'Produto desconhecido'}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {product.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-foreground">
                      {getWorkstationName(order.currentWorkstation)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.currentOperation}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "status-badge",
                      order.status === "pending" && "status-pending",
                      order.status === "in-progress" && "status-in-progress",
                      order.status === "completed" && "status-completed",
                      order.status === "delayed" && "status-delayed"
                    )}
                  >
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-30">
                    <Progress value={order.progress} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-10">
                      {order.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
