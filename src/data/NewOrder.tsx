import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductionStore } from "@/lib/store";
import { useState } from "react";

// Mock Data - Idealmente, estes dados viriam do store ou de uma API
const clients = [
  { id: 'cli-1', name: 'João Silva' },
  { id: 'cli-2', name: 'Maria Santos' },
  { id: 'cli-3', name: 'Pedro Costa' },
];

const weapons = [
  { id: 'wep-1', model: 'Glock G19' },
  { id: 'wep-2', model: 'Beretta 92FS' },
  { id: 'wep-3', model: 'SIG Sauer P226' },
];

export default function NewOrder() {
  const navigate = useNavigate();
  const addOrder = useProductionStore((state) => state.addOrder);
  const products = useProductionStore((state) => state.products);

  const [formData, setFormData] = useState({
    orderNumber: '',
    clientId: '',
    weaponId: '',
    productId: '',
    quantity: '1',
    dueDate: '',
    notes: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate order number if not provided
    const orderNumber = formData.orderNumber || `OP-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;

    const client = clients.find(c => c.id === formData.clientId);
    const weapon = weapons.find(w => w.id === formData.weaponId);

    if (!client || !formData.productId) {
      // Basic validation, in a real app you'd show a proper error
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    addOrder({
      orderNumber,
      client,
      weapon,
      products: [{
        productId: formData.productId, quantity: parseInt(formData.quantity) || 1
      }],
      startDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
    });

    // Navigate back to orders list
    navigate("/orders");
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Nova Ordem de Produção"
        subtitle="Criar uma nova ordem de produção"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Produção
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Ordem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Número da Ordem</Label>
                    <Input
                      id="orderNumber"
                      placeholder="Ex: OP-2024-001 (opcional)"
                      value={formData.orderNumber}
                      onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select onValueChange={(value) => handleInputChange('clientId', value)} value={formData.clientId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weapon">Arma</Label>
                    <Select onValueChange={(value) => handleInputChange('weaponId', value)} value={formData.weaponId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma arma" />
                      </SelectTrigger>
                      <SelectContent>
                        {weapons.map(weapon => (
                          <SelectItem key={weapon.id} value={weapon.id}>{weapon.model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Produto</Label>
                    <Select onValueChange={(value) => handleInputChange('productId', value)} value={formData.productId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Prazo de Entrega</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações adicionais..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Ordem
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}