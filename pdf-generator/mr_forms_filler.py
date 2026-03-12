#!/usr/bin/env python3
"""
MR Forms Filler
===============
Preenche automaticamente as Folhas de Obra e/ou Análise MR a partir de um
ficheiro JSON com os dados do cliente/arma/trabalho.

Uso:
    python mr_forms_filler.py --json dados.json --folha obra --output preenchido.pdf
    python mr_forms_filler.py --json dados.json --folha analise --output preenchido.pdf
    python mr_forms_filler.py --json dados.json --folha ambas --output preenchido.pdf

Argumentos:
    --json     Caminho para o ficheiro JSON com os dados
    --folha    Qual folha preencher: 'obra', 'analise', ou 'ambas'
    --output   Caminho para o PDF de saída
    --template-obra     (opcional) Caminho para o template Folha de Obra
    --template-analise  (opcional) Caminho para o template Folha de Análise
"""

import argparse
import json
import sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, BooleanObject, ArrayObject, TextStringObject


# ─── MAPAS DE CAMPOS: campo JSON → (field_id no PDF, tipo) ───────────────────

FORM_MAPS = {
    "coronha": {
        # Cabeçalho
        "client_name": ("NOME_1", "text"),
        "weapon_id": ("TextField_16", "text"),
        # Medidas da coronha
        "gunstock_measurements1": ("1_1", "text"),
        "gunstock_measurements2": ("2_1", "text"),
        "gunstock_measurements3": ("3_1", "text"),
        "gunstock_measurements4": ("4_1", "text"), # Assumido, estava em falta
        "gunstock_measurements5": ("TextField_32", "text"),
        "gunstock_measurements6": ("6_1", "text"),
        "gunstock_measurements7": ("7_1", "text"),
        # CAST ON
        "gunstock_cast_on1": ("1_2", "text"),
        "gunstock_cast_on2": ("2_2", "text"),
        "gunstock_cast_on3": ("3_2", "text"),
        "gunstock_cast_on4": ("TextField_35", "text"),
        # CAST OFF
        "gunstock_cast_off1": ("TextField_30", "text"),
        "gunstock_cast_off2": ("TextField_33", "text"),
        "gunstock_cast_off3": ("TextField_34", "text"),
        "gunstock_cast_off4": ("TextField_36", "text"),
        # Largura do Punho (Grip Width)
        "gunstock_width1": ("TextField_42", "text"),
        "gunstock_width2": ("TextField_45", "text"),
        "gunstock_width3": ("TextField_48", "text"),
        # Medidas do Punho (Grip Measurements)
        "gunstock_grip_measurements1": ("2_3", "text"),
        "gunstock_grip_measurements2": ("1_3", "text"),
        "gunstock_grip_measurements3": ("3_3", "text"),
        "gunstock_grip_measurements4": ("2_4", "text"),
        "gunstock_grip_measurements5": ("5_2", "text"),
        "gunstock_grip_measurements6": ("6_2", "text"),
        # Calço (Recoil Pad)
        "gunstock_recoil_pad1": ("1_4", "text"),
        "gunstock_recoil_pad2": ("3_4", "text"),
        "gunstock_recoil_pad3": ("4", "text"),
        # Pitch
        "pitch": ("PITCH", "text"),
    },
    "medidas_corpo": {
        # TODO: É NECESSÁRIO PREENCHER OS NOMES DOS CAMPOS DO PDF 'Corpo.pdf'
        # Medidas (Mão Aberta)
        "body_measurements_open_palm1": ("NOME_CAMPO_PDF_1", "text"),
        "body_measurements_open_palm2": ("NOME_CAMPO_PDF_2", "text"),
        "body_measurements_open_palm3": ("NOME_CAMPO_PDF_3", "text"),
        "body_measurements_open_palm4": ("NOME_CAMPO_PDF_4", "text"),
        "body_measurements_open_palm5": ("NOME_CAMPO_PDF_5", "text"),
        "body_measurements_open_palm6": ("NOME_CAMPO_PDF_6", "text"),
        # Medidas (Corpo)
        "body_measurements_body1": ("NOME_CAMPO_PDF_7", "text"),
        "body_measurements_body2": ("NOME_CAMPO_PDF_8", "text"),
        "body_measurements_body3": ("NOME_CAMPO_PDF_9", "text"),
        "body_measurements_weight": ("NOME_CAMPO_PDF_10", "text"),
        "body_measurements_age": ("NOME_CAMPO_PDF_11", "text"),
        # Medidas (Mão em Posição)
        "body_measurements_hand_in_position1": ("NOME_CAMPO_PDF_12", "text"),
        "body_measurements_hand_in_position2": ("NOME_CAMPO_PDF_13", "text"),
        "body_measurements_hand_in_position3": ("NOME_CAMPO_PDF_14", "text"),
        "body_measurements_between_hands": ("NOME_CAMPO_PDF_15", "text"),
    },
    "medidas_fuste": {
        # TODO: É NECESSÁRIO PREENCHER OS NOMES DOS CAMPOS DO PDF 'Fuste.pdf'
        # Medidas do Fuste (Vista de Cima)
        "forehand_dimensions_top_view1": ("NOME_CAMPO_PDF_A", "text"),
        "forehand_dimensions_top_view2": ("NOME_CAMPO_PDF_B", "text"),
        "forehand_dimensions_top_view3": ("NOME_CAMPO_PDF_C", "text"),
        # Medidas do Fuste (Vista de Lado)
        "forehand_dimensions_side_view4": ("NOME_CAMPO_PDF_D", "text"),
        "forehand_dimensions_side_view5": ("NOME_CAMPO_PDF_E", "text"),
        "forehand_dimensions_side_view6": ("NOME_CAMPO_PDF_F", "text"),
        "forehand_dimensions_side_view7": ("NOME_CAMPO_PDF_G", "text"),
    },
    "analise": {
        # Cabeçalho cliente
        "client_id": ("Texto1", "text"),
        "client_name": ("NOME", "text"),
        "address": ("MORADA", "text"),
        # Cabeçalho arma
        "weapon_id": ("ID ARMA", "text"),
        "brand": ("ARMA", "text"),
        "model": ("MODELO", "text"),
        "rib": ("FITA", "text"),
        "caliber": ("CALIBRE", "text"),
        "barrel_length": ("CANOS", "text"),
        "barrel_weight": ("PESO CANOS", "text"),
        "forehand_weight": ("PESO FUSTE", "text"),
        "total_weight": ("TextField_5", "text"),
        # Medidas da coronha (secção análise)
        "gunstock_measurements1": ("1", "text"),
        "gunstock_measurements2": ("2", "text"),
        "gunstock_measurements3": ("3", "text"),
        "gunstock_measurements5": ("5", "text"),
        "gunstock_measurements6": ("6", "text"),
        "gunstock_measurements7": ("7", "text"),
    }
}


