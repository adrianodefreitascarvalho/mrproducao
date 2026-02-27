import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductionStore, type Client } from "@/lib/store";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const getClientDisplayName = (client: Client) => {
  return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Sem nome';
};

interface ClientFormProps {
  client: Client;
  onSave: (data: Partial<Client>) => void;
  onCancel: () => void;
}

const ClientForm = ({ client, onSave, onCancel }: ClientFormProps) => {
  const weapons = useProductionStore((state) => state.weapons);
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

  useEffect(() => {
    // In a real app, you would fetch the client's associated weapons here.
    // For this example, we'll assume it's empty on load for the edit form.
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
      // Note: Saving the associated weapons should be handled by the `onSave` function,
      // likely involving a separate call to a `client_weapons` table.
      // The `updateClient` in the store doesn't handle this yet.
    });
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
                <Select value={selectedWeaponToAdd} onValueChange={setSelectedWeaponToAdd}>
                  <SelectTrigger id="weapon-select"><SelectValue placeholder="Selecione uma arma" /></SelectTrigger>
                  <SelectContent>
                    {weapons.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.brand} {w.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
    </Card>
  );
};

const EditClient = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clients = useProductionStore((state) => state.clients);
  const updateClient = useProductionStore((state) => state.updateClient);

  const client = clients.find((c) => c.id === id);

  if (!client) {
    navigate("/clients");
    return null;
  }

  const handleSave = async (data: Partial<Client>) => {
    if (id) {
      await updateClient(id, data);
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
