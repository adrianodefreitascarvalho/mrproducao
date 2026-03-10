import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Save, FileDown } from "lucide-react";
import { useProductionStore, type Client, type Weapon, type ProductionOrder } from "@/lib/store";
import { generatePdf } from "@/lib/pdfGenerator";

type BodyMeasurement = {
  id: string;
  order_id?: string | null;
  client_id?: string | null;
  weapon_id?: string | null;
  units: 'cm' | 'inches';
  body_measurements_open_palm1?: number | null;
  body_measurements_open_palm2?: number | null;
  body_measurements_open_palm3?: number | null;
  body_measurements_open_palm4?: number | null;
  body_measurements_open_palm5?: number | null;
  body_measurements_open_palm6?: number | null;
  body_measurements_body1?: number | null;
  body_measurements_body2?: number | null;
  body_measurements_body3?: number | null;
  body_measurements_weight?: number | null;
  body_measurements_age?: number | null;
  body_measurements_hand_in_position1?: number | null;
  body_measurements_hand_in_position2?: number | null;
  body_measurements_hand_in_position3?: number | null;
  body_measurements_between_hands?: number | null;
  created_at: string;
};

const EMPTY_FORM_DATA: Omit<BodyMeasurement, 'id' | 'created_at'> = {
    order_id: '', client_id: '', weapon_id: '', units: 'cm',
    body_measurements_open_palm1: undefined, body_measurements_open_palm2: undefined, body_measurements_open_palm3: undefined,
    body_measurements_open_palm4: undefined, body_measurements_open_palm5: undefined, body_measurements_open_palm6: undefined,
    body_measurements_body1: undefined, body_measurements_body2: undefined, body_measurements_body3: undefined,
    body_measurements_weight: undefined, body_measurements_age: undefined,
    body_measurements_hand_in_position1: undefined, body_measurements_hand_in_position2: undefined, body_measurements_hand_in_position3: undefined,
    body_measurements_between_hands: undefined
};