def resolve_fields(data: dict, field_map: dict) -> list[dict]:
    """Resolve o mapa de campos com os valores do JSON. Devolve lista de field_values."""
    result = []
    for json_key, mapping in field_map.items():
        field_id = mapping[0]
        field_type = mapping[1]
        page = mapping[2] if len(mapping) > 2 else 1

        value = data.get(json_key)
        if value is None:
            continue  # campo não fornecido → deixar em branco

        if field_type == "checkbox":
            checked = bool(value)
            result.append({
                "field_id": field_id,
                "page": page,
                "type": "checkbox",
                "value": "/0" if checked else "/Off",
                "description": json_key
            })
        else:
            result.append({
                "field_id": field_id,
                "page": page,
                "type": "text",
                "value": str(value),
                "description": json_key
            })
    return result


# ─── Preenchimento de PDF ─────────────────────────────────────────────────────

def fill_pdf(template_path: str, field_values: list[dict], output_path: str):
    """Preenche os campos de um PDF com os valores fornecidos."""
    reader = PdfReader(template_path)
    writer = PdfWriter()
    writer.append(reader)

    filled = 0
    skipped = []

    for item in field_values:
        field_id = item["field_id"]
        value = item["value"]
        try:
            writer.update_page_form_field_values(
                writer.pages[item["page"] - 1],
                {field_id: value}
            )
            filled += 1
        except Exception as e:
            skipped.append((field_id, str(e)))

    # Flatten fields so they appear printed in all PDF viewers
    for page in writer.pages:
        if "/Annots" in page:
            for annot in page["/Annots"]:
                annot_obj = annot.get_object()
                if annot_obj.get("/Subtype") == "/Widget":
                    annot_obj.update({
                        NameObject("/F"): BooleanObject(False)
                    })

    with open(output_path, "wb") as f:
        writer.write(f)

    print(f"  ✔ {filled} campos preenchidos → {output_path}")
    if skipped:
        print(f"  ⚠ {len(skipped)} campos ignorados:")
        for fid, err in skipped:
            print(f"     - {fid}: {err}")

    return filled


