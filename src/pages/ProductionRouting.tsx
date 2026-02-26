import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Route, Settings } from "lucide-react";
import { useProductionStore } from "@/lib/store";
import { workstations, generateDefaultRouting, type ProductionRouting, type RoutingStep } from "@/data/workstations";

export default function ProductionRouting() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const order = useProductionStore((state) => state.orders.find((o) => o.id === id));
  const updateOrder = useProductionStore((state) => state.updateOrder);

  const setWorkstationColor = (element: HTMLElement | null, color: string) => {
    if (element) {
      element.style.setProperty("--workstation-color", color);
    }
  };

  const [routing, setRouting] = useState<ProductionRouting>(
    (order?.routing as unknown as ProductionRouting) || generateDefaultRouting()
  );
  const [selectedWorkstations, setSelectedWorkstations] = useState<string[]>(
    routing.steps.map((step) => step.workstationId)
  );

  if (!order) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="Ordem de Produção" subtitle="Ordem não encontrada" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Ordem de produção não encontrada.</p>
            <Button onClick={() => navigate("/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar às Ordens
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const toggleWorkstation = (workstationId: string) => {
    const isSelected = selectedWorkstations.includes(workstationId);

    if (isSelected) {
      setSelectedWorkstations((prev) => prev.filter((id) => id !== workstationId));
      setRouting((prev) => ({
        ...prev,
        steps: prev.steps.filter((step) => step.workstationId !== workstationId),
      }));
    } else {
      setSelectedWorkstations((prev) => [...prev, workstationId]);
      const ws = workstations.find((w) => w.id === workstationId);
      if (ws) {
        const newStep: RoutingStep = {
          id: crypto.randomUUID(),
          workstationId: ws.id,
          operationIds: ws.operations.map((op) => op.id),
          order: routing.steps.length + 1,
          isRequired: true,
        };
        setRouting((prev) => ({
          ...prev,
          steps: [...prev.steps, newStep],
        }));
      }
    }
  };

  const handleSaveRouting = () => {
    // Save the current routing state which includes specific operation selections
    updateOrder(order.id, { routing: routing as any });
    // Optional: Navigate back or show success toast
  };

  const handleResetToDefault = () => {
    const defaultRouting = generateDefaultRouting();
    setRouting(defaultRouting);
    setSelectedWorkstations(defaultRouting.steps.map((step) => step.workstationId));
    // Removed immediate updateOrder to allow user to review before saving
  };

  const toggleOperation = (workstationId: string, operationId: string) => {
    setRouting((prev) => {
      const updatedSteps = prev.steps.map((step) => {
        if (step.workstationId === workstationId) {
          const newOperationIds = step.operationIds.includes(operationId)
            ? step.operationIds.filter((id) => id !== operationId)
            : [...step.operationIds, operationId];
          return { ...step, operationIds: newOperationIds };
        }
        return step;
      });
      return { ...prev, steps: updatedSteps };
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Roteiro de Produção"
        subtitle={`Ordem: ${order.order_number} - ${(order.client as any)?.name || ''}`}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate(`/orders/${order.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResetToDefault}>
              <Settings className="mr-2 h-4 w-4" />
              Restaurar Padrão
            </Button>
            <Button onClick={handleSaveRouting}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Roteiro
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Selecionar Postos de Trabalho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workstations.map((ws) => (
                <div
                  key={ws.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedWorkstations.includes(ws.id)
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                  onClick={() => toggleWorkstation(ws.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedWorkstations.includes(ws.id)}
                        onCheckedChange={() => toggleWorkstation(ws.id)}
                      />
                      <span className="font-medium">{ws.name}</span>
                    </div>
                    <span className="contents" ref={(el) => setWorkstationColor(el, ws.color)}>
                      <Badge
                        className="text-white workstation-badge-filled"
                        data-workstation-color={ws.color}
                      >
                        {ws.operations.length} ops
                      </Badge>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ws.operations.length} operações disponíveis
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Operações por Posto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workstations
                .filter((ws) => selectedWorkstations.includes(ws.id))
                .map((ws) => {
                  const step = routing.steps.find((s) => s.workstationId === ws.id);
                  return (
                    <div
                      key={ws.id}
                      ref={(el) => setWorkstationColor(el, ws.color)}
                      className="border rounded-lg p-4 border-l-4 workstation-card"
                      data-workstation-color={ws.color}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{ws.name}</h4>
                        <span className="contents" ref={(el) => setWorkstationColor(el, ws.color)}>
                          <Badge variant="outline" className="border-2 workstation-badge" data-workstation-color={ws.color}>
                            {step?.operationIds.length || 0} / {ws.operations.length} operações
                          </Badge>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {ws.operations.map((op) => {
                          const isSelected = step?.operationIds.includes(op.id);
                          return (
                            <label
                              key={op.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-primary/10"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleOperation(ws.id, op.id)}
                              />
                              <span className="text-sm">{op.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Resumo do Roteiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {routing.steps.map((step, index) => {
                const ws = workstations.find((w) => w.id === step.workstationId);
                if (!ws) return null;
                return (
                  <div key={step.id} className="flex items-center">
                    {index > 0 && (
                      <div className="w-8 h-0.5 bg-muted-foreground/30 mx-2" />
                    )}
                    <span key={step.id} className="contents" ref={(el) => setWorkstationColor(el, ws.color)}>
                      <Badge
                        className="text-white workstation-badge-filled"
                        data-workstation-color={ws.color}
                      >
                        {ws.name}
                      </Badge>
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Total: {routing.steps.length} postos de trabalho,{" "}
              {routing.steps.reduce((acc, step) => acc + step.operationIds.length, 0)} operações
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
