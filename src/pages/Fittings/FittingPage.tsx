import { useState, useEffect, useMemo, useCallback, ReactNode } from "react";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FittingData = { id: string; client_id?: string | null; order_id?: string | null; weapon_id?: string | null; created_at: string; units: 'cm' | 'inches'; [key: string]: any };

type RenderFieldFunc<T> = (label: string, field: keyof T, showUnits?: boolean) => ReactNode;

interface FittingPageProps<T extends Omit<FittingData, 'id' | 'created_at'>> {
  pageTitle: string;
  pageSubtitle: string;
  tableName: string;
  emptyFormData: T;
  renderFormFields: (
    formData: T,
    handleInputChange: (field: keyof T, value: string | number | null | undefined) => void,
    renderField: RenderFieldFunc<T>
  ) => ReactNode;
  pdfTemplatePath: string;
  pdfSchemaPath: string;
  pdfOutputNamePrefix: string;
}

export function FittingPage<T extends Omit<FittingData, 'id' | 'created_at'>>({
  pageTitle,
  pageSubtitle,
  tableName,
  emptyFormData,
  renderFormFields,
  pdfTemplatePath,
  pdfSchemaPath,
  pdfOutputNamePrefix,
}: FittingPageProps<T>) {
  const [dimensions, setDimensions] = useState<FittingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<T>(emptyFormData);

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

  const fetchDimensions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error(`Erro ao carregar ${pageTitle}.`);
      console.error(error);
    } else {
      setDimensions((data as FittingData[]) || []);
    }
    setLoading(false);
  }, [tableName, pageTitle]);

  useEffect(() => {
    fetchClients();
    fetchWeapons();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDimensions();
  }, [fetchClients, fetchWeapons, fetchDimensions]);

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: FittingData) => {
    setFormData({
        ...emptyFormData,
        ...Object.fromEntries(Object.entries(item).map(([key, value]) => [key, value === null ? undefined : value]))
    } as T);
    setEditingId(item.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este registo?')) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) {
        toast.error("Erro ao eliminar registo.");
      } else {
        toast.success("Registo eliminado com sucesso.");
        fetchDimensions();
      }
    }
  };

  const handleInputChange = (field: keyof T, value: string | number | null | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value === '' || value === null ? undefined : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    for (const key in payload) {
        const value = payload[key as keyof typeof payload];
        if (value === undefined || value === '') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (payload as any)[key] = null;
        }
    }

    const { error } = editingId
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? await (supabase.from(tableName) as any).update(payload).eq('id', editingId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : await (supabase.from(tableName) as any).insert(payload);

    if (error) {
      toast.error(`Erro ao ${editingId ? 'actualizar' : 'criar'} o registo.`);
      console.error(error);
    } else {
      toast.success(`Registo ${editingId ? 'actualizado' : 'criado'} com sucesso!`);
      resetForm();
      fetchDimensions();
    }
  };

  const handleGeneratePdf = async (itemId: string) => {
    const item = dimensions.find(d => d.id === itemId);
    if (!item) return toast.error("Registo não encontrado para gerar PDF.");

    const client = clients.find(c => c.id === item.client_id);
    const order = orders.find(o => o.id === item.order_id);

    const fullData = {
      ...item,
      client_name: client ? `${client.first_name} ${client.last_name}`.trim() : 'N/A',
      order_number: order?.order_number || 'N/A',
      creation_date: new Date(item.created_at).toLocaleDateString('pt-PT'),
    };

    const clientName = client ? `${client.first_name}_${client.last_name}`.replace(/\s+/g, '_') : 'desconhecido';
    const outputFileName = `${pdfOutputNamePrefix}_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`;

    toast.info("A gerar PDF...");
    try {
      await generatePdf(pdfTemplatePath, pdfSchemaPath, fullData, outputFileName);
    } catch (e) {
      toast.error("Falha ao gerar PDF.", { description: (e as Error).message });
      console.error("PDF Generation Error:", e);
    }
  };

  const clientNameMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, `${c.first_name} ${c.last_name}`])), [clients]);

  const renderField: RenderFieldFunc<T> = (label, field, showUnits = true) => (
    <div className="space-y-2">
      <Label htmlFor={field as string}>{label}{showUnits ? ` (${formData.units})` : ''}</Label>
      <Input id={field as string} type="number" step="0.01" value={String(formData[field] ?? '')} onChange={e => handleInputChange(field, e.target.value)} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      <Header title={pageTitle} subtitle={pageSubtitle} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => { if (isFormOpen) resetForm(); else setIsFormOpen(true); }}>
            {isFormOpen ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {isFormOpen ? 'Cancelar' : 'Novo Registo'}
          </Button>
        </div>

        {isFormOpen && (
          <Card>
            <CardHeader><CardTitle>{editingId ? 'Editar Medidas' : `Novas ${pageTitle}`}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <CardTitle className="text-lg pt-4">Associações</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="client_id">Cliente</Label>
                        <Select value={formData.client_id || ''} onValueChange={(value: string) => handleInputChange('client_id' as keyof T, value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{clients.map((c: Client) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="order_id">Ordem de Produção</Label>
                        <Select value={formData.order_id || ''} onValueChange={(value: string) => handleInputChange('order_id' as keyof T, value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{orders.map((o: ProductionOrder) => <SelectItem key={o.id} value={o.id}>{o.order_number}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weapon_id">Arma</Label>
                        <Select value={formData.weapon_id || ''} onValueChange={(value: string) => handleInputChange('weapon_id' as keyof T, value)}>
                            <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                            <SelectContent>{weapons.map((w: Weapon) => <SelectItem key={w.id} value={w.id}>{w.brand} {w.model}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>

                {renderFormFields(formData, handleInputChange, renderField)}

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit"><Save className="mr-2 h-4 w-4" /> {editingId ? 'Guardar Alterações' : 'Criar Registo'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Registos de {pageTitle}</CardTitle></CardHeader>
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
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">A carregar...</TableCell></TableRow>
                ) : dimensions.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum registo encontrado.</TableCell></TableRow>
                ) : (
                  dimensions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.client_id ? clientNameMap[item.client_id] : 'N/A'}</TableCell>
                      <TableCell>{orders.find((o: ProductionOrder) => o.id === item.order_id)?.order_number || 'N/A'}</TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleGeneratePdf(item.id)} title="Gerar PDF"><FileDown className="h-4 w-4 text-muted-foreground" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
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
}