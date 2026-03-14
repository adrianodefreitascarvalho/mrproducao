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


# ─── Mapeamento: campo JSON → field_id no PDF ────────────────────────────────

# Mapeamento para FOLHA DE OBRA (ficheiro standalone de 1 página)
OBRA_MAP = {
    # Cabeçalho - Mapeado para os campos flat enviados pelo frontend
    "client_id":                 ("TextField_21",   "text"),
    "client_name":               ("NOME_1",          "text"),
    "weapon_id":                 ("TextField_16",    "text"),

    # Medidas da coronha
    "gunstock_measurements1":    ("1_1",             "text"),
    "gunstock_measurements2":    ("2_1",             "text"),
    "gunstock_measurements3":    ("3_1",             "text"),
    "gunstock_measurements5":    ("TextField_32",    "text"),
    "gunstock_measurements6":    ("6_1",             "text"),
    "gunstock_measurements7":    ("7_1",             "text"),

    # CAST ON
    "gunstock_cast_on1":         ("1_2",             "text"),
    "gunstock_cast_on2":         ("2_2",             "text"),
    "gunstock_cast_on3":         ("3_2",             "text"),
    "gunstock_cast_on4":         ("TextField_35",    "text"),

    # CAST OFF
    "gunstock_cast_off1":        ("TextField_30",    "text"),
    "gunstock_cast_off2":        ("TextField_33",    "text"),
    "gunstock_cast_off3":        ("TextField_34",    "text"),
    "gunstock_cast_off4":        ("TextField_36",    "text"),

    # Largura do Punho (Grip Width)
    "gunstock_width1":           ("TextField_42",    "text"),
    "gunstock_width2":           ("TextField_45",    "text"),
    "gunstock_width3":           ("TextField_48",    "text"),

    # Medidas do Punho (Grip Measurements)
    "gunstock_grip_measurements1": ("2_3",             "text"),
    "gunstock_grip_measurements2": ("1_3",             "text"),
    "gunstock_grip_measurements3": ("3_3",             "text"),
    "gunstock_grip_measurements4": ("2_4",             "text"),
    "gunstock_grip_measurements5": ("5_2",             "text"),
    "gunstock_grip_measurements6": ("6_2",             "text"),

    # Calço (Recoil Pad)
    "gunstock_recoil_pad1":      ("1_4",             "text"),
    "gunstock_recoil_pad2":      ("3_4",             "text"),
    "gunstock_recoil_pad3":      ("4",               "text"),

    # Pitch
    "pitch":                     ("PITCH",           "text"),
}

# Mapeamento para FOLHA DE ANÁLISE (página 1 – análise do cliente)
ANALISE_MAP = {
    # Cabeçalho cliente
    "client_id":                 ("Texto1",              "text"),
    "client_name":               ("NOME",                "text"),
    "address":                   ("MORADA",              "text"), # Mapeado de client.address
    # Cabeçalho arma
    "weapon_id":                 ("ID ARMA",             "text"),
    "brand":                     ("ARMA",                "text"), # Mapeado de weapon.brand
    "model":                     ("MODELO",              "text"), # Mapeado de weapon.model
    "rib":                       ("FITA",                "text"), # Mapeado de weapon.rib
    "caliber":                   ("CALIBRE",             "text"), # Mapeado de weapon.caliber
    "barrel_length":             ("CANOS",               "text"), # Mapeado de weapon.barrel_length
    "barrel_weight":             ("PESO CANOS",          "text"),
    "forehand_weight":           ("PESO FUSTE",          "text"),
    "total_weight":              ("TextField_5",         "text"),
    # Medidas da coronha (secção análise)
    "gunstock_measurements1":    ("1",                   "text"),
    "gunstock_measurements2":    ("2",                   "text"),
    "gunstock_measurements3":    ("3",                   "text"),
    "gunstock_measurements5":    ("5",                   "text"),
    "gunstock_measurements6":    ("6",                   "text"),
    "gunstock_measurements7":    ("7",                   "text"),
}

