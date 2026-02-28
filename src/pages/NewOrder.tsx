import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductionStore, type ClientWeapon } from "@/lib/store";
import { useState, useEffect, useMemo } from "react";
import { workstations } from "@/data/workstations";
import type { Caliber, DominantHand, SidePlates, Rib, CompetitionFrequency } from "@/data/workstations";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const caliberOptions: Caliber[] = ['12', '16', '20', '28', '410'];
const dominantHandOptions: DominantHand[] = ['Direita', 'Esquerda'];
const sidePlatesOptions: SidePlates[] = ['Inteiras', 'Inteiras falsas', 'Meias'];
const ribOptions: Rib[] = ['Alta', 'Media', 'Baixa', 'Rasa', 'Ajustável'];
const competitionFrequencyOptions: CompetitionFrequency[] = ['Não Frequente', 'Frequente', 'Intensiva', 'Profissional'];
const weaponCategories = [
  'Platina L – IV',
  'Platina D – IF',
  'Platina SO',
  'Meia Platina',
  'Semi Automática',
  'Carabina',
  'Carabina 2',
  'Ergonómica'
];

export default function NewOrder() {
  const navigate = useNavigate();
  const addOrder = useProductionStore((state) => state.addOrder);
  const storeProducts = useProductionStore((state) => state.products);
  const fetchProducts = useProductionStore((state) => state.fetchProducts);
  const orders = useProductionStore((state) => state.orders);
  const clients = useProductionStore((state) => state.clients);
  const fetchClients = useProductionStore((state) => state.fetchClients);
  const weapons = useProductionStore((state) => state.weapons);
  const fetchWeapons = useProductionStore((state) => state.fetchWeapons);
  const addWeapon = useProductionStore((state) => state.addWeapon);

  const [clientWeapons, setClientWeapons] = useState<ClientWeapon[]>([]);
  const [isLoadingClientWeapons, setIsLoadingClientWeapons] = useState(false);

  // State for new weapon form
  const [isNewWeaponOpen, setIsNewWeaponOpen] = useState(false);
  const [newWeaponBrand, setNewWeaponBrand] = useState("");
  const [newWeaponModel, setNewWeaponModel] = useState("");
  const [newWeaponCategory, setNewWeaponCategory] = useState("");
  const [newWeaponSerial, setNewWeaponSerial] = useState("");
  const [newWeaponCaliber, setNewWeaponCaliber] = useState<Caliber>('12');
  const [newWeaponHand, setNewWeaponHand] = useState<DominantHand>('Direita');
  const [newWeaponPlates, setNewWeaponPlates] = useState<SidePlates>('Meias');
  const [newWeaponBarrelLen, setNewWeaponBarrelLen] = useState('');
  const [newWeaponBarrelWt, setNewWeaponBarrelWt] = useState('');
  const [newWeaponForendWt, setNewWeaponForendWt] = useState('');
  const [newWeaponRib, setNewWeaponRib] = useState<Rib>('Media');
  const [newWeaponTotalWt, setNewWeaponTotalWt] = useState('');
  const [newWeaponDiscipline, setNewWeaponDiscipline] = useState('');
  const [newWeaponFreq, setNewWeaponFreq] = useState<CompetitionFrequency>('Não Frequente');

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
    const newFormData = { ...formData, [field]: value };
    if (field === 'clientId') {
      newFormData.weaponId = ''; // Reset weapon when client changes
      setClientWeapons([]); // Clear weapons immediately
    }
    setFormData(newFormData);
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
    fetchClients();
    fetchProducts();
    fetchWeapons();
  }, [fetchClients, fetchProducts, fetchWeapons]);

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

  useEffect(() => {
    if (!formData.clientId) {
      return;
    }

    const fetchClientWeapons = async () => {
      setIsLoadingClientWeapons(true);
      const { data, error } = await supabase
        .from('client_weapons')
        .select('*')
        .eq('client_id', formData.clientId);

      setIsLoadingClientWeapons(false);
      if (error) {
        toast.error("Erro ao carregar armas do cliente.");
        setClientWeapons([]);
        return;
      }
      setClientWeapons((data as ClientWeapon[]) || []);
    };

    fetchClientWeapons();
  }, [formData.clientId]);

  const availableWeapons = useMemo(() => {
    return clientWeapons.map((cw, index) => {
      const weaponDetails = weapons.find(w => w.id === cw.weapon_id);
      // Cria um valor único para o seletor para evitar chaves duplicadas se o cliente tiver várias armas do mesmo modelo
      const uniqueValue = cw.id || `${cw.weapon_id}_${cw.identification_number}_${index}`;
      return {
        value: uniqueValue,
        originalWeaponId: cw.weapon_id,
        name: weaponDetails ? `${weaponDetails.brand} ${weaponDetails.model} (Série: ${cw.identification_number})` : `Arma ID: ${cw.weapon_id} (Série: ${cw.identification_number})`
      };
    });
  }, [clientWeapons, weapons]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Sem nome';

    // Encontra a arma selecionada para obter o weapon_id original correto
    const selectedWeapon = availableWeapons.find(w => w.value === formData.weaponId);
    const actualWeaponId = selectedWeapon ? selectedWeapon.originalWeaponId : null;

    addOrder({
      order_number: formData.orderNumber,
      client: { id: client.id, name: clientName },
      weapon_id: actualWeaponId,
      routing: null,
      products: formData.products.map(p => ({ 
        product_id: p.productId,
        quantity: parseInt(p.quantity) || 0
      })),
      start_date: new Date().toISOString().split('T')[0],
      due_date: formData.dueDate,
      related_order_id: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    navigate("/orders");
  };

  const handleCreateWeapon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeaponBrand.trim() || !newWeaponModel.trim() || !newWeaponSerial.trim() || !formData.clientId) return;

    const newWeapon = await addWeapon({
      brand: newWeaponBrand.trim(),
      model: newWeaponModel.trim(),
      category: newWeaponCategory || null,
      serial_number: newWeaponSerial.trim(),
      caliber: newWeaponCaliber,
      dominant_hand: newWeaponHand,
      side_plates: newWeaponPlates,
      barrel_length: Number(newWeaponBarrelLen),
      barrel_weight: Number(newWeaponBarrelWt),
      forend_weight: Number(newWeaponForendWt),
      rib: newWeaponRib,
      total_weight: Number(newWeaponTotalWt),
      discipline: newWeaponDiscipline.trim(),
      competition_frequency: newWeaponFreq,
    });

    if (newWeapon) {
      // Associate with client
      const { data: association, error } = await supabase
        .from('client_weapons')
        .insert({
          client_id: formData.clientId,
          weapon_id: newWeapon.id,
          identification_number: newWeapon.serial_number
        })
        .select()
        .single();

      if (error) {
        toast.error("Erro ao associar arma ao cliente.");
      } else {
        const newAssociation = association as ClientWeapon;
        setClientWeapons(prev => [...prev, newAssociation]);
        
        // Select the new weapon
        handleInputChange('weaponId', newAssociation.id);
        
        toast.success("Nova arma criada e seleccionada!");
        setIsNewWeaponOpen(false);
        
        // Reset form
        setNewWeaponBrand("");
        setNewWeaponModel("");
        setNewWeaponCategory("");
        setNewWeaponSerial("");
        setNewWeaponBarrelLen('');
        setNewWeaponBarrelWt('');
        setNewWeaponForendWt('');
        setNewWeaponRib('Media');
        setNewWeaponTotalWt('');
        setNewWeaponDiscipline('');
        setNewWeaponFreq('Não Frequente');
      }
    }
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
                      <SelectTrigger><SelectValue placeholder="Seleccione um cliente" /></SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {`${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Sem nome'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weapon">Arma da Encomenda</Label>
                    <div className="flex gap-2">
                      <Select 
                        onValueChange={(value) => handleInputChange('weaponId', value)} 
                        value={formData.weaponId || undefined} 
                        disabled={!formData.clientId || isLoadingClientWeapons}
                      >
                        <SelectTrigger id="weapon" className="flex-1">
                          <SelectValue placeholder={
                            !formData.clientId 
                              ? "Selecione um cliente primeiro" 
                              : isLoadingClientWeapons 
                                ? "A carregar armas..." 
                                : "Seleccione uma arma"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWeapons.length > 0 ? (
                            availableWeapons.map(weapon => (
                              <SelectItem key={weapon.value} value={weapon.value}>{weapon.name}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-weapon" disabled>Nenhuma arma associada a este cliente</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="icon" onClick={() => setIsNewWeaponOpen(true)} disabled={!formData.clientId} title="Criar nova arma">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
                          <SelectTrigger><SelectValue placeholder="Seleccione um produto" /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder="Seleccione um posto" /></SelectTrigger>
                      <SelectContent>
                        {workstations.map(ws => (<SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operation">Operação</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, operation: value }))} value={formData.operation} required>
                      <SelectTrigger><SelectValue placeholder="Seleccione uma operação" /></SelectTrigger>
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

      <Sheet open={isNewWeaponOpen} onOpenChange={setIsNewWeaponOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl w-full">
          <SheetHeader>
            <SheetTitle>Criar Nova Arma</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleCreateWeapon} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Marca</Label><Input value={newWeaponBrand} onChange={e => setNewWeaponBrand(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Modelo</Label><Input value={newWeaponModel} onChange={e => setNewWeaponModel(e.target.value)} required /></div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={newWeaponCategory} onValueChange={setNewWeaponCategory}>
                <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  {weaponCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Número de Série</Label><Input value={newWeaponSerial} onChange={e => setNewWeaponSerial(e.target.value)} required /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Calibre</Label>
                <Select value={newWeaponCaliber} onValueChange={(v: Caliber) => setNewWeaponCaliber(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{caliberOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mão</Label>
                <Select value={newWeaponHand} onValueChange={(v: DominantHand) => setNewWeaponHand(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{dominantHandOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platinas</Label>
                <Select value={newWeaponPlates} onValueChange={(v: SidePlates) => setNewWeaponPlates(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{sidePlatesOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Comp. Canos (cm)</Label><Input type="number" value={newWeaponBarrelLen} onChange={e => setNewWeaponBarrelLen(e.target.value)} /></div>
              <div className="space-y-2"><Label>Peso Canos (kg)</Label><Input type="number" step="0.001" value={newWeaponBarrelWt} onChange={e => setNewWeaponBarrelWt(e.target.value)} /></div>
              <div className="space-y-2"><Label>Peso Fuste (gr)</Label><Input type="number" value={newWeaponForendWt} onChange={e => setNewWeaponForendWt(e.target.value)} /></div>
              <div className="space-y-2"><Label>Peso Total (kg)</Label><Input type="number" step="0.001" value={newWeaponTotalWt} onChange={e => setNewWeaponTotalWt(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>Fita</Label>
              <Select value={newWeaponRib} onValueChange={(v: Rib) => setNewWeaponRib(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ribOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Disciplina</Label>
              <Input value={newWeaponDiscipline} onChange={e => setNewWeaponDiscipline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select value={newWeaponFreq} onValueChange={(v: CompetitionFrequency) => setNewWeaponFreq(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{competitionFrequencyOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewWeaponOpen(false)}>Cancelar</Button>
              <Button type="submit">Criar Arma</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
