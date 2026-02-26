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
import { workstations } from "@/data/workstations";

export default function NewOrder() {
  const navigate = useNavigate();
  const addOrder = useProductionStore((state) => state.addOrder);
  const storeProducts = useProductionStore((state) => state.products);
  const orders = useProductionStore((state) => state.orders);
  const clients = useProductionStore((state) => state.clients);
  const _storeWeapons = useProductionStore((state) => state.weapons);

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
    setFormData(prev => ({ ...prev, products: [...prev.products, { productId: '', quantity: '1' }] }));
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
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
      .filter((o) => o.order_number.startsWith(datePrefix))
      .map((o) => parseInt(o.order_number.slice(datePrefix.length), 10))
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
    if (!client) return;

    const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Sem nome';

    addOrder({
      order_number: formData.orderNumber,
      client: { id: client.id, name: clientName } as any,
      current_workstation: formData.workstationId || 'preparacao',
      current_operation: formData.operation || 'Escolha da Madeira',
      routing: null,
      products: formData.products.map(p => ({ 
        product_id: p.productId,
        quantity: parseInt(p.quantity) || 0
      })) as any,
      start_date: new Date().toISOString().split('T')[0],
      due_date: formData.dueDate,
      related_order_id: null,
    });

    navigate("/orders");
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Nova Ordem de Produção" subtitle="Criar uma nova ordem de produção" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Produção
            </Button>
          </div>

          <Card>
            <CardHeader><CardTitle>Detalhes da Ordem</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Número da Ordem</Label>
                    <Input id="orderNumber" placeholder="Ex: OP-2024-001" value={formData.orderNumber} onChange={(e) => handleInputChange('orderNumber', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select onValueChange={(value) => handleInputChange('clientId', value)} value={formData.clientId} required>
                      <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {`${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Sem nome'}
                          </SelectItem>
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
                        <Select onValueChange={(value) => handleProductChange(index, 'productId', value)} value={item.productId}>
                          <SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
                          <SelectContent>
                            {storeProducts.map(product => (
                              <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Qtd</Label>
                        <Input type="number" min="1" value={item.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} />
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
                    <Select onValueChange={(value) => {
                      const ws = workstations.find(w => w.id === value);
                      setFormData(prev => ({ ...prev, workstationId: value, operation: ws?.operations?.[0]?.name || '' }));
                    }} value={formData.workstationId} required>
                      <SelectTrigger><SelectValue placeholder="Selecione um posto" /></SelectTrigger>
                      <SelectContent>
                        {workstations.map(ws => (<SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operation">Operação</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, operation: value }))} value={formData.operation} required>
                      <SelectTrigger><SelectValue placeholder="Selecione uma operação" /></SelectTrigger>
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
                  <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => handleInputChange('dueDate', e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" placeholder="Observações adicionais..." rows={3} value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/")}>Cancelar</Button>
                  <Button type="submit">Criar Ordem</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
