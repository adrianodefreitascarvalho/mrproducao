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

const NewProduct = () => {
  const navigate = useNavigate();
  const addProduct = useProductionStore((state) => state.addProduct);
  const fetchPriceTables = useProductionStore((state) => state.fetchPriceTables);
  const fetchDropdowns = useProductionStore((state) => state.fetchDropdowns);
  const priceTables = useProductionStore((state) => state.priceTables);
  const productTypes = useProductionStore((state) => state.productTypes);
  const woodGrades = useProductionStore((state) => state.woodGrades);
  const weaponCategories = useProductionStore((state) => state.weaponCategories);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState("");
  const [category, setCategory] = useState("");
  const [woodGrade, setWoodGrade] = useState("");
  const [selectedPriceItem, setSelectedPriceItem] = useState("");

  useEffect(() => {
    fetchPriceTables();
    fetchDropdowns();
  }, [fetchPriceTables, fetchDropdowns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !productType) {
      return;
    }
    await addProduct({
      name: name.trim(),
      sku: `PROD-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      description: description.trim() || null,
      product_type: productType || null,
      category: category || null,
      wood_grade: (productType === 'coronha' || productType === 'fuste') ? woodGrade : null,
    });
    navigate("/products");
  };

  const filteredItems = useMemo(() => {
    // Filter tables: Match category OR is 'Extras' OR is 'Geral'
    // Normaliza a string para minúsculas e substitui travessão (–) por hífen (-) para garantir a correspondência
    // Também trata plurais comuns nos nomes das tabelas (ex: Platinas -> Platina) para garantir o match
    const normalize = (str: string) => {
      if (!str) return '';
      return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .trim()
        .replace(/platinas/g, 'platina')
        .replace(/meias/g, 'meia')
        .replace(/automaticas/g, 'automatica')
        .replace(/carabinas/g, 'carabina')
        .replace(/ergonomicas/g, 'ergonómica')
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
    // Value format: "tableName|description|price" to ensure uniqueness if needed, or just use index/description
    // For simplicity, let's assume value is the description
    const item = filteredItems.find(i => i.description === value);
    if (item) {
      setName(item.description);
      setDescription(`Produto seleccionado da tabela ${item.tableName}. Preço Base: ${item.price}€`);
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
                  <Label htmlFor="product-name">Nome do Produto</Label>
                  <Input id="product-name" placeholder="Nome do produto" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description">Descrição</Label>
                  <Textarea id="product-description" placeholder="Descrição detalhada do produto..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria de Arma</Label>
                  <Select onValueChange={setCategory} value={category}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {weaponCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-type">Tipo de Produto</Label>
                    <Select onValueChange={setProductType} value={productType} required>
                      <SelectTrigger id="product-type">
                        <SelectValue placeholder="Seleccione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(productType === 'coronha' || productType === 'fuste') && (
                    <div className="space-y-2">
                      <Label htmlFor="wood-grade">Tipo de Madeira</Label>
                      <Select onValueChange={setWoodGrade} value={woodGrade}>
                        <SelectTrigger id="wood-grade">
                          <SelectValue placeholder="Seleccione o tipo de madeira" />
                        </SelectTrigger>
                        <SelectContent>
                          {woodGrades.map((grade) => (
                            <SelectItem key={grade.id} value={grade.name}>{grade.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {filteredItems.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="price-item">Selecionar Produto da Tabela de Preços</Label>
                    <Select onValueChange={handlePriceItemChange} value={selectedPriceItem}>
                      <SelectTrigger id="price-item">
                        <SelectValue placeholder="Seleccione um produto..." />
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
