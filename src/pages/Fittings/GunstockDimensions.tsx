import { FittingPage, type FittingData } from "./FittingPage";
import { CardTitle } from "@/components/ui/card";

type GunstockFormData = Omit<FittingData, 'id' | 'created_at'> & {
  gunstock_measurements?: number | null;
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

const emptyFormData: GunstockFormData = {
  client_id: null, order_id: null, weapon_id: null, units: 'cm',
  gunstock_measurements: null, gunstock_measurements2: null, gunstock_measurements3: null,
  gunstock_measurements4: null, gunstock_measurements5: null, gunstock_measurements6: null,
  gunstock_measurements7: null, gunstock_width1: null, gunstock_width2: null, gunstock_width3: null,
  gunstock_recoil_pad1: null, gunstock_recoil_pad2: null, gunstock_recoil_pad3: null,
  gunstock_cast_off1: null, gunstock_cast_off2: null, gunstock_cast_off3: null, gunstock_cast_off4: null,
  gunstock_cast_on1: null, gunstock_cast_on2: null, gunstock_cast_on3: null, gunstock_cast_on4: null,
  gunstock_grip_measurements1: null, gunstock_grip_measurements2: null, gunstock_grip_measurements3: null,
  gunstock_grip_measurements4: null, gunstock_grip_measurements5: null, gunstock_grip_measurements6: null,
};

export default function GunstockDimensions() {
  return (
    <FittingPage<GunstockFormData>
      pageTitle="Medidas Coronha" pageSubtitle="Gestão de medidas de coronha"
      tableName="gunstock_dimensions" emptyFormData={emptyFormData}
      pdfTemplatePath="/pdf-templates/Coronha.pdf" pdfSchemaPath="/pdf-templates/gunstock_dimensions_schema.json"
      pdfOutputNamePrefix="coronha"
      renderFormFields={(_formData, _handleInputChange, renderField) => (
        <>
          <CardTitle className="text-lg pt-4">Medidas</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderField('Medida 1', 'gunstock_measurements')}
            {renderField('Medida 2', 'gunstock_measurements2')}
            {renderField('Medida 3', 'gunstock_measurements3')}
            {renderField('Medida 4', 'gunstock_measurements4')}
            {renderField('Medida 5', 'gunstock_measurements5')}
            {renderField('Medida 6', 'gunstock_measurements6')}
            {renderField('Medida 7', 'gunstock_measurements7')}
          </div>
          <CardTitle className="text-lg pt-4">Largura do Punho</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('Largura 1', 'gunstock_width1')}
            {renderField('Largura 2', 'gunstock_width2')}
            {renderField('Largura 3', 'gunstock_width3')}
          </div>
          <CardTitle className="text-lg pt-4">Calço (Recoil Pad)</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('Recoil Pad 1', 'gunstock_recoil_pad1')}
            {renderField('Recoil Pad 2', 'gunstock_recoil_pad2')}
            {renderField('Recoil Pad 3', 'gunstock_recoil_pad3')}
          </div>
          <CardTitle className="text-lg pt-4">Cast Off</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderField('Cast Off 1', 'gunstock_cast_off1')}
            {renderField('Cast Off 2', 'gunstock_cast_off2')}
            {renderField('Cast Off 3', 'gunstock_cast_off3')}
            {renderField('Cast Off 4', 'gunstock_cast_off4')}
          </div>
          <CardTitle className="text-lg pt-4">Cast On</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderField('Cast On 1', 'gunstock_cast_on1')}
            {renderField('Cast On 2', 'gunstock_cast_on2')}
            {renderField('Cast On 3', 'gunstock_cast_on3')}
            {renderField('Cast On 4', 'gunstock_cast_on4')}
          </div>
          <CardTitle className="text-lg pt-4">Medidas do Punho</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('Medida Punho 1', 'gunstock_grip_measurements1')}
            {renderField('Medida Punho 2', 'gunstock_grip_measurements2')}
            {renderField('Medida Punho 3', 'gunstock_grip_measurements3')}
            {renderField('Medida Punho 4', 'gunstock_grip_measurements4')}
            {renderField('Medida Punho 5', 'gunstock_grip_measurements5')}
            {renderField('Medida Punho 6', 'gunstock_grip_measurements6')}
          </div>
        </>
      )}
    />
  );
}
