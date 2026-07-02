# ABB Medium Voltage Switchgear Co-Engineer - Project Context

> Read this when a task needs architecture, module ownership, domain understanding, or known planning decisions.

## What It Does

AI-Powered Multi-Stage RFQ-to-ABB Configurator: converts heterogeneous RFQ documents (PDFs, images, tables) → extracted parameters → product recommendations → lineup configuration → ABB XML export. Human-in-the-loop review validates all extractions; missing parameters block export until resolved.

---

## Target Architecture — Parallel Ensemble

**Confirmed decision:** Parallel Ensemble extraction. All three extraction paths run on every document. Two-level extraction: system-level parameters AND device-level per-cubicle data. Ensemble voting determines confidence. No silent ABB defaults — missing parameters block XML export.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ANGULAR FRONTEND (v17)                         │
│  Upload → Classification → Parameters → Products → Lineup → Deviations  │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    .NET 9 WEB API (ASP.NET Core)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  SHARED FOUNDATION  (one pass, result shared by all paths)      │   │
│  │  Azure DI prebuilt-layout + iText7 fallback (if coverage < 30%) │   │
│  │  PdfPig for true page count before Azure DI call                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│              │                    │                    │                │
│              ▼                    ▼                    ▼                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │   PATH A         │  │   PATH B         │  │   PATH C             │  │
│  │  DI Custom Model │  │  RAG Pipeline    │  │  Grounded Vision     │  │
│  │                  │  │                  │  │                      │  │
│  │  Known templates │  │  All text pages  │  │  SLD diagram pages   │  │
│  │  50+ labelled    │  │  Chunk→Embed     │  │  GPT-4o vision       │  │
│  │  docs trained    │  │  Azure AI Search │  │  direct image read   │  │
│  │  in DI Studio    │  │                  │  │                      │  │
│  │                  │  │  LEVEL 1:        │  │  LEVEL 1:            │  │
│  │  LEVEL 1:        │  │  11 system params│  │  System params       │  │
│  │  System params   │  │  incl. IP + IAC  │  │  from title block    │  │
│  │  incl. IP + IAC  │  │                  │  │                      │  │
│  │                  │  │  LEVEL 2:        │  │  LEVEL 2:            │  │
│  │  LEVEL 2:        │  │  Cubicle sched.  │  │  Per-panel devices   │  │
│  │  Device fields   │  │  table extract   │  │  CB/CT/relay/relay   │  │
│  │  from trained    │  │  per cubicle     │  │  direct from image   │  │
│  │  table fields    │  │  CB/CT/relay     │  │                      │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────┬───────────┘  │
│           └─────────────────────┼────────────────────────┘              │
│                                 ▼                                        │
│                    HTTP call to Python extraction-service                │
│                    (FastAPI on port 8000)                                │
│                                 │                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ENSEMBLE VOTING  (voting.py)                                    │   │
│  │  PathB + PathC agree  → Auto-accept (confidence boosted +0.10)  │   │
│  │  Only one path found  → Flag for review                         │   │
│  │  Contradiction        → confidence = 0.50, flagged              │   │
│  │  Neither found        → not_extracted status                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                    │                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  DOMAIN VALIDATION  (voting.py _validate)                        │   │
│  │  IEC standard value check → NonStandardValue flag               │   │
│  │  Distribution inferred from voltage when missing                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                    │                                                      │
│  ┌───────────────────┐   ┌──────────────────────────────────────┐        │
│  │ Azure DI /        │   │  SQL Server (EF Core)                │        │
│  │ Azure AI Search   │   │  DocumentPackages                    │        │
│  │ Azure OpenAI      │   │  ExtractedParameters  (Level 1)      │        │
│  └───────────────────┘   │  CubicleDeviceExtractions (Level 2)  │        │
│                           │  SwitchgearInstances + Topology      │        │
│                           │  SwitchgearCubicles                  │        │
│                           │  DeviationItems                      │        │
│                           └──────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## How to Run

Open three terminals:

