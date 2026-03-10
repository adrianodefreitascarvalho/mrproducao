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
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { useProductionStore, type Client, type Weapon, type ProductionOrder } from "@/lib/store";
import { FileDown } from "lucide-react";
import { generatePdf } from "@/lib/pdfGenerator";

type GunstockDimension = {
  id: string;
  order_id?: string | null;
  client_id?: string | null;
  weapon_id?: string | null;
  units: 'cm' | 'inches';
  gunstock_measurements?: number | null;
  gunstock_measurements2?: number | null;
  gunstock_measurements3?: number | null;
  gunstock_measurements4?: number | null;
  gunstock_measurements5?: number | null;
  gunstock_measurements6?: number | null;
  gunstock_measurements7?: number | null;
  gunstock_cast_on1?: number | null;
  gunstock_cast_on2?: number | null;
  gunstock_cast_on3?: number | null;
  gunstock_cast_on4?: number | null;
  gunstock_cast_off1?: number | null;
  gunstock_cast_off2?: number | null;
  gunstock_cast_off3?: number | null;
  gunstock_cast_off4?: number | null;
  gunstock_width1?: number | null;
  gunstock_width2?: number | null;
  gunstock_width3?: number | null;
  gunstock_recoil_pad1?: number | null;
  gunstock_recoil_pad2?: number | null;
  gunstock_recoil_pad3?: number | null;
  created_at: string;
};

const EMPTY_FORM_DATA: Omit<GunstockDimension, 'id' | 'created_at'> = {
    order_id: '', client_id: '', weapon_id: '', units: 'cm',
    gunstock_measurements: undefined, gunstock_measurements2: undefined, gunstock_measurements3: undefined,
    gunstock_measurements4: undefined, gunstock_measurements5: undefined, gunstock_measurements6: undefined,
    gunstock_measurements7: undefined, gunstock_cast_on1: undefined, gunstock_cast_on2: undefined,
    gunstock_cast_on3: undefined, gunstock_cast_on4: undefined, gunstock_cast_off1: undefined,
    gunstock_cast_off2: undefined, gunstock_cast_off3: undefined, gunstock_cast_off4: undefined,
    gunstock_width1: undefined, gunstock_width2: undefined, gunstock_width3: undefined,
    gunstock_recoil_pad1: undefined, gunstock_recoil_pad2: undefined, gunstock_recoil_pad3: undefined,
};

