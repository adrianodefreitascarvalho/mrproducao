import { ReactNode } from "react";
import { FittingPage, FittingData } from "./FittingPage";
import { CardTitle } from "@/components/ui/card";

// Define a estrutura de dados específica para Medidas Corporais
type BodyMeasurementsData = Omit<FittingData, 'id' | 'created_at'> & {
    body_measurements_open_palm1?: number | null;
    body_measurements_open_palm2?: number | null;
    body_measurements_open_palm3?: number | null;
    body_measurements_open_palm4?: number | null;
    body_measurements_open_palm5?: number | null;
    body_measurements_open_palm6?: number | null;
    body_measurements_body1?: number | null;
    body_measurements_body2?: number | null;
    body_measurements_body3?: number | null;
    body_measurements_weight?: number | null;
    body_measurements_age?: number | null;
    body_measurements_hand_in_position1?: number | null;
    body_measurements_hand_in_position2?: number | null;
    body_measurements_hand_in_position3?: number | null;
    body_measurements_between_hands?: number | null;
};

// Estado inicial vazio para o formulário
const emptyFormData: BodyMeasurementsData = {
    units: 'cm',
    client_id: null, order_id: null, weapon_id: null,
    body_measurements_open_palm1: null,
    body_measurements_open_palm2: null,
    body_measurements_open_palm3: null,
    body_measurements_open_palm4: null,
    body_measurements_open_palm5: null,
    body_measurements_open_palm6: null,
    body_measurements_body1: null,
    body_measurements_body2: null,
    body_measurements_body3: null,
    body_measurements_weight: null,
    body_measurements_age: null,
    body_measurements_hand_in_position1: null,
    body_measurements_hand_in_position2: null,
    body_measurements_hand_in_position3: null,
    body_measurements_between_hands: null,
};

// Função para renderizar os campos de formulário específicos para Medidas Corporais
const renderFormFields = (
    _formData: BodyMeasurementsData,
    _handleInputChange: (field: keyof BodyMeasurementsData, value: string | number | boolean | null | undefined) => void,
    renderField: (label: string, field: keyof BodyMeasurementsData, showUnits?: boolean) => ReactNode
) => (
    <>
        <CardTitle className="text-lg pt-4">Medidas (Mão Aberta)</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField("Mão Aberta 1", "body_measurements_open_palm1")}
            {renderField("Mão Aberta 2", "body_measurements_open_palm2")}
            {renderField("Mão Aberta 3", "body_measurements_open_palm3")}
            {renderField("Mão Aberta 4", "body_measurements_open_palm4")}
            {renderField("Mão Aberta 5", "body_measurements_open_palm5")}
            {renderField("Mão Aberta 6", "body_measurements_open_palm6")}
        </div>
        <CardTitle className="text-lg pt-4">Medidas (Corpo)</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField("Corpo 1", "body_measurements_body1")}
            {renderField("Corpo 2", "body_measurements_body2")}
            {renderField("Corpo 3", "body_measurements_body3")}
            {renderField("Peso (kg)", "body_measurements_weight", false)}
            {renderField("Idade", "body_measurements_age", false)}
        </div>
        <CardTitle className="text-lg pt-4">Medidas (Mão em Posição)</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField("Mão em Posição 1", "body_measurements_hand_in_position1")}
            {renderField("Mão em Posição 2", "body_measurements_hand_in_position2")}
            {renderField("Mão em Posição 3", "body_measurements_hand_in_position3")}
            {renderField("Entre Mãos", "body_measurements_between_hands")}
        </div>
    </>
);

export default function BodyMeasurementsPage() {
    return (
        <FittingPage<BodyMeasurementsData>
            pageTitle="Medidas Corporais"
            pageSubtitle="Gestão de registos de medidas corporais"
            tableName="body_measurements"
            emptyFormData={emptyFormData}
            renderFormFields={renderFormFields}
            pdfTemplatePath="/pdf-templates/Corpo.pdf"
            pdfSchemaPath="/pdf-templates/body_measurements_schema.json"
            pdfOutputNamePrefix="medidas_corpo"
        />
    );
}