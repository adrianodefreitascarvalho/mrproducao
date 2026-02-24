import { Header } from "@/components/layout/Header";
import { workstations } from "@/data/workstations";
import { WorkstationCard } from "@/components/dashboard/WorkstationCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useProductionStore } from "@/lib/store";

export default function Workstations() {
  const navigate = useNavigate();
  const orders = useProductionStore((state) => state.orders);

  const getActiveOrdersCount = (workstationId: string) => {
    return orders.filter(
      (o) => o.currentWorkstation === workstationId && o.status !== "completed"
    ).length;
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Postos de Trabalho"
        subtitle="Gestão de todos os postos de trabalho"
      />

      <div className="flex-1 overflow-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workstations.map((ws) => (
            <WorkstationCard
              key={ws.id}
              workstation={ws}
              activeOrders={getActiveOrdersCount(ws.id)}
              onClick={() => navigate(`/workstations/${ws.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
