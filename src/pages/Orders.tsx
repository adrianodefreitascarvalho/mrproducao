import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { sampleOrders, OrderStatus } from "@/data/workstations";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const statusFilters: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "in-progress", label: "Em Produção" },
  { value: "completed", label: "Concluídas" },
  { value: "delayed", label: "Atrasadas" },
];

export default function Orders() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");

  const filteredOrders =
    activeFilter === "all"
      ? sampleOrders
      : sampleOrders.filter((o) => o.status === activeFilter);

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Ordens de Produção"
        subtitle={`${sampleOrders.length} ordens no sistema`}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    activeFilter === filter.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Ordem
          </Button>
        </div>

        {/* Orders Table */}
        <OrdersTable orders={filteredOrders} />
      </div>
    </div>
  );
}