const GunstockDimensions = () => {
  const [dimensions, setDimensions] = useState<GunstockDimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);

  // NOTE: It's best practice to define a type for your Zustand store state
  // to avoid using 'any' here.
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

  const fetchGunstockDimensions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('gunstock_dimensions').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error("Erro ao carregar dimensões da coronha.");
      console.error(error);
    } else {
      setDimensions((data as GunstockDimension[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
    fetchWeapons();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGunstockDimensions();
  }, [fetchClients, fetchWeapons, fetchGunstockDimensions]);

  const resetForm = () => {
    setFormData(EMPTY_FORM_DATA);
    setEditingId(null);
    setIsFormOpen(false);
  };
  const handleEdit = (item: GunstockDimension) => {
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
      const { error } = await supabase.from('gunstock_dimensions').delete().eq('id', id);
      if (error) {
        toast.error("Erro ao eliminar registo.");
      } else {
        toast.success("Registo eliminado com sucesso.");
        fetchGunstockDimensions();
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
      const { error } = await (supabase.from('gunstock_dimensions') as any).update(payload).eq('id', editingId);
      if (error) {
        toast.error("Erro ao actualizar o registo.");
        console.error(error);
      } else {
        toast.success("Registo actualizado com sucesso!");
        resetForm();
        fetchGunstockDimensions();
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('gunstock_dimensions') as any).insert(payload);
      if (error) {
        toast.error("Erro ao criar o registo.");
        console.error(error);
      } else {
        toast.success("Registo criado com sucesso!");
        resetForm();
        fetchGunstockDimensions();
      }
    }
  };

  const handleGeneratePdf = async (itemId: string) => {
    const item = dimensions.find(d => d.id === itemId);
    if (!item) {
      toast.error("Registo não encontrado para gerar PDF.");
      return;
    }

    // Encontrar dados relacionados no store
    const client = clients.find(c => c.id === item.client_id);
    const order = orders.find(o => o.id === item.order_id);

    // Aplaina os dados para o gerador de PDF
    const fullData = {
      ...item,
      client_name: client ? `${client.first_name} ${client.last_name}`.trim() : 'N/A',
      client_email: client?.email || 'N/A',
      client_phone: client?.phone || 'N/A',
      order_number: order?.order_number || 'N/A',
      creation_date: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-PT') : 'N/A',
    };

    const templatePath = '/pdf-templates/gunstock_dimensions.pdf';
    const schemaPath = '/pdf-templates/gunstock_dimensions_schema.json';
    const clientName = client ? `${client.first_name}_${client.last_name}`.replace(/\s+/g, '_') : 'desconhecido';
    const outputFileName = `FolhaObra_Coronha_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`;

    toast.info("A gerar PDF...");
    try {
      await generatePdf(templatePath, schemaPath, fullData, outputFileName);
    } catch (e) {
      toast.error("Falha ao gerar PDF.");
      console.error("PDF Generation Error:", e);
    }
  };

  const clientNameMap = useMemo(() => Object.fromEntries(clients.map((c: Client) => [c.id, `${c.first_name} ${c.last_name}`])), [clients]);

  const renderField = (label: string, field: keyof typeof formData) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label} ({formData.units})</Label>
      <Input id={field} type="number" step="0.01" value={formData[field] ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field, e.target.value)} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      <Header title="Dimensões da Coronha" subtitle="Medidas para fabrico de coronhas" />
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
              <CardTitle>{editingId ? 'Editar Medidas' : 'Novas Medidas da Coronha'}</CardTitle>
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
                            <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                            <SelectContent>
                                {weapons.map((w: Weapon) => <SelectItem key={w.id} value={w.id}>{w.brand} {w.model}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* --- Medidas --- */}
                <CardTitle className="text-lg pt-4">Medidas da Coronha</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    {renderField("Coronha medida 1", "gunstock_measurements")}
                    {renderField("Coronha medida 2", "gunstock_measurements2")}
                    {renderField("Coronha medida 3", "gunstock_measurements3")}
                    {renderField("Coronha medida 4", "gunstock_measurements4")}
                    {renderField("Coronha medida 5", "gunstock_measurements5")}
                    {renderField("Coronha medida 6", "gunstock_measurements6")}
                    {renderField("Coronha medida 7", "gunstock_measurements7")}
                </div>

                {/* --- Cast On --- */}
                <CardTitle className="text-lg pt-4">Cast On</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {renderField("Cast On 1", "gunstock_cast_on1")}
                    {renderField("Cast On 2", "gunstock_cast_on2")}
                    {renderField("Cast On 3", "gunstock_cast_on3")}
                    {renderField("Cast On 4", "gunstock_cast_on4")}
                </div>

                {/* --- Cast Off --- */}
                <CardTitle className="text-lg pt-4">Cast Off</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {renderField("Cast Off 1", "gunstock_cast_off1")}
                    {renderField("Cast Off 2", "gunstock_cast_off2")}
                    {renderField("Cast Off 3", "gunstock_cast_off3")}
                    {renderField("Cast Off 4", "gunstock_cast_off4")}
                </div>

                {/* --- Largura --- */}
                <CardTitle className="text-lg pt-4">Largura Coronha</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderField("Coronha largura 1", "gunstock_width1")}
                    {renderField("Coronha largura 2", "gunstock_width2")}
                    {renderField("Coronha largura 3", "gunstock_width3")}
                </div>

                {/* --- Recoil Pad --- */}
                <CardTitle className="text-lg pt-4">Calço</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderField("Calço 1", "gunstock_recoil_pad1")}
                    {renderField("Calço 2", "gunstock_recoil_pad2")}
                    {renderField("Calço 3", "gunstock_recoil_pad3")}
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
                <CardTitle>Registos de Medidas</CardTitle>
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
                        ) : dimensions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Nenhum registo encontrado.</TableCell>
                            </TableRow>
                        ) : (
                            dimensions.map((item) => (
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

export default GunstockDimensions;