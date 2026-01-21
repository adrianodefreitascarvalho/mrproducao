import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { workstations, sampleOrders } from "@/data/workstations";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WorkstationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const workstation = workstations.find((w) => w.id === id);
  const workstationOrders = sampleOrders.filter(
    (o) => o.currentWorkstation === id
  );

  if (!workstation) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="Posto não encontrado" />
        <div className="flex-1 flex items-center justify-center">
          <Button onClick={() => navigate("/workstations")}>
            Voltar aos Postos
          </Button>
        </div>
      </div>
    );
  }

  const inProgress = workstationOrders.filter((o) => o.status === "in-progress").length;
  const completed = workstationOrders.filter((o) => o.status === "completed").length;
  const delayed = workstationOrders.filter((o) => o.status === "delayed").length;

  return (
    <div className="flex flex-col h-screen">
      <Header
        title={workstation.name}
        subtitle={`${workstation.operations.length} operações disponíveis`}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/workstations")}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{workstationOrders.length}</p>
              <p className="text-xs text-muted-foreground">Total Ordens</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgress}</p>
              <p className="text-xs text-muted-foreground">Em Produção</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completed}</p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{delayed}</p>
              <p className="text-xs text-muted-foreground">Atrasadas</p>
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Operações deste Posto
          </h3>
          <div className="flex flex-wrap gap-2">
            {workstation.operations.map((op) => (
              <Badge
                key={op.id}
                variant="outline"
                className="px-3 py-1.5 text-sm"
                style={{
                  borderColor: workstation.color,
                  color: workstation.color,
                }}
              >
                {op.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">
            Ordens neste Posto
          </h3>
          {workstationOrders.length > 0 ? (
            <OrdersTable orders={workstationOrders} />
          ) : (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma ordem neste posto de trabalho
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
