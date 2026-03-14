import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProductionStore, type Weapon } from "@/lib/store";
import type { Caliber, DominantHand, SidePlates, Rib, CompetitionFrequency } from "@/data/workstations";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface WeaponFormProps {
  weapon: Weapon;
  onSave: (data: Partial<Omit<Weapon, 'id' | 'created_at'>>) => void;
  onCancel: () => void;
}

const WeaponForm = ({ weapon, onSave, onCancel }: WeaponFormProps) => {
  const weaponCategories = useProductionStore((state) => state.weaponCategories);
  const caliberOptions = useProductionStore((state) => state.calibers);
  const dominantHandOptions = useProductionStore((state) => state.dominantHands);
  const sidePlatesOptions = useProductionStore((state) => state.sidePlates);
  const ribOptions = useProductionStore((state) => state.ribs);
  const competitionFrequencyOptions = useProductionStore((state) => state.competitionFrequencies);

  const [brand, setBrand] = useState(weapon.brand ?? '');
  const [model, setModel] = useState(weapon.model ?? ''); 
  const [category, setCategory] = useState(weapon.category || "");
  const [serialNumber, setSerialNumber] = useState(weapon.serial_number ?? ''); 
  const [caliber, setCaliber] = useState<Caliber | ''>((weapon.caliber as Caliber) || '');
  const [dominantHand, setDominantHand] = useState<DominantHand | ''>((weapon.dominant_hand as DominantHand) || '');
  const [sidePlates, setSidePlates] = useState<SidePlates | ''>((weapon.side_plates as SidePlates) || '');
  const [barrelLength, setBarrelLength] = useState(weapon.barrel_length?.toString() ?? '');
  const [barrelWeight, setBarrelWeight] = useState(weapon.barrel_weight?.toString() ?? '');
  const [forendWeight, setForendWeight] = useState(weapon.forend_weight?.toString() ?? '');
  const [rib, setRib] = useState<Rib | ''>((weapon.rib as Rib) || '');
  const [totalWeight, setTotalWeight] = useState(weapon.total_weight?.toString() ?? '');
  const [discipline, setDiscipline] = useState(weapon.discipline ?? ''); 
  const [competitionFrequency, setCompetitionFrequency] = useState<CompetitionFrequency | ''>((weapon.competition_frequency as CompetitionFrequency) || '');
  const [clientName, setClientName] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [observations, setObservations] = useState((weapon as any).observations || "");

  useEffect(() => {
    const fetchClient = async () => {
      const { data } = await supabase
        .from('client_weapons')
        .select('clients(first_name, last_name)')
        .eq('weapon_id', weapon.id)
        .maybeSingle();

      if (data?.clients) {
        const client = data.clients as unknown as { first_name: string | null, last_name: string | null };
        setClientName(`${client.first_name || ''} ${client.last_name || ''}`.trim());
      }
    };
    fetchClient();
  }, [weapon.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim() || !serialNumber.trim()) return;
    onSave({
      brand: brand.trim(),
      model: model.trim(),
      category: category || null,
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
      observations: observations.trim() || null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Arma</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {clientName && (
            <div className="space-y-2">
              <Label>Cliente Associado</Label>
              <Input value={clientName} readOnly className="bg-muted" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weapon-brand">Marca</Label>
              <Input id="weapon-brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon-model">Modelo</Label>
              <Input id="weapon-model" value={model} onChange={(e) => setModel(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon-category">Categoria</Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger id="weapon-category"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  {weaponCategories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon-serial">Número da Arma</Label>
              <Input id="weapon-serial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weapon-observations">Observações</Label>
            <Textarea id="weapon-observations" placeholder="Notas sobre a arma, estado, etc." value={observations} onChange={(e) => setObservations(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weapon-caliber">Calibre</Label>
              <Select onValueChange={(v) => setCaliber(v as Caliber)} value={caliber}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {caliberOptions.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon-hand">Mão Dominante</Label>
              <Select onValueChange={(v) => setDominantHand(v as DominantHand)} value={dominantHand}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {dominantHandOptions.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon-plates">Platinas</Label>
              <Select onValueChange={(v) => setSidePlates(v as SidePlates)} value={sidePlates}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sidePlatesOptions.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weapon-barrel-length">Compr. Canos (cm)</Label>
              <Input id="weapon-barrel-length" type="number" value={barrelLength} onChange={(e) => setBarrelLength(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon-barrel-weight">Peso Canos (kg)</Label>
              <Input id="weapon-barrel-weight" type="number" step="0.001" value={barrelWeight} onChange={(e) => setBarrelWeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon-forend-weight">Peso Fuste (gr)</Label>
              <Input id="weapon-forend-weight" type="number" value={forendWeight} onChange={(e) => setForendWeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon-total-weight">Peso Total (kg)</Label>
              <Input id="weapon-total-weight" type="number" step="0.001" value={totalWeight} onChange={(e) => setTotalWeight(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weapon-rib">Fita</Label>
              <Select onValueChange={(v) => setRib(v as Rib)} value={rib}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ribOptions.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon-discipline">Disciplina Praticada</Label>
              <Input id="weapon-discipline" value={discipline} onChange={(e) => setDiscipline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weapon-frequency">Frequência de Competição</Label>
              <Select onValueChange={(v) => setCompetitionFrequency(v as CompetitionFrequency)} value={competitionFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {competitionFrequencyOptions.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
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


const EditWeapon = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const weapons = useProductionStore((state) => state.weapons);
  const updateWeapon = useProductionStore((state) => state.updateWeapon);
  const fetchDropdowns = useProductionStore((state) => state.fetchDropdowns);

  const weaponToEdit = useMemo(
    () => weapons.find((w) => w.id === id),
    [weapons, id]
  );

  useEffect(() => {
    fetchDropdowns();
    if (!weaponToEdit) {
      navigate("/weapons");
    }
  }, [weaponToEdit, navigate, fetchDropdowns]);

  const handleSave = async (data: Partial<Omit<Weapon, 'id' | 'created_at'>>) => {
    if (id) {
      await updateWeapon(id, data);
      navigate("/weapons");
    }
  };

  if (!weaponToEdit) {
    return <div>A carregar arma...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Editar Arma"
        subtitle={`A editar: ${weaponToEdit.brand} ${weaponToEdit.model}`}
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

          <WeaponForm
            key={weaponToEdit.id}
            weapon={weaponToEdit}
            onSave={handleSave}
            onCancel={() => navigate("/weapons")}
          />
        </div>
      </div>
    </div>
  );
};

export default EditWeapon;