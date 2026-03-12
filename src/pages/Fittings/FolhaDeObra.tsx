import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductionStore } from "@/lib/store";
import { generatePdf } from "@/lib/pdfGenerator";

interface SalesOrder {
  id: string;
  order_number: string;
  client_id: string | null;
}

export default function FolhaDeObra() {
  const productionOrders = useProductionStore((state) => state.orders);
  const clients = useProductionStore((state) => state.clients);
  const weapons = useProductionStore((state) => state.weapons);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [selectedSalesOrderId, setSelectedSalesOrderId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchSalesOrders = async () => {
      const { data, error } = await supabase.from('sales_orders').select('id, order_number, client_id').order('order_number', { ascending: false });
      if (error) {
        toast.error("Falha ao carregar encomendas.");
        console.error(error);
      } else {
        setSalesOrders(data || []);
      }
    };
    fetchSalesOrders();
  }, []);

  const handleGeneratePdf = async () => {
    if (!selectedSalesOrderId) {
      toast.error("Por favor, selecione uma encomenda.");
      return;
    }
    setIsGenerating(true);
    toast.info("A recolher dados e a gerar PDF...");

    try {
      const productionOrder = productionOrders.find(o => o.related_order_id === selectedSalesOrderId);
      if (!productionOrder) throw new Error("Nenhuma Ordem de Produção encontrada para a encomenda selecionada.");

      const client = clients.find(c => c.id === productionOrder.client.id);

      const { data: gunstockData, error: gunstockError } = await supabase.from('gunstock_dimensions').select('*').eq('order_id', productionOrder.id).order('created_at', { ascending: false }).limit(1).single();

      if (gunstockError && gunstockError.code !== 'PGRST116') { // PGRST116: "exact-one" rows not found
        throw gunstockError;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const weapon = weapons.find(w => w.id === (gunstockData as any)?.weapon_id);

      const fullData = {
        client_name: client ? `${client.first_name} ${client.last_name}`.trim() : 'N/A',
        weapon_id: weapon?.id || 'N/A',
        ...(gunstockData || {}),
      };

      const clientName = client ? `${client.first_name}_${client.last_name}`.replace(/\s+/g, '_') : 'desconhecido';
      const outputFileName = `Folha_de_Obra_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`;

      await generatePdf(
        "/pdf-templates/Folha_de_obra.pdf",
        "/pdf-templates/folha_de_obra_schema.json",
        fullData,
        outputFileName
      );
    } catch (e) {
      toast.error("Falha ao gerar PDF.", { description: (e as Error).message });
      console.error("PDF Generation Error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Folha de Obra" subtitle="Gerar PDF da Folha de Obra a partir de uma Encomenda" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Card>
          <CardHeader><CardTitle>Gerar Folha de Obra</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sales_order_id">Encomenda</Label>
              <Select value={selectedSalesOrderId || ''} onValueChange={setSelectedSalesOrderId}>
                <SelectTrigger id="sales_order_id"><SelectValue placeholder="Selecione uma encomenda..." /></SelectTrigger>
                <SelectContent>{salesOrders.map((so: SalesOrder) => (<SelectItem key={so.id} value={so.id}>{so.order_number} - {clients.find(c => c.id === so.client_id)?.first_name} {clients.find(c => c.id === so.client_id)?.last_name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleGeneratePdf} disabled={!selectedSalesOrderId || isGenerating}>{isGenerating ? "A Gerar..." : "Gerar PDF"}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}