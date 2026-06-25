# Review Extraction Quality

Audit the extraction pipeline for quality issues, missing domain rules, and confidence problems.

## Step 1 — Read the voting and normalisation logic

Read:
- `extraction-service/ensemble/voting.py` — `ALLOWED_VALUES`, voting logic
- `extraction-service/services/path_b/normalizer.py` — enum normalisation rules
- `extraction-service/services/path_b/rag_extractor.py` — `_compute_confidence()`
- `extraction-service/services/path_c/sld_vision_analyzer.py` — `_confidence()`

## Step 2 — Identify quality problems

Check for these specific issues:

**Confidence scoring**
- Are confidence thresholds consistent between Path B and Path C?
- Is `flagged_for_review` triggered at the right threshold (currently <0.75 in PathB, <0.80 in PathC)?
- Are enum matches getting higher confidence than free-text matches?

**ALLOWED_VALUES coverage**
- List every parameter that has an `ALLOWED_VALUES` entry
- For each numeric parameter (OperatingVoltage, ShortCircuitLevel, etc.), are all IEC standard values covered?
  - Standard MV voltages: 3.6, 7.2, 12, 17.5, 24, 36, 40.5, 52 kV
  - Standard short-circuit levels: 12.5, 16, 20, 25, 31.5, 40, 50, 63 kA
  - Standard busbar currents: 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000 A
  - Standard frequencies: 50, 60 Hz
- For enum parameters, are all real-world variants covered in normalizer.py?

**Normaliser completeness**
- Read `normalizer.py` for each enum parameter
- Check: are common OCR corruption variants handled? (e.g. "lEC" instead of "IEC", "5F6" instead of "SF6")
- Check: are French/Italian/German spellings normalised?

**Ensemble voting logic**
- When Path B and Path C disagree, how is the winner chosen?
- Is there a tie-breaking rule for equal confidence?
- Are there parameters where one path is always more reliable?

## Step 3 — Apply fixes

For each problem found:
- Add missing ALLOWED_VALUES entries
- Add missing normaliser mappings
- Fix confidence threshold inconsistencies
- Add OCR corruption variants to the normaliser

## Step 4 — Report

Produce a summary:
- Parameters with good coverage (all standard values in ALLOWED_VALUES)
- Parameters with gaps (which values are missing)
- Normaliser gaps found and fixed
- Recommended next improvements that require real IEC documents in the RAG store
