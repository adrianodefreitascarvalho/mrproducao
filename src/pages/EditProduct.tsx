import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProductionStore, type Product } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface ProductFormProps {
  product: Product;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || "");
  const [productTypeId, setProductTypeId] = useState(product.product_type || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !productTypeId) return;
    onSave({
      name: name.trim(),
      description: description.trim() || null,
      product_type: productTypeId,
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Detalhes do Produto</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Nome do Produto</Label>
            <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-description">Descrição</Label>
            <Textarea id="product-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-type">Tipo de Produto</Label>
              <Select onValueChange={setProductTypeId} value={productTypeId} required>
                <SelectTrigger id="product-type"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coronha">Coronha</SelectItem>
                  <SelectItem value="Semi-Automática">Semi-Automática</SelectItem>
                  <SelectItem value="Carabina">Carabina</SelectItem>
                  <SelectItem value="Fuste">Fuste</SelectItem>
                  <SelectItem value="Punho Glove">Punho Glove</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wood-species">Espécie da Madeira</Label>
              <Input id="wood-species" value="Nogueira Turca" readOnly className="bg-muted" />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar Alterações</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const products = useProductionStore((state) => state.products);
  const updateProduct = useProductionStore((state) => state.updateProduct);

  const productToEdit = useMemo(() => products.find((p) => p.id === id), [products, id]);

  useEffect(() => {
    if (!productToEdit) navigate("/products");
  }, [productToEdit, navigate]);

  const handleSave = (data: any) => {
    if (id) {
      updateProduct(id, data);
      navigate("/products");
    }
  };

  if (!productToEdit) return <div>A carregar produto...</div>;

  return (
    <div className="flex flex-col h-screen">
      <Header title="Editar Produto" subtitle={`A editar o produto: ${productToEdit.name}`} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/products")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Catálogo
            </Button>
          </div>
          <ProductForm key={productToEdit.id} product={productToEdit} onSave={handleSave} onCancel={() => navigate("/products")} />
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
