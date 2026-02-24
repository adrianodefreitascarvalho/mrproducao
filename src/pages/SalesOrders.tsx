import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

type GripType = 'Punho Normal' | 'Punho Pistola' | 'Punho anatómico com dedos' | 'Punho anatómico sem dedos' | 'Punho papo de rôla';
type CheckeringType = 'Normal' | 'Laser' | 'Personalizado';

interface OrderItem {
  id: string; // Identificador único da linha
  weaponId?: string;
  productId?: string;
  woodId?: string;
  quantity: number;
  unitPrice?: number;
  
  // Step 2
  gripType?: GripType;
  
  // Step 3 - Customization
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
  status: string;
  priority: 'Alta' | 'Media' | 'Baixa';
  clientId: string;
  weaponId?: string; // Arma principal da encomenda
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
  orderNumber: "",
  status: "pending",
  priority: "Media",
  clientId: "",
  weaponId: "",
  clientName: "",
  clientEmail: "",
  shippingAddress: "",
  deliveryDate: "",
  observations: "",
  totalAmount: 0,
  items: []
};

const GRIP_TYPES: GripType[] = ['Punho Normal', 'Punho Pistola', 'Punho anatómico com dedos', 'Punho anatómico sem dedos', 'Punho papo de rôla'];
const CHECKERING_TYPES: CheckeringType[] = ['Normal', 'Laser', 'Personalizado'];

