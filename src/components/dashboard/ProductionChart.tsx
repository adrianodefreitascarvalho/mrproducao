import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Seg", producao: 24, meta: 30 },
  { name: "Ter", producao: 28, meta: 30 },
  { name: "Qua", producao: 32, meta: 30 },
  { name: "Qui", producao: 27, meta: 30 },
  { name: "Sex", producao: 35, meta: 30 },
  { name: "Sáb", producao: 18, meta: 20 },
  { name: "Dom", producao: 0, meta: 0 },
];

export function ProductionChart() {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Produção Semanal</h3>
          <p className="text-sm text-muted-foreground">
            Unidades produzidas vs meta
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Produção</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Meta</span>
          </div>
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorProducao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 60%, 35%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(210, 60%, 35%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 85%)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(220, 13%, 85%)" }}
            />
            <YAxis
              tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(220, 13%, 85%)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 85%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="meta"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMeta)"
            />
            <Area
              type="monotone"
              dataKey="producao"
              stroke="hsl(210, 60%, 35%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProducao)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
