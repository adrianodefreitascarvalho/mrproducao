import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
<<<<<<< HEAD
  const [selectedWeapons, setSelectedWeapons] = useState<{ weapon_id: string; identification_number: string }[]>([]);
  const [currentWeaponId, setCurrentWeaponId] = useState("");
  const [currentIdNumber, setCurrentIdNumber] = useState("");
=======
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [weaponIds, setWeaponIds] = useState<string[]>([]);
  const [selectedWeaponToAdd, setSelectedWeaponToAdd] = useState("");
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395

  const handleAddWeapon = () => {
    if (!currentWeaponId || !currentIdNumber) return;
    setSelectedWeapons([...selectedWeapons, { weapon_id: currentWeaponId, identification_number: currentIdNumber }]);
    setCurrentWeaponId("");
    setCurrentIdNumber("");
  };

  const handleRemoveWeapon = (index: number) => {
    setSelectedWeapons(selectedWeapons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    if (!firstName.trim() && !lastName.trim()) return;
    
    await addClient({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    }, selectedWeapons);
=======
    if (!firstName.trim()) return;
    
    addClient({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: { street: address.trim(), notes: notes.trim(), weaponIds } as any,
    });
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395
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

                <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                  <Label className="text-base font-semibold">Associar Armas</Label>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5 space-y-2">
                      <Label htmlFor="weapon-select">Modelo da Arma</Label>
                      <Select value={currentWeaponId} onValueChange={setCurrentWeaponId}>
                        <SelectTrigger id="weapon-select">
                          <SelectValue placeholder="Selecione uma arma" />
                        </SelectTrigger>
                        <SelectContent>
                          {weapons.map((weapon) => (
                            <SelectItem key={weapon.id} value={weapon.id}>
                              {weapon.brand} {weapon.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-5 space-y-2">
                      <Label htmlFor="id-number">Nº Identificação (Série)</Label>
                      <Input id="id-number" value={currentIdNumber} onChange={(e) => setCurrentIdNumber(e.target.value)} placeholder="Ex: A123456" />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="button" onClick={handleAddWeapon} className="w-full" disabled={!currentWeaponId || !currentIdNumber}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedWeapons.map((item, index) => {
                      const weapon = weapons.find(w => w.id === item.weapon_id);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-background border rounded-md">
                          <span className="text-sm">{weapon?.brand} {weapon?.model} - <span className="font-mono text-muted-foreground">{item.identification_number}</span></span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveWeapon(index)}>
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
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                    {selectedWeapons.length === 0 && (
                      <p className="text-sm text-muted-foreground italic text-center py-2">Nenhuma arma associada.</p>
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
