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
  onSave: (data: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const weaponCategories = useProductionStore((state) => state.weaponCategories);
  const productTypes = useProductionStore((state) => state.productTypes);
  const priceTables = useProductionStore((state) => state.priceTables);

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [productType, setProductType] = useState(product.product_type || '');
  const [category, setCategory] = useState(product.category || '');
  const [selectedPriceItem, setSelectedPriceItem] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !productType) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      product_type: productType,
      category: category || null,
    });
  };

  const filteredItems = useMemo(() => {
    const normalize = (str: string) => {
      if (!str) return '';
      return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .trim()
        .replace(/platinas/g, 'platina')
        .replace(/meias/g, 'meia')
        .replace(/automaticas/g, 'automatica')
        .replace(/carabinas/g, 'carabina')
        .replace(/ergonomicas/g, 'ergonomica')
        .replace(/[^a-z0-9]/g, '');
    };

    const pType = (productType || '').toLowerCase().trim();
    const isStockOrForend = pType === 'coronha' || pType === 'fuste';

    const results = priceTables.flatMap(pt => {
      if (!pt.name) return [];
      const tableName = normalize(pt.name);
      const items = pt.price_items || [];

      // 1. Sempre mostrar itens das tabelas Geral e Extras
      if (tableName === 'extras' || tableName === 'geral') {
        return items.map(item => ({ ...item, tableName: pt.name }));
      }
      
      // 2. Se for Coronha ou Fuste, mostrar itens de QUALQUER tabela que contenham o tipo na descrição
      if (isStockOrForend) {
        const matchingItems = items.filter(item => item.description.toLowerCase().includes(pType));
        return matchingItems.map(item => ({ ...item, tableName: pt.name }));
      }

      return [];
    });

    return results.sort((a, b) => a.description.localeCompare(b.description));
  }, [priceTables, productType]);

  const handlePriceItemChange = (value: string) => {
    setSelectedPriceItem(value);
    const item = filteredItems.find(i => i.description === value);
    if (item) {
      setName(item.description);
      setDescription(`Produto selecionado da tabela ${item.tableName}. Preço Base: ${item.price}€`);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Detalhes do Produto</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria de Arma</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {weaponCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              <Select onValueChange={setProductType} value={productType} required>
                <SelectTrigger id="product-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredItems.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="price-item">Selecionar Produto da Tabela de Preços</Label>
              <Select onValueChange={handlePriceItemChange} value={selectedPriceItem}>
                <SelectTrigger id="price-item">
                  <SelectValue placeholder="Selecione um produto..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredItems.map((item, idx) => (
                    <SelectItem key={`${item.tableName}-${idx}`} value={item.description}>
                      {item.description} ({item.tableName}) - {item.price}€
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
  const fetchDropdowns = useProductionStore((state) => state.fetchDropdowns);
  const fetchPriceTables = useProductionStore((state) => state.fetchPriceTables);

  const productToEdit = useMemo(() => products.find((p) => p.id === id), [products, id]);

  useEffect(() => {
    fetchDropdowns();
    fetchPriceTables();
    if (!productToEdit) navigate("/products");
  }, [productToEdit, navigate, fetchDropdowns, fetchPriceTables]);

  const handleSave = async (data: Partial<Product>) => {
    if (id) {
      await updateProduct(id, data);
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
