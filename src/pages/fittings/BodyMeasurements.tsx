import { FittingPage, type FittingData } from "./FittingPage";
import { CardTitle } from "@/components/ui/card";

type BodyFormData = Omit<FittingData, 'id' | 'created_at'> & {
  body_measurements_open_palm1?: number | null;
  body_measurements_open_palm2?: number | null;
  body_measurements_open_palm3?: number | null;
  body_measurements_open_palm4?: number | null;
  body_measurements_open_palm5?: number | null;
  body_measurements_open_palm6?: number | null;
  body_measurements_body1?: number | null;
  body_measurements_body2?: number | null;
  body_measurements_body3?: number | null;
  body_measurements_hand_in_position1?: number | null;
  body_measurements_hand_in_position2?: number | null;
  body_measurements_hand_in_position3?: number | null;
  body_measurements_between_hands?: number | null;
  body_measurements_weight?: number | null;
  body_measurements_age?: number | null;
};

const emptyFormData: BodyFormData = {
  client_id: null, order_id: null, weapon_id: null, units: 'cm',
  body_measurements_open_palm1: null, body_measurements_open_palm2: null,
  body_measurements_open_palm3: null, body_measurements_open_palm4: null,
  body_measurements_open_palm5: null, body_measurements_open_palm6: null,
  body_measurements_body1: null, body_measurements_body2: null, body_measurements_body3: null,
  body_measurements_hand_in_position1: null, body_measurements_hand_in_position2: null,
  body_measurements_hand_in_position3: null, body_measurements_between_hands: null,
  body_measurements_weight: null, body_measurements_age: null,
};

export default function BodyMeasurements() {
  return (
    <FittingPage<BodyFormData>
      pageTitle="Medidas Corporais"
      pageSubtitle="Gestão de medidas corporais"
      tableName="body_measurements"
      emptyFormData={emptyFormData}
      pdfTemplatePath="/pdf-templates/Medidas_Corporais.pdf"
      pdfSchemaPath="/pdf-templates/body_measurements_schema.json"
      pdfOutputNamePrefix="medidas_corporais"
      renderFormFields={(_formData, _handleInputChange, renderField) => (
        <>
          <CardTitle className="text-lg pt-4">Palma Aberta</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('Palma Aberta 1', 'body_measurements_open_palm1')}
            {renderField('Palma Aberta 2', 'body_measurements_open_palm2')}
            {renderField('Palma Aberta 3', 'body_measurements_open_palm3')}
            {renderField('Palma Aberta 4', 'body_measurements_open_palm4')}
            {renderField('Palma Aberta 5', 'body_measurements_open_palm5')}
            {renderField('Palma Aberta 6', 'body_measurements_open_palm6')}
          </div>
          <CardTitle className="text-lg pt-4">Corpo</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('Corpo 1', 'body_measurements_body1')}
            {renderField('Corpo 2', 'body_measurements_body2')}
            {renderField('Corpo 3', 'body_measurements_body3')}
          </div>
          <CardTitle className="text-lg pt-4">Mão em Posição</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('Mão em Posição 1', 'body_measurements_hand_in_position1')}
            {renderField('Mão em Posição 2', 'body_measurements_hand_in_position2')}
            {renderField('Mão em Posição 3', 'body_measurements_hand_in_position3')}
          </div>
          <CardTitle className="text-lg pt-4">Outros</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('Entre Mãos', 'body_measurements_between_hands')}
            {renderField('Peso', 'body_measurements_weight')}
            {renderField('Idade', 'body_measurements_age', false)}
          </div>
        </>
      )}
    />
  );
}
