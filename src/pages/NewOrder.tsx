import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductionStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { workstations, generateDefaultRouting, Weapon } from "@/data/workstations";

const weapons: Weapon[] = [
  {
    id: 'wep-1', brand: 'Beretta', model: '686', serialNumber: 'BER-123456', caliber: '12', dominantHand: 'Direita',
    sidePlates: 'Inteiras', barrelLength: 76, barrelWeight: 1.520, forendWeight: 450,
    rib: 'Media', totalWeight: 3.550, discipline: 'Fosso Olímpico', competitionFrequency: 'Frequente'
  },
  {
    id: 'wep-2', brand: 'Browning', model: 'Citori', serialNumber: 'BRO-789012', caliber: '12', dominantHand: 'Direita',
    sidePlates: 'Meias', barrelLength: 81, barrelWeight: 1.580, forendWeight: 470,
    rib: 'Alta', totalWeight: 3.750, discipline: 'Compak Sporting', competitionFrequency: 'Intensiva'
  },
  {
    id: 'wep-3', brand: 'Benelli', model: '828U', serialNumber: 'BEN-345678', caliber: '20', dominantHand: 'Esquerda',
    sidePlates: 'Inteiras falsas', barrelLength: 71, barrelWeight: 1.350, forendWeight: 400,
    rib: 'Rasa', totalWeight: 3.100, discipline: 'Caça', competitionFrequency: 'Não Frequente'
  },
];

export default function NewOrder() {
  const navigate = useNavigate();
  const addOrder = useProductionStore((state) => state.addOrder);
  const storeProducts = useProductionStore((state) => state.products);
  const orders = useProductionStore((state) => state.orders);
  const clients = useProductionStore((state) => state.clients);
  const updateOrder = useProductionStore((state) => state.updateOrder);

  const [formData, setFormData] = useState({
    orderNumber: '',
    clientId: '',
    weaponId: '',
    workstationId: '',
    operation: '',
    products: [{ productId: '', quantity: '1' }],
    dueDate: '',
    notes: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { productId: '', quantity: '1' }]
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleProductChange = (index: number, field: 'productId' | 'quantity', value: string) => {
    setFormData(prev => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], [field]: value };
      return { ...prev, products: newProducts };
    });
  };

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const datePrefix = `OP-${year}${month}${day}-`;

    const existingSequences = orders
      .filter((o) => o.orderNumber.startsWith(datePrefix))
      .map((o) => parseInt(o.orderNumber.slice(datePrefix.length), 10))
      .filter((n) => !isNaN(n));

    const nextSequence = existingSequences.length > 0 ? Math.max(...existingSequences) + 1 : 1;
    const nextOrderNumber = `${datePrefix}${String(nextSequence).padStart(6, "0")}`;

    const t = setTimeout(() => {
      setFormData((prev) => {
        if (prev.orderNumber) return prev;
        return { ...prev, orderNumber: nextOrderNumber };
      });
    }, 0);
    return () => clearTimeout(t);
  }, [orders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const client = clients.find(c => c.id === formData.clientId);
    const weapon = weapons.find(w => w.id === formData.weaponId);

    if (!client || !weapon) return; // Validação básica

    const routing = generateDefaultRouting();

    if (formData.workstationId) {
      const startStepIndex = routing.steps.findIndex((s) => s.workstationId === formData.workstationId);

      if (startStepIndex !== -1) {
        // Remove previous workstations
        routing.steps = routing.steps.slice(startStepIndex);

        // Filter operations in the current workstation if operation is selected
        if (formData.operation) {
          const currentStep = routing.steps[0];
          const workstation = workstations.find((w) => w.id === formData.workstationId);

          if (workstation) {
            const startOpIndex = workstation.operations.findIndex((op) => op.name === formData.operation);
            if (startOpIndex !== -1) {
              // Keep only operations from the selected one onwards
              const allowedOpIds = workstation.operations.slice(startOpIndex).map((op) => op.id);
              currentStep.operationIds = currentStep.operationIds.filter((id) => allowedOpIds.includes(id));
            }
          }
        }

        // Re-index step orders
        routing.steps.forEach((step, index) => {
          step.order = index + 1;
        });
      }
    }

    addOrder({
      orderNumber: formData.orderNumber,
      client,
      weapon,
      currentWorkstation: formData.workstationId,
      currentOperation: formData.operation,
      routing,
      products: formData.products.map(p => ({ 
        productId: p.productId,
        quantity: parseInt(p.quantity) || 0
      })),
      startDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
    });

    // Update status immediately after creation
    const createdOrder = useProductionStore.getState().orders.find(o => o.orderNumber === formData.orderNumber);
    if (createdOrder) {
      updateOrder(createdOrder.id, { 
        status: 'in-progress',
        ...(formData.workstationId ? { currentWorkstation: formData.workstationId } : {}),
        ...(formData.operation ? { currentOperation: formData.operation } : {})
      });
    }

    // Navigate back to orders list
    navigate("/orders");
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Nova Ordem de Produção"
        subtitle="Criar uma nova ordem de produção"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Produção
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Ordem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Número da Ordem</Label>
                    <Input
                      id="orderNumber"
                      placeholder="Ex: OP-2024-001 (opcional)"
                      value={formData.orderNumber}
                      onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select onValueChange={(value) => handleInputChange('clientId', value)} value={formData.clientId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weapon">Arma</Label>
                    <Select onValueChange={(value) => handleInputChange('weaponId', value)} value={formData.weaponId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma arma" />
                      </SelectTrigger>
                      <SelectContent>
                        {weapons.map(weapon => (
                          <SelectItem key={weapon.id} value={weapon.id}>{weapon.brand} {weapon.model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Produtos a Produzir</Label>
                    <Button type="button" size="sm" variant="secondary" onClick={handleAddProduct}>
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Produto
                    </Button>
                  </div>

                  {formData.products.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-2 last:border-0">
                      <div className="col-span-8">
                        <Label className="text-xs">Produto</Label>
                        <Select 
                          onValueChange={(value) => handleProductChange(index, 'productId', value)} 
                          value={item.productId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {storeProducts.map(product => (
                              <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Qtd</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveProduct(index)} disabled={formData.products.length === 1}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workstation">Posto de Trabalho</Label>
                    <Select
                      onValueChange={(value) => {
                        const ws = workstations.find(w => w.id === value);
                        setFormData(prev => ({ ...prev, workstationId: value, operation: ws?.operations?.[0]?.name || '' }));
                      }}
                      value={formData.workstationId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um posto" />
                      </SelectTrigger>
                      <SelectContent>
                        {workstations.map(ws => (
                          <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operation">Operação</Label>
                    <Select
                      onValueChange={(value) => setFormData(prev => ({ ...prev, operation: value }))}
                      value={formData.operation}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma operação" />
                      </SelectTrigger>
                      <SelectContent>
                        {(workstations.find(w => w.id === formData.workstationId)?.operations || []).map(op => (
                          <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Prazo de Entrega</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações adicionais..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Ordem
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}