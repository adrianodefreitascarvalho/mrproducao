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
    # ── Cabeçalho cliente ──────────────────────────────────────────────────
    "cliente.id_cliente":        ("TextField_21",   "text"),
    "cliente.nome":              ("NOME_1",          "text"),
    "cliente.morada":            ("MORADA_1",        "text"),
    "cliente.tlm":               ("TLM",             "text"),
    "cliente.email":             ("E-MAIL",          "text"),
    "servico.tipo_servico":      ("TextField_17",    "text"),
    "servico.anatomia":          ("ANATOMIA",        "text"),
    # ── Cabeçalho arma ────────────────────────────────────────────────────
    "arma.id_arma":              ("TextField_16",    "text"),
    "arma.arma":                 ("TextField_14",    "text"),
    "arma.fita":                 ("FITA_1",          "text"),
    "arma.modalidade":           ("MODALIDADE",      "text"),
    # Checkboxes equipamento
    "arma.tem_mala":             ("Caixa de seleção1", "checkbox"),
    "arma.tem_saco":             ("Caixa de seleção2", "checkbox"),
    "arma.tem_aloquete":         ("Caixa de seleção3", "checkbox"),
    # ── Observação geral ──────────────────────────────────────────────────
    "obs_geral":                 ("OBS",             "text"),
    # ── Campos de trabalho ────────────────────────────────────────────────
    "trabalho.crista_de_regular": ("1 - CRISTA DE REGULAR", "text"),
    "trabalho.punho":            ("2 - PUNHO",       "text"),
    "trabalho.fuste":            ("3 - FUSTE",       "text"),
    "trabalho.calco":            ("TextField_25",    "text"),
    "trabalho.serrilhado":       ("6/7 - SERRILHADO","text"),
    "trabalho.acabamento":       ("5 - ACABAMENTO",  "text"),
    "trabalho.linhas":           ("8 - LINHAS",      "text"),
    "trabalho.gravacao":         ("TextField_26",    "text"),
    "trabalho.obs_trabalho":     ("10- OBS",         "text"),
    "trabalho.madeira":          ("TextField_29",    "text"),
    # ── Medidas da coronha ────────────────────────────────────────────────
    "medidas_coronha.m1":        ("1_1",             "text"),
    "medidas_coronha.m2":        ("2_1",             "text"),
    "medidas_coronha.m3":        ("3_1",             "text"),
    "medidas_coronha.m5":        ("TextField_32",    "text"),
    "medidas_coronha.m6":        ("6_1",             "text"),
    "medidas_coronha.m7":        ("7_1",             "text"),
    # ── CAST ON / OFF ─────────────────────────────────────────────────────
    "cast.on_1":                 ("1_2",             "text"),
    "cast.on_2":                 ("2_2",             "text"),
    "cast.on_3":                 ("3_2",             "text"),
    "cast.on_4":                 ("TextField_35",    "text"),
    "cast.off_1":                ("TextField_30",    "text"),
    "cast.off_2":                ("TextField_33",    "text"),
    "cast.off_3":                ("TextField_34",    "text"),
    "cast.off_4":                ("TextField_36",    "text"),
    # ── Grip Width ────────────────────────────────────────────────────────
    "grip_width.gw1":            ("TextField_42",    "text"),
    "grip_width.gw2":            ("TextField_45",    "text"),
    "grip_width.gw3":            ("TextField_48",    "text"),
    # ── Grip Measurements ─────────────────────────────────────────────────
    "grip_measurements.gm1":     ("2_3",             "text"),
    "grip_measurements.gm2":     ("1_3",             "text"),
    "grip_measurements.gm3":     ("3_3",             "text"),
    "grip_measurements.gm4":     ("2_4",             "text"),
    "grip_measurements.gm5":     ("5_2",             "text"),
    "grip_measurements.gm6":     ("6_2",             "text"),
    # ── Recoil Pad ────────────────────────────────────────────────────────
    "recoil_pad.rp1":            ("1_4",             "text"),
    "recoil_pad.rp2":            ("3_4",             "text"),
    "recoil_pad.rp3":            ("4",               "text"),
    # ── Pitch ─────────────────────────────────────────────────────────────
    "pitch":                     ("PITCH",           "text"),
}

