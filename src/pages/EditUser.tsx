import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Mock data for users (duplicado de Users.tsx para simulação)
const mockUsers = [
  { id: "1", name: "Administrador", email: "mr@mr.pt", role: "admin", status: "active" },
  { id: "2", name: "João Silva", email: "joao.silva@mr.pt", role: "operator", status: "active" },
  { id: "3", name: "Maria Santos", email: "maria.santos@mr.pt", role: "manager", status: "active" },
];

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  // Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      const user = mockUsers.find((u) => u.id === id);

      if (user) {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setStatus(user.status);
      } else {
        toast.error("Utilizador não encontrado");
        navigate("/users");
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password) {
      if (password.length < 6) {
        toast.error("A nova password deve ter pelo menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("As passwords não coincidem.");
        return;
      }
    }

    // A atualização de password de outro utilizador deve ser feita no backend
    // usando uma Supabase Edge Function com permissões de administrador ('service_role').
    // Exemplo de como poderia ser chamado:
    // if (password) {
    //   const { error } = await supabase.functions.invoke('update-user-password', {
    //     body: { userId: id, password },
    //   });
    // }
    console.log("Updating user:", { id, name, email, role, status, password: password ? "********" : "não alterada" });

    toast.success("Utilizador atualizado com sucesso!");
    navigate("/users");
  };

  if (loading) {
    return <div className="p-6">A carregar...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="Editar Utilizador" subtitle={`A editar: ${name}`} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/users")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Dados do Utilizador</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6 mt-6">
                  <Label className="text-base font-semibold">Alterar Password</Label>
                  <p className="text-sm text-muted-foreground">
                    Preencha os campos abaixo apenas se desejar alterar a password do utilizador.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Nova Password</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Password</Label>
                      <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/users")}>Cancelar</Button>
                  <Button type="submit"><Save className="mr-2 h-4 w-4" /> Guardar Alterações</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditUser;