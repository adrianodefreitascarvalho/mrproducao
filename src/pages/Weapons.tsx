import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductionStore } from "@/lib/store";
import { PlusCircle, Trash2, Pencil, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Weapons = () => {
  const navigate = useNavigate();
  const weapons = useProductionStore((state) => state.weapons);
  const fetchWeapons = useProductionStore((state) => state.fetchWeapons);
  const removeWeapon = useProductionStore((state) => state.removeWeapon);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchWeapons();
  }, [fetchWeapons]);

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

  const filteredWeapons = weapons.filter((weapon) =>
    weapon.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    weapon.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (weapon.serial_number && weapon.serial_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Catálogo de Armas"
        subtitle="Gestão de todas as marcas e modelos de armas"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar Armas"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
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
                <TableHead>Categoria</TableHead>
                <TableHead>Calibre</TableHead>
                <TableHead>Mão Dominante</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead className="text-right w-25">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWeapons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma arma encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWeapons.map((weapon) => (
                  <TableRow key={weapon.id}>
                    <TableCell className="font-medium">{weapon.brand}</TableCell>
                    <TableCell>{weapon.model}</TableCell>
                    <TableCell>{weapon.category || "-"}</TableCell>
                    <TableCell>{weapon.caliber}</TableCell> 
                    <TableCell>{weapon.dominant_hand}</TableCell>
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