# Mapeamento para FOLHA DE ANÁLISE (página 1 – análise do cliente)
ANALISE_MAP = {
    # ── Cabeçalho cliente ──────────────────────────────────────────────────
    "cliente.id_cliente":        ("Texto1",              "text"),
    "cliente.nome":              ("NOME",                "text"),
    "cliente.morada":            ("MORADA",              "text"),
    # ── Cabeçalho arma ────────────────────────────────────────────────────
    "arma.id_arma":              ("ID ARMA",             "text"),
    "arma.arma":                 ("ARMA",                "text"),
    "arma.modelo":               ("MODELO",              "text"),
    "arma.fita":                 ("FITA",                "text"),
    "arma.calibre":              ("CALIBRE",             "text"),
    "arma.comp_canos":           ("CANOS",               "text"),
    "arma.peso_canos":           ("PESO CANOS",          "text"),
    "arma.peso_fuste":           ("PESO FUSTE",          "text"),
    "arma.peso_arma":            ("TextField_5",         "text"),
    # ── Dados do atirador ─────────────────────────────────────────────────
    "analise.mao_dominante":     ("MÃO DOMINANTE",       "text"),
    "analise.olho_dominante":    ("TextField",           "text"),
    "analise.olhos_a_atirar":    ("OLHOS A ATIRAR",      "text"),
    "analise.oculos_prescricao": ("TextField_1",         "text"),
    "analise.ve_fita_rasa":      ("VÊ FITA RASA?",       "text"),
    "analise.teste_moedas":      ("TESTE MOEDAS",        "text"),
    "analise.freq_treino":       ("TextField_3",         "text"),
    "analise.freq_competicao":   ("TextField_4",         "text"),
    "analise.modalidades_tiro":  ("MODALIDADES DE TIRO", "text"),
    # ── Opinião do cliente sobre a coronha ────────────────────────────────
    "analise.opiniao_altura":    ("TextField_7",         "text"),
    "analise.opiniao_comprimento":("TextField_8",        "text"),
    "analise.opiniao_punho":     ("TextField_10",        "text"),
    "analise.opiniao_cast":      ("TextField_12",        "text"),
    "analise.opiniao_actual":    ("Texto3",              "text"),
    # ── Medidas da coronha (secção análise) ───────────────────────────────
    "medidas_coronha.m1":        ("1",                   "text"),
    "medidas_coronha.m2":        ("2",                   "text"),
    "medidas_coronha.m3":        ("3",                   "text"),
    "medidas_coronha.m5":        ("5",                   "text"),
    "medidas_coronha.m6":        ("6",                   "text"),
    "medidas_coronha.m7":        ("7",                   "text"),
}

# A página 2 da Folha de Análise é igual à Folha de Obra, mas com page=2
ANALISE_OBRA_MAP = {k: (v[0], v[1], 2) for k, v in OBRA_MAP.items()}


# ─── Utilitários ──────────────────────────────────────────────────────────────

def get_nested(data: dict, dotted_key: str):
    """Obtém um valor de um dicionário usando notação com pontos (ex: 'cliente.nome')."""
    keys = dotted_key.split(".")
    val = data
    for k in keys:
        if not isinstance(val, dict):
            return None
        val = val.get(k)
    return val


def resolve_fields(data: dict, field_map: dict) -> list[dict]:
    """Resolve o mapa de campos com os valores do JSON. Devolve lista de field_values."""
    result = []
    for json_key, mapping in field_map.items():
        field_id = mapping[0]
        field_type = mapping[1]
        page = mapping[2] if len(mapping) > 2 else 1

        value = get_nested(data, json_key)
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
