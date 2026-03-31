import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, PlusCircle, Upload, PackageOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "../lib/supabase";
import ExcelJS from "exceljs";
import { useProductionStore } from "../lib/store";

// 1. Definir os schemas de validação para a nova estrutura
const tableItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "A descrição é obrigatória."),
  price: z.number().positive("O preço deve ser positivo."),
});

const priceTableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "O nome da tabela é obrigatório."),
  price_items: z.array(tableItemSchema),
});

const formSchema = z.object({
  tables: z.array(priceTableSchema),
});

type FormValues = z.infer<typeof formSchema>;

type TableItemsProps = {
  tableIndex: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
};

// 2. Sub-componente para gerir os items de UMA tabela
const TableItems = ({ tableIndex, control, register, errors }: TableItemsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `tables.${tableIndex}.price_items`,
  });

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center space-x-2 border-b pb-2 font-medium text-slate-600">
        <div className="grow">Descrição</div>
        <div className="w-32 text-right">Preço</div>
        <div className="w-10"></div>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start space-x-2">
          <div className="grow space-y-1">
            <input
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              {...register(`tables.${tableIndex}.price_items.${index}.description`)}
              placeholder="Descrição do item"
            />
            {errors.tables?.[tableIndex]?.price_items?.[index]?.description && <p className="text-sm text-red-500">{errors.tables?.[tableIndex]?.price_items?.[index]?.description?.message}</p>}
          </div>
          <div className="w-32 space-y-1">
            <input
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-right placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              type="number"
              step="0.01"
              {...register(`tables.${tableIndex}.price_items.${index}.price`, { valueAsNumber: true })}
              placeholder="Preço"
            />
            {errors.tables?.[tableIndex]?.price_items?.[index]?.price && <p className="text-sm text-red-500">{errors.tables?.[tableIndex]?.price_items?.[index]?.price?.message}</p>}
          </div>
          <button type="button" aria-label="Remover item" className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-red-500 text-sm font-medium text-white hover:bg-red-600" onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        onClick={() => append({ description: "", price: 0 })}
      >
        <PlusCircle className="h-4 w-4" />
        Adicionar Item
      </button>
    </div>
  );
};

