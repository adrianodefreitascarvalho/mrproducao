// check-pdf-fields.mjs
import pdflib from 'pdf-lib';
const { PDFDocument } = pdflib;
import { readFileSync } from 'fs';
import { argv } from 'process';

async function getPdfFields(filePath) {
  if (!filePath) {
    console.error('❌ Por favor, forneça o caminho para o ficheiro PDF.');
    console.log('Uso: node check-pdf-fields.mjs <caminho-para-o-pdf>');
    return;
  }

  try {
    const pdfBytes = readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes, {
      updateMetadata: false,
    });

    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log(`✅ Campos encontrados no ficheiro "${filePath}":`);
    if (fields.length === 0) {
      console.log('Nenhum campo de formulário encontrado.');
    } else {
      const fieldData = fields.map(field => {
        const type = field.constructor.name.replace('PDF', '');
        const name = field.getName();
        const options = 'getOptions' in field ? field.getOptions() : [];
        return { name, type, options: options.join(', ') || 'N/A' };
      })
      console.table(fieldData);
    }
  } catch (error) {
    console.error(`Ocorreu um erro ao processar o ficheiro ${filePath}:`, error);
  }
}

const filePath = argv[2];
getPdfFields(filePath);
