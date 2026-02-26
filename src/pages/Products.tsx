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
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

const Products = () => {
  const navigate = useNavigate();
  const products = useProductionStore((state) => state.products);
  const removeProduct = useProductionStore((state) => state.removeProduct);
  const productTypes = useProductionStore((state) => state.productTypes);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const productTypeMap = useMemo(() => new Map<string, string>([
    ['GE-Espingarda de Caça', 'Espingarda de Caça'],
    ['SA-Semi-Automática', 'Semi-Automática'],
    ['CA-Carabina', 'Carabina'],
    ['PO-Punho Glove', 'Punho Glove'],
    ...productTypes.map((pt) => [pt.id, pt.name] as [string, string])
  ]), [productTypes]);

  const handleNewProduct = () => {
    navigate("/products/new");
  };

  const handleEditProduct = (id: string) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Tem a certeza que pretende eliminar o produto "${name}"?`)) {
      removeProduct(id);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pId) => pId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(`Tem a certeza que pretende eliminar ${selectedProducts.length} produtos?`)) {
      selectedProducts.forEach((id) => removeProduct(id));
      setSelectedProducts([]);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Catálogo de Produtos"
        subtitle="Gestão de todos os produtos utilizados na produção"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-end gap-2">
          {selectedProducts.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar ({selectedProducts.length})
            </Button>
          )}
          <Button onClick={handleNewProduct}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={products.length > 0 && selectedProducts.length === products.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Nome do Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Espécie</TableHead>
                <TableHead className="text-right w-25">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleSelectProduct(product.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      {productTypeMap.get(product.product_type || '') || product.product_type || "N/A"}
                    </TableCell>
                    <TableCell>
                      {product.wood_grade || "Nogueira Turca"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
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

export default Products;