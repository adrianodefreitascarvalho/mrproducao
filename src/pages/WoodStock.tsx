import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Save, Search, Package, Settings } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Tipos para as madeiras
interface WoodItem {
  id: string;
  sku: string;
  type: string; // Ex: Nogueira, Carvalho
  part: string; // Ex: Coronha, Fuste
  grade: string; // Ex: Grade 1, Grade 2
  quantity: number;
  price?: number;
  frontPhoto?: string;
  backPhoto?: string;
}

// Função auxiliar para gerar IDs (fora do componente para evitar erros de pureza)
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_GRADE_PRICES: Record<string, number> = {
  'Grau 2': 150,
  'Grau 3': 250,
  'Grau 4': 450,
  'Grau 5': 700,
  'Exibição 1': 1000,
  'Exibição 2': 1200,
  'Exibição 3': 1500,
  'Exibição 4': 1800,
  'Exibição 5': 2200,
  'Premium-Normal': 3000,
  'Premium-Especial': 5000,
};

const PRODUCT_TYPE_PREFIXES: Record<string, string> = {
  'GE-Espingarda de Caça': 'GE',
  'SA-Semi-Automática': 'SA',
  'CA-Carabina': 'CA',
  'PO-Punho Glove': 'PG',
};

const GRADE_PREFIXES: Record<string, string> = {
  'Grau 2': 'G2', 'Grau 3': 'G3', 'Grau 4': 'G4', 'Grau 5': 'G5',
  'Exibição 1': 'E1', 'Exibição 2': 'E2', 'Exibição 3': 'E3', 'Exibição 4': 'E4', 'Exibição 5': 'E5',
  'Premium-Normal': 'PN', 'Premium-Especial': 'PE',
};

const skuSequence = 1; // Simulação de sequência global

