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

type ForehandDimension = {
  id: string;
  order_id?: string | null;
  client_id?: string | null;
  weapon_id?: string | null;
  units: 'cm' | 'inches';
  forehand_dimensions_top_view1?: number | null;
  forehand_dimensions_top_view2?: number | null;
  forehand_dimensions_top_view3?: number | null;
  forehand_dimensions_side_view4?: number | null;
  forehand_dimensions_side_view5?: number | null;
  forehand_dimensions_side_view6?: number | null;
  forehand_dimensions_side_view7?: number | null;
  created_at: string;
};

const EMPTY_FORM_DATA: Omit<ForehandDimension, 'id' | 'created_at'> = {
    order_id: '', client_id: '', weapon_id: '', units: 'cm',
    forehand_dimensions_top_view1: undefined, forehand_dimensions_top_view2: undefined, forehand_dimensions_top_view3: undefined,
    forehand_dimensions_side_view4: undefined, forehand_dimensions_side_view5: undefined, forehand_dimensions_side_view6: undefined, forehand_dimensions_side_view7: undefined,
};

const ForehandDimensions = () => {
  const [dimensions, setDimensions] = useState<ForehandDimension[]>([]);
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

  const fetchForehandDimensions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('forehand_dimensions').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error("Erro ao carregar dimensões do fuste.");
      console.error(error);
    } else {
      setDimensions((data as ForehandDimension[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
    fetchWeapons();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchForehandDimensions();
  }, [fetchClients, fetchWeapons, fetchForehandDimensions]);

  const resetForm = () => {
    setFormData(EMPTY_FORM_DATA);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: ForehandDimension) => {
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
      const { error } = await supabase.from('forehand_dimensions').delete().eq('id', id);
      if (error) {
        toast.error("Erro ao eliminar registo.");
      } else {
        toast.success("Registo eliminado com sucesso.");
        fetchForehandDimensions();
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
      const { error } = await (supabase.from('forehand_dimensions') as any).update(payload).eq('id', editingId);
      if (error) {
        toast.error("Erro ao atualizar o registo.");
        console.error(error);
      } else {
        toast.success("Registo atualizado com sucesso!");
        resetForm();
        fetchForehandDimensions();
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('forehand_dimensions') as any).insert(payload);
      if (error) {
        toast.error("Erro ao criar o registo.");
        console.error(error);
      } else {
        toast.success("Registo criado com sucesso!");
        resetForm();
        fetchForehandDimensions();
      }
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
      <Header title="Dimensões do Fuste" subtitle="Medidas para fabrico de fustes" />
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
              <CardTitle>{editingId ? 'Editar Medidas' : 'Novas Medidas do Fuste'}</CardTitle>
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

                {/* --- Top View --- */}
                <CardTitle className="text-lg pt-4">Vista Superior (Top View)</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderField("Top View 1", "forehand_dimensions_top_view1")}
                    {renderField("Top View 2", "forehand_dimensions_top_view2")}
                    {renderField("Top View 3", "forehand_dimensions_top_view3")}
                </div>

                {/* --- Side View --- */}
                <CardTitle className="text-lg pt-4">Vista Lateral (Side View)</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {renderField("Side View 4", "forehand_dimensions_side_view4")}
                    {renderField("Side View 5", "forehand_dimensions_side_view5")}
                    {renderField("Side View 6", "forehand_dimensions_side_view6")}
                    {renderField("Side View 7", "forehand_dimensions_side_view7")}
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
                <CardTitle>Registos de Dimensões do Fuste</CardTitle>
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

export default ForehandDimensions;