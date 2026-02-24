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

const Weapons = () => {
  const navigate = useNavigate();
  const weapons = useProductionStore((state) => state.weapons);
  const removeWeapon = useProductionStore((state) => state.removeWeapon);

  const handleNewWeapon = () => {
    navigate("/weapons/new");
  };

  const handleEditWeapon = (id: string) => {
    navigate(`/weapons/edit/${id}`);
  };

  const handleDeleteWeapon = (id: string, model: string) => {
    if (confirm(`Tem a certeza que pretende eliminar a arma "${model}"?`)) {
      removeWeapon(id);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Catálogo de Armas"
        subtitle="Gestão de todos os modelos de armas"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleNewWeapon}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Arma
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Calibre</TableHead>
                <TableHead>Mão Dominante</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead className="text-right w-25">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weapons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma arma encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                weapons.map((weapon) => (
                  <TableRow key={weapon.id}>
                    <TableCell className="font-medium">{weapon.brand}</TableCell>
                    <TableCell>{weapon.model}</TableCell>
                    <TableCell>{weapon.caliber}</TableCell>
                    <TableCell>{weapon.dominantHand}</TableCell>
                    <TableCell>{weapon.discipline}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditWeapon(weapon.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteWeapon(weapon.id, weapon.model)}
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

export default Weapons;