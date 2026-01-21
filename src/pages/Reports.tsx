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
import { workstations, sampleOrders } from "@/data/workstations";

const statusData = [
  { name: "Em Produção", value: 3, color: "hsl(199, 89%, 48%)" },
  { name: "Concluídas", value: 1, color: "hsl(142, 71%, 45%)" },
  { name: "Atrasadas", value: 1, color: "hsl(38, 92%, 50%)" },
  { name: "Pendentes", value: 1, color: "hsl(220, 14%, 70%)" },
];

const workstationData = workstations.map((ws) => ({
  name: ws.name,
  value: sampleOrders.filter((o) => o.currentWorkstation === ws.id).length,
  color: ws.color,
})).filter((d) => d.value > 0);

export default function Reports() {
  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Relatórios"
        subtitle="Análise de produção e desempenho"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionChart />

          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">
              Estado das Ordens
            </h3>
            <div className="h-[250px]">
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
          <div className="h-[300px]">
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