```bash
# Terminal 1 — Extraction service (Python FastAPI)
cd extraction-service
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000  (health: GET /health)

# Terminal 2 — Backend (.NET)
cd backend/SwitchgearApi
dotnet run
# → http://localhost:5062

# Terminal 3 — Frontend (Angular)
cd frontend/switchgear-ui
npm start
# → http://localhost:4200
```

Start order: extraction → backend → frontend.

`python main.py` does nothing — the app has no `uvicorn.run()`. Always use `python -m uvicorn`.

---

## Tech Stack & Dependencies

| Layer | Tech | Version | Purpose |
|-------|------|---------|---------|
| **Frontend** | Angular | 17 | SPA with standalone components, signals, OnPush strategy |
| **Backend** | .NET | 9 | ASP.NET Core Web API, EF Core ORM |
| **Extraction service** | Python / FastAPI | 3.13 / 0.115 | Path B + C extraction; called by backend via HTTP |
| **Database** | SQL Server | LocalDB/Cloud | Document & parameter persistence |
| **OCR — Primary** | Azure Document Intelligence | ≥1.0.0 | prebuilt-layout: tables, text, figures |
| **OCR — Fallback** | iText7 | 9.6.0 | CAD-generated PDFs with non-standard font encoding |
| **Page count** | UglyToad.PdfPig | 1.7.0 | True page count only (before Azure DI call) |
| **LLM — Text** | Azure OpenAI gpt-4o-mini | — | Path B extraction (structured output JSON Schema) |
| **LLM — Vision** | Azure OpenAI gpt-4o | — | Path C: reads SLD image directly |
| **Vector Store** | Azure AI Search | ≥11.6.0 | Path B: chunk embeddings + hybrid search |
| **Embeddings** | Azure OpenAI text-embedding-3-small | — | Path B: multilingual chunk embedding |
| **LangChain** | langchain + langchain-community + langchain-openai | ≥0.2 | RAG orchestration in Path B |

---

## Extraction Service — Python (extraction-service/)

The extraction service is a self-contained FastAPI app. The .NET backend calls it via HTTP for all AI extraction work.

### Key files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app + `/extract` endpoint. Start with `python -m uvicorn main:app` |
| `config.py` | Settings (Azure endpoints, API keys) via pydantic-settings + `.env` |
| `ensemble/voting.py` | ALLOWED_VALUES + ensemble vote() + _validate() |
| `ensemble/device_voting.py` | Device-level ensemble voting (Path B + Path C cubicle devices) |
| `services/path_b/rag_extractor.py` | `_SYSTEM_PROMPT`, `PARAMETER_QUERIES`, `_SWITCHGEAR_DENSITY_TERMS`, `run_path_b()` |
| `services/path_b/vector_index.py` | Azure AI Search index build/delete/retrieve + `get_knowledge_store()` |
| `services/path_b/normalizer.py` | Multilingual enum → canonical value mapping (FR/IT/DE) |
| `services/path_b/chunker.py` | Semantic text chunking |
| `services/path_b/device_table_extractor.py` | Path B Level 2: cubicle schedule table extraction |
| `services/path_c/sld_vision_analyzer.py` | `_SYSTEM_PROMPT` + `analyze_sld_image()` — GPT-4o reads SLD image |
| `services/path_c/sld_topology_service.py` | Builds TopologySummary from panel classifications |
| `scripts/load_knowledge_doc.py` | Load IEC standards / manufacturer catalogues into persistent knowledge index |

### Persistent knowledge index

`vector_index.py` maintains two index types:
- **Per-document index** (`{index_name}-{document_id}`): built per upload, deleted after extraction
- **Knowledge index** (`{index_name}-knowledge`): persistent, pre-loaded with IEC standards / catalogues

Load documents into knowledge index:
```bash
cd extraction-service
python scripts/load_knowledge_doc.py path/to/IEC62271-200.pdf "IEC 62271-200"
python scripts/load_knowledge_doc.py --list
python scripts/load_knowledge_doc.py --remove "IEC 62271-200"
```

---

## Two-Level Extraction Model

