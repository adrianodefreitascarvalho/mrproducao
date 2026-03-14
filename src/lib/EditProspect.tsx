import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductionStore, type Prospect, type Database } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Este formulário é uma versão simplificada. Um formulário completo teria todos os ~70 campos da tabela prospects.
const ProspectForm = ({ prospect, onSave, onCancel }: { prospect: Partial<Prospect>, onSave: (data: Partial<Prospect>) => void, onCancel: () => void }) => {
  const [firstName, setFirstName] = useState(prospect.first_name ?? '');
  const [lastName, setLastName] = useState(prospect.last_name ?? '');
  const [email, setEmail] = useState(prospect.email ?? '');
  const [phone, setPhone] = useState(prospect.phone ?? '');

  const [weaponBrand, setWeaponBrand] = useState(prospect.weapon_brand ?? '');
  const [weaponModel, setWeaponModel] = useState(prospect.weapon_model ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !email.trim()) {
        toast.error("O nome ou o email do prospect são obrigatórios.");
        return;
    }

    onSave({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      weapon_brand: weaponBrand,
      weapon_model: weaponModel,
      // ... outros campos seriam recolhidos aqui
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Informação do Prospect</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="first-name">Primeiro Nome</Label><Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="last-name">Apelido</Label><Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="phone">Telefone</Label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Informação da Arma (Opcional)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="weapon-brand">Marca da Arma</Label><Input id="weapon-brand" value={weaponBrand} onChange={(e) => setWeaponBrand(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="weapon-model">Modelo da Arma</Label><Input id="weapon-model" value={weaponModel} onChange={(e) => setWeaponModel(e.target.value)} /></div>
          </div>
          <p className="text-sm text-muted-foreground pt-4">Um formulário completo incluiria secções para todas as medidas da coronha, do corpo e do fuste.</p>
        </CardContent>
      </Card>

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

  const { prospects, fetchProspects, addProspect, updateProspect } = useProductionStore();

  const prospectToEdit = useMemo(() => (isNew ? {} : prospects.find((p) => p.id === id)), [prospects, id, isNew]);

  useEffect(() => {
    if (!isNew && !prospectToEdit) {
      fetchProspects();
    }
  }, [isNew, prospectToEdit, fetchProspects]);

  const handleSave = async (data: Partial<Prospect>) => {
    if (isNew) {
      await addProspect(data as any);
    } else {
      await updateProspect(id, data);
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