export default function SalesOrders() {
  const clients = useProductionStore(state => state.clients);
  const weapons = useProductionStore(state => state.weapons);
  const updateClient = useProductionStore(state => state.updateClient);
  
  // Ler madeiras do localStorage para garantir sincronia com a página WoodStock
  const [woodStock, setWoodStock] = useState<WoodStockItem[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAssociatingWeapon, setIsAssociatingWeapon] = useState(false);
  const [weaponToAssociate, setWeaponToAssociate] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Estado local inicializado com localStorage para persistência simples
  const [orders, setOrders] = useState<SalesOrder[]>(() => {
    try {
      const saved = localStorage.getItem("sales-orders");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const savedWood = localStorage.getItem("wood-stock-items");
    if (savedWood) setWoodStock(JSON.parse(savedWood));
  }, [isFormOpen]); // Recarregar quando abrir o form

  // Persistir alterações no localStorage
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
    try {
      // Simulação de delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      // Não limpar as encomendas aqui, apenas carregar se fosse uma API real
      // setOrders([]); 
    } catch (error) {
      console.error("Erro ao carregar encomendas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const resetForm = () => {
    setFormData(EMPTY_FORM_DATA);
    setEditingId(null);
    setIsFormOpen(false);
    setFormError(null);
    setCurrentStep(1);
    setIsAssociatingWeapon(false);
    setWeaponToAssociate("");
  };

  const handleEdit = (order: SalesOrder) => {
    setFormData({
      orderNumber: order.orderNumber,
      status: order.status,
      clientId: order.clientId,
      weaponId: order.weaponId || "",
      priority: order.priority,
      clientName: order.clientName || "",
      clientEmail: order.clientEmail || "",
      shippingAddress: order.shippingAddress || "",
      deliveryDate: order.deliveryDate || "",
      observations: order.observations || "",
      totalAmount: order.totalAmount || 0,
      items: order.items.map(item => ({ ...item })),
    });
    setEditingId(order.id);
    setIsFormOpen(true);
    setFormError(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem a certeza que deseja eliminar esta encomenda?")) {
      setOrders(orders.filter((order) => order.id !== id));
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((oId) => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Tem a certeza que pretende eliminar ${selectedOrders.length} encomendas?`)) {
      setOrders(orders.filter((order) => !selectedOrders.includes(order.id)));
      setSelectedOrders([]);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: crypto.randomUUID(), quantity: 1, weaponId: formData.weaponId }
      ]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    
    // Recalcular total
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);
    setFormData({ ...formData, items: newItems, totalAmount: newTotal });
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number | undefined): void => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Se mudou a madeira, atualizar preço (lógica simplificada)
    if (field === 'woodId') {
      const wood = woodStock.find((w) => w.id === value);
      if (wood && wood.price !== undefined) {
        newItems[index].unitPrice = Number(wood.price) || 0;
      }
    }
    
    // Recalcular total
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);
    
    setFormData({ ...formData, items: newItems, totalAmount: newTotal });
  };

  const handleAssociateWeapon = () => {
    if (formData.clientId && weaponToAssociate) {
      const client = clients.find(c => c.id === formData.clientId);
      if (client) {
        const currentWeapons = client.weaponIds || [];
        const { id, ...clientData } = client;
        updateClient(id, { ...clientData, weaponIds: [...currentWeapons, weaponToAssociate] }); // Persist association
        setFormData({ ...formData, weaponId: weaponToAssociate }); // Select it for this order
        setIsAssociatingWeapon(false);
        setWeaponToAssociate("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      setFormError("A encomenda deve ter pelo menos um item.");
      return;
    }

    if (editingId) {
      setOrders(orders.map(order => 
        order.id === editingId 
          ? { ...order, ...formData, id: editingId } 
          : order
      ));
    } else {
      // Gerar Número de Encomenda: E + YYYY + MM + 5 dígitos sequenciais
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `E${year}${month}`;
      
      const currentSequences = orders
        .filter(o => o.orderNumber.startsWith(prefix))
        .map(o => {
          const seq = parseInt(o.orderNumber.slice(7)); // E(1) + YYYY(4) + MM(2) = 7 caracteres de prefixo
          return isNaN(seq) ? 0 : seq;
        });
      
      const nextSequence = currentSequences.length > 0 ? Math.max(...currentSequences) + 1 : 1;
      const newOrderNumber = `${prefix}${String(nextSequence).padStart(5, '0')}`;

      const newOrder: SalesOrder = { ...formData, id: crypto.randomUUID(), createdAt: new Date().toISOString(), orderNumber: newOrderNumber };
      setOrders([...orders, newOrder]);
    }
    resetForm();
  };

  const statusVariant: Record<string, BadgeProps['variant']> = {
    pending: 'secondary',
    confirmed: 'default',
    processing: 'default',
    completed: 'success',
    cancelled: 'destructive'
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Encomendas de Venda"
        subtitle="Consulta de encomendas do sistema externo"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-end gap-2">
          {selectedOrders.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar ({selectedOrders.length})
            </Button>
          )}
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Dados
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
                {/* Passo 1: Dados Gerais */}
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
                          setFormData({...formData, clientId: value, clientName: clients.find(c => c.id === value)?.name, weaponId: ""});
                          setIsAssociatingWeapon(false);
                        }} value={formData.clientId} required>
                          <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                          <SelectContent>
                            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            {formData.clientId && !clients.find(c => c.id === formData.clientId) && (
                              <SelectItem value={formData.clientId}>{formData.clientName || "Cliente Externo"}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        
                        {formData.clientId && (() => {
                          const client = clients.find(c => c.id === formData.clientId);
                          if (client) {
                            if (!client.weaponIds || client.weaponIds.length === 0) {
                              return !formData.weaponId ? (
                                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-xs font-medium">Este cliente não tem armas associadas.</span>
                                  </div>
                                  {!isAssociatingWeapon ? (
                                    <Button type="button" variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => setIsAssociatingWeapon(true)}>
                                      Associar Arma
                                    </Button>
                                  ) : (
                                    <div className="space-y-2">
                                      <Select value={weaponToAssociate} onValueChange={setWeaponToAssociate}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Escolher arma..." /></SelectTrigger>
                                        <SelectContent>{weapons.map(w => <SelectItem key={w.id} value={w.id}>{w.brand} {w.model}</SelectItem>)}</SelectContent>
                                      </Select>
                                      <div className="flex gap-2"><Button type="button" size="sm" className="h-7 text-xs flex-1" onClick={handleAssociateWeapon} disabled={!weaponToAssociate}>Guardar</Button><Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsAssociatingWeapon(false)}>Cancelar</Button></div>
                                    </div>
                                  )}
                                </div>
                              ) : null;
                            }
                          }
                          return null;
                        })()}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weapon">Arma da Encomenda</Label>
                        <Select onValueChange={(value) => setFormData({...formData, weaponId: value})} value={formData.weaponId} disabled={!formData.clientId}>
                          <SelectTrigger><SelectValue placeholder="Selecione a arma" /></SelectTrigger>
                          <SelectContent>
                            {formData.clientId && (() => {
                              const client = clients.find(c => c.id === formData.clientId);
                              const clientWeaponIds = client?.weaponIds || [];
                              // Se a arma selecionada não estiver na lista do cliente, adicionamo-la temporariamente à lista para visualização
                              const weaponIdsToShow = formData.weaponId && !clientWeaponIds.includes(formData.weaponId) 
                                ? [...clientWeaponIds, formData.weaponId] 
                                : clientWeaponIds;

                              return weaponIdsToShow.map(wid => {
                              const w = weapons.find(wp => wp.id === wid);
                              return w ? <SelectItem key={w.id} value={w.id}>{w.brand} {w.model} ({w.serialNumber})</SelectItem> : null;
                            })})()}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select onValueChange={(value: 'Alta' | 'Media' | 'Baixa') => setFormData({...formData, priority: value})} value={formData.priority}>
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
                      <Textarea id="observations" value={formData.observations} onChange={(e) => setFormData({...formData, observations: e.target.value})} />
                    </div>
                  </div>
                )}

                {/* Passo 2: Linhas de Encomenda */}
                {currentStep === 2 && (
                  <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold">Linhas da Encomenda</Label>
                      <Button type="button" size="sm" variant="secondary" onClick={handleAddItem}>
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Linha
                      </Button>
                    </div>
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-2 last:border-0">
                        <div className="col-span-3">
                          <Label className="text-xs">Arma</Label>
                          <Input value={weapons.find(w => w.id === formData.weaponId)?.model || "N/A"} disabled className="h-9 text-xs" />
                        </div>
                        <div className="col-span-3"><Label className="text-xs">Produto</Label><Select onValueChange={(v) => handleItemChange(index, 'productId', v)} value={item.productId || ""}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Produto" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Coronha">Coronha</SelectItem>
                            <SelectItem value="Semi-Automática">Semi-Automática</SelectItem>
                            <SelectItem value="Carabina">Carabina</SelectItem>
                            <SelectItem value="Fuste">Fuste</SelectItem>
                            <SelectItem value="Punho Glove">Punho Glove</SelectItem>
                          </SelectContent>
                        </Select></div>
                        <div className="col-span-3"><Label className="text-xs">Madeira (SKU)</Label><Select onValueChange={(v) => handleItemChange(index, 'woodId', v)} value={item.woodId || ""}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Pesquisar SKU..." /></SelectTrigger>
                          <SelectContent>
                            {woodStock.map((w) => <SelectItem key={w.id} value={w.id}>{w.sku} - {w.type} ({w.grade})</SelectItem>)}
                          </SelectContent>
                        </Select></div>
                        <div className="col-span-2"><Label className="text-xs">Punho</Label><Select onValueChange={(v) => handleItemChange(index, 'gripType', v)} value={item.gripType || ""}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent>{GRIP_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                        <div className="col-span-1"><Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItem(index)}><Minus className="h-4 w-4" /></Button></div>
                      </div>
                    ))}
                    {formData.items.length > 0 && (
                      <div className="text-right text-sm text-muted-foreground mt-2">
                        Total Estimado: {formData.totalAmount?.toFixed(2)}€
                      </div>
                    )}
                  </div>
                )}

                {/* Passo 3: Medidas */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Configuração de Medidas</Label>
                    {formData.items.map((item, index) => {
                      return (
                        <div key={item.id} className="space-y-4 border-b pb-4 mb-4">
                          <h4 className="font-medium text-sm text-primary">Item {index + 1}: {item.productId || 'Produto'} <span className="text-muted-foreground font-normal">({item.gripType || 'Sem punho definido'})</span></h4>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1"><Label className="text-xs">Comp. Coronha (mm)</Label><Input type="number" className="h-8" value={item.stockLength ?? ''} onChange={(e) => handleItemChange(index, 'stockLength', Number(e.target.value))} /></div>
                            <div className="space-y-1"><Label className="text-xs">Length of Pull (mm)</Label><Input type="number" className="h-8" value={item.lengthOfPull ?? ''} onChange={(e) => handleItemChange(index, 'lengthOfPull', Number(e.target.value))} /></div>
                            <div className="space-y-1"><Label className="text-xs">Drop at Comb (mm)</Label><Input type="number" className="h-8" value={item.dropAtComb ?? ''} onChange={(e) => handleItemChange(index, 'dropAtComb', Number(e.target.value))} /></div>
                            <div className="space-y-1"><Label className="text-xs">Drop at Heel (mm)</Label><Input type="number" className="h-8" value={item.dropAtHeel ?? ''} onChange={(e) => handleItemChange(index, 'dropAtHeel', Number(e.target.value))} /></div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1"><Label className="text-xs">Cast On (mm)</Label><Input type="number" className="h-8" value={item.castHeel ?? ''} onChange={(e) => handleItemChange(index, 'castHeel', Number(e.target.value))} /></div>
                            <div className="space-y-1"><Label className="text-xs">Cast Off (mm)</Label><Input type="number" className="h-8" value={item.castToe ?? ''} onChange={(e) => handleItemChange(index, 'castToe', Number(e.target.value))} /></div>
                            <div className="space-y-1"><Label className="text-xs">Pitch Angle (graus)</Label><Input type="number" className="h-8" value={item.pitchAngle ?? ''} onChange={(e) => handleItemChange(index, 'pitchAngle', Number(e.target.value))} /></div>
                            <div className="space-y-1"><Label className="text-xs">LPI</Label><Input type="number" className="h-8" value={item.lpi ?? ''} onChange={(e) => handleItemChange(index, 'lpi', Number(e.target.value))} /></div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1">
                              <Label className="text-xs">Tipo de Serrilhado</Label>
                              <Select onValueChange={(v) => handleItemChange(index, 'checkeringType', v)} value={item.checkeringType || ""}>
                                <SelectTrigger className="h-8"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>{CHECKERING_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                             <div className="space-y-1"><Label className="text-xs">Estilo Punho (Passo 2)</Label><Input className="h-8 bg-muted" value={item.gripType || ''} disabled /></div>
                          </div>

                          <div className="mt-4 pt-4 border-t">
                            <Label htmlFor="totalAmount">Valor Total Estimado (€)</Label>
                            <Input id="totalAmount" type="number" value={(formData.totalAmount || 0).toFixed(2)} readOnly className="bg-muted font-mono font-bold text-lg mt-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {formError && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    {currentStep > 1 && <Button type="button" variant="outline" onClick={prevStep}><ArrowLeft className="w-4 h-4 mr-2" />Anterior</Button>}
                  </div>
                  <div className="flex gap-2">
                    {currentStep < 3 && <Button type="button" onClick={nextStep}>Seguinte<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                    {currentStep === 3 && <Button type="submit"><Save className="w-4 h-4 mr-2" />{editingId ? 'Guardar Alterações' : 'Criar Encomenda'}</Button>}
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
                <TableHead className="w-12">
                  <Checkbox
                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Nº Encomenda</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    {loading ? "A carregar..." : "Nenhuma encomenda encontrada."}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleSelectOrder(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.clientName || order.clientId || "N/A"}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString('pt-PT')}</TableCell>
                    <TableCell>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('pt-PT') : "-"}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell><Badge variant={order.priority === 'Alta' ? 'destructive' : order.priority === 'Media' ? 'default' : 'secondary'}>{order.priority}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[order.status] || 'default'}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.totalAmount !== undefined 
                        ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(order.totalAmount)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(order)} aria-label="Editar">
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)} className="hover:bg-destructive/10" aria-label="Eliminar">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}