const PriceTable = () => {
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Os valores são agora definidos dinamicamente no useEffect para garantir a sincronização correta.
    defaultValues: { tables: [] },
  });

  const { fields: tableFields, append: appendTable, remove: removeTable } = useFieldArray({
    control,
    name: "tables",
  });

  const [activeTab, setActiveTab] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { priceTables, fetchPriceTables, isLoadingPriceTables } = useProductionStore();

  // Carregar dados do Supabase ao iniciar
  useEffect(() => {
    // Este efeito é a fonte de verdade para popular o formulário.
    // Ele só é executado quando o estado de carregamento termina.
    if (isLoadingPriceTables) return;

    const tablesFromStore = priceTables.map((table) => {
      return { ...table, price_items: table.price_items || [] };
    });

    reset({ tables: tablesFromStore as unknown as FormValues['tables'] });
    if (tablesFromStore.length > 0) {
      setActiveTab(currentTab => tablesFromStore.some(t => t.id === currentTab) ? currentTab : tablesFromStore[0]?.id);
    } else {
      setActiveTab(undefined);
    }
  }, [isLoadingPriceTables, priceTables, reset]);

  const addNewTable = () => {
    const newId = crypto.randomUUID();
    appendTable({
      id: newId,
      name: `Tabela ${tableFields.length + 1}`,
      price_items: [],
    });
    setActiveTab(newId);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      for (const table of data.tables) {
        // 1. Upsert table header
        const { error: tableError } = await supabase
          .from("price_tables")
          .upsert({ id: table.id, name: table.name, items: [] });
        
        if (tableError) throw tableError;

        // 2. Handle items
        // Delete items not in the form (if needed) or just upsert all
        // For simplicity in this refactor, we delete all for this table and re-insert to handle removals
        // A better approach for production would be diffing.
        await supabase.from("price_items").delete().eq("price_table_id", table.id);

        if (table.price_items.length > 0) {
          const itemsToInsert = table.price_items.map(item => ({
            price_table_id: table.id,
            description: item.description,
            price: item.price
          }));
          
          const { error: itemsError } = await supabase.from("price_items").insert(itemsToInsert);
          if (itemsError) throw itemsError;
        }
      }
      alert("Tabelas salvas com sucesso!");
      fetchPriceTables();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar as tabelas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const importedTables: FormValues["tables"] = [];

      workbook.eachSheet((worksheet) => {
const newItems: z.infer<typeof tableItemSchema>[] = [];
        const headerRow = worksheet.getRow(1);

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Saltar cabeçalho

<<<<<<< HEAD
          const rowData: any = {};
=======
          const rowData: Record<string, ExcelJS.CellValue> = {};
>>>>>>> b8cfae24d95499e24d7f9c6a4e31cc1a74bb3818
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headerRow.getCell(colNumber).value?.toString();
            if (header) {
              rowData[header] = cell.value;
            }
          });

<<<<<<< HEAD
          const description = rowData["Descrição"] || rowData["description"] || "";
=======
          const description = String(rowData["Descrição"] || rowData["description"] || "");
>>>>>>> b8cfae24d95499e24d7f9c6a4e31cc1a74bb3818
          const price = parseFloat(String(rowData["Preço"] || rowData["price"] || 0)) || 0;

          if (description) {
            newItems.push({ description, price });
          }
        });

        if (newItems.length > 0) {
          importedTables.push({
            id: crypto.randomUUID(),
            name: worksheet.name,
            price_items: newItems,
          });
        }
      });

      if (importedTables.length > 0) {
        reset({ tables: importedTables });
        setActiveTab(importedTables[0].id);
        alert(`${importedTables.length} tabelas importadas com sucesso! Clique em 'Salvar Alterações' para persistir os dados.`);
      } else {
        alert("Nenhuma tabela válida foi encontrada no ficheiro Excel.");
      }
    } catch (error) {
      console.error("Erro ao importar o ficheiro:", error);
      alert("Ocorreu um erro ao processar o ficheiro. Verifique se o formato está correcto.");
    } finally {
      setIsLoading(false);
    }
    event.target.value = ""; // Limpa o input para permitir re-upload
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center border-b">
          <TabsList className="flex-wrap h-auto">
            {tableFields.map((field, index) => (
              <TabsTrigger key={field.id} value={field.id} className="relative group" asChild>
                <div>
                  <input
                    {...register(`tables.${index}.name`)}
                    className="bg-transparent text-center focus:outline-none"
                  />
                  {tableFields.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTable(index);
                      }}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center"
                      aria-label="Remover tabela"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          <button type="button" onClick={addNewTable} className="ml-4 inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
            <PlusCircle className="h-4 w-4" /> Nova Tabela
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="ml-2 inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700" disabled={isLoading}>
            <Upload className="h-4 w-4" /> {isLoading ? "A processar..." : "Importar Excel"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
            accept=".xlsx, .xls"
            aria-label="Importar ficheiro Excel"
          />
          <button type="submit" className="ml-auto inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" disabled={isLoading}>
            Salvar Alterações
          </button>
        </div>
        {(isLoading || isLoadingPriceTables) ? (
          <div className="flex justify-center items-center h-64">
            <p>A carregar dados...</p>
          </div>
        ) : tableFields.length > 0 ? (
          tableFields.map((field, index) => (
            <TabsContent key={field.id} value={field.id}>
              <TableItems tableIndex={index} control={control} register={register} errors={errors} />
            </TabsContent>
          ))
        ) : (
          <div className="mt-4 flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed text-center text-slate-500">
            <PackageOpen className="mb-4 h-12 w-12 text-slate-400" />
            <h3 className="text-lg font-semibold">Nenhuma Tabela de Preços Encontrada</h3>
            <p className="text-sm">Crie uma nova tabela ou importe de um ficheiro Excel para começar.</p>
          </div>
        )}
      </Tabs>
    </form>
  );
};

export default PriceTable;