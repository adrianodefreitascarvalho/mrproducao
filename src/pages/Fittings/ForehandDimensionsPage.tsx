import { ReactNode } from "react";
import { FittingPage, FittingData } from "./FittingPage";
import { CardTitle } from "@/components/ui/card";

// Define a estrutura de dados específica para Medidas do Fuste
type ForehandDimensionsData = Omit<FittingData, 'id' | 'created_at'> & {
    forehand_dimensions_top_view1?: number | null;
    forehand_dimensions_top_view2?: number | null;
    forehand_dimensions_top_view3?: number | null;
    forehand_dimensions_side_view4?: number | null;
    forehand_dimensions_side_view5?: number | null;
    forehand_dimensions_side_view6?: number | null;
    forehand_dimensions_side_view7?: number | null;
};

// Estado inicial vazio para o formulário
const emptyFormData: ForehandDimensionsData = {
    units: 'cm',
    client_id: null, order_id: null, weapon_id: null,
    forehand_dimensions_top_view1: null,
    forehand_dimensions_top_view2: null,
    forehand_dimensions_top_view3: null,
    forehand_dimensions_side_view4: null,
    forehand_dimensions_side_view5: null,
    forehand_dimensions_side_view6: null,
    forehand_dimensions_side_view7: null,
};

// Função para renderizar os campos de formulário específicos para Medidas do Fuste
const renderFormFields = (
    _formData: ForehandDimensionsData,
    _handleInputChange: (field: keyof ForehandDimensionsData, value: string | number | boolean | null | undefined) => void,
    renderField: (label: string, field: keyof ForehandDimensionsData, showUnits?: boolean) => ReactNode
) => (
    <>
        <CardTitle className="text-lg pt-4">Medidas do Fuste (Vista de Cima)</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderField("Vista de Cima 1", "forehand_dimensions_top_view1")}
            {renderField("Vista de Cima 2", "forehand_dimensions_top_view2")}
            {renderField("Vista de Cima 3", "forehand_dimensions_top_view3")}
        </div>
        <CardTitle className="text-lg pt-4">Medidas do Fuste (Vista de Lado)</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderField("Vista de Lado 4", "forehand_dimensions_side_view4")}
            {renderField("Vista de Lado 5", "forehand_dimensions_side_view5")}
            {renderField("Vista de Lado 6", "forehand_dimensions_side_view6")}
            {renderField("Vista de Lado 7", "forehand_dimensions_side_view7")}
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
            pdfTemplatePath="/pdf-templates/Fuste.pdf"
            pdfSchemaPath="/pdf-templates/forehand_dimensions_schema.json"
            pdfOutputNamePrefix="medidas_fuste"
        />
    );
}