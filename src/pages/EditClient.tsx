import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
<<<<<<< HEAD
import { useProductionStore, type Client } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
=======
import { Textarea } from "@/components/ui/textarea";
import { useProductionStore, type Client } from "@/lib/store";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const getClientDisplayName = (client: Client) => {
  return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Sem nome';
};
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395

interface ClientFormProps {
  client: Client;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ClientForm = ({ client, onSave, onCancel }: ClientFormProps) => {
<<<<<<< HEAD
  const [firstName, setFirstName] = useState(client.first_name || '');
  const [lastName, setLastName] = useState(client.last_name || '');
  const [email, setEmail] = useState(client.email || '');
  const [phone, setPhone] = useState(client.phone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) return;

    onSave({
      ...client,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
=======
  const weapons = useProductionStore((state) => state.weapons);
  const addressData = (client.address as any) || {};
  
  const [firstName, setFirstName] = useState(client.first_name || "");
  const [lastName, setLastName] = useState(client.last_name || "");
  const [email, setEmail] = useState(client.email || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [address, setAddress] = useState(addressData.street || "");
  const [notes, setNotes] = useState(addressData.notes || "");
  const [weaponIds, setWeaponIds] = useState<string[]>(addressData.weaponIds || []);
  const [selectedWeaponToAdd, setSelectedWeaponToAdd] = useState("");

  const handleAddWeapon = () => {
    if (selectedWeaponToAdd && !weaponIds.includes(selectedWeaponToAdd)) {
      setWeaponIds([...weaponIds, selectedWeaponToAdd]);
      setSelectedWeaponToAdd("");
    }
  };

  const handleRemoveWeapon = (id: string) => {
    setWeaponIds(weaponIds.filter(wId => wId !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    onSave({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: { street: address.trim(), notes: notes.trim(), weaponIds },
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Dados do Cliente</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
<<<<<<< HEAD
              <Label htmlFor="firstName">Nome Próprio</Label>
=======
              <Label htmlFor="firstName">Primeiro Nome</Label>
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apelido</Label>
<<<<<<< HEAD
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
=======
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395
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
<<<<<<< HEAD
=======
          <div className="space-y-2">
            <Label htmlFor="address">Morada</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Armas Associadas</Label>
            <div className="flex gap-2">
              <Select value={selectedWeaponToAdd} onValueChange={setSelectedWeaponToAdd}>
                <SelectTrigger><SelectValue placeholder="Selecionar arma para associar..." /></SelectTrigger>
                <SelectContent>
                  {weapons.filter(w => !weaponIds.includes(w.id)).map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.brand} {w.model} ({w.serial_number})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddWeapon} variant="secondary">
                <Plus className="h-4 w-4 mr-2" /> Adicionar
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              {weaponIds.map(id => {
                const weapon = weapons.find(w => w.id === id);
                if (!weapon) return null;
                return (
                  <div key={id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                    <span className="text-sm">{weapon.brand} {weapon.model} - <span className="text-muted-foreground">{weapon.serial_number}</span></span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveWeapon(id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
              {weaponIds.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Nenhuma arma associada.</p>
              )}
            </div>
          </div>
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395

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

<<<<<<< HEAD
  const handleSave = async (data: Omit<Client, 'id'>) => {
=======
  const handleSave = (data: any) => {
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395
    if (id) {
      await updateClient(id, data);
      navigate("/clients");
    }
  };

  return (
    <div className="flex flex-col h-screen">
<<<<<<< HEAD
      <Header
        title="Editar Cliente"
        subtitle={`A editar: ${client.first_name} ${client.last_name}`}
      />
=======
      <Header title="Editar Cliente" subtitle={`A editar: ${getClientDisplayName(client)}`} />
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395
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
