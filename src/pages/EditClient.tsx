import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useProductionStore, type Client } from "@/lib/store";
import type { Caliber, DominantHand, SidePlates, Rib, CompetitionFrequency } from "@/data/workstations";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const getClientDisplayName = (client: Client) => {
  return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Sem nome';
};

interface ClientFormProps {
  client: Client;
  onSave: (data: Partial<Client>, weapons: { weapon_id: string; identification_number: string }[]) => void;
  onCancel: () => void;
}

const ClientForm = ({ client, onSave, onCancel }: ClientFormProps) => {
  const weapons = useProductionStore((state) => state.weapons);
  const weaponCategories = useProductionStore((state) => state.weaponCategories);
  const caliberOptions = useProductionStore((state) => state.calibers);
  const dominantHandOptions = useProductionStore((state) => state.dominantHands);
  const sidePlatesOptions = useProductionStore((state) => state.sidePlates);
  const ribOptions = useProductionStore((state) => state.ribs);
  const competitionFrequencyOptions = useProductionStore((state) => state.competitionFrequencies);

  const addressData = (client.address as { street?: string; notes?: string }) || {};
  
  const [firstName, setFirstName] = useState(client.first_name || "");
  const [lastName, setLastName] = useState(client.last_name || "");
  const [email, setEmail] = useState(client.email || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [address, setAddress] = useState(addressData.street || "");
  const [notes, setNotes] = useState(addressData.notes || "");
  const [clientWeapons, setClientWeapons] = useState<{ weapon_id: string; identification_number: string }[]>([]);
  const [selectedWeaponToAdd, setSelectedWeaponToAdd] = useState("");
  const [currentIdNumber, setCurrentIdNumber] = useState("");

  // State for new weapon form
  const [isNewWeaponOpen, setIsNewWeaponOpen] = useState(false);
  const addWeapon = useProductionStore((state) => state.addWeapon);
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

  useEffect(() => {
    const fetchWeapons = async () => {
      const { data, error } = await supabase
        .from('client_weapons')
        .select('weapon_id, identification_number')
        .eq('client_id', client.id);
      
      if (error) {
        console.error("Erro ao carregar armas do cliente:", error);
        toast.error("Erro ao carregar armas associadas.");
        return;
      }

      if (data) {
        setClientWeapons(data);
      }
    };
    fetchWeapons();
  }, [client.id]);

  const handleAddWeapon = () => {
    if (selectedWeaponToAdd && currentIdNumber && !clientWeapons.some(w => w.weapon_id === selectedWeaponToAdd && w.identification_number === currentIdNumber)) {
      setClientWeapons([...clientWeapons, { weapon_id: selectedWeaponToAdd, identification_number: currentIdNumber }]);
      setSelectedWeaponToAdd("");
      setCurrentIdNumber("");
    }
  };

  const handleRemoveWeapon = (index: number) => {
    setClientWeapons(clientWeapons.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) return;

    onSave({
      ...client,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: { street: address.trim(), notes: notes.trim() },
    }, clientWeapons);
  };

  const handleCreateWeapon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeaponBrand.trim() || !newWeaponModel.trim() || !newWeaponSerial.trim()) return;

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
      // Associar automaticamente a nova arma à lista
      setClientWeapons(prev => [...prev, { weapon_id: newWeapon.id, identification_number: newWeapon.serial_number }]);
      
      setIsNewWeaponOpen(false);
      
      // Reset form
      setNewWeaponBrand("");
      setNewWeaponModel("");
      setNewWeaponCategory("");
      setNewWeaponSerial("");
      setNewWeaponCaliber('12');
      setNewWeaponHand('Direita');
      setNewWeaponPlates('Meias');
      setNewWeaponBarrelLen('');
      setNewWeaponBarrelWt('');
      setNewWeaponForendWt('');
      setNewWeaponRib('Media');
      setNewWeaponTotalWt('');
      setNewWeaponDiscipline('');
      setNewWeaponFreq('Não Frequente');
      
      // Limpar campos de seleção para evitar duplicação visual
      setSelectedWeaponToAdd("");
      setCurrentIdNumber("");
      toast.success("Nova arma criada e associada!");
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Dados do Cliente</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome Próprio</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apelido</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Morada</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div className="space-y-4 border rounded-md p-4 bg-muted/10">
            <Label className="text-base font-semibold">Armas Associadas</Label>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5 space-y-2">
                <Label htmlFor="weapon-select">Modelo da Arma</Label>
                <div className="flex gap-2">
                  <Select value={selectedWeaponToAdd} onValueChange={setSelectedWeaponToAdd}>
                    <SelectTrigger id="weapon-select" className="flex-1"><SelectValue placeholder="Selecione uma arma" /></SelectTrigger>
                    <SelectContent>
                      {weapons.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.brand} {w.model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setIsNewWeaponOpen(true)} title="Criar nova arma">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="md:col-span-5 space-y-2">
                <Label htmlFor="id-number">Nº Identificação (Série)</Label>
                <Input id="id-number" value={currentIdNumber} onChange={(e) => setCurrentIdNumber(e.target.value)} placeholder="Ex: A123456" />
              </div>
              <div className="md:col-span-2">
                <Button type="button" onClick={handleAddWeapon} className="w-full" disabled={!selectedWeaponToAdd || !currentIdNumber}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              {clientWeapons.map((item, index) => {
                const weapon = weapons.find(w => w.id === item.weapon_id);
                return (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-background">
                    <span className="text-sm">{weapon?.brand} {weapon?.model} - <span className="text-muted-foreground font-mono">{item.identification_number}</span></span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveWeapon(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
              {clientWeapons.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-2">Nenhuma arma associada.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar Alterações</Button>
          </div>
        </form>
      </CardContent>

      <Sheet open={isNewWeaponOpen} onOpenChange={setIsNewWeaponOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl w-full">
          <SheetHeader>
            <SheetTitle>Criar Nova Arma</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleCreateWeapon} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input value={newWeaponBrand} onChange={e => setNewWeaponBrand(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input value={newWeaponModel} onChange={e => setNewWeaponModel(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={newWeaponCategory} onValueChange={setNewWeaponCategory}>
                <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  {weaponCategories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número de Série</Label>
              <Input value={newWeaponSerial} onChange={e => setNewWeaponSerial(e.target.value)} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Calibre</Label>
                <Select value={newWeaponCaliber} onValueChange={(v: Caliber) => setNewWeaponCaliber(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{caliberOptions.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mão</Label>
                <Select value={newWeaponHand} onValueChange={(v: DominantHand) => setNewWeaponHand(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{dominantHandOptions.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platinas</Label>
                <Select value={newWeaponPlates} onValueChange={(v: SidePlates) => setNewWeaponPlates(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{sidePlatesOptions.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
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
                <SelectContent>{ribOptions.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
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
                <SelectContent>{competitionFrequencyOptions.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewWeaponOpen(false)}>Cancelar</Button>
              <Button type="submit">Criar Arma</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </Card>
  );
};

const EditClient = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clients = useProductionStore((state) => state.clients);
  const updateClient = useProductionStore((state) => state.updateClient);
  const fetchDropdowns = useProductionStore((state) => state.fetchDropdowns);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  const client = clients.find((c) => c.id === id);

  if (!client) {
    navigate("/clients");
    return null;
  }

  const handleSave = async (data: Partial<Client>, weapons: { weapon_id: string; identification_number: string }[]) => {
    if (id) {
      await updateClient(id, data, weapons);
      navigate("/clients");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Editar Cliente" subtitle={`A editar: ${getClientDisplayName(client)}`} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/clients")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar aos Clientes
            </Button>
          </div>
          <ClientForm key={client.id} client={client} onSave={handleSave} onCancel={() => navigate("/clients")} />
        </div>
      </div>
    </div>
  );
};

export default EditClient;