const BodyMeasurements = () => {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clients: Client[] = useProductionStore((state: any) => state.clients);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const weapons: Weapon[] = useProductionStore((state: any) => state.weapons);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders: ProductionOrder[] = useProductionStore((state: any) => state.orders);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchClients = useProductionStore((state: any) => state.fetchClients);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchWeapons = useProductionStore((state: any) => state.fetchWeapons);

  const fetchBodyMeasurements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('body_measurements').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error("Erro ao carregar medidas corporais.");
      console.error(error);
    } else {
      setMeasurements((data as BodyMeasurement[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
    fetchWeapons();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBodyMeasurements();
  }, [fetchClients, fetchWeapons, fetchBodyMeasurements]);

  const resetForm = () => {
    setFormData(EMPTY_FORM_DATA);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: BodyMeasurement) => {
    setFormData({
        ...EMPTY_FORM_DATA,
        ...Object.fromEntries(Object.entries(item).map(([key, value]) => [key, value === null ? undefined : value]))
    });
    setEditingId(item.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este registo?')) {
      const { error } = await supabase.from('body_measurements').delete().eq('id', id);
      if (error) {
        toast.error("Erro ao eliminar registo.");
      } else {
        toast.success("Registo eliminado com sucesso.");
        fetchBodyMeasurements();
      }
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number | null | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value === '' || value === null ? undefined : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: { [key: string]: unknown } = {};
    for (const key of Object.keys(formData) as Array<keyof typeof formData>) {
      payload[key] = formData[key] === undefined ? null : formData[key];
    }

    if (editingId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('body_measurements') as any).update(payload).eq('id', editingId);
      if (error) {
        toast.error("Erro ao atualizar o registo.");
        console.error(error);
      } else {
        toast.success("Registo atualizado com sucesso!");
        resetForm();
        fetchBodyMeasurements();
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('body_measurements') as any).insert(payload);
      if (error) {
        toast.error("Erro ao criar o registo.");
        console.error(error);
      } else {
        toast.success("Registo criado com sucesso!");
        resetForm();
        fetchBodyMeasurements();
      }
    }
  };

  const handleGeneratePdf = async (itemId: string) => {
    const item = measurements.find(d => d.id === itemId);
    if (!item) {
      toast.error("Registo não encontrado para gerar PDF.");
      return;
    }

    const client = clients.find(c => c.id === item.client_id);
    const order = orders.find(o => o.id === item.order_id);

    const fullData = {
      ...item,
      client_name: client ? `${client.first_name} ${client.last_name}`.trim() : 'N/A',
      order_number: order?.order_number || 'N/A',
      creation_date: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-PT') : 'N/A',
    };

    const templatePath = '/pdf-templates/body_measurements.pdf';
    const schemaPath = '/pdf-templates/body_measurements_schema.json';
    const clientName = client ? `${client.first_name}_${client.last_name}`.replace(/\s+/g, '_') : 'desconhecido';
    const outputFileName = `FolhaObra_MedidasCorpo_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`;

    toast.info("A gerar PDF...");
    try {
      await generatePdf(templatePath, schemaPath, fullData, outputFileName);
    } catch (e) {
      console.error("PDF Generation Error:", e);
      toast.error("Falha ao gerar PDF.");
    }
  };

  const clientNameMap = useMemo(() => Object.fromEntries(clients.map((c: Client) => [c.id, `${c.first_name} ${c.last_name}`])), [clients]);

  const renderField = (label: string, field: keyof typeof formData, showUnits = true) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}{showUnits ? ` (${formData.units})` : ''}</Label>
      <Input id={field} type="number" step="0.01" value={formData[field] ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field, e.target.value)} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      <Header title="Medidas Corporais" subtitle="Registo de medidas corporais do atirador" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => { if (isFormOpen) resetForm(); else setIsFormOpen(true); }}>
            {isFormOpen ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {isFormOpen ? 'Cancelar' : 'Novo Registo'}
          </Button>
        </div>

        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Medidas' : 'Novas Medidas Corporais'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* --- Associações --- */}
                <CardTitle className="text-lg pt-4">Associações</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="client_id">Cliente</Label>
                        <Select value={formData.client_id || ''} onValueChange={(value: string) => handleInputChange('client_id', value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {clients.map((c: Client) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="order_id">Ordem de Produção</Label>
                        <Select value={formData.order_id || ''} onValueChange={(value: string) => handleInputChange('order_id', value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {orders.map((o: ProductionOrder) => <SelectItem key={o.id} value={o.id}>{o.order_number}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weapon_id">Arma</Label>
                        <Select value={formData.weapon_id || ''} onValueChange={(value: string) => handleInputChange('weapon_id', value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {weapons.map((w: Weapon) => <SelectItem key={w.id} value={w.id}>{w.brand} {w.model}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* --- Configuração --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="units">Unidade</Label>
                        <Select value={formData.units} onValueChange={(value: 'cm' | 'inches') => handleInputChange('units', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cm">cm (Centímetros)</SelectItem>
                                <SelectItem value="inches">inches (Polegadas)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* --- Palma Aberta --- */}
                <CardTitle className="text-lg pt-4">Palma da Mão Aberta (Open Palm)</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderField("Open Palm 1", "body_measurements_open_palm1")}
                    {renderField("Open Palm 2", "body_measurements_open_palm2")}
                    {renderField("Open Palm 3", "body_measurements_open_palm3")}
                    {renderField("Open Palm 4", "body_measurements_open_palm4")}
                    {renderField("Open Palm 5", "body_measurements_open_palm5")}
                    {renderField("Open Palm 6", "body_measurements_open_palm6")}
                </div>

                {/* --- Corpo --- */}
                <CardTitle className="text-lg pt-4">Corpo (Body)</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderField("Body 1", "body_measurements_body1")}
                    {renderField("Body 2", "body_measurements_body2")}
                    {renderField("Body 3", "body_measurements_body3")}
                </div>

                {/* --- Mão em Posição --- */}
                <CardTitle className="text-lg pt-4">Mão em Posição (Hand in Position)</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderField("Hand Pos 1", "body_measurements_hand_in_position1")}
                    {renderField("Hand Pos 2", "body_measurements_hand_in_position2")}
                    {renderField("Hand Pos 3", "body_measurements_hand_in_position3")}
                </div>

                {/* --- Outros --- */}
                <CardTitle className="text-lg pt-4">Outros Dados</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderField("Entre Mãos", "body_measurements_between_hands")}
                    {renderField("Peso (kg)", "body_measurements_weight", false)}
                    {renderField("Idade", "body_measurements_age", false)}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit"><Save className="mr-2 h-4 w-4" /> {editingId ? 'Guardar Alterações' : 'Criar Registo'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Registos de Medidas Corporais</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Ordem</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">A carregar...</TableCell>
                            </TableRow>
                        ) : measurements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Nenhum registo encontrado.</TableCell>
                            </TableRow>
                        ) : (
                            measurements.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.client_id ? clientNameMap[item.client_id] : 'N/A'}</TableCell>
                                    <TableCell>{orders.find((o: ProductionOrder) => o.id === item.order_id)?.order_number || 'N/A'}</TableCell>
                                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleGeneratePdf(item.id)} title="Gerar PDF">
                                            <FileDown className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BodyMeasurements;