import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { useProductionStore, type Prospect, type Database, type Json } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const ProspectForm = ({ 
  prospect, 
  onSave, 
  onCancel 
}: { 
  prospect: Partial<Prospect>, 
  onSave: (data: Partial<Prospect>) => void, 
  onCancel: () => void 
}) => {
  const store = useProductionStore();
  const { prospectInteractions, addProspectInteraction } = useProductionStore();
  
  const [formData, setFormData] = useState<Partial<Prospect>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nif: '',
    status: 'prospect',
    weapon_brand: '',
    weapon_model: '',
    weapon_category: '',
    weapon_serial_number: '',
    weapon_caliber: '',
    weapon_dominant_hand: '',
    weapon_side_plates: '',
    weapon_rib: '',
    weapon_discipline: '',
    weapon_competition_frequency: '',
    weapon_observations: '',
    gunstock_units: 'cm',
    body_units: 'cm',
    forehand_units: 'cm',
    ...prospect
  });

  // Estado para nova interação
  const [newInteraction, setNewInteraction] = useState({
    message_content: '',
    message_date: new Date().toISOString().slice(0, 16),
    reply_content: '',
    reply_date: ''
  });

  const handleChange = (field: keyof Prospect, value: Json) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: keyof Prospect, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name?.trim() && !formData.email?.trim()) {
        toast.error("O nome ou o email do prospect são obrigatórios.");
        return;
    }

    onSave(formData);
  };

  const handleAddInteraction = async () => {
    if (!prospect.id) return;
    if (!newInteraction.message_content.trim()) {
      toast.error("O conteúdo da mensagem é obrigatório.");
      return;
    }

    await addProspectInteraction({
      prospect_id: prospect.id,
      message_content: newInteraction.message_content,
      message_date: new Date(newInteraction.message_date).toISOString(),
      reply_content: newInteraction.reply_content || null,
      reply_date: newInteraction.reply_date ? new Date(newInteraction.reply_date).toISOString() : null,
    });

    setNewInteraction({ message_content: '', message_date: new Date().toISOString().slice(0, 16), reply_content: '', reply_date: '' });
  };

  // Renderizador para campos de medidas repetitivos
  const renderMeasurementGrid = (prefix: string, count: number, label: string) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => {
        const fieldName = `${prefix}${i + 1}` as keyof Prospect;
        return (
          <div key={prefix + i} className="space-y-2">
            <Label htmlFor={prefix + i}>{label} {i + 1}</Label>
            <Input 
              id={prefix + i} 
              type="number" 
              step="0.01" 
              value={(formData[fieldName] as unknown as string | number) ?? ''} 
              onChange={(e) => handleNumberChange(fieldName, e.target.value)} 
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
          <TabsTrigger value="weapon">Arma</TabsTrigger>
          <TabsTrigger value="gunstock">Coronha</TabsTrigger>
          <TabsTrigger value="body">Corpo</TabsTrigger>
          <TabsTrigger value="forehand">Fuste</TabsTrigger>
          <TabsTrigger 
            value="interactions" 
            disabled={!prospect.id}
            title={!prospect.id ? "Grave o prospect primeiro para poder registar interações" : ""}
          >
            Interações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Informação do Prospect</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">Primeiro Nome</Label>
                  <Input id="first-name" value={formData.first_name ?? ''} onChange={(e) => handleChange('first_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Apelido</Label>
                  <Input id="last-name" value={formData.last_name ?? ''} onChange={(e) => handleChange('last_name', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email ?? ''} onChange={(e) => handleChange('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={formData.phone ?? ''} onChange={(e) => handleChange('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input id="nif" value={formData.nif ?? ''} onChange={(e) => handleChange('nif', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weapon" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Informação da Arma</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weapon-brand">Marca</Label>
                  <Input id="weapon-brand" value={formData.weapon_brand ?? ''} onChange={(e) => handleChange('weapon_brand', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weapon-model">Modelo</Label>
                  <Input id="weapon-model" value={formData.weapon_model ?? ''} onChange={(e) => handleChange('weapon_model', e.target.value)} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formData.weapon_category ?? ''} onValueChange={(v) => handleChange('weapon_category', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {store.weaponCategories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial">Nº de Série</Label>
                  <Input id="serial" value={formData.weapon_serial_number ?? ''} onChange={(e) => handleChange('weapon_serial_number', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Calibre</Label>
                  <Select value={formData.weapon_caliber ?? ''} onValueChange={(v) => handleChange('weapon_caliber', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {store.calibers.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Mão Dominante</Label>
                  <Select value={formData.weapon_dominant_hand ?? ''} onValueChange={(v) => handleChange('weapon_dominant_hand', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {store.dominantHands.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Side Plates</Label>
                  <Select value={formData.weapon_side_plates ?? ''} onValueChange={(v) => handleChange('weapon_side_plates', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {store.sidePlates.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fita (Rib)</Label>
                  <Select value={formData.weapon_rib ?? ''} onValueChange={(v) => handleChange('weapon_rib', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {store.ribs.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barrel-len">Comprimento Canos</Label>
                  <Input id="barrel-len" type="number" step="0.1" value={formData.weapon_barrel_length ?? ''} onChange={(e) => handleNumberChange('weapon_barrel_length', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barrel-weight">Peso Canos</Label>
                  <Input id="barrel-weight" type="number" step="0.1" value={formData.weapon_barrel_weight ?? ''} onChange={(e) => handleNumberChange('weapon_barrel_weight', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-weight">Peso Total</Label>
                  <Input id="total-weight" type="number" step="0.1" value={formData.weapon_total_weight ?? ''} onChange={(e) => handleNumberChange('weapon_total_weight', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="obs">Observações</Label>
                <Textarea id="obs" value={formData.weapon_observations ?? ''} onChange={(e) => handleChange('weapon_observations', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gunstock" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medidas da Coronha</CardTitle>
              <div className="flex items-center space-x-2">
                <Label>Unidades:</Label>
                <Select value={formData.gunstock_units ?? 'cm'} onValueChange={(v) => handleChange('gunstock_units', v)}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cm">cm</SelectItem><SelectItem value="inches">inches</SelectItem></SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Medidas Gerais</h4>
                {renderMeasurementGrid('gunstock_measurements', 7, 'Medida')}
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Vantagem (Cast On)</h4>
                {renderMeasurementGrid('gunstock_cast_on', 4, 'Cast On')}
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Desvio (Cast Off)</h4>
                {renderMeasurementGrid('gunstock_cast_off', 4, 'Cast Off')}
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Largura (Width)</h4>
                {renderMeasurementGrid('gunstock_width', 3, 'Width')}
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Recoil Pad</h4>
                {renderMeasurementGrid('gunstock_recoil_pad', 3, 'Recoil Pad')}
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Punho (Grip)</h4>
                {renderMeasurementGrid('gunstock_grip_measurements', 6, 'Grip')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="body" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medidas Corporais</CardTitle>
              <div className="flex items-center space-x-2">
                <Label>Unidades:</Label>
                <Select value={formData.body_units ?? 'cm'} onValueChange={(v) => handleChange('body_units', v)}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cm">cm</SelectItem><SelectItem value="inches">inches</SelectItem></SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Palma da Mão Aberta</h4>
                {renderMeasurementGrid('body_measurements_open_palm', 6, 'Medida')}
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Tronco/Corpo</h4>
                {renderMeasurementGrid('body_measurements_body', 3, 'Medida')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="body-weight">Peso (kg)</Label>
                  <Input id="body-weight" type="number" step="0.1" value={formData.body_measurements_weight ?? ''} onChange={(e) => handleNumberChange('body_measurements_weight', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body-age">Idade</Label>
                  <Input id="body-age" type="number" value={formData.body_measurements_age ?? ''} onChange={(e) => handleNumberChange('body_measurements_age', e.target.value)} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Mão em Posição</h4>
                {renderMeasurementGrid('body_measurements_hand_in_position', 3, 'Medida')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="between-hands">Distância entre Mãos</Label>
                <Input id="between-hands" type="number" step="0.1" value={formData.body_measurements_between_hands ?? ''} onChange={(e) => handleNumberChange('body_measurements_between_hands', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forehand" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dimensões do Fuste</CardTitle>
              <div className="flex items-center space-x-2">
                <Label>Unidades:</Label>
                <Select value={formData.forehand_units ?? 'cm'} onValueChange={(v) => handleChange('forehand_units', v)}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cm">cm</SelectItem><SelectItem value="inches">inches</SelectItem></SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Vista Superior (Top View)</h4>
                {renderMeasurementGrid('forehand_dimensions_top_view', 3, 'Medida')}
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Vista Lateral (Side View)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[4, 5, 6, 7].map(i => {
                    const fieldName = `forehand_dimensions_side_view${i}` as keyof Prospect;
                    return (
                      <div key={i} className="space-y-2">
                        <Label htmlFor={`side-${i}`}>Medida {i}</Label>
                        <Input id={`side-${i}`} type="number" step="0.01" value={(formData[fieldName] as unknown as string | number) ?? ''} onChange={(e) => handleNumberChange(fieldName, e.target.value)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Histórico de Interações</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                <h4 className="font-medium flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Nova Interação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data da Mensagem</Label>
                    <Input 
                      type="datetime-local" 
                      value={newInteraction.message_date} 
                      onChange={e => setNewInteraction(prev => ({ ...prev, message_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdo da Mensagem</Label>
                    <Textarea 
                      placeholder="O que foi enviado/recebido..." 
                      value={newInteraction.message_content}
                      onChange={e => setNewInteraction(prev => ({ ...prev, message_content: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data da Resposta (Opcional)</Label>
                    <Input 
                      type="datetime-local" 
                      value={newInteraction.reply_date} 
                      onChange={e => setNewInteraction(prev => ({ ...prev, reply_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teor da Resposta (Opcional)</Label>
                    <Textarea 
                      placeholder="A resposta obtida..." 
                      value={newInteraction.reply_content}
                      onChange={e => setNewInteraction(prev => ({ ...prev, reply_content: e.target.value }))}
                    />
                  </div>
                </div>
                <Button type="button" className="w-full" onClick={handleAddInteraction}>
                  <Send className="h-4 w-4 mr-2" /> Registar Interação
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Registos Anteriores</h4>
                {prospectInteractions.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-4">Sem interações registadas.</p>
                ) : (
                  <div className="space-y-4">
                    {prospectInteractions.map(interaction => (
                      <div key={interaction.id} className="border rounded-lg p-4 space-y-3 bg-background">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase text-primary">Mensagem</span>
                            <p className="text-sm">{interaction.message_content}</p>
                            <span className="text-[10px] text-muted-foreground">{format(new Date(interaction.message_date), "PPp", { locale: pt })}</span>
                          </div>
                        </div>
                        
                        {interaction.reply_content && (
                          <div className="pl-4 border-l-2 border-primary/30 space-y-1">
                            <span className="text-xs font-semibold uppercase text-success">Resposta</span>
                            <p className="text-sm italic">{interaction.reply_content}</p>
                            {interaction.reply_date && (
                              <span className="text-[10px] text-muted-foreground">{format(new Date(interaction.reply_date), "PPp", { locale: pt })}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Prospect</Button>
      </div>
    </form>
  );
};

const EditProspectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const { prospects, addProspect, updateProspect, fetchDropdowns, fetchProspectInteractions } = useProductionStore();

  useEffect(() => {
    fetchDropdowns();
    if (id) {
      fetchProspectInteractions(id);
    }
  }, [id, fetchDropdowns, fetchProspectInteractions]);

  const prospectToEdit = useMemo(
    () => (isNew ? ({} as Partial<Prospect>) : prospects.find((p: Prospect) => p.id === id)), 
    [prospects, id, isNew]
  );

  const handleSave = async (data: Partial<Prospect>) => {
    if (isNew) {
      await addProspect(data as Database['public']['Tables']['prospects']['Insert']);
    } else {
      await updateProspect(id!, data as Database['public']['Tables']['prospects']['Update']);
    }
    navigate("/prospects");
  };

  if (!isNew && !prospectToEdit) {
    return <div className="p-6">A carregar prospect...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header 
        title={isNew ? "Novo Prospect" : "Editar Prospect"}
        subtitle={isNew ? "Registe um novo potencial cliente e as suas medidas." : `A editar: ${prospectToEdit?.first_name || ''} ${prospectToEdit?.last_name || ''}`.trim()}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/prospects")} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Voltar à Lista</Button>
          </div>
          <ProspectForm
            key={prospectToEdit?.id || 'new'}
            prospect={prospectToEdit || {}}
            onSave={handleSave}
            onCancel={() => navigate("/prospects")}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProspectPage;