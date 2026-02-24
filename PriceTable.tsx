import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch, Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

// 1. Definir os schemas de validação para a nova estrutura
const tableItemSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória."),
  price: z.number().positive("O preço deve ser positivo."),
});

const priceTableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "O nome da tabela é obrigatório."),
  items: z.array(tableItemSchema),
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
    name: `tables.${tableIndex}.items`,
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
              {...register(`tables.${tableIndex}.items.${index}.description`)}
              placeholder="Descrição do item"
            />
            {errors.tables?.[tableIndex]?.items?.[index]?.description && <p className="text-sm text-red-500">{errors.tables?.[tableIndex]?.items?.[index]?.description?.message}</p>}
          </div>
          <div className="w-32 space-y-1">
            <input
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-right placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              type="number"
              step="0.01"
              {...register(`tables.${tableIndex}.items.${index}.price`, { valueAsNumber: true })}
              placeholder="Preço"
            />
            {errors.tables?.[tableIndex]?.items?.[index]?.price && <p className="text-sm text-red-500">{errors.tables?.[tableIndex]?.items?.[index]?.price?.message}</p>}
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
    defaultValues: {
      tables: [{ id: crypto.randomUUID(), name: "Tabela Padrão", items: [] }],
    },
  });

  const { fields: tableFields, append: appendTable, remove: removeTable } = useFieldArray({
    control,
    name: "tables",
  });

  const [activeTab, setActiveTab] = useState(tableFields[0]?.id);

  // Carregar dados do Supabase ao iniciar
  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase.from("price_tables").select("*");
      
      if (data && data.length > 0) {
        // Atualiza o formulário com os dados vindos do banco
        reset({ tables: data });
        setActiveTab(data[0].id);
      } else if (error) {
        console.error("Erro ao buscar tabelas:", error);
      }
    };
    fetchTables();
  }, [reset]);

  const addNewTable = () => {
    const newId = crypto.randomUUID();
    appendTable({
      id: newId,
      name: `Tabela ${tableFields.length + 1}`,
      items: [],
    });
    setActiveTab(newId);
  };

  const onSubmit = async (data: FormValues) => {
    // Salva (Upsert) todas as tabelas no Supabase
    const { error } = await supabase.from("price_tables").upsert(data.tables);

    if (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar as tabelas.");
    } else {
      alert("Tabelas salvas com sucesso no Supabase!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center border-b">
          <TabsList className="flex-wrap h-auto">
            {tableFields.map((field, index) => (
              <TabsTrigger key={field.id} value={field.id} className="relative group">
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
              </TabsTrigger>
            ))}
          </TabsList>
          <button type="button" onClick={addNewTable} className="ml-4 inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
            <PlusCircle className="h-4 w-4" /> Nova Tabela
          </button>
        </div>
        {tableFields.map((field, index) => (
          <TabsContent key={field.id} value={field.id}>
            <TableItems tableIndex={index} control={control} register={register} errors={errors} />
          </TabsContent>
        ))}
      </Tabs>
    </form>
  );
};

export default PriceTable;