```
LEVEL 1 — System Parameters  (one set per installation)
  OperatingVoltage, ShortCircuitLevel, RatedBusbarCurrent, PanelRatedCurrent,
  Frequency, Market, BusbarArrangement, Insulation, Distribution,
  IngressProtection (IP), InternalArcClassification (IAC)
  → Stored in: ExtractedParameter table
  → Used for: ABB product matching, XML header

LEVEL 2 — Device Parameters  (one set per cubicle)
  PanelType, FunctionalPosition, CBModel, CBRating, CBBreakingCapacity,
  CTRatio, CTAccuracyClass, CTBurden, VTRatio, RelayModel, ProtectionFunctions,
  EarthingSwitch, SurgeArrester, AuxControlVoltage
  → Stored in: CubicleDeviceExtraction table → feeds SwitchgearCubicle
  → Used for: Lineup reconstruction, XML cubicle hierarchy, accessories

TOPOLOGY — Lineup Summary  (derived from Level 2)
  TotalPanels, IncomersCount, FeedersCount, CouplersCount,
  MeteringCount, BusbarSections
  → Stored in: SwitchgearInstance.TopologySummary (JSON column)
  → Used for: Lineup view, topology warnings, XML structure
```

---

## System Parameters (Level 1) — Full List

| Parameter | Allowed Values (IEC standard) | Unit |
|-----------|---|---|
| **OperatingVoltage** | 3.6, 6, 7.2, 10, 12, 15, 17.5, 20, 24, 33, 36, 40.5, 52 | kV |
| **ShortCircuitLevel** | 12.5, 16, 20, 25, 31.5, 40, 50, 63 | kA |
| **RatedBusbarCurrent** | 630, 800, 1000, 1200, 1250, 1600, 2000, 2500, 3150, 4000 | A |
| **PanelRatedCurrent** | 400, 630, 800, 1000, 1200, 1250, 1600, 2000, 2500 | A |
| **Frequency** | 50, 60 | Hz |
| **Market** | IEC, ANSI | — |
| **BusbarArrangement** | Single busbar, Double busbar, Double Level | — |
| **Insulation** | AIS, GIS (Dry Air), GIS (SF6), GIS (SF6-free) | — |
| **Distribution** | Primary, Secondary | — |
| **IngressProtection** | IP31, IP33, IP41, IP43, IP44, IP54, IP55, IP65 | — |
| **InternalArcClassification** | IAC A, IAC B, IAC AB, IAC AFL, IAC AFLR | — |

Source of truth in Python: `ensemble/voting.py` `ALLOWED_VALUES`. Values not in this list are flagged `NonStandardValue` but not rejected.

**Multilingual labels:**

| Parameter | French | Italian | German |
|---|---|---|---|
| OperatingVoltage | tension assignée | tensione nominale | Nennspannung |
| ShortCircuitLevel | courant de court-circuit, Icc | corrente di cortocircuito | Kurzschlussstrom |
| RatedBusbarCurrent | In jeu de barres | corrente nominale sbarra | Sammelschienenstrom |
| IngressProtection | indice de protection | grado di protezione | Schutzart |
| InternalArcClassification | tenue à l'arc interne | classificazione arco interno | Lichtbogenklassifizierung |
| BusbarArrangement | 1/2 jeu(x) de barres | sbarra singola / doppia sbarra | einfache / doppelte Sammelschiene |
| Insulation | isolé à l'air / gaz SF6 | isolamento aria / gas SF6 | luftisoliert / gasisoliert |

---

## Device Parameters (Level 2) — Per Cubicle

| Field | Example | Extraction source |
|---|---|---|
| **FunctionalPosition** | BB1, F03, I01 | SLD header / table |
| **PanelType** | Incomer, Feeder, Coupler, Metering, Transformer | SLD label + topology |
| **CBModel** | VD4-1250, HD4-630, 3AH3, XIRIA-E | SLD annotation / table |
| **CBRating** | 1250A, 630A, 2000A | SLD annotation / table |
| **CBBreakingCapacity** | 25kA, 31.5kA, 40kA/3s | SLD annotation |
| **CTRatio** | 400/1A, 400-800/1A, 100/5A | SLD annotation / table |
| **CTAccuracyClass** | 5P20, 0.5S, 10VA 5P20 | SLD annotation |
| **VTRatio** | 22000/110V, 11000/√3/110/√3V | SLD annotation |
| **RelayModel** | REF615, Sepam 40, P127, 7SJ85 | SLD annotation |
| **ProtectionFunctions** | [50/51, 51N, 27, 87T] | SLD relay box ANSI codes |
| **EarthingSwitch** | true / false | SLD symbol (QZ, QE) |
| **AuxControlVoltage** | 110VDC, 48VDC | SLD annotation |

**Relay models recognised:**
- ABB: REF615, REF630, REM615, RED615, REQ615, REL670, REB670
- Schneider: Sepam 10/20/40/80, MiCOM P series
- GE/Alstom: MiCOM P127, P141, P142, P143
- Siemens: 7SJ, 7SD, 7UT, 7SL
- Eaton: PXRE

**CB models recognised:**
- ABB: VD4, HD4, VM1, VD4/R, SafePlus, SafeRing
- Schneider: HVX, CVX, Evolis
- Siemens: 3AH, 3AE, 3AF
- Eaton: XIRIA, FORESIX
- GE: VB, Powervac

---

## Ensemble Voting Rules

```python
# voting.py vote() logic:
if path_b and path_c agree:
    winner.confidence += 0.10   # boosted, flagged_for_review = confidence < 0.75
elif contradiction:
    confidence = 0.50, flagged = True
elif single path only:
    flagged_for_review = confidence < 0.75

# _compute_confidence() in rag_extractor.py:
# value in ALLOWED_VALUES → 0.85
# value NOT in ALLOWED_VALUES → 0.60
# unconstrained param → 0.75
# flagged_for_review when confidence < 0.80
```

---

## Lineup View — Frontend

The lineup tab shows:
1. **Panel cards** in a horizontal row — each card shows device chips (CT ratio, relay) directly without clicking
2. **Device summary table** below the diagram — all panels at once: Position, Type, CB, CT Ratio, VT Ratio, Relay, Confidence
3. **Right panel** on click — shows full CB/CT/relay details read from `cub.devices[].description` (real extracted values, no ABB article numbers)

No ABB article numbers are used in lineup display. The `Description` field on `DeviceSelectionDto` carries the extracted value (CT ratio string, relay model string).

---

## Lineup Topology

```
TopologySummary built by sld_topology_service.py:
{
  "totalPanels": 12,
  "incomers": 2,
  "feeders": 8,
  "couplers": 1,
  "metering": 1,
  "busbarSections": 2
}

Panel classification rules (multilingual):
  Incomer:     "arriv", "incom", "arrivée", "arrivo", "einspeise"
  Feeder:      "départ", "feeder", "sortie", "partenza", "abgang"
  Coupler:     "couplage", "coupler", "bus-tie", "accoppiatore", "kupplung"
  Metering:    "comptage", "metering", "mesure", "misura", "messung"
  Transformer: "transfo", "transformer", "trasformatore"
```

---

## Prompt Engineering — Domain Knowledge

Both LLM prompts embed IEC domain knowledge directly. Key content:

**`rag_extractor.py` `_SYSTEM_PROMPT` includes:**
- IEC 62271-200 standard voltage / current / IAC / IP tables
- IEC 61869 CT standard ratios (50/1A … 2000/1A) + dual-ratio format
- CT accuracy classes (5P10, 5P20, 0.5S, 0.2S)
- Italian-specific translation rules (CEI = IEC, sbarre omnibus = Single busbar, IAC A F-R-L = IAC AFL)
- FR/IT/DE multilingual equivalents for all 11 parameters
- OCR corruption corrections (lEC→IEC, 5F6→SF6, lP→IP)
- Topology hints

**`sld_vision_analyzer.py` `_SYSTEM_PROMPT` includes:**
- All CB model families (ABB/Schneider/Siemens/Eaton/GE)
- All relay model families with ANSI protection codes (27/50/51/51N/59/67/79/86/87T)
- CT: IEC ratios, dual-ratio format, accuracy classes, FR/IT/DE labels (TC/TA/SW/Stromwandler)
- VT: multiple ratio formats incl. open delta winding, FR/IT/DE labels (TP/TV/SpW/Spannungswandler)
- Topology rules
- Disconnector multilingual (sectionneur/sezionatore/Trennschalter)

