# Check and Improve LLM Prompts

Read both extraction prompts, identify domain knowledge gaps, and apply improvements immediately.

## Step 1 — Read both prompts

Read these two files completely:
- `extraction-service/services/path_b/rag_extractor.py` — find `_SYSTEM_PROMPT`
- `extraction-service/services/path_c/sld_vision_analyzer.py` — find `_SYSTEM_PROMPT`

## Step 2 — Check against this electrical engineering checklist

For EACH prompt, check whether these topics are covered. Note every gap.

**Switchgear topology rules**
- [ ] Incomer panels are always at the ends of the lineup
- [ ] Coupler panels sit between busbar sections
- [ ] Feeder/outgoer panels are in the middle
- [ ] A panel with both CT and relay is almost certainly a feeder, not a coupler

**Circuit breaker identification**
- [ ] ABB models: VD4, HD4, VM1, VD4/R (withdrawable), SafePlus CB
- [ ] Schneider models: HVX, CVX, Evolis
- [ ] Siemens models: 3AH, 3AF, 3AE
- [ ] Rating format examples: "630A", "1250A", "2000A"
- [ ] Breaking capacity format examples: "25kA", "31.5kA", "40kA/3s"

**Current Transformer (CT) recognition**
- [ ] Standard IEC ratios: 50/1A, 100/1A, 200/1A, 400/1A, 600/1A, 800/1A, 1000/1A, 1250/1A, 1600/1A
- [ ] Dual-ratio format: "400-800/1A", "1250/1-1A"
- [ ] Accuracy class format: "5P20", "0.5S", "10VA 5P20", "0.2S"
- [ ] Core types: Protection, Metering, Protection/Metering (combined)
- [ ] French: "transformateur de courant", "TC"
- [ ] Italian: "trasformatore di corrente", "TA"
- [ ] German: "Stromwandler", "SW"

**Voltage Transformer (VT) recognition**
- [ ] Standard ratios: "11/√3 - 0.11/√3 kV", "22000/110V", "33000/√3/110/√3V"
- [ ] Open delta (residual) winding for earth fault detection
- [ ] French: "transformateur de tension", "TP"
- [ ] Italian: "trasformatore di tensione", "TV"
- [ ] German: "Spannungswandler"

**Protection relay identification**
- [ ] ABB relays: REF615, REF630, REM615, RED615, REQ615, REL670, REB670
- [ ] Schneider relays: Sepam series (Sepam 10, 20, 40, 80), MiCOM P series
- [ ] GE/Alstom: MiCOM P127, P141, P142, P143
- [ ] Siemens: 7SJ, 7SD, 7UT series
- [ ] Common ANSI protection codes: 27 (UV), 50/51 (OC), 51N (EF), 59 (OV), 67 (DOC), 79 (AR), 86 (lockout), 87T (diff)

**Multilingual parameter names**
- [ ] English / French / Italian / German equivalents for each key parameter
- [ ] Common OCR errors: "lEC" (I→l), "5F6" (S→5), "0" vs "O" confusion

## Step 3 — Apply improvements

For each gap found:

**In `rag_extractor.py` `_SYSTEM_PROMPT`:**
Add a concise instruction line covering the gap. Keep additions short and specific. The prompt already has a list of parameters — add rules that help disambiguate edge cases.

**In `sld_vision_analyzer.py` `_SYSTEM_PROMPT`:**
In the CUBICLE DEVICES section, add examples of values the model should recognise (e.g. additional relay model names, CT ratio formats, multilingual labels). Keep within the "Rules" section or as additions to the field descriptions.

Do NOT duplicate rules already present. Read carefully before adding.

## Step 4 — Report

Print a table:

| Category | Gap found | File | Fixed |
|----------|-----------|------|-------|
| CT identification | Missing dual-ratio format | sld_vision_analyzer.py | ✅ |
| ...

Then state what could NOT be fixed with a prompt change alone (e.g. things that need real IEC documents in the RAG vector store).
