import { Header } from "@/components/layout/Header";
import { PriceTable } from "./PriceTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tableNames = [
  "Geral",
  "Patina D – IF",
  "Platina L – IV",
  "Meia Platina",
  "Platina SO",
  "Semi Auto",
  "Carabina",
  "Carabina 2",
  "Ergonómica",
  "Extras",
];

export default function PriceTablesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Tabelas de Preços"
        subtitle="Gestão de itens e preços por tabela."
      />
      <main className="flex-1 p-6">
        <Tabs defaultValue={tableNames[0]} className="h-full">
          <TabsList>
            {tableNames.map((name) => (
              <TabsTrigger key={name} value={name}>
                {name}
              </TabsTrigger>
            ))}
          </TabsList>

          {tableNames.map((name) => (
            <TabsContent key={name} value={name} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Itens da Tabela: {name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <PriceTable tableName={name} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}