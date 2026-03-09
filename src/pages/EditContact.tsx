import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useProductionStore } from "@/lib/store";

const EditContact = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const addClient = useProductionStore((state) => state.addClient);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nif, setNif] = useState("");
  const [address, setAddress] = useState("");
  const [hearAboutUs, setHearAboutUs] = useState("");

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isAlreadyClient, setIsAlreadyClient] = useState(false);

  // Shooter Profile State
  const [dominantHand, setDominantHand] = useState("");
  const [dominantEye, setDominantEye] = useState("");
  const [glasses, setGlasses] = useState(false);
  const [shootingVision, setShootingVision] = useState("");
  const [shootingDiscipline, setShootingDiscipline] = useState("");
  const [practiceFrequence, setPracticeFrequence] = useState("");
  const [competitionFrequence, setCompetitionFrequence] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);

      // Fetch Contact
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: contact, error: contactError } = await (supabase.from('contacts') as any)
        .select('*')
        .eq('id', id)
        .single();

      if (contactError) {
        toast.error("Erro ao carregar contacto");
        navigate("/contacts");
        return;
      }

      // Check if a client record exists for this contact
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('source_contact_id', id)
        .maybeSingle();

      if (clientError) {
        console.error("Error checking for existing client:", clientError);
      } else if (client) {
        setIsOrderPlaced(true);
        setIsAlreadyClient(true);
      }

      if (contact) {
        setFirstName(contact.first_name || "");
        setLastName(contact.last_name || "");
        setEmail(contact.email || "");
        setPhone(contact.phone || "");
        setNif(contact.nif || "");
        setHearAboutUs(contact.hearaboutus || "");
        // Handle address JSONB
        const addr = contact.address as { street?: string } | null;
        setAddress(addr?.street || "");
      }

      // Fetch Profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase.from('shooter_profiles') as any)
        .select('*')
        .eq('contact_id', id)
        .maybeSingle();

      if (profile) {
        setDominantHand(profile.dominant_hand || "");
        setDominantEye(profile.dominant_eye || "");
        setGlasses(profile.glasses || false);
        setShootingVision(profile.shooting_vision || "");
        setShootingDiscipline(profile.shooting_discipline || "");
        setPracticeFrequence(profile.practice_frequence || "");
        setCompetitionFrequence(profile.competition_frequence || "");
      }

      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) return;
    if (!id) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: contactError } = await (supabase.from('contacts') as any).update({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      nif: nif.trim() || null,
      address: { street: address.trim() },
      hearaboutus: hearAboutUs.trim() || null,
      updated: new Date().toISOString()
    }).eq('id', id);

    if (contactError) {
      toast.error("Erro ao actualizar contacto");
      console.error(contactError);
      return;
    }

    // Update shooter profile
    const profileData = {
      contact_id: id,
      dominant_hand: dominantHand,
      dominant_eye: dominantEye,
      glasses: glasses,
      shooting_vision: shootingVision,
      shooting_discipline: shootingDiscipline,
      practice_frequence: practiceFrequence,
      competition_frequence: competitionFrequence
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase.from('shooter_profiles') as any).upsert(profileData, { onConflict: 'contact_id' });
    
    if (isOrderPlaced && !isAlreadyClient) {
      await addClient({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        nif: nif.trim() || null,
        address: { street: address.trim() },
        source_contact_id: id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      toast.success("Contacto actualizado e cliente criado com sucesso!");

      if (profileError) {
        console.error("Erro ao actualizar perfil de atirador:", profileError);
        toast.warning("Perfil de atirador não foi salvo.");
      }
    } else if (profileError) {
      console.error("Erro ao actualizar perfil de atirador:", profileError);
      toast.warning("Contacto atualizado, mas houve um erro ao salvar o perfil de atirador.");
    } else {
      toast.success("Contacto actualizado com sucesso!");
    }

    navigate("/contacts");
  };

  if (loading) {
    return <div className="p-6">A carregar...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="Editar Contacto" subtitle={`A editar: ${firstName} ${lastName}`} />
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
                    <Label htmlFor="hearAboutUs">Como nos conheceu</Label>
                    <Input id="hearAboutUs" value={hearAboutUs} onChange={(e) => setHearAboutUs(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Morada</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="order-placed"
                    checked={isOrderPlaced}
                    onCheckedChange={(checked) => {
                      if (!isAlreadyClient) {
                        setIsOrderPlaced(checked === true);
                      }
                    }}
                    disabled={isAlreadyClient}
                  />
                  <Label htmlFor="order-placed" className="cursor-pointer">
                    {isAlreadyClient ? "Este contacto já é um cliente" : "Encomenda colocada (Criar como Cliente)"}
                  </Label>
                </div>

                <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                  <Label className="text-base font-semibold">Perfil de Atirador</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dominantHand">Mão Dominante</Label>
                      <Select value={dominantHand} onValueChange={setDominantHand}>
                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Direita">Direita</SelectItem>
                          <SelectItem value="Esquerda">Esquerda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dominantEye">Olho Dominante</Label>
                      <Select value={dominantEye} onValueChange={setDominantEye}>
                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
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
                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
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
                  <Button type="submit">Guardar Alterações</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditContact;