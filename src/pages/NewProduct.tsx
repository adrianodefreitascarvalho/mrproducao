import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProductionStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const weaponCategories = [
  'Platina L – IV',
  'Platina D – IF',
  'Platina SO',
  'Meia Platina',
  'Semi Automática',
  'Carabina',
  'Carabina 2',
  'Ergonómica'
];

const NewProduct = () => {
  const navigate = useNavigate();
  const addProduct = useProductionStore((state) => state.addProduct);
  const fetchPriceTables = useProductionStore((state) => state.fetchPriceTables);
  const priceTables = useProductionStore((state) => state.priceTables);
  const productTypes = useProductionStore((state) => state.productTypes);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState("");
  const [category, setCategory] = useState("");
  const [selectedPriceItem, setSelectedPriceItem] = useState("");

  useEffect(() => {
    fetchPriceTables();
  }, [fetchPriceTables]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !productType) {
      return;
    }
    await addProduct({
      name: name.trim(),
      sku: "",
      description: description.trim() || null,
      product_type: productType || null,
      category: category || null,
    });
    navigate("/products");
  };

  const filteredItems = useMemo(() => {
    if (!category) return [];
    
    // Filter tables: Match category OR is 'Extras' OR is 'Geral'
    const relevantTables = priceTables.filter(pt => 
      pt.name === category || pt.name === 'Extras' || pt.name === 'Geral'
    );

    // Flatten items from relevant tables
    return relevantTables.flatMap(pt => {
      let items: { description: string; price: number }[] = [];
      if (Array.isArray(pt.items)) {
        items = pt.items as { description: string; price: number }[];
      } else if (typeof pt.items === 'string') {
        try {
          items = JSON.parse(pt.items);
        } catch (e) {
          console.error("Error parsing items", e);
        }
      }
      return items.map(item => ({ ...item, tableName: pt.name }));
    });
  }, [category, priceTables]);

  const handlePriceItemChange = (value: string) => {
    setSelectedPriceItem(value);
    // Value format: "tableName|description|price" to ensure uniqueness if needed, or just use index/description
    // For simplicity, let's assume value is the description
    const item = filteredItems.find(i => i.description === value);
    if (item) {
      setName(item.description);
      setDescription(`Produto selecionado da tabela ${item.tableName}. Preço Base: ${item.price}€`);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Novo Produto" subtitle="Adicionar um novo produto ao catálogo" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/products")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Catálogo
            </Button>
          </div>
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
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {category && (
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

                <div className="space-y-2">
                  <Label htmlFor="product-name">Nome do Produto</Label>
                  <Input id="product-name" placeholder="Nome do produto" value={name} onChange={(e) => setName(e.target.value)} required />
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
                        {productTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/products")}>Cancelar</Button>
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
