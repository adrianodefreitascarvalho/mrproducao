import { ReactNode } from "react";
import { FittingPage, FittingData } from "./FittingPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Define a estrutura de dados específica para Medidas Corporais
type BodyMeasurementsData = Omit<FittingData, 'id' | 'created_at'> & {
    // Medidas Corporais
    height?: number;
    weight?: number;
    arm_length?: number;
    shoulder_width?: number;
    neck_length?: number;
    age?: number;

    // Análise do Atirador
    dominant_hand?: 'Direita' | 'Esquerda';
    dominant_eye?: 'Direito' | 'Esquerdo';
    shooting_eyes?: 'Ambos' | 'Direito' | 'Esquerdo';
    has_prescription_glasses?: boolean;
    sees_flat_rib?: 'Sim' | 'Não' | 'Parcialmente';
    coin_test?: string;
    training_frequency?: string;
    competition_frequency?: string;
    shooting_disciplines?: string;

    // Opinião do cliente
    opinion_height?: string;
    opinion_length?: string;
    opinion_fist?: string; // punho
    opinion_cast?: string;
    opinion_current_stock?: string;
};

// Estado inicial vazio para o formulário
const emptyFormData: BodyMeasurementsData = {
    units: 'cm',
    client_id: undefined,
    order_id: undefined,
    weapon_id: undefined,
    height: undefined,
    arm_length: undefined,
    shoulder_width: undefined,
    neck_length: undefined,
    weight: undefined,
    age: undefined,
    dominant_hand: undefined,
    dominant_eye: undefined,
    shooting_eyes: undefined,
    has_prescription_glasses: undefined,
    sees_flat_rib: undefined,
    coin_test: undefined,
    training_frequency: undefined,
    competition_frequency: undefined,
    shooting_disciplines: undefined,
    opinion_height: undefined,
    opinion_length: undefined,
    opinion_fist: undefined,
    opinion_cast: undefined,
    opinion_current_stock: undefined,
};

// Função para renderizar os campos de formulário específicos para Medidas Corporais
const renderFormFields = (
    formData: BodyMeasurementsData,
    handleInputChange: (field: keyof BodyMeasurementsData, value: string | number | boolean | null | undefined) => void,
    renderField: (label: string, field: keyof BodyMeasurementsData, showUnits?: boolean) => ReactNode
) => (
    <>
        <h3 className="text-lg font-medium pt-4 col-span-1 md:col-span-3">Medidas Corporais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField("Altura", "height", true)}
            {renderField("Peso (kg)", "weight", false)}
            {renderField("Idade", "age", false)}
            {renderField("Comprimento do Braço", "arm_length")}
            {renderField("Largura dos Ombros", "shoulder_width")}
            {renderField("Comprimento do Pescoço", "neck_length")}
        </div>

        <h3 className="text-lg font-medium pt-4 col-span-1 md:col-span-3">Análise do Atirador</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label>Mão Dominante</Label>
                <Select value={formData.dominant_hand} onValueChange={(v) => handleInputChange('dominant_hand', v)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="Direita">Direita</SelectItem><SelectItem value="Esquerda">Esquerda</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
                <Label>Olho Dominante</Label>
                <Select value={formData.dominant_eye} onValueChange={(v) => handleInputChange('dominant_eye', v)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="Direito">Direito</SelectItem><SelectItem value="Esquerdo">Esquerdo</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
                <Label>Olhos a Atirar</Label>
                <Select value={formData.shooting_eyes} onValueChange={(v) => handleInputChange('shooting_eyes', v)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="Ambos">Ambos</SelectItem><SelectItem value="Direito">Direito</SelectItem><SelectItem value="Esquerdo">Esquerdo</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
                <Label>Vê Fita Rasa?</Label>
                <Select value={formData.sees_flat_rib} onValueChange={(v) => handleInputChange('sees_flat_rib', v)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Não">Não</SelectItem><SelectItem value="Parcialmente">Parcialmente</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="shooting_disciplines">Modalidades de Tiro</Label>
                <Input id="shooting_disciplines" value={formData.shooting_disciplines || ''} onChange={(e) => handleInputChange('shooting_disciplines', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="training_frequency">Frequência de Treino</Label>
                <Input id="training_frequency" value={formData.training_frequency || ''} onChange={(e) => handleInputChange('training_frequency', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="competition_frequency">Frequência de Competição</Label>
                <Input id="competition_frequency" value={formData.competition_frequency || ''} onChange={(e) => handleInputChange('competition_frequency', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="coin_test">Teste das Moedas</Label>
                <Input id="coin_test" value={formData.coin_test || ''} onChange={(e) => handleInputChange('coin_test', e.target.value)} />
            </div>
            <div className="flex items-center space-x-2 pt-6">
                <Checkbox id="has_prescription_glasses" checked={formData.has_prescription_glasses} onCheckedChange={(c) => handleInputChange('has_prescription_glasses', c as boolean)} />
                <Label htmlFor="has_prescription_glasses">Usa óculos de prescrição?</Label>
            </div>
        </div>

        <h3 className="text-lg font-medium pt-4 col-span-1 md:col-span-3">Opinião do Cliente sobre a Coronha Atual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="opinion_height">Altura</Label>
                <Input id="opinion_height" value={formData.opinion_height || ''} onChange={(e) => handleInputChange('opinion_height', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="opinion_length">Comprimento</Label>
                <Input id="opinion_length" value={formData.opinion_length || ''} onChange={(e) => handleInputChange('opinion_length', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="opinion_fist">Punho</Label>
                <Input id="opinion_fist" value={formData.opinion_fist || ''} onChange={(e) => handleInputChange('opinion_fist', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="opinion_cast">Cast</Label>
                <Input id="opinion_cast" value={formData.opinion_cast || ''} onChange={(e) => handleInputChange('opinion_cast', e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="opinion_current_stock">Opinião Geral</Label>
                <Textarea id="opinion_current_stock" value={formData.opinion_current_stock || ''} onChange={(e) => handleInputChange('opinion_current_stock', e.target.value)} />
            </div>
        </div>
    </>
);

export default function BodyMeasurementsPage() {
    return (
        <FittingPage<BodyMeasurementsData>
            pageTitle="Análise de Atirador e Medidas"
            pageSubtitle="Gestão de registos de análise e medidas corporais do cliente"
            tableName="body_measurements"
            emptyFormData={emptyFormData}
            renderFormFields={renderFormFields}
            pdfTemplatePath="/path/to/body_template.pdf"
            pdfSchemaPath="/path/to/body_schema.json"
            pdfOutputNamePrefix="analise_medidas"
        />
    );
}