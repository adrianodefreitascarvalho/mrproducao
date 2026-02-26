import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { ArrowLeft as ArrowLeftIcon, Pencil, Save, X, Route, Plus, Minus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom"; 
import { useProductionStore, type ProductionOrder, type Product, type Weapon } from "@/lib/store";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { workstations, OrderStatus } from "@/data/workstations";

const weapons: Weapon[] = [
  {
    id: 'wep-1', brand: 'Beretta', model: '686', serial_number: 'BER-123456', caliber: '12', dominant_hand: 'Direita',
    side_plates: 'Inteiras', barrel_length: 76, barrel_weight: 1.520, forend_weight: 450,
    rib: 'Media', total_weight: 3.550, discipline: 'Fosso Olímpico', competition_frequency: 'Frequente', created_at: ''
  },
  {
    id: 'wep-2', brand: 'Browning', model: 'Citori', serial_number: 'BRO-789012', caliber: '12', dominant_hand: 'Direita',
    side_plates: 'Meias', barrel_length: 81, barrel_weight: 1.580, forend_weight: 470,
    rib: 'Alta', total_weight: 3.750, discipline: 'Compak Sporting', competition_frequency: 'Intensiva', created_at: ''
  },
  {
    id: 'wep-3', brand: 'Benelli', model: '828U', serial_number: 'BEN-345678', caliber: '20', dominant_hand: 'Esquerda',
    side_plates: 'Inteiras falsas', barrel_length: 71, barrel_weight: 1.350, forend_weight: 400,
    rib: 'Rasa', total_weight: 3.100, discipline: 'Caça', competition_frequency: 'Não Frequente', created_at: ''
  },
];

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  'in-progress': 'Em Produção',
  completed: 'Concluído',
  delayed: 'Atrasado',
};

// Interface for the form product state
interface FormProduct {
  productId: string;
  name: string;
  quantity: string;
}

const defaultFormData = {
  orderNumber: '',
  clientId: '',
  weaponId: '',
  workstationId: '',
  operation: '',
  operationProgress: '0',
  status: 'pending' as OrderStatus,
  startDate: '',
  products: [] as FormProduct[],
  dueDate: '',
};

