import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { useProductionStore } from "@/lib/store";

const NewContact = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nif, setNif] = useState("");
  const [address, setAddress] = useState("");
  const [hearAboutUs, setHearAboutUs] = useState("");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const addClient = useProductionStore((state) => state.addClient);

  // Shooter Profile State
  const [dominantHand, setDominantHand] = useState("");
  const [dominantEye, setDominantEye] = useState("");
  const [glasses, setGlasses] = useState(false);
  const [shootingVision, setShootingVision] = useState("");
  const [shootingDiscipline, setShootingDiscipline] = useState("");
  const [practiceFrequence, setPracticeFrequence] = useState("");
  const [competitionFrequence, setCompetitionFrequence] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) {
      toast.error("O nome próprio ou apelido é obrigatório.");
      return;
    }

    const contactPayload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      nif: nif.trim() || null,
      address: address.trim() ? { street: address.trim() } : null,
      hearaboutus: hearAboutUs.trim() || null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newContact, error: contactError } = await (supabase.from("contacts") as any)
      .insert(contactPayload)
      .select()
      .single();

    if (contactError) {
      toast.error("Erro ao criar contacto");
      console.error(contactError);
      return;
    }
    if (!newContact) {
      toast.error("Falha ao criar o contacto. O registo não foi retornado.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase.from("shooter_profiles") as any)
      .insert({
        contact_id: newContact.id,
        dominant_hand: dominantHand || null,
        dominant_eye: dominantEye || null,
        glasses: glasses,
        shooting_vision: shootingVision || null,
        shooting_discipline: shootingDiscipline || null,
        practice_frequence: practiceFrequence || null,
        competition_frequence: competitionFrequence || null,
      });

    if (profileError) {
      console.error("Erro ao criar perfil de atirador:", profileError);
      toast.warning(
        "Contacto criado, mas houve um erro ao salvar o perfil de atirador."
      );
    }

    if (isOrderPlaced) {
      const { hearaboutus, ...clientPayload } = contactPayload;
      await addClient({
        ...clientPayload,
        source_contact_id: newContact.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    } else {
      if (!profileError) {
        toast.success("Contacto criado com sucesso!");
      }
    }

    navigate("/contacts");
  };
  return (
    <div className="flex flex-col h-screen">
      <Header title="Novo Contacto" subtitle="Adicionar um novo contacto (Lead)" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/contacts")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar aos Contactos
            </Button>
          </div>

          <Card>
            <CardHeader><CardTitle>Dados do Contacto</CardTitle></CardHeader>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nif">NIF</Label>
                    <Input id="nif" value={nif} onChange={(e) => setNif(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hearAboutUs">Como conheceu</Label>
                    <Input id="hearAboutUs" value={hearAboutUs} onChange={(e) => setHearAboutUs(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Morada</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="order-placed" checked={isOrderPlaced} onCheckedChange={(checked) => setIsOrderPlaced(checked === true)} />
                  <Label htmlFor="order-placed" className="cursor-pointer">Encomenda colocada (Criar como Cliente)</Label>
                </div>

                <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                  <Label className="text-base font-semibold">Perfil de Atirador</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dominantHand">Mão Dominante</Label>
                      <Select value={dominantHand} onValueChange={setDominantHand}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Direita">Direita</SelectItem>
                          <SelectItem value="Esquerda">Esquerda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dominantEye">Olho Dominante</Label>
                      <Select value={dominantEye} onValueChange={setDominantEye}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Direito">Direito</SelectItem>
                          <SelectItem value="Esquerdo">Esquerdo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex items-center gap-2 pt-6">
                      <Checkbox id="glasses" checked={glasses} onCheckedChange={(c) => setGlasses(!!c)} />
                      <Label htmlFor="glasses" className="cursor-pointer">Usa Óculos</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shootingVision">Visão de Tiro</Label>
                      <Input id="shootingVision" value={shootingVision} onChange={(e) => setShootingVision(e.target.value)} placeholder="Ex: Correção astigmatismo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shootingDiscipline">Disciplina de Tiro</Label>
                      <Input id="shootingDiscipline" value={shootingDiscipline} onChange={(e) => setShootingDiscipline(e.target.value)} placeholder="Ex: Fosso Olímpico" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="practiceFrequence">Frequência de Prática</Label>
                      <Select value={practiceFrequence} onValueChange={setPracticeFrequence}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Semanal">Semanal</SelectItem>
                          <SelectItem value="Mensal">Mensal</SelectItem>
                          <SelectItem value="Ocasional">Ocasional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="competitionFrequence">Frequência de Competição</Label>
                      <Input id="competitionFrequence" value={competitionFrequence} onChange={(e) => setCompetitionFrequence(e.target.value)} placeholder="Ex: Nacional, Internacional" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/contacts")}>Cancelar</Button>
                  <Button type="submit">Criar Contacto</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewContact;