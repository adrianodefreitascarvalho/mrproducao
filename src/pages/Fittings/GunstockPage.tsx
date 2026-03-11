import { ReactNode } from "react";
import { FittingPage, FittingData } from "./FittingPage";

// Define the specific data structure for Gunstock fittings
type GunstockFittingData = Omit<FittingData, 'id' | 'created_at'> & {
    gunstock_measurements1?: number | null;
    gunstock_measurements2?: number | null;
    gunstock_measurements3?: number | null;
    gunstock_measurements4?: number | null;
    gunstock_measurements5?: number | null;
    gunstock_measurements6?: number | null;
    gunstock_measurements7?: number | null;
    gunstock_width1?: number | null;
    gunstock_width2?: number | null;
    gunstock_width3?: number | null;
    gunstock_recoil_pad1?: number | null;
    gunstock_recoil_pad2?: number | null;
    gunstock_recoil_pad3?: number | null;
    gunstock_cast_off1?: number | null;
    gunstock_cast_off2?: number | null;
    gunstock_cast_off3?: number | null;
    gunstock_cast_off4?: number | null;
    gunstock_cast_on1?: number | null;
    gunstock_cast_on2?: number | null;
    gunstock_cast_on3?: number | null;
    gunstock_cast_on4?: number | null;
};

// Initial empty state for the form
const emptyFormData: GunstockFittingData = {
    units: 'cm',
    client_id: null, order_id: null, weapon_id: null,
    gunstock_measurements1: null, gunstock_measurements2: null, gunstock_measurements3: null,
    gunstock_measurements4: null, gunstock_measurements5: null, gunstock_measurements6: null,
    gunstock_measurements7: null, gunstock_width1: null, gunstock_width2: null, gunstock_width3: null,
    gunstock_recoil_pad1: null, gunstock_recoil_pad2: null, gunstock_recoil_pad3: null,
    gunstock_cast_off1: null, gunstock_cast_off2: null, gunstock_cast_off3: null, gunstock_cast_off4: null,
    gunstock_cast_on1: null, gunstock_cast_on2: null, gunstock_cast_on3: null, gunstock_cast_on4: null,
};

// Function to render the specific form fields for Gunstock fittings
const renderFormFields = (
    _formData: GunstockFittingData,
    _handleInputChange: (field: keyof GunstockFittingData, value: string | number | boolean | null | undefined) => void,
    renderField: (label: string, field: keyof GunstockFittingData, showUnits?: boolean) => ReactNode
) => (
    <>
        <h3 className="text-lg font-medium pt-4 col-span-1 md:col-span-3">Medidas da Coronha</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderField('Medida 1', 'gunstock_measurements1')}
            {renderField('Medida 2', 'gunstock_measurements2')}
            {renderField('Medida 3', 'gunstock_measurements3')}
            {renderField('Medida 4', 'gunstock_measurements4')}
            {renderField('Medida 5', 'gunstock_measurements5')}
            {renderField('Medida 6', 'gunstock_measurements6')}
            {renderField('Medida 7', 'gunstock_measurements7')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4 col-span-1 md:col-span-3">
            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium text-center">Cast On</h4>
                <div className="grid grid-cols-2 gap-4">
                    {renderField('Cast On 1', 'gunstock_cast_on1')}
                    {renderField('Cast On 2', 'gunstock_cast_on2')}
                    {renderField('Cast On 3', 'gunstock_cast_on3')}
                    {renderField('Cast On 4', 'gunstock_cast_on4')}
                </div>
            </div>
            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium text-center">Cast Off</h4>
                <div className="grid grid-cols-2 gap-4">
                    {renderField('Cast Off 1', 'gunstock_cast_off1')}
                    {renderField('Cast Off 2', 'gunstock_cast_off2')}
                    {renderField('Cast Off 3', 'gunstock_cast_off3')}
                    {renderField('Cast Off 4', 'gunstock_cast_off4')}
                </div>
            </div>
        </div>

        <h3 className="text-lg font-medium pt-4 col-span-1 md:col-span-3">Punho (Grip) e Calço</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('Largura 1', 'gunstock_width1')}
            {renderField('Largura 2', 'gunstock_width2')}
            {renderField('Largura 3', 'gunstock_width3')}
            {renderField('Recoil Pad 1', 'gunstock_recoil_pad1')}
            {renderField('Recoil Pad 2', 'gunstock_recoil_pad2')}
            {renderField('Recoil Pad 3', 'gunstock_recoil_pad3')}
        </div>
    </>
);

export default function GunstockPage() {
    return (
        <FittingPage<GunstockFittingData>
            pageTitle="Medidas de Coronha"
            pageSubtitle="Gestão de registos de medidas de coronha"
            tableName="gunstock_dimensions"
            emptyFormData={emptyFormData}
            renderFormFields={renderFormFields}
            pdfTemplatePath="/path/to/gunstock_template.pdf"
            pdfSchemaPath="/path/to/gunstock_schema.json"
            pdfOutputNamePrefix="medidas_coronha"
        />
    );
}