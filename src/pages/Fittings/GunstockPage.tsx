import { ReactNode } from "react";
import { FittingPage, FittingData } from "../fittings/FittingPage";

// Define the specific data structure for Gunstock fittings
type GunstockFittingData = Omit<FittingData, 'id' | 'created_at'> & {
    // Medidas da Coronha (baseado no script python)
    length_of_pull?: number;
    drop_at_comb?: number;
    drop_at_heel?: number;
    drop_at_monte_carlo?: number; // M4
    cast_at_heel?: number;
    cast_at_toe?: number;
    cast_at_comb?: number; // M7
    pitch?: number;

    // Cast On
    cast_on_1?: number;
    cast_on_2?: number;
    cast_on_3?: number;
    cast_on_4?: number;

    // Cast Off
    cast_off_1?: number;
    cast_off_2?: number;
    cast_off_3?: number;
    cast_off_4?: number;

    // Grip Width
    grip_width_1?: number;
    grip_width_2?: number;
    grip_width_3?: number;

    // Grip Measurements
    grip_measurements_1?: number;
    grip_measurements_2?: number;
    grip_measurements_3?: number;
    grip_measurements_4?: number;
    grip_measurements_5?: number;
    grip_measurements_6?: number;

    // Recoil Pad
    recoil_pad_1?: number;
    recoil_pad_2?: number;
    recoil_pad_3?: number;
};

// Initial empty state for the form
const emptyFormData: GunstockFittingData = {
    units: 'cm',
    client_id: undefined,
    order_id: undefined,
    weapon_id: undefined,
    length_of_pull: undefined,
    drop_at_comb: undefined,
    drop_at_heel: undefined,
    drop_at_monte_carlo: undefined,
    cast_at_heel: undefined,
    cast_at_toe: undefined,
    cast_at_comb: undefined,
    pitch: undefined,
    cast_on_1: undefined,
    cast_on_2: undefined,
    cast_on_3: undefined,
    cast_on_4: undefined,
    cast_off_1: undefined,
    cast_off_2: undefined,
    cast_off_3: undefined,
    cast_off_4: undefined,
    grip_width_1: undefined,
    grip_width_2: undefined,
    grip_width_3: undefined,
    grip_measurements_1: undefined,
    grip_measurements_2: undefined,
    grip_measurements_3: undefined,
    grip_measurements_4: undefined,
    grip_measurements_5: undefined,
    grip_measurements_6: undefined,
    recoil_pad_1: undefined,
    recoil_pad_2: undefined,
    recoil_pad_3: undefined,
};

// Function to render the specific form fields for Gunstock fittings
const renderFormFields = (
    _formData: GunstockFittingData,
    _handleInputChange: (field: keyof GunstockFittingData, value: string | number | boolean | null | undefined) => void,
    renderField: (label: string, field: keyof GunstockFittingData, showUnits?: boolean) => ReactNode
) => (
    <>
        <h3 className="text-lg font-medium pt-4 col-span-1 md:col-span-3">Medidas da Coronha</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField("Comprimento (M1)", "length_of_pull")}
            {renderField("Queda na Crista (M2)", "drop_at_comb")}
            {renderField("Queda na Soleira (M3)", "drop_at_heel")}
            {renderField("Pitch (M4)", "pitch")}
            {renderField("Desvio na Soleira (M5)", "cast_at_heel")}
            {renderField("Desvio na Ponta (M6)", "cast_at_toe")}
            {renderField("Desvio na Crista (M7)", "cast_at_comb")}
            {renderField("Queda Monte Carlo (M8)", "drop_at_monte_carlo")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4 col-span-1 md:col-span-3">
            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium text-center">Cast On</h4>
                <div className="grid grid-cols-2 gap-4">
                    {renderField("Cast on 1", "cast_on_1")}
                    {renderField("Cast on 2", "cast_on_2")}
                    {renderField("Cast on 3", "cast_on_3")}
                    {renderField("Cast on 4", "cast_on_4")}
                </div>
            </div>
            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium text-center">Cast Off</h4>
                <div className="grid grid-cols-2 gap-4">
                    {renderField("Cast off 1", "cast_off_1")}
                    {renderField("Cast off 2", "cast_off_2")}
                    {renderField("Cast off 3", "cast_off_3")}
                    {renderField("Cast off 4", "cast_off_4")}
                </div>
            </div>
        </div>

        <h3 className="text-lg font-medium pt-4 col-span-1 md:col-span-3">Punho (Grip) e Calço</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField("Largura do Punho 1", "grip_width_1")}
            {renderField("Largura do Punho 2", "grip_width_2")}
            {renderField("Largura do Punho 3", "grip_width_3")}
            {renderField("Medidas do Punho 1", "grip_measurements_1")}
            {renderField("Medidas do Punho 2", "grip_measurements_2")}
            {renderField("Medidas do Punho 3", "grip_measurements_3")}
            {renderField("Medidas do Punho 4", "grip_measurements_4")}
            {renderField("Medidas do Punho 5", "grip_measurements_5")}
            {renderField("Medidas do Punho 6", "grip_measurements_6")}
            {renderField("Calço 1", "recoil_pad_1")}
            {renderField("Calço 2", "recoil_pad_2")}
            {renderField("Calço 3", "recoil_pad_3")}
        </div>
    </>
);

export default function GunstockPage() {
    return (
        <FittingPage<GunstockFittingData>
            pageTitle="Medidas de Coronha"
            pageSubtitle="Gestão de registos de medidas de coronha"
            tableName="gunstock_fittings"
            emptyFormData={emptyFormData}
            renderFormFields={renderFormFields}
            pdfTemplatePath="/path/to/gunstock_template.pdf"
            pdfSchemaPath="/path/to/gunstock_schema.json"
            pdfOutputNamePrefix="medidas_coronha"
        />
    );
}