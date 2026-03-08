import { Header } from "@/components/layout/Header";
import { ProductionChart } from "@/components/dashboard/ProductionChart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { workstations } from "@/data/workstations";
import { useProductionStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Reports() {
  const navigate = useNavigate();
  const orders = useProductionStore((state) => state.orders);

  const statusData = [
    { name: "Em Produção", value: orders.filter(o => o.status === 'in-progress').length, color: "hsl(199, 89%, 48%)" },
    { name: "Concluídas", value: orders.filter(o => o.status === 'completed').length, color: "hsl(142, 71%, 45%)" },
    { name: "Atrasadas", value: orders.filter(o => o.status === 'delayed').length, color: "hsl(38, 92%, 50%)" },
    { name: "Pendentes", value: orders.filter(o => o.status === 'pending').length, color: "hsl(220, 14%, 70%)" },
  ];

  const workstationData = workstations.map((ws) => ({
    name: ws.name,
    value: orders.filter((o) => o.current_workstation === ws.id).length,
    color: ws.color,
  })).filter((d) => d.value > 0);
  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Relatórios"
        subtitle="Análise de produção e desempenho"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Produção
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">
              Produção ao Longo do Tempo
            </h3>
            <div className="h-72"><ProductionChart /></div>
          </div>
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">
              Estado das Ordens
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 85%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-muted-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Ordens por Posto de Trabalho
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workstationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={true}
                >
                  {workstationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 13%, 85%)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
