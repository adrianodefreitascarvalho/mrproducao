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
import { useNavigate } from "react-router-dom";

const NewClient = () => {
  const navigate = useNavigate();
  const addClient = useProductionStore((state) => state.addClient);
  const weapons = useProductionStore((state) => state.weapons);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [weaponIds, setWeaponIds] = useState<string[]>([]);
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
    
    addClient({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: { street: address.trim(), notes: notes.trim(), weaponIds } as any,
    });
    navigate("/clients");
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Novo Cliente" subtitle="Adicionar um novo cliente" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/clients")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar aos Clientes
            </Button>
          </div>

          <Card>
            <CardHeader><CardTitle>Dados do Cliente</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Primeiro Nome</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apelido</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
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

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/clients")}>Cancelar</Button>
                  <Button type="submit">Criar Cliente</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewClient;