# A página 2 da Folha de Análise é igual à Folha de Obra, mas com page=2
ANALISE_OBRA_MAP = {k: (v[0], v[1], 2) for k, v in OBRA_MAP.items()}


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
    
    fields_by_page = {}
    for item in field_values:
        page_idx = item["page"] - 1
        if page_idx not in fields_by_page:
            fields_by_page[page_idx] = {}
        fields_by_page[page_idx][item["field_id"]] = item["value"]
        
    filled = 0
    skipped = []

    for page_idx, fields in fields_by_page.items():
        if page_idx < len(writer.pages):
            try:
                writer.update_page_form_field_values(
                    writer.pages[page_idx],
                    fields,
                    flatten=True
                )
                filled += len(fields)
            except Exception as e:
                for field_id in fields.keys():
                    skipped.append((field_id, str(e)))
        else:
            for field_id in fields.keys():
                skipped.append((field_id, f"Page index {page_idx} out of range."))

    with open(output_path, "wb") as f:
        writer.write(f)

    print(f"  ✔ {filled} campos preenchidos → {output_path}")
    if skipped:
        print(f"  ⚠ {len(skipped)} campos ignorados:")
        for fid, err in skipped:
            print(f"     - {fid}: {err}")

    return filled


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
        "--folha", required=True, choices=["obra", "analise", "ambas"],
        help="Qual folha preencher: 'obra', 'analise' ou 'ambas'"
    )
    parser.add_argument(
        "--output", required=True,
        help="Caminho para o PDF de saída"
    )
    parser.add_argument(
        "--template-obra", default=DEFAULT_TEMPLATE_OBRA,
        help=f"Template Folha de Obra (default: {DEFAULT_TEMPLATE_OBRA})"
    )
    parser.add_argument(
        "--template-analise", default=DEFAULT_TEMPLATE_ANALISE,
        help=f"Template Folha de Análise (default: {DEFAULT_TEMPLATE_ANALISE})"
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

    if args.folha == "obra":
        if not Path(args.template_obra).exists():
            print(f"ERRO: Template não encontrado: {args.template_obra}")
            sys.exit(1)
        fields = resolve_fields(data, OBRA_MAP)
        fill_pdf(args.template_obra, fields, args.output)

    elif args.folha == "analise":
        if not Path(args.template_analise).exists():
            print(f"ERRO: Template não encontrado: {args.template_analise}")
            sys.exit(1)
        # Página 1: análise
        fields_p1 = resolve_fields(data, ANALISE_MAP)
        # Página 2: folha de obra incorporada
        fields_p2 = resolve_fields(data, ANALISE_OBRA_MAP)
        fill_pdf(args.template_analise, fields_p1 + fields_p2, args.output)

    elif args.folha == "ambas":
        # Gera os dois ficheiros separados
        base, ext = Path(args.output).stem, Path(args.output).suffix
        out_dir   = Path(args.output).parent

        out_obra    = out_dir / f"{base}_obra{ext}"
        out_analise = out_dir / f"{base}_analise{ext}"

        if not Path(args.template_obra).exists():
            print(f"ERRO: Template não encontrado: {args.template_obra}")
            sys.exit(1)
        if not Path(args.template_analise).exists():
            print(f"ERRO: Template não encontrado: {args.template_analise}")
            sys.exit(1)

        fields_obra = resolve_fields(data, OBRA_MAP)
        fill_pdf(args.template_obra, fields_obra, str(out_obra))

        fields_p1 = resolve_fields(data, ANALISE_MAP)
        fields_p2 = resolve_fields(data, ANALISE_OBRA_MAP)
        fill_pdf(args.template_analise, fields_p1 + fields_p2, str(out_analise))

    print("\n✅ Concluído!")


if __name__ == "__main__":
    main()