**`normalizer.py`** maps multilingual / OCR-corrupted enum values to canonical strings before voting.

---

## Skills (Claude Code Slash Commands)

Custom skills in `.claude/commands/` automate recurring tasks:

| Skill | Use |
|---|---|
| `/improve-domain-knowledge` | Audit all three files for domain gaps, apply improvements |
| `/check-prompt` | Checklist review of both `_SYSTEM_PROMPT` strings, apply fixes |
| `/review-extraction` | Check extraction pipeline for bugs and gaps |
| `/add-parameter` | Add a new system parameter end-to-end |
| `/add-panel-type` | Add a new panel type to topology classification |
| `/add-rag-document` | Load a document into the knowledge vector index |
| `/build-check` | Verify backend + frontend build cleanly |
| `/sync-check` | Verify DTO/model alignment across extraction ↔ backend ↔ frontend |

---

## Key Backend Services

| Service | Role |
|---|---|
| `PipelineOrchestrationService` | Coordinates all stages, creates instances + cubicles |
| `LineupReconstructionService` | Builds SwitchgearCubicle rows from CubicleDeviceExtraction; reads real CT/relay from `Description` |
| `DocumentIntelligenceService` | Azure DI call + coverage check + iText7 fallback |
| `AbbProductMatchingService` | Product scoring using all 11 Level 1 parameters |

---

## Key Frontend Components

| Component | Purpose |
|-----------|---------|
| `lineup-view` | Topology summary + panel cards with device chips + summary table below SLD |
| `parameter-review` | Level 1 system parameters + overrides |
| `deviation-panel` | Conflicts, low-confidence, missing items |

---

## Configuration

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SwitchgearDb;..."
  },
  "AzureDocumentIntelligence": {
    "Endpoint": "https://<resource>.cognitiveservices.azure.com/",
    "ApiKey": "<key>"
  },
  "AzureOpenAI": {
    "Endpoint": "https://<resource>.openai.azure.com/",
    "ApiKey": "<key>",
    "TextDeployment": "gpt-4o-mini",
    "VisionDeployment": "gpt-4o",
    "EmbeddingDeployment": "text-embedding-3-small"
  },
  "AzureAISearch": {
    "Endpoint": "https://<resource>.search.windows.net",
    "ApiKey": "<key>",
    "IndexName": "switchgear-chunks"
  }
}
```

Extraction service config is in `extraction-service/.env` (loaded by pydantic-settings in `config.py`).

Services degrade gracefully — unconfigured paths are skipped; ensemble votes on available paths only.

---

## Known Constraints

1. **`python main.py` does nothing** — no `uvicorn.run()` in main.py; always start with `python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
2. **Artifactory pins** — corporate Artifactory proxy may 404 on exact-pinned versions; `requirements.txt` uses `>=` constraints; all packages are installed system-wide already
3. **Per-document index deleted** — `main.py` calls `delete_index()` in finally block after every extraction; IEC standard docs must go into the separate `-knowledge` index via `load_knowledge_doc.py`
4. **Confidence scoring ignores retrieval score** — `_compute_confidence()` only checks ALLOWED_VALUES; same confidence whether value appears once or ten times
5. **gpt-4o-mini token cap** — Path B uses direct full-text extraction for docs ≤60 K chars; larger docs use RAG vector retrieval
6. **No blob storage** — files not persisted; only extracted text and rendered SLD PNGs stored in DB
7. **Polling, not events** — frontend polls `/status`; no WebSocket
8. **Path A requires training data** — not available; ensemble runs Path B + C only until 50 docs labelled
9. **IAC value format is free-form** — normalizer maps Italian/French variants; prefix "IAC" + letter codes stored as canonical string
10. **SLD open delta VT winding** — Path C prompt recognises "da/dn" winding notation but field is stored as single `vt_ratio` string; separate field for residual winding not yet in schema
