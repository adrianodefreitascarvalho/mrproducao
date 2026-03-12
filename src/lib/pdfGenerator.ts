import { PDFDocument, PDFTextField, PDFCheckBox } from 'pdf-lib';
import download from 'downloadjs';

interface FieldMapping {
  pdf_field: string;
  db_field: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataObject = { [key: string]: any };

/**
 * Gera um PDF preenchido a partir de um template, um esquema de mapeamento e dados.
 * @param templatePath Caminho para o template PDF (dentro da pasta /public).
 * @param schemaPath Caminho para o esquema JSON (dentro da pasta /public).
 * @param data O objeto de dados contendo as informações a serem preenchidas.
 * @param outputFileName O nome do ficheiro PDF a ser descarregado.
 */
export async function generatePdf(
  templatePath: string,
  schemaPath: string,
  data: DataObject,
  outputFileName: string
): Promise<void> {
  // 1. Carregar recursos (template PDF e esquema JSON)
  const [templateBytes, schemaResponse] = await Promise.all([
    fetch(templatePath).then(res => res.arrayBuffer()),
    fetch(schemaPath).then(res => res.json())
  ]);
  const fieldMappings: FieldMapping[] = schemaResponse.fields;

  // 2. Carregar o documento PDF e aceder ao formulário
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // 3. Mapear os dados para os campos do PDF
  console.log("Iniciando mapeamento de dados para o PDF. Dados recebidos:", data);
  fieldMappings.forEach(mapping => {
    const dbField = mapping.db_field;
    const pdfField = mapping.pdf_field;
    const value = data[dbField];

    // Log da tentativa de mapeamento
    console.log(`Mapeando: db_field='${dbField}' -> pdf_field='${pdfField}'. Valor encontrado:`, value);

    try {
      const field = form.getField(pdfField);

      if (!field) {
        console.warn(`AVISO: Campo do PDF não encontrado no template: '${pdfField}'`);
        return; // Pula para o próximo campo do mapeamento
      }

      if (field instanceof PDFTextField) {
        const textValue = value !== null && value !== undefined ? String(value) : '';
        console.log(`  -> Preenchendo campo de texto '${pdfField}' com valor: "${textValue}"`);
        field.setText(textValue);
      } else if (field instanceof PDFCheckBox) {
        console.log(`  -> Preenchendo checkbox '${pdfField}' com valor: ${!!value}`);
        if (value === true) {
          field.check();
        } else {
          field.uncheck();
        }
      } else {
        console.warn(`  -> Tipo de campo não suportado para '${pdfField}':`, field.constructor.name);
      }

    } catch (e) {
      console.error(`ERRO ao processar o campo do PDF '${pdfField}':`, e);
    }
  });

  // 4. Achatar os campos para que não sejam editáveis e salvar o PDF
  form.flatten();
  const pdfBytes = await pdfDoc.save();

  // 5. Iniciar o download no navegador
  download(pdfBytes, outputFileName, 'application/pdf');
}