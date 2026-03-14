import { FittingPage, type FittingData } from "./FittingPage";
import { CardTitle } from "@/components/ui/card";

type ForehandFormData = Omit<FittingData, 'id' | 'created_at'> & {
  forehand_dimensions_top_view1?: number | null;
  forehand_dimensions_top_view2?: number | null;
  forehand_dimensions_top_view3?: number | null;
  forehand_dimensions_side_view4?: number | null;
  forehand_dimensions_side_view5?: number | null;
  forehand_dimensions_side_view6?: number | null;
  forehand_dimensions_side_view7?: number | null;
};

const emptyFormData: ForehandFormData = {
  client_id: null, order_id: null, weapon_id: null, units: 'cm',
  forehand_dimensions_top_view1: null, forehand_dimensions_top_view2: null,
  forehand_dimensions_top_view3: null, forehand_dimensions_side_view4: null,
  forehand_dimensions_side_view5: null, forehand_dimensions_side_view6: null,
  forehand_dimensions_side_view7: null,
};

export default function ForehandDimensions() {
  return (
    <FittingPage<ForehandFormData>
      pageTitle="Medidas Fuste"
      pageSubtitle="Gestão de medidas de fuste"
      tableName="forehand_dimensions"
      emptyFormData={emptyFormData}
      pdfTemplatePath="/pdf-templates/Fuste.pdf"
      pdfSchemaPath="/pdf-templates/forehand_dimensions_schema.json"
      pdfOutputNamePrefix="fuste"
      renderFormFields={(_formData, _handleInputChange, renderField) => (
        <>
          <CardTitle className="text-lg pt-4">Vista Superior</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('Vista Superior 1', 'forehand_dimensions_top_view1')}
            {renderField('Vista Superior 2', 'forehand_dimensions_top_view2')}
            {renderField('Vista Superior 3', 'forehand_dimensions_top_view3')}
          </div>
          <CardTitle className="text-lg pt-4">Vista Lateral</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderField('Vista Lateral 4', 'forehand_dimensions_side_view4')}
            {renderField('Vista Lateral 5', 'forehand_dimensions_side_view5')}
            {renderField('Vista Lateral 6', 'forehand_dimensions_side_view6')}
            {renderField('Vista Lateral 7', 'forehand_dimensions_side_view7')}
          </div>
        </>
      )}
    />
  );
}
