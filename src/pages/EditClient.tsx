import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProductionStore } from "@/lib/store";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Client } from "@/data/workstations";

interface ClientFormProps {
  client: Client;
  onSave: (data: Omit<Client, 'id'>) => void;
  onCancel: () => void;
}

const ClientForm = ({ client, onSave, onCancel }: ClientFormProps) => {
  const weapons = useProductionStore((state) => state.weapons);
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone);
  const [nif, setNif] = useState(client.nif);
  const [address, setAddress] = useState(client.address);
  const [postalCode, setPostalCode] = useState(client.postalCode || "");
  const [city, setCity] = useState(client.city || "");
  const [country, setCountry] = useState(client.country || "Portugal");
  const [notes, setNotes] = useState(client.notes || "");
  const [weaponIds, setWeaponIds] = useState<string[]>(client.weaponIds || []);
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
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      nif: nif.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      city: city.trim(),
      country: country.trim(),
      notes: notes.trim(),
      weaponIds,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <Input id="nif" value={nif} onChange={(e) => setNif(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Morada</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="0000-000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Localidade</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Armas Associadas</Label>
            <div className="flex gap-2">
              <Select value={selectedWeaponToAdd} onValueChange={setSelectedWeaponToAdd}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar arma para associar..." />
                </SelectTrigger>
                <SelectContent>
                  {weapons.filter(w => !weaponIds.includes(w.id)).map(w => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.brand} {w.model} ({w.serialNumber})
                    </SelectItem>
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
                    <span className="text-sm">{weapon.brand} {weapon.model} - <span className="text-muted-foreground">{weapon.serialNumber}</span></span>
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

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
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

  const handleSave = (data: Omit<Client, 'id'>) => {
    if (id) {
      updateClient(id, data);
      navigate("/clients");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Editar Cliente"
        subtitle={`A editar: ${client.name}`}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/clients")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Clientes
            </Button>
          </div>

          <ClientForm
            key={client.id}
            client={client}
            onSave={handleSave}
            onCancel={() => navigate("/clients")}
          />
        </div>
      </div>
    </div>
  );
};

export default EditClient;