export default function WoodStock() {
  // Usar localStorage para persistência local, já que a store global parece problemática
  const [items, setItems] = useState<WoodItem[]>(() => {
    try {
      const saved = sessionStorage.getItem("wood-stock-items");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Persistir alterações (sessionStorage clears on browser close)
  useEffect(() => {
    sessionStorage.setItem("wood-stock-items", JSON.stringify(items));
  }, [items]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPriceConfigOpen, setIsPriceConfigOpen] = useState(false);
  const [gradePrices, setGradePrices] = useState(INITIAL_GRADE_PRICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Estado para edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<WoodItem, 'id'>>({
    sku: '',
    type: 'GE-Espingarda de Caça',
    part: 'Coronha',
    grade: '',
    quantity: 1,
    price: 0,
    frontPhoto: '',
    backPhoto: ''
  });

  // Filtrar itens
  const filteredItems = (items || []).filter(item => 
    (item.type || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (item.sku || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  // Iniciar edição
  const handleEdit = (item: WoodItem) => {
    setFormData({
      sku: item.sku,
      type: item.type,
      part: item.part,
      grade: item.grade,
      quantity: item.quantity,
      price: item.price || 0,
      frontPhoto: item.frontPhoto || '',
      backPhoto: item.backPhoto || ''
    });
    setEditingId(item.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edição/criação
  const handleCancel = () => {
    setFormData({
      sku: '',
      type: 'GE-Espingarda de Caça',
      part: 'Coronha',
      grade: '',
      quantity: 1,
      price: 0,
      frontPhoto: '',
      backPhoto: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  // Submeter formulário (Criar ou Atualizar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Atualizar existente
      setItems(items.map(item =>
        item.id === editingId 
          ? { ...formData, id: editingId }
          : item
      ));
    } else {
      // Criar novo
      const typePrefix = PRODUCT_TYPE_PREFIXES[formData.type] || 'XX';
      const gradePrefix = GRADE_PREFIXES[formData.grade] || 'XX';
      
      // Encontrar o maior sequencial existente para este tipo/grau ou usar o global
      // Para simplificar e garantir unicidade global ou por tipo, vamos usar um contador global simples aqui
      // Em produção real, isto viria da base de dados
      const currentMaxSku = items
        .map(i => parseInt(i.sku.slice(4)))
        .filter(n => !isNaN(n))
        .reduce((max, curr) => Math.max(max, curr), 0);
        
      const nextSequence = Math.max(skuSequence, currentMaxSku + 1);
      const newSku = `${typePrefix}${gradePrefix}${String(nextSequence).padStart(6, '0')}`;

      const newItem = {
        ...formData,
        sku: newSku,
        id: generateId(),
      };
      setItems([...items, newItem]);
    }

    handleCancel();
  };

  // Eliminar item
  const handleDelete = (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este item de stock?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Tem a certeza que pretende eliminar ${selectedItems.length} itens de stock?`)) {
      setItems(items.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    }
  };

  const handlePriceChange = (grade: string, price: string) => {
    setGradePrices(prev => ({ ...prev, [grade]: Number(price) || 0 }));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <Header 
        title="Gestão de Stock de Madeiras" 
        subtitle="Controlo de inventário de coronhas, fustes e blocos" 
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              aria-label="Pesquisar madeiras"
              placeholder="Pesquisar por SKU ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {selectedItems.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar ({selectedItems.length})
            </Button>
          )}
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsPriceConfigOpen(!isPriceConfigOpen)}
            >
              <Settings className="w-4 h-4 mr-2" /> Configurar Preços
            </Button>
            <Button 
              onClick={() => { handleCancel(); setIsFormOpen(!isFormOpen); setIsPriceConfigOpen(false); }}
              className={isFormOpen ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isFormOpen ? <><X className="w-4 h-4 mr-2" /> Cancelar</> : <><Plus className="w-4 h-4 mr-2" /> Nova Madeira</>}
            </Button>
          </div>
        </div>

        {/* Configuração de Preços */}
        {isPriceConfigOpen && (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Configuração de Preços por Qualidade
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsPriceConfigOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(gradePrices).map(([grade, price]) => (
                <div key={grade} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{grade}</label>
                  <Input type="number" value={price} onChange={(e) => handlePriceChange(grade, e.target.value)} className="h-8" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        {isFormOpen && (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                {editingId ? <Pencil className="w-5 h-5 text-primary" /> : <Package className="w-5 h-5 text-primary" />}
                <h2 className="text-lg font-semibold">
                  {editingId ? 'Editar Madeira' : 'Adicionar Nova Madeira'}
                </h2>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="sku" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">SKU / Referência</label>
                  <Input id="sku" value={formData.sku || ""} disabled placeholder="Gerado ao guardar" className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Tipo de Produto</label>
                  <select id="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="GE-Espingarda de Caça">GE-Espingarda de Caça</option>
                    <option value="SA-Semi-Automática">SA-Semi-Automática</option>
                    <option value="CA-Carabina">CA-Carabina</option>
                    <option value="PO-Punho Glove">PO-Punho Glove</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="part" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Peça</label>
                  <select 
                    id="part" 
                    title="Peça"
                    aria-label="Peça"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                    value={formData.part} 
                    onChange={e => setFormData({...formData, part: e.target.value})}
                  >
                    <option value="Coronha">Coronha</option>
                    <option value="Semi-Automática">Semi-Automática</option>
                    <option value="Carabina">Carabina</option>
                    <option value="Fuste">Fuste</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="grade" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Grau</label>
                  <select 
                    id="grade" 
                    title="Qualidade"
                    aria-label="Qualidade"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                    value={formData.grade} 
                    onChange={e => {
                      const newGrade = e.target.value;
                      const newPrice = gradePrices[newGrade] || 0;
                      setFormData({...formData, grade: newGrade, price: newPrice });
                    }}
                  >
                    <option value="">Selecione...</option>
                    {Object.keys(INITIAL_GRADE_PRICES).map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Preço (€)</label>
                  <Input id="price" type="number" value={formData.price || 0} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Quantidade</label>
                  <Input id="quantity" required type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="frontPhoto" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Foto Frente</label>
                  <Input id="frontPhoto" type="file" accept="image/*" onChange={e => e.target.files?.[0] && setFormData({...formData, frontPhoto: e.target.files[0].name})} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="backPhoto" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Foto Verso</label>
                  <Input id="backPhoto" type="file" accept="image/*" onChange={e => e.target.files?.[0] && setFormData({...formData, backPhoto: e.target.files[0].name})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Atualizar Madeira' : 'Guardar Madeira'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-medium border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <Checkbox
                      checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3">SKU</th><th className="px-4 py-3">Tipo de Produto</th><th className="px-4 py-3">Peça</th><th className="px-4 py-3">Grau</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3 text-right">Preço</th><th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.length === 0 ? (<tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Nenhuma madeira encontrada.</td></tr>) : (filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleSelectItem(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{item.sku}</td><td className="px-4 py-3">{item.type}</td><td className="px-4 py-3">{item.part}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{item.grade}</span></td>
                    <td className="px-4 py-3">
                      <span className="font-bold">{item.quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {item.price !== undefined 
                        ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(item.price)
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} aria-label={`Editar ${item.sku}`} title="Editar">
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="hover:bg-destructive/10" aria-label={`Eliminar ${item.sku}`} title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>)))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}