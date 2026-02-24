import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserProductionStore } from "@/lib/UserProductionStore";
import { useProductionStore } from "@/lib/store";
import { useEffect, useState } from "react";

export default function ReleaseOrders() {
  const navigate = useNavigate();
  const productions = useUserProductionStore((state) => state.productions);
  const releaseProduction = useUserProductionStore((state) => state.releaseProduction);
  const productionOrders = useProductionStore((state) => state.orders);
  const [, setRefresh] = useState(0);

  // Force re-render when productions change to ensure UI updates
  useEffect(() => {
    console.log("[ReleaseOrders] Produções carregadas:", productions.length);
  }, [productions]);

  const handleRelease = (id: string) => {
    releaseProduction(id);
    // Force refresh
    setRefresh((prev) => prev + 1);
  };

  const getReleasedOrderCount = () => {
    return productions.filter((p) => p.status === "RELEASED").length;
  };

  const getProductionOrdersFromReleased = () => {
    return productionOrders.filter((o) => o.orderNumber.startsWith("OM-"));
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Libertar Encomendas para Produção"
        subtitle="Gerencie encomendas bloqueadas e liberte-as para produção"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Encomendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bloqueadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {productions.filter((p) => p.status === "BLOCKED").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Libertadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getReleasedOrderCount()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Encomendas a Libertar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Encomendas Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                {productions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma encomenda pendente
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Externo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Itens</TableHead>
                          <TableHead>Data Criação</TableHead>
                          <TableHead>Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productions.map((prod) => (
                          <TableRow key={prod.id}>
                            <TableCell className="font-mono text-sm">
                              {prod.externalOrderId.slice(-6)}
                            </TableCell>
                            <TableCell>
                              {prod.status === "BLOCKED" ? (
                                <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                  <Lock className="h-3 w-3" />
                                  Bloqueada
                                </Badge>
                              ) : (
                                <Badge variant="default" className="flex w-fit items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Libertada
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{prod.items.length}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(prod.createdAt).toLocaleDateString("pt-PT")}
                            </TableCell>
                            <TableCell>
                              {prod.status === "BLOCKED" ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleRelease(prod.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Libertar
                                </Button>
                              ) : (
                                <span className="text-xs text-green-600 font-medium">✓ Libertada</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ordens em Produção */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Status Sincronização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Ordens em Produção
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {getProductionOrdersFromReleased().length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Encomendas libertadas sincronizadas no sistema de produção
                  </p>
                </div>

                {getProductionOrdersFromReleased().length > 0 && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="text-sm font-medium">Últimas Libertadas:</div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {getProductionOrdersFromReleased().slice(-5).map((order) => (
                        <div
                          key={order.id}
                          className="text-xs p-2 bg-green-50 rounded border border-green-200"
                        >
                          <div className="font-mono font-medium">{order.orderNumber}</div>
                          <div className="text-muted-foreground">
                            {typeof order.client === 'string' ? order.client : `${order.client?.name || 'Cliente'}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="w-full"
                  >
                    Ver Dashboard →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