def list_template_fields(template_path: str):
    """Lista todos os campos de formulário de um template PDF."""
    print(f"🔍 Inspecionando campos do template: {template_path}")
    try:
        reader = PdfReader(template_path)
        fields = reader.get_fields()
        if not fields:
            print("  -> Nenhum campo de formulário encontrado.")
            return

        print(f"  -> Encontrados {len(fields)} campos:")
        # O método get_fields() devolve um dicionário.
        for field_name, field_obj in fields.items():
            field_type = field_obj.get("/FT")  # /FT é o tipo do campo (ex: /Tx para texto)
            print(f"     - Nome: '{field_name}', Tipo: {field_type}")

    except Exception as e:
        print(f"  -> ERRO ao ler o template: {e}")


# ─── Programa principal ───────────────────────────────────────────────────────

DEFAULT_TEMPLATE_OBRA    = "Folha_de_obra_MR_final.pdf"
DEFAULT_TEMPLATE_ANALISE = "Folha_de_análise_MR_final.pdf"


def main():
    parser = argparse.ArgumentParser(
        description="Preenche Folhas MR (Obra / Análise) a partir de um JSON."
    )
    parser.add_argument(
        "--json", required=True,
        help="Caminho para o ficheiro JSON com os dados"
    )
    parser.add_argument(
        "--folha", required=True, choices=FORM_MAPS.keys(),
        help="O tipo de folha a preencher (e.g., 'coronha', 'medidas_corpo')"
    )
    parser.add_argument(
        "--output", required=True,
        help="Caminho para o PDF de saída"
    )
    parser.add_argument(
        "--template", required=True,
        help="Caminho para o template PDF"
    )
    args = parser.parse_args()

    # Carregar JSON
    try:
        with open(args.json, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"ERRO: Ficheiro JSON não encontrado: {args.json}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"ERRO: JSON inválido: {e}")
        sys.exit(1)

    print(f"\n📄 MR Forms Filler")
    print(f"   JSON:  {args.json}")
    print(f"   Folha: {args.folha}")
    print(f"   Saída: {args.output}\n")

    if not Path(args.template).exists():
        print(f"ERRO: Template não encontrado: {args.template}")
        sys.exit(1)

    # Seleciona o mapa de campos correto
    field_map = FORM_MAPS.get(args.folha)
    if not field_map:
        # Este caso é prevenido pelo `choices` do argparse, mas é uma segurança extra
        print(f"ERRO: Tipo de folha desconhecido: {args.folha}")
        sys.exit(1)

    # A folha de análise é especial (2 páginas) e reutiliza o mapa da coronha
    if args.folha == 'analise':
        analise_obra_map = {k: (v[0], v[1], 2) for k, v in FORM_MAPS["coronha"].items()}
        fields_p1 = resolve_fields(data, field_map)
        fields_p2 = resolve_fields(data, analise_obra_map)
        fill_pdf(args.template, fields_p1 + fields_p2, args.output)
    else:
        # Folhas de 1 página (coronha, fuste, corpo)
        fields = resolve_fields(data, field_map)
        fill_pdf(args.template, fields, args.output)

    # O modo "ambas" foi removido por simplicidade. A aplicação pode chamar
    # o script duas vezes se necessitar de gerar ambos os PDFs.

    print("\n✅ Concluído!")


if __name__ == "__main__":
    main()
