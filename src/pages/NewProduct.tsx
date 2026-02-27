import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProductionStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NewProduct = () => {
  const navigate = useNavigate();
  const addProduct = useProductionStore((state) => state.addProduct);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !productType) {
      return;
    }
    await addProduct({
      name: name.trim(),
      sku: "",
      description: description.trim(),
      product_type: productType,
    });
    navigate("/products");
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Novo Produto"
        subtitle="Adicionar um novo produto ao catálogo"
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/products")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Catálogo
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Nome do Produto</Label>
                    <Input id="product-name" placeholder="Ex: Coronha de Nogueira" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-description">Descrição</Label>
                  <Textarea id="product-description" placeholder="Descrição detalhada do produto..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-type">Tipo de Produto</Label>
                    <Select onValueChange={setProductType} value={productType} required>
                      <SelectTrigger id="product-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Coronha">Coronha</SelectItem>
                        <SelectItem value="Semi-Automática">Semi-Automática</SelectItem>
                        <SelectItem value="Carabina">Carabina</SelectItem>
                        <SelectItem value="Fuste">Fuste</SelectItem>
                        <SelectItem value="Punho Glove">Punho Glove</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/products")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Produto</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewProduct;