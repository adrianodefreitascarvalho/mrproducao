import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useProductionStore } from "@/lib/store";
import type { Caliber, DominantHand, SidePlates, Rib, CompetitionFrequency } from "@/data/workstations";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const caliberOptions: Caliber[] = ['12', '16', '20', '28', '410'];
const dominantHandOptions: DominantHand[] = ['Direita', 'Esquerda'];
const sidePlatesOptions: SidePlates[] = ['Inteiras', 'Inteiras falsas', 'Meias'];
const ribOptions: Rib[] = ['Alta', 'Media', 'Baixa', 'Rasa', 'Ajustável'];
const competitionFrequencyOptions: CompetitionFrequency[] = ['Não Frequente', 'Frequente', 'Intensiva', 'Profissional'];

const NewWeapon = () => {
  const navigate = useNavigate();
  const addWeapon = useProductionStore((state) => state.addWeapon);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [caliber, setCaliber] = useState<Caliber>('12');
  const [dominantHand, setDominantHand] = useState<DominantHand>('Direita');
  const [sidePlates, setSidePlates] = useState<SidePlates>('Meias');
  const [barrelLength, setBarrelLength] = useState('');
  const [barrelWeight, setBarrelWeight] = useState('');
  const [forendWeight, setForendWeight] = useState('');
  const [rib, setRib] = useState<Rib>('Media');
  const [totalWeight, setTotalWeight] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [competitionFrequency, setCompetitionFrequency] = useState<CompetitionFrequency>('Não Frequente');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim() || !serialNumber.trim()) {
      return;
    }
    await addWeapon( {
      brand: brand.trim(),
      model: model.trim(), 
      serial_number: serialNumber.trim(),
      caliber,
      dominant_hand: dominantHand,
      side_plates: sidePlates,
      barrel_length: Number(barrelLength),
      barrel_weight: Number(barrelWeight),
      forend_weight: Number(forendWeight), 
      rib,
      total_weight: Number(totalWeight),
      discipline: discipline.trim(),
      competition_frequency: competitionFrequency, 
    });
    navigate("/weapons"); 
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Nova Arma"
        subtitle="Adicionar um novo modelo de arma ao catálogo"
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/weapons")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Catálogo
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Arma</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weapon-brand">Marca</Label>
                    <Input id="weapon-brand" placeholder="Ex: Beretta" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weapon-model">Modelo</Label>
                    <Input id="weapon-model" placeholder="Ex: 686" value={model} onChange={(e) => setModel(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weapon-serial">Número da Arma</Label>
                    <Input id="weapon-serial" placeholder="Ex: A123456" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weapon-caliber">Calibre</Label>
                    <Select onValueChange={(v) => setCaliber(v as Caliber)} value={caliber}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {caliberOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weapon-hand">Mão Dominante</Label>
                    <Select onValueChange={(v) => setDominantHand(v as DominantHand)} value={dominantHand}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {dominantHandOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weapon-plates">Platinas</Label>
                    <Select onValueChange={(v) => setSidePlates(v as SidePlates)} value={sidePlates}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {sidePlatesOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="weapon-barrel-length">Compr. Canos (cm)</Label>
                    <Input id="weapon-barrel-length" type="number" placeholder="Ex: 76" value={barrelLength} onChange={(e) => setBarrelLength(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="weapon-barrel-weight">Peso Canos (kg)</Label>
                    <Input id="weapon-barrel-weight" type="number" step="0.001" placeholder="Ex: 1.520" value={barrelWeight} onChange={(e) => setBarrelWeight(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="weapon-forend-weight">Peso Fuste (gr)</Label>
                    <Input id="weapon-forend-weight" type="number" placeholder="Ex: 450" value={forendWeight} onChange={(e) => setForendWeight(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="weapon-total-weight">Peso Total (kg)</Label>
                    <Input id="weapon-total-weight" type="number" step="0.001" placeholder="Ex: 3.550" value={totalWeight} onChange={(e) => setTotalWeight(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weapon-rib">Fita</Label>
                    <Select onValueChange={(v) => setRib(v as Rib)} value={rib}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ribOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weapon-discipline">Disciplina Praticada</Label>
                    <Input id="weapon-discipline" placeholder="Ex: Fosso Olímpico" value={discipline} onChange={(e) => setDiscipline(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weapon-frequency">Frequência de Competição</Label>
                    <Select onValueChange={(v) => setCompetitionFrequency(v as CompetitionFrequency)} value={competitionFrequency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {competitionFrequencyOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/weapons")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Arma</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewWeapon;