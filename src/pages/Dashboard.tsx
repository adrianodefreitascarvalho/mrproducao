import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { WorkstationCard } from "@/components/dashboard/WorkstationCard";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { ProductionChart } from "@/components/dashboard/ProductionChart";
import { workstations, sampleOrders } from "@/data/workstations";
import {
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const getActiveOrdersCount = (workstationId: string) => {
    return sampleOrders.filter(
      (o) => o.currentWorkstation === workstationId && o.status !== "completed"
    ).length;
  };

  const totalOrders = sampleOrders.length;
  const inProgressOrders = sampleOrders.filter(
    (o) => o.status === "in-progress"
  ).length;
  const completedOrders = sampleOrders.filter(
    (o) => o.status === "completed"
  ).length;
  const delayedOrders = sampleOrders.filter(
    (o) => o.status === "delayed"
  ).length;

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Dashboard"
        subtitle="Visão geral da produção"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Ordens"
            value={totalOrders}
            change="Este mês"
            changeType="neutral"
            icon={ClipboardList}
          />
          <StatCard
            title="Em Produção"
            value={inProgressOrders}
            change="+2 desde ontem"
            changeType="positive"
            icon={TrendingUp}
          />
          <StatCard
            title="Concluídas"
            value={completedOrders}
            change="Esta semana"
            changeType="positive"
            icon={CheckCircle2}
          />
          <StatCard
            title="Atrasadas"
            value={delayedOrders}
            change="Requer atenção"
            changeType="negative"
            icon={AlertTriangle}
          />
        </div>

        {/* Workstations Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Postos de Trabalho
            </h2>
            <button
              onClick={() => navigate("/workstations")}
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Chart and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionChart />

          <div className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  Ordens Recentes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Últimas atualizações
                </p>
              </div>
              <button
                onClick={() => navigate("/orders")}
                className="text-sm text-primary hover:underline"
              >
                Ver todas
              </button>
            </div>
            <OrdersTable orders={sampleOrders} limit={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
