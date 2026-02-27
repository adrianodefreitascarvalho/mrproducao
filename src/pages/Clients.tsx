import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductionStore } from "@/lib/store";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Clients = () => {
  const navigate = useNavigate();
  const clients = useProductionStore((state) => state.clients);
  const removeClient = useProductionStore((state) => state.removeClient);

  const handleNewClient = () => {
    navigate("/clients/new");
  };

  const handleEditClient = (id: string) => {
    navigate(`/clients/edit/${id}`);
  };

  const handleDeleteClient = (id: string, firstName: string | null, lastName: string | null) => {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    if (confirm(`Tem a certeza que pretende eliminar o cliente "${fullName}"?`)) {
      removeClient(id);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Clientes"
        subtitle="Gestão de clientes"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleNewClient}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right w-25">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.first_name} {client.last_name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClient(client.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClient(client.id, client.first_name, client.last_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Clients;