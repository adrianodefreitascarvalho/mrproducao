import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Pencil, Trash2, Plus, Save, X, Minus, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useProductionStore } from "@/lib/store";

// Type definitions
type SalesOrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
type SalesOrderPriority = 'Alta' | 'Media' | 'Baixa';

type GripType = 'Punho Normal' | 'Punho Pistola' | 'Punho anatómico com dedos' | 'Punho anatómico sem dedos' | 'Punho papo de rôla';
type CheckeringType = 'Normal' | 'Laser' | 'Personalizado';

interface OrderItem {
  id: string;
  weaponId?: string;
  productId?: string;
  woodId?: string;
  quantity: number;
  unitPrice?: number;
  gripType?: GripType;
  stockLength?: number;
  lengthOfPull?: number;
  dropAtComb?: number;
  dropAtHeel?: number;
  castHeel?: number;
  castToe?: number;
  pitchAngle?: number;
  checkeringType?: CheckeringType;
  lpi?: number;
}

interface WoodStockItem {
  id: string;
  sku: string;
  type: string;
  species?: string;
  grade: string;
  price?: number;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  status: SalesOrderStatus;
  priority: SalesOrderPriority;
  clientId: string;
  weaponId?: string;
  clientName?: string;
  clientEmail?: string;
  shippingAddress?: string;
  deliveryDate?: string;
  observations?: string;
  createdAt: string;
  totalAmount?: number;
  items: OrderItem[];
}

const EMPTY_FORM_DATA: Omit<SalesOrder, 'id' | 'createdAt'> = {
  orderNumber: "", status: "pending", priority: "Media", clientId: "", weaponId: "",
  clientName: "", clientEmail: "", shippingAddress: "", deliveryDate: "", observations: "",
  totalAmount: 0, items: []
};

const GRIP_TYPES: GripType[] = ['Punho Normal', 'Punho Pistola', 'Punho anatómico com dedos', 'Punho anatómico sem dedos', 'Punho papo de rôla'];
// const CHECKERING_TYPES: CheckeringType[] = ['Normal', 'Laser', 'Personalizado'];

const getClientName = (client: any) => {
  if (client.name) return client.name;
  return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Sem nome';
};

export default function SalesOrders() {
  const clients = useProductionStore(state => state.clients);
  const weapons = useProductionStore(state => state.weapons);
  // const updateClient = useProductionStore(state => state.updateClient);
  
  const [woodStock, setWoodStock] = useState<WoodStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [, setIsAssociatingWeapon] = useState(false);
  // const [weaponToAssociate, setWeaponToAssociate] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const [orders, setOrders] = useState<SalesOrder[]>(() => {
    try {
      const saved = localStorage.getItem("sales-orders");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    const savedWood = localStorage.getItem("wood-stock-items");
    if (savedWood) setWoodStock(JSON.parse(savedWood));
  }, [isFormOpen]);

  useEffect(() => {
    localStorage.setItem("sales-orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (isFormOpen && !editingId) {
      const deliveryDate = new Date();
      deliveryDate.setMonth(deliveryDate.getMonth() + 2);
      setFormData(prev => ({ ...prev, deliveryDate: deliveryDate.toISOString().split('T')[0] }));
    }
  }, [isFormOpen, editingId]);

  const fetchOrders = async () => {
    setLoading(true);
    try { await new Promise(resolve => setTimeout(resolve, 500)); }
    catch (error) { console.error("Erro ao carregar encomendas", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const resetForm = () => {
    setFormData(EMPTY_FORM_DATA); setEditingId(null); setIsFormOpen(false);
    setFormError(null); setCurrentStep(1); setIsAssociatingWeapon(false);
  };

  const handleEdit = (order: SalesOrder) => {
    setFormData({
      orderNumber: order.orderNumber, status: order.status, clientId: order.clientId,
      weaponId: order.weaponId || "", priority: order.priority, clientName: order.clientName || "",
      clientEmail: order.clientEmail || "", shippingAddress: order.shippingAddress || "",
      deliveryDate: order.deliveryDate || "", observations: order.observations || "",
      totalAmount: order.totalAmount || 0, items: order.items.map(item => ({ ...item })),
    });
    setEditingId(order.id); setIsFormOpen(true); setFormError(null); setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem a certeza que deseja eliminar esta encomenda?")) {
      setOrders(orders.filter((order) => order.id !== id));
    }
  };

  const toggleSelectAll = () => { setSelectedOrders(selectedOrders.length === orders.length ? [] : orders.map((o) => o.id)); };
  const toggleSelectOrder = (id: string) => { setSelectedOrders(prev => prev.includes(id) ? prev.filter((oId) => oId !== id) : [...prev, id]); };

  const handleDeleteSelected = () => {
    if (window.confirm(`Tem a certeza que pretende eliminar ${selectedOrders.length} encomendas?`)) {
      setOrders(orders.filter((order) => !selectedOrders.includes(order.id)));
      setSelectedOrders([]);
    }
  };

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { id: crypto.randomUUID(), quantity: 1, weaponId: formData.weaponId }] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items]; newItems.splice(index, 1);
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);
    setFormData({ ...formData, items: newItems, totalAmount: newTotal });
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number | undefined): void => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'woodId') {
      const wood = woodStock.find((w) => w.id === value);
      if (wood && wood.price !== undefined) newItems[index].unitPrice = Number(wood.price) || 0;
    }
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);
    setFormData({ ...formData, items: newItems, totalAmount: newTotal });
  };

  /* handleAssociateWeapon removed - kept for future use
  const handleAssociateWeapon = () => {
    if (formData.clientId && weaponToAssociate) {
      const client = clients.find(c => c.id === formData.clientId);
      if (client) {
        const addressData = (client.address as any) || {};
        const currentWeapons = addressData.weaponIds || [];
        updateClient(client.id, { address: { ...addressData, weaponIds: [...currentWeapons, weaponToAssociate] } as any });
        setFormData({ ...formData, weaponId: weaponToAssociate });
        setIsAssociatingWeapon(false); setWeaponToAssociate("");
      }
    }
  };
  */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) { setFormError("A encomenda deve ter pelo menos um item."); return; }

    if (editingId) {
      setOrders(orders.map(order => order.id === editingId ? { ...order, ...formData, id: editingId } : order));
    } else {
      const now = new Date();
      const prefix = `E${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const currentSequences = orders.filter(o => o.orderNumber.startsWith(prefix)).map(o => { const seq = parseInt(o.orderNumber.slice(7)); return isNaN(seq) ? 0 : seq; });
      const nextSequence = currentSequences.length > 0 ? Math.max(...currentSequences) + 1 : 1;
      const newOrderNumber = `${prefix}${String(nextSequence).padStart(5, '0')}`;
      const newOrder: SalesOrder = { ...formData, id: crypto.randomUUID(), createdAt: new Date().toISOString(), orderNumber: newOrderNumber };
      setOrders([...orders, newOrder]);
    }
    resetForm();
  };

  const statusVariant: Record<SalesOrderStatus, BadgeProps['variant']> = {
    pending: 'secondary', confirmed: 'default', processing: 'default', completed: 'success', cancelled: 'destructive'
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col h-screen">
      <Header title="Encomendas de Venda" subtitle="Consulta de encomendas do sistema externo" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-end gap-2">
          {selectedOrders.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar ({selectedOrders.length})
            </Button>
          )}
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar Dados
          </Button>
          <Button onClick={() => { if (isFormOpen) resetForm(); else { setIsFormOpen(true); setCurrentStep(1); } }}>
            {isFormOpen ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {isFormOpen ? 'Fechar' : 'Nova Encomenda'}
          </Button>
        </div>

        {isFormOpen && (
          <Card className="animate-in fade-in slide-in-from-top-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{editingId ? 'Editar Encomenda' : 'Nova Encomenda'}</CardTitle>
                <div className="text-sm text-muted-foreground">Passo {currentStep} de 3</div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderNumber">Nº Encomenda</Label>
                        <Input id="orderNumber" value={formData.orderNumber || "Gerado automaticamente"} disabled className="bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client">Cliente</Label>
                        <Select onValueChange={(value) => {
                          const c = clients.find(cl => cl.id === value);
                          setFormData({...formData, clientId: value, clientName: c ? getClientName(c) : '', weaponId: ""});
                          setIsAssociatingWeapon(false);
                        }} value={formData.clientId} required>
                          <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                          <SelectContent>
                            {clients.map(c => <SelectItem key={c.id} value={c.id}>{getClientName(c)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weapon">Arma da Encomenda</Label>
                        <Select onValueChange={(value) => setFormData({...formData, weaponId: value})} value={formData.weaponId} disabled={!formData.clientId}>
                          <SelectTrigger><SelectValue placeholder="Selecione a arma" /></SelectTrigger>
                          <SelectContent>
                            {formData.clientId && (() => {
                              const client = clients.find(c => c.id === formData.clientId);
                              const addressData = (client?.address as any) || {};
                              const clientWeaponIds = addressData.weaponIds || [];
                              const weaponIdsToShow = formData.weaponId && !clientWeaponIds.includes(formData.weaponId) 
                                ? [...clientWeaponIds, formData.weaponId] : clientWeaponIds;
                              return weaponIdsToShow.map((wid: string) => {
                                const w = weapons.find(wp => wp.id === wid);
                                return w ? <SelectItem key={w.id} value={w.id}>{w.brand} {w.model} ({w.serial_number})</SelectItem> : null;
                              });
                            })()}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select onValueChange={(value: SalesOrderPriority) => setFormData({...formData, priority: value})} value={formData.priority}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Alta">Alta</SelectItem>
                            <SelectItem value="Media">Média</SelectItem>
                            <SelectItem value="Baixa">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryDate">Data de Entrega</Label>
                        <Input id="deliveryDate" type="date" value={formData.deliveryDate} onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observations">Observações</Label>
                      <Textarea id="observations" value={formData.observations} onChange={(e) => setFormData({...formData, observations: e.target.value})} maxLength={1000} />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold">Itens da Encomenda</Label>
                      <Button type="button" size="sm" variant="secondary" onClick={handleAddItem}>
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Item
                      </Button>
                    </div>
                    {formData.items.map((item, index) => (
                      <Card key={item.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Produto</Label>
                            <Select value={item.productId || ''} onValueChange={(value) => handleItemChange(index, 'productId', value)}>
                              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                              <SelectContent>
                                {woodStock.map(w => <SelectItem key={w.id} value={w.id}>{w.sku} - {w.grade}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Quantidade</Label>
                            <Input type="number" min="1" max="10000" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Punho</Label>
                            <Select value={item.gripType || ''} onValueChange={(value) => handleItemChange(index, 'gripType', value)}>
                              <SelectTrigger><SelectValue placeholder="Tipo de punho..." /></SelectTrigger>
                              <SelectContent>
                                {GRIP_TYPES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItem(index)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {formData.items.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">Adicione pelo menos um item.</div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Resumo da Encomenda</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Nº Encomenda:</span><span>{formData.orderNumber || 'Auto'}</span>
                      <span className="text-muted-foreground">Cliente:</span><span>{formData.clientName}</span>
                      <span className="text-muted-foreground">Prioridade:</span><span>{formData.priority}</span>
                      <span className="text-muted-foreground">Itens:</span><span>{formData.items.length}</span>
                      <span className="text-muted-foreground">Total:</span><span>{(formData.totalAmount || 0).toFixed(2)} €</span>
                    </div>
                  </div>
                )}

                {formError && <div className="text-sm text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" />{formError}</div>}

                <div className="flex justify-between pt-4">
                  <div>
                    {currentStep > 1 && <Button type="button" variant="outline" onClick={prevStep}><ArrowLeft className="h-4 w-4 mr-2" /> Anterior</Button>}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                    {currentStep < 3 ? (
                      <Button type="button" onClick={nextStep}>Seguinte <ArrowRight className="h-4 w-4 ml-2" /></Button>
                    ) : (
                      <Button type="submit"><Save className="h-4 w-4 mr-2" /> {editingId ? 'Guardar' : 'Criar Encomenda'}</Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={orders.length > 0 && selectedOrders.length === orders.length} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead>Nº Encomenda</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell><Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={() => toggleSelectOrder(order.id)} /></TableCell>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.clientName}</TableCell>
                  <TableCell><Badge variant={order.priority === 'Alta' ? 'destructive' : 'secondary'}>{order.priority}</Badge></TableCell>
                  <TableCell><Badge variant={statusVariant[order.status] || 'secondary'}>{order.status}</Badge></TableCell>
                  <TableCell>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(order)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(order.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow><TableCell colSpan={7} className="h-24 text-center">Nenhuma encomenda encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
