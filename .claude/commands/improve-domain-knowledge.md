# Improve Domain Knowledge

You are improving the electrical engineering domain knowledge embedded in the AI extraction pipeline for an ABB medium-voltage switchgear system.

## Step 1 — Read the current prompts and allowed values

Read these files in full:
- `extraction-service/services/path_b/rag_extractor.py` — focus on `_SYSTEM_PROMPT`, `PARAMETER_QUERIES`, `_SWITCHGEAR_DENSITY_TERMS`
- `extraction-service/services/path_c/sld_vision_analyzer.py` — focus on `_SYSTEM_PROMPT`
- `extraction-service/ensemble/voting.py` — focus on `ALLOWED_VALUES`

## Step 2 — Analyse gaps

Look for these specific weaknesses:
1. **Missing manufacturer naming conventions** — ABB (VD4, HD4, SafeRing, UniGear, ZS1, ZS2), Schneider (SM6, RM6, PIX, HVX), Siemens (NXPLUS, 8DA, 8DB), Eaton (XIRIA, FORESIX), GE (Powervac, Magne-Blast)
2. **Missing IEC standard values** — IEC 62271-200 (MV switchgear), IEC 62271-100 (circuit breakers), IEC 60255 (protection relays), IEC 61850 (communication), IEC 60044 (instrument transformers)
3. **Missing protection relay ANSI codes** — 27 (undervoltage), 50/51 (overcurrent), 51N (earth fault), 59 (overvoltage), 67 (directional overcurrent), 79 (auto-reclose), 86 (lockout), 87 (differential)
4. **Missing multilingual terms** — French (disjoncteur, transformateur de courant, relais de protection, jeu de barres), Italian (interruttore, trasformatore di corrente), German (Leistungsschalter, Stromwandler, Schutzrelais)
5. **Missing topology rules** — IEC 62271-200 panel arrangement rules, busbar section coupler requirements, incomer/feeder ratio conventions
6. **Missing CT/VT standard ratios** — Common IEC CT ratios: 50/1A, 100/1A, 200/1A, 400/1A, 600/1A, 800/1A, 1000/1A, 1250/1A, 1600/1A, 2000/1A; common VT ratios: 11/0.1kV, 22/0.1kV, 33/0.1kV

## Step 3 — Apply improvements

For each gap found, make targeted edits to the relevant file. Keep edits surgical — only improve what is genuinely weak or missing. Preserve existing correct rules.

Improvements you can make:
- Add manufacturer model name recognition to Path C `_SYSTEM_PROMPT`
- Add ANSI protection code list to Path C cubicle device section
- Expand `PARAMETER_QUERIES` with additional multilingual search terms
- Expand `_SWITCHGEAR_DENSITY_TERMS` with manufacturer-specific terms
- Add standard CT/VT ratio values to `ALLOWED_VALUES` if a list exists there
- Add topology validation rules to Path B `_SYSTEM_PROMPT`

## Step 4 — Report

Summarise:
- What gaps were found
- What was changed and in which file
- What still needs improvement (e.g. needs real IEC documents loaded into the RAG vector store)
