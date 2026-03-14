import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProductionStore } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, UserCheck, Edit } from "lucide-react";

const ProspectsPage = () => {
  const navigate = useNavigate();
  const {
    prospects,
    fetchProspects,
    isLoadingProspects,
    updateProspect,
  } = useProductionStore();

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const handleConvert = async (id: string) => {
    if (window.confirm("Tem a certeza que deseja converter este prospect em cliente? Esta ação é irreversível e irá criar novos registos de cliente e arma.")) {
      await updateProspect(id, { status: 'converted' });
      fetchProspects(); // Refresh the list
    }
  };

  const activeProspects = prospects.filter(p => p.status === 'prospect');

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Gestão de Prospects"
        subtitle="Registe e converta potenciais clientes."
      />
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lista de Prospects</CardTitle>
            <Button onClick={() => navigate("/prospects/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Prospect
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingProspects ? (
              <p className="text-center text-muted-foreground py-8">A carregar prospects...</p>
            ) : activeProspects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeProspects.map((prospect) => (
                    <TableRow key={prospect.id}>
                      <TableCell className="font-medium">{`${prospect.first_name || ''} ${prospect.last_name || ''}`.trim()}</TableCell>
                      <TableCell>{prospect.email}</TableCell>
                      <TableCell>{prospect.phone}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleConvert(prospect.id)}><UserCheck className="mr-2 h-4 w-4" />Converter</Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/prospects/${prospect.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">Nenhum prospect ativo encontrado.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProspectsPage;