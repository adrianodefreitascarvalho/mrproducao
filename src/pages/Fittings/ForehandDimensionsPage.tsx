import { ReactNode } from "react";
import { FittingPage, FittingData } from "./FittingPage";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define a estrutura de dados específica para Medidas do Fuste
type ForehandDimensionsData = Omit<FittingData, 'id' | 'created_at'> & {
    width?: number;
    length?: number;
    depth?: number;
    shape?: string;
    observations?: string;
};

// Estado inicial vazio para o formulário
const emptyFormData: ForehandDimensionsData = {
    units: 'cm',
    client_id: undefined,
    order_id: undefined,
    weapon_id: undefined,
    width: undefined,
    length: undefined,
    depth: undefined,
    shape: undefined,
    observations: undefined,
};

// Função para renderizar os campos de formulário específicos para Medidas do Fuste
const renderFormFields = (
    formData: ForehandDimensionsData,
    handleInputChange: (field: keyof ForehandDimensionsData, value: string | number | boolean | null | undefined) => void,
    renderField: (label: string, field: keyof ForehandDimensionsData, showUnits?: boolean) => ReactNode
) => (
    <>
        <h3 className="text-lg font-medium pt-4">Medidas do Fuste</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderField("Largura", "width")}
            {renderField("Comprimento", "length")}
            {renderField("Altura", "depth")}
            <div className="space-y-2">
                <Label htmlFor="shape">Formato</Label>
                <Input
                    id="shape"
                    type="text"
                    value={formData.shape || ''}
                    onChange={(e) => handleInputChange('shape', e.target.value)}
                />
            </div>
        </div>
        <div className="space-y-2 pt-4">
            <Label htmlFor="observations">Observações do Fuste (Trabalho)</Label>
            <Textarea id="observations" value={formData.observations || ''} onChange={(e) => handleInputChange('observations', e.target.value)} 
            placeholder="Descrição do trabalho a realizar no fuste..."/>
        </div>
    </>
);

export default function ForehandDimensionsPage() {
    return (
        <FittingPage<ForehandDimensionsData>
            pageTitle="Medidas do Fuste"
            pageSubtitle="Gestão de registos de medidas do fuste"
            tableName="forehand_dimensions"
            emptyFormData={emptyFormData}
            renderFormFields={renderFormFields}
            pdfTemplatePath="/path/to/forehand_template.pdf"
            pdfSchemaPath="/path/to/forehand_schema.json"
            pdfOutputNamePrefix="medidas_fuste"
        />
    );
}