const mapOrderToFormData = (order: ProductionOrder | undefined, products: Product[]) => {
  if (!order) return defaultFormData;
  return {
    orderNumber: order.order_number,
    clientId: order.client?.id || '',
    weaponId: '', // Weapon is not directly on ProductionOrder in DB
    workstationId: order.current_workstation || '',
    operation: order.current_operation || '',
    operationProgress: (order.progress ?? 0).toString(),
    status: (order.status as OrderStatus) || 'pending',
    startDate: order.start_date || '',
    products: order.products.map((p: { product_id: string; quantity: number }) => {
      const product = products.find((prod) => prod.id === p.product_id);
      return {
        productId: p.product_id,
        name: product?.name || p.product_id,
        quantity: p.quantity.toString(),
      };
    }),
    dueDate: order.due_date,
  };
};

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const orders = useProductionStore((state) => state.orders);
  const updateOrder = useProductionStore((state) => state.updateOrder);
  const products = useProductionStore((state) => state.products);
  const clients = useProductionStore((state) => state.clients);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  const handleSave = () => {
    if (id) {
      const client = clients.find(c => c.id === formData.clientId);

      const updates: Partial<ProductionOrder> = {
        order_number: formData.orderNumber,
        // currentWorkstation and currentOperation may be overwritten below if operation reaches 100%
        current_workstation: formData.workstationId,
        current_operation: formData.operation,
        status: formData.status as OrderStatus,
        products: formData.products.map((p: FormProduct) => ({
          product_id: p.productId,
          quantity: parseInt(p.quantity) || 0,
        })),
        due_date: formData.dueDate,
      };

      if (client) updates.client = { id: client.id, name: `${client.first_name} ${client.last_name}` };

      // Handle operation progress advance
       const opPercent = parseInt(formData.operationProgress) || 0;
       if (opPercent < 100) {
        updates.progress = opPercent;
      } else {
        // Find current workstation and operation indexes
        const wsIndex = workstations.findIndex(w => w.id === (formData.workstationId || updates.current_workstation));
        const currentWs = workstations[wsIndex];
        const opIndex = currentWs ? currentWs.operations.findIndex(op => op.name === (formData.operation || updates.current_operation)) : -1;

        if (currentWs && opIndex >= 0 && opIndex < currentWs.operations.length - 1) {
          // Advance to next operation in same workstation
          updates.current_operation = currentWs.operations[opIndex + 1].name;
          updates.progress = 0;
        } else if (wsIndex >= 0 && wsIndex < workstations.length - 1) {
          // Move to next workstation and set to its first operation
          const nextWs = workstations[wsIndex + 1];
          updates.current_workstation = nextWs.id;
          updates.current_operation = nextWs.operations[0].name;
          updates.progress = 0;
        } else {
          // No next operation or workstation -> mark order completed
          updates.status = 'completed';
          updates.progress = 100;
        }
      }

      updateOrder(id, updates);
      navigate("/orders");
    }
  };

  const order = useMemo(() => orders.find((o) => o.id === id), [id, orders]);
  const clientName = useMemo(() => order?.client?.name || '', [order]);
  const weaponModel = useMemo(() => weapons.find(w => w.id === formData.weaponId)?.model || '', [formData.weaponId]);
  const isCompleted = order?.status === 'completed';
  const effectiveIsEditing = isEditing && !isCompleted;

  const viewData = useMemo(() => mapOrderToFormData(order, products), [order, products]);
  const displayData = effectiveIsEditing ? formData : viewData;

  const handleEditClick = () => {
    setFormData(viewData);
    setIsEditing(true);
  };

  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { productId: '', name: '', quantity: '1' }]
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleProductChange = (index: number, field: keyof FormProduct, value: string) => {
    setFormData(prev => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], [field]: value };
      return { ...prev, products: newProducts };
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Ordem de Produção"
        subtitle="Detalhes da ordem de produção"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/orders")}
              className="mb-4"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Voltar para Ordens
            </Button>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Detalhes da Ordem de Produção</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${id}/routing`)}>
                  <Route className="mr-2 h-4 w-4" />
                  Roteiro
                </Button>
                {!effectiveIsEditing && (
                  <Button variant="outline" size="sm" onClick={handleEditClick} disabled={isCompleted}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Número da Ordem</Label>
                    <Input
                      id="orderNumber"
                      value={displayData.orderNumber}
                      readOnly={!effectiveIsEditing}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    {effectiveIsEditing ? (
                      <Select onValueChange={(value) => setFormData({ ...formData, status: value as OrderStatus })} value={displayData.status}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in-progress">Em Produção</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="delayed">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="status"
                        value={statusLabels[displayData.status] || displayData.status}
                        readOnly={true}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={displayData.startDate}
                      readOnly={true}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    {effectiveIsEditing ? (
                      <Select onValueChange={(value) => setFormData({ ...formData, clientId: value })} value={formData.clientId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.first_name} {client.last_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input id="client" value={clientName} readOnly />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weapon">Arma</Label>
                    {effectiveIsEditing ? (
                      <Select onValueChange={(value) => setFormData({ ...formData, weaponId: value })} value={displayData.weaponId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma arma" />
                        </SelectTrigger>
                        <SelectContent>
                          {weapons.map(weapon => (
                            <SelectItem key={weapon.id} value={weapon.id}>{weapon.brand} {weapon.model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input id="weapon" value={weaponModel} readOnly />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workstation">Posto de Trabalho</Label>
                    {effectiveIsEditing ? (
                      <Select
                        onValueChange={(value) => {
                          const ws = workstations.find(w => w.id === value);
                          setFormData({ ...formData, workstationId: value, operation: ws?.operations?.[0]?.name || '' });
                        }}
                        value={displayData.workstationId}
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
                    ) : (
                      <Input id="workstation" value={workstations.find(w => w.id === displayData.workstationId)?.name || ''} readOnly />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operation">Operação</Label>
                    {effectiveIsEditing ? (
                      <Select
                        onValueChange={(value) => setFormData({ ...formData, operation: value })}
                        value={formData.operation}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma operação" />
                        </SelectTrigger>
                        <SelectContent>
                          {(workstations.find(w => w.id === displayData.workstationId)?.operations || []).map(op => (
                            <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input id="operation" value={displayData.operation} readOnly />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operationProgress">Progresso da Operação (%)</Label>
                    <Input
                      id="operationProgress"
                      type="number"
                      min={0}
                      max={100}
                      value={displayData.operationProgress}
                      readOnly={!effectiveIsEditing}
                      onChange={(e) => setFormData({ ...formData, operationProgress: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Produtos</Label>
                    {effectiveIsEditing && (
                      <Button type="button" size="sm" variant="secondary" onClick={handleAddProduct}>
                        <Plus className="h-4 w-4 mr-2" /> Adicionar
                      </Button>
                    )}
                  </div>

                  {displayData.products.map((product, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-2 last:border-0">
                      <div className="col-span-8">
                        <Label className="text-xs" htmlFor={`product-${index}`}>Produto</Label>
                        {effectiveIsEditing ? (
                          <Select
                            onValueChange={(value) => {
                              const productName = products.find(p => p.id === value)?.name || '';
                              handleProductChange(index, 'productId', value);
                              handleProductChange(index, 'name', productName);
                            }}
                            value={product.productId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(prod => (
                                <SelectItem key={prod.id} value={prod.id}>{prod.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={`product-${index}`}
                            value={product.name}
                            readOnly={true}
                          />
                        )}
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs" htmlFor={`quantity-${index}`}>Qtd</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          value={product.quantity}
                          readOnly={!effectiveIsEditing}
                          onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                      {effectiveIsEditing && (
                        <div className="col-span-1">
                          <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveProduct(index)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Prazo de Entrega</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={displayData.dueDate}
                    readOnly={!effectiveIsEditing}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  {effectiveIsEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSave}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/orders")}
                    >
                      Voltar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}