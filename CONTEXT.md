# YDComplan — Project Context

> One file for any AI assistant or developer picking this up. It replaces the
> older `CONTEXT.md` and `CONTEXT by claude.md`. Last updated 2026-10-16.

---

## 1. What this is

**YOGIJI DIGI LIMITED** (Faridabad, Haryana) builds industrial steel-processing
lines — cold rolling mills, temper mills, GI/GL and colour-coating lines,
pickling lines, acid regeneration plants. Clients include JSW, Apollo, AMNS,
Vikas Iron & Steel and others.

The live website **ydprojects.ydagchmi.com** ("YD Ascend") runs each project
from sales initiation to drawings release. The goal is to keep automating the
repetitive work of each team, stage by stage.

This repository holds:

- **`index.html`** — the single-file **prototype** of the whole environment
  (Kick-Off panel, Drawings, YDAstra procurement, Library Drawings). It is used
  to show new stages to the team before the website developer builds them on
  the live stack. No server: everything is stored in the browser.
- **`kickoff.html`, `drawings.html`, `activitylog.html`** — source dumps of the
  **live** pages, kept only as the reference for "what the live site does
  now". The owner replaces them whenever the live site changes. They do not run
  locally (they need the live backend, `assets/` folder and login).

### Who uses what

| Area | Users | Purpose |
|---|---|---|
| Kick-Off panel | Sales, Design, Electrical Design, Directors, Finance, COO/VP, PMs, Planning | Project lifecycle up to ACTIVE |
| Drawings | Design team | Drawings (PDF) and BOMs (Excel) per LOE assembly / subassembly |
| YDAstra (procurement) | Projects team (PMs) + SAP team (Yashveer, Shivam) | YF / WBS / YS codes, new-code requests, BOM to SAP, PO / Jobwork |
| Library Drawings | Design team | Reusable assemblies / subassemblies with their BOMs and drawings, linked into projects |

---

## 2. Files

| File | What it is |
|---|---|
| `index.html` | The prototype (~9,800 lines): HTML + CSS + JS in one file. **The only runnable page.** |
| `kickoff.html` | Live Kick-Off page dump (reference only) |
| `drawings.html` | Live Assembly Drawings page dump (reference only) |
| `activitylog.html` | Live Activity Log / Project Overview dump (reference only) |
| `Products (12) (1).xlsx` | SAP material master export ("SAP library"), 61,639 codes |
| `L.O.E. 2611.xls` | Sample LOE (List of Equipment) workbook |
| `* 2427-…xlsx`, `* 2630-…xlsx` | Ten real Design BOMs used for testing |
| `YDLOGO.png`, `yd-favicon.png`, `yd-footer.png`, `ydbg.jpg` | Images |

Rule: **one runnable HTML file.** New features go into `index.html` as a view
or module, never as a separate page.

---

## 3. The live website (from the dumps)

- Stack: **Node + MongoDB + S3**. Pages call `${API_URL}/kickoffRoutes/...`
  and `${API_URL}/activity/...` with `Authorization: Bearer <localStorage.token>`.
  The server decides every stage transition; pages only show buttons/modals.
- Shared scripts: `assets/js/config.js` (API_URL), `approvals.js`
  (`window.ApprovalInbox`), `issues.js`, `main.js`, `workWeek.js`,
  `attendance.js`, socket.io.
- **Roles** come from substring matches on the user's branch names
  (`design`, `electrical design`, `sales`, `finance`, `director`, `vp`/`coo`,
  `pm`/`project`, `planning`/`forecasting`, `accounts`, `dispatch`);
  `role === "superadmin"` overrides. Nothing matched → VIEWER.
- **Kick-Off** (`kickoff.html`): stages 0 → 10 (table in §5). Live has a
  single "Final Approval" at stage 9 (Director or VP; reject → back to 8).
  Assign PM is a multi-select with "Notify Teams", "Kick-Off not required"
  (`noKickOff`) and, for spares, "LOE not required" (`noLOE` → ACTIVE).
  Stage 5 has no button on that page. SLA: 15 days for advance and kickoff,
  7 days otherwise. LOE is parsed **server-side** (`previewLoe` with sheet
  picker); planning and release-week columns are filled through
  `editExcel.html` or uploaded templates. ACTIVE rows link to
  `drawing.html?project=<_id>`.
- **Drawings** (`drawings.html`): per-assembly uploads; Excel files go to
  `/uploadAssemblyBom`, everything else to `/uploadAssemblyDrawing`. **The live
  page does not parse BOMs** — it stores them as files (`bomFiles[]`) with a
  read-only preview. A new drawing is private to its uploader for 1 hour; after
  that, replace/delete needs a reason and approval (PM impact note → Director).
  Hierarchy: whole-number SR = parent, dotted SR = child, non-numeric SR =
  section divider, rows after "REVISION NOTE" dropped.
- **Activity Log** (`activitylog.html`): `/activity/summary|filters|feed|assemblies|overview`.
  Action keys include `project.create`, `project.assignPM`, `payment.*`,
  `drawing.upload|stage|revisionUpload`, `bom.upload|subRowFile`. The
  overview's stage list, owners and SLAs come from the backend, so a new stage
  (e.g. procurement) needs new activity categories/actions and a new row in the
  backend overview table.
- Nothing on the live site leads past drawings yet — no procurement,
  YDAstra or library.

---

## 4. Prototype architecture (`index.html`)

- jQuery 3.6, Bootstrap 5.3.0, Font Awesome 6.5.2, DataTables 1.13.4,
  select2, SweetAlert2, SheetJS 0.18.5, jsPDF. No build step.
- Views inside `<main>` (one visible at a time):

| View | Opened by | Content |
|---|---|---|
| `#dashboardView` | `showDashboardView()` | Kick-Off panel (DataTable + modals) |
| `#drawingsView` | `showDrawingsView(projId)` | Assembly Drawings for a project |
| `#ydcProjectSummary` | `showYDAstraView(projId)` | YDAstra: assemblies of a project |
| `#ydcAssemblyView` | `openYDAstraAssembly(projId, loeIdx)` | YDAstra 3-stage workspace |
| `#libraryView` | `showLibraryView()` | Library Drawings |

- Script blocks: the main block (Kick-Off, Drawings, library-link module,
  YDAstra module) and a second block for the Library page logic.
- **One look for every page.** YDAstra and Library Drawings use the Assembly
  Drawings page's own pieces: `page-title-bar` (red title + project
  selector, buttons on the right), `stats-strip`, `filter-row` ("Show:"
  filters), `table-wrap` + `table.assemblies` (dark header, column-filter
  row, sortable headers), `parent-row` / `child-row` with `toggle-chevron`,
  `section-divider`, and the `up-sec-files` box in the last column. New
  pages must reuse these rather than add their own styles.
- **Kick-Off and Drawings follow the live code** (Oct 2026 parity pass):
  - "KICK-OFF — LIVE PARITY" (parts 1 and 2) in the main block is a port of
    the live `kickOff.html` logic: `determineUserRole`, `getActionBtn`, the
    generic action modal (`koOpenAction` / `koConfirmAction`), owner, SLA,
    priority, stepper, Project Details, remarks, SO edit, Technical Scope
    revision approval, Create Project, LOE sheet picker, week checks.
  - "DRAWINGS — LIVE PARITY" is a port of the live `drawing.html` logic:
    sections, sheet tabs, filters, hierarchical sort, drawings / BOM modals,
    1-hour private window, replace / delete approval requests, Rejected list,
    Download Updated LOE, Pending Drawings (all projects) and export.
  - Where live calls the server, the prototype applies the same change to
    `projectsData` (stage moves via `koMoveStage`, which records
    `stageHistory`). When the live site changes, compare the new dumps with
    these blocks.
- **Sign-in is simulated:** the user menu has "View as" with mock users
  (`KO_USERS`) whose branch names produce the live roles. The default is
  Super Admin. Each user sees only their own buttons, exactly as on live.

### Storage (all browser-side)

| Data | Where |
|---|---|
| Projects (`projectsData`, incl. LOE rows, BOM rows, drawings as base64, procurement records) | IndexedDB `YDKickoffDB_v1` / store `projects` / key `ydKickoffProjects` (localStorage fallback) |
| SAP library (Products export) | same store, key `ydSapLibrary` |
| PM-learned code mappings | same store, key `ydCodeMemory` |
| Library Drawings (assemblies, subassemblies, BOMs, drawings, revisions, project usages) | IndexedDB `yd-library-demo-v1`: store `state` key `library` (`schema: 2`), store `files` (one Blob per file). Name kept from the first library build so existing data survives. |

Chrome/Edge give every local `file://` page the same origin, so all of this is
one shared browser store. Firefox, another browser or another PC will not see
the data.

---

## 5. Project data model and workflow

`projectsData[]` items (main fields): `id, projNo, client, site, machine,
machineDescription, speed, thickness, width, soNo (SG-n placeholder until a
real SO is set), hasElectrical, stage, stageHistory[{stage, at}], createdAt,
updatedAt, rejectionReason, paymentDecision (1 with / 2 without advance),
noKickOff, noLOE, priority, pm / pmEmail / pmMobile (comma-joined), pmHistory[],
notifyTeams[], notificationLog[] (simulated WhatsApp/email), advanceReceiptUrl,
techScopeUrl, technicalScopeVersions[], pendingTechnicalScope, poUrl,
projectRemarks[{userId, userName, text, at}], loeData[], loeSheets[],
drawingApprovals[] (drawing / BOM requests), ydcHistory[]`. Older saved data is
upgraded once on load (`migrateKickoffProjects`).

### Stage map (prototype `CONSTANTS.STAGE_MAP`)

| Stage | Key | Owner → action |
|---|---|---|
| 0 | SALES_INITIATED | Sales creates the project |
| 1 | AWAITING_DESIGN_PROJECT_NO | Design assigns project number |
| 1.5 | AWAITING_ELECTRICAL_DESIGN | Electrical-only projects |
| 2 | PENDING_DIRECTOR_DECISION | Director: with or without advance |
| 3 | AWAITING_ADVANCE | Finance records the advance |
| 4 | PENDING_PM_ASSIGNMENT | COO/VP assigns PM |
| 5 | PENDING_KICKOFF | PM holds kickoff (live: recorded off this page; the prototype has a labelled "Mark kick-off meeting held" in Details) |
| 6 | PENDING_DESIGN_LOE | Design uploads LOE |
| 7 | PENDING_PLANNING_COLUMNS | Planning: dispatch week + billing value |
| 8 | PENDING_DESIGN_RELEASE_WEEK | Design: drawing release week |
| 9 | PENDING_DIRECTOR_APPROVAL | Final Approval by Director or VP; reject (message required) → back to 8 |
| 10 | ACTIVE | Drawings upload / execution |
| 99 | BLOCKED_NO_APPROVAL | Escalated |

### LOE row (`project.loeData[i]`)

`srNo, section, sheetName, assemblyName, drawingNo, docRevNo, bomRevNo, qty,
scope, unitWeight, totalWeight, planDate, issuedDate, designEngineer,
designStatus, dispatchWeek, billingValue, releaseWeek`, plus:

- `rowId` — stable assembly id (used by drawings, approval requests).
- `drawingFiles[]` — `{ _id, originalName, fileData, uploadedAt, uploadedBy,
  uploadedByName, isPublic }` for uploaded files (private to the uploader for
  one hour), or a **library link** `{ _id, source: 'library', libraryDrawingId,
  libraryUsageId, componentRef, componentName, originalName, linkedAt }`
  (see §8).
- `bomFiles[]` — the BOM Excel files as uploaded (live keeps the files).
- `subtasks[]` — components parsed from all `bomFiles`
  `{ component, drawingNo, qty, material, weight, bomFileId }` (YDAstra reads
  these). Hand edits in the Components window set `subtasksManual`.
- `procurement` — YDAstra record (see §7).

**BOM rule:** a BOM goes only on a row with nothing under it. With SR 1, 1.1,
1.2, 2, 3, 4, 4.1 the BOMs are on 1.1, 1.2, 2, 3 and 4.1 — never on 1 or 4.
The Drawings page shows parent rows as summaries (no upload box), the bulk
upload window offers only those rows for a BOM file, and in the Library an
assembly with subassemblies takes drawings but no BOM.

`mergeLoeData()` keeps `rowId`, `drawingFiles`, `bomFiles`, `subtasks` and
`procurement` when an LOE is re-uploaded. Drawings hierarchy follows live:
whole-number SR = parent, dotted = child, non-numeric SR = section bar, a
"BO SPECIFICATION" bar before BO rows, grouped per sheet and section.

---

## 6. BOM format (Design team)

All ten sample BOMs share one layout, one sheet:

- Row 1: merged title, e.g. `P-2427 BACKUP CLAMP ASSY.`
- Row 2: `S NO. | PART N0. | REVISION | DESCRIPTION | QTY. | MTL. | UNIT WT. | T.WT.`
- Rows 3+: components. **PART NO.** holds either a project drawing number
  (`2630-TRL-01-01-00-001`) or a standard designation
  (`IS 1363(Part2) - M12 x 40-NN`, `IS 2016 A- 18`, `SKF - 32036 X`).
- The same part can appear in several BOMs (e.g. DTR Mandrel reuses 26 ETR
  parts; the three Coil Saddles share parts).

The Drawings view reads columns B (part no), D (description), E (qty),
F (material), and H (or G when H4 is empty) for weight, from row 3 down.

---

## 7. YDAstra — procurement (Projects team)

Appears for any project with at least one BOM uploaded. Data per assembly lives
on `loeRow.procurement`, never on the Design BOM, so a BOM re-upload does not
wipe PM work:

```
{ yfCode, yfDesc, wbs,                 // '' = use the auto value
  status: 'draft' | 'codesSent' | 'bomSubmitted',
  sentSig, sentAt, submittedAt,        // sentSig = BOM fingerprint at send
  rows: { [rowKey]: { ysCode, ysDesc, po1, po2, vendor1, vendor2,
                      price1, price2, date1, date2, ready1, ready2 } },
  newCodes: [{ kind: 'YS'|'YF'|'STD', code, desc, rowKey, created, createdAt }] }
```

`rowKey` = part number without punctuation (or `C:` + component name), with
`#n` for repeats. Overrides are stored only when they differ from the auto value.

**Flow**

1. **BOM to SAP (PM).** Rows arrive with YS code + description prepared and are
   tinted by confidence: **green** = in the SAP library, **yellow** = new code
   (SAP team to create) or a match worth checking, **red** = no code yet. Hover
   gives the reason. Columns: YF CODE, WBS ELEMENT, YSCODE, YSDESCRIPTION, part
   no, component, qty, material, weight. Buttons: Save, Copy, Export, then
   **"Send N new codes to SAP Team"** (downloads `New_SAP_Codes_<proj>_<wbs>_<date>.xlsx`)
   or, when nothing is new, **"Submit BOM to SAP"**. Red rows, missing YF/WBS
   or an unloaded library block sending.
2. **SAP Check (SAP team).** Lists only the new codes; each is ticked
   "Created in SAP" (or found automatically after a library update).
   "Submit BOM to SAP" unlocks when all are created and downloads
   `BOM_to_SAP_<proj>_<wbs>_<date>.xlsx` (YF code, YF description, WBS, YS code,
   YS description, qty, material, weight, part no).
3. **Ordering.** Two lines per component: PO / Jobwork, Vendor / Operator,
   Price, PO / Jobwork date, tentative ready date.

Also: codes shared with another assembly are requested once ("already requested
with SR …"); a PM-typed code for a non-drawing line is remembered
(`ydCodeMemory`) and fills the same line next time; if Design revises a BOM
after sending, a banner offers to re-open Stage 1. All storage calls go through
`YDStore` — the block a backend port replaces.

### SAP code rules (verified against the Products export)

- **Assembly (YF):** `YF` + assembly drawing no. without hyphens →
  `YF2630CAR010300000`; description `2630-<ASSEMBLY NAME>`; FERT / FG001.
- **WBS element:** first four groups of the assembly drawing no. →
  `2630-CAR-01-03-00-000` → `2630CAR0103`.
- **Drawing part (YS):** `YS` + part no. without hyphens →
  `YS2630TRL010100001`; description `<NAME> (2630TRL)`; HALB / SG001.
- Limits: code ≤ 18 characters, description ≤ 40. ~1,330 master items are
  described "Deleted" and must not be used.
- When a code exists in SAP, **SAP's description wins** over the BOM text.
- **Standard parts:** parsed from the IS designation and looked up in the
  library: `FSBT08M12L40G2` hex bolt (IS 1363/1364 HHB), `FSBT01…` Allen
  (IS 2269), `FSBT03…` CSK (IS 6761), `FSNT07M30 G2` hex nut (IS 1364-3, note
  the space), `FSNT38M48` thin nut (IS 1364-4), `FSWR13M16` plain washer
  (IS 2016 hole 18 → M16), `FSWR16D18` spring washer (IS 6735 / 3063),
  `FSNP05D1/8` grease nipple, `FSPN25…` dowel, circlips, keys, gaskets.
  Grade map G1 8.8, G2 10.9, G3 12.9, G4/5/6 SS-304/316/310. **Default grade
  10.9 (G2)** — company decision; BOMs say "Grade C" (4.6), which SAP does not
  stock.
- Bought-out items without a rule (bearings, oil seals, rotary unions) are
  matched by numbers + words in the description (yellow, "closest item").
- On the ten sample BOMs (192 rows): 99 green, 89 yellow (mostly new 2630
  drawing parts), 4 red (proximity switch, O-ring).

The SAP library is loaded with **Update SAP library** (Products export) and
kept in the browser; codes the SAP team marks created count as present until
the next upload.

---

## 8. Library Drawings (Design team)

`#libraryView`, opened from the Kick-Off toolbar ("Library Drawings"). Same
layout as Assembly Drawings; kept deliberately simple.

- Two levels, shown as **Folder** (SR 1, 2, …) → **Subfolder** (1.1, 1.2, …);
  the data keeps the names `assemblies` / `subassemblies`. Add Folder is top
  right; each folder row has + (add subfolder), edit and delete. Each record: `{ id, code, name, drawingNumber, createdAt, updatedAt }`
  (+ `assemblyId` on a subassembly). Codes are unique among siblings.
- **Every row has the live upload box**: "Drawings (n)" / "BOM (n)" buttons and
  a multi-file input (files can also be dropped on it). One upload takes any
  number of files: Excel (`.xlsx/.xls/.xlsm/.csv`) → BOM files, everything
  else → drawings. Drawings are uploaded per assembly / subassembly, never per
  component.
- Drawing number and revision come from the file name
  (`2630-TRL-01-01-00-001 Rev B.pdf` → number `2630-TRL-01-01-00-001`, rev `B`;
  `_R2` → `R2`; no suffix → `R0`). A file whose number is already on that row
  becomes the drawing's **next revision** (`currentRevisionId` moves, history
  kept); the replace button in the Drawings window does the same for one file.
- BOM window: files with in-page preview (sheet tabs), download, delete; a file
  with the same name replaces the current one and the old one stays under
  "Earlier versions". BOMs are not parsed in the Library.
- State: `assemblies[], subassemblies[], boms[{ assemblyId, subassemblyId,
  fileId, originalFilename, status: current|superseded }], drawings[{
  assemblyId, subassemblyId, drawingNumber, currentRevisionId }],
  revisions[{ drawingId, revisionLabel, fileId, originalFilename,
  uploadedAt, uploadedBy }], usages[], activity[]`.
- Delete is blocked while a drawing is linked into a project, and an
  assembly with subassemblies must be emptied first. Older library data
  (with components) is upgraded once on open: each component's drawings move
  up to its subassembly / assembly.
- `LibStore` (top of the Library script) is the only storage code, the block a
  backend port replaces.

### Copy to Project

Shared window `#copyToProjectModal` (`ydOpenCopyDialog`), laid out like the
"Copy Subtasks" window: selected items on the left; on the right a searchable
project picker, then a searchable tick list of that project's rows. Target
rows are the rows with an upload box on the Drawings page (`ydTargetRows`):
no section bars, no whole-number row that has sub-rows.

- **Library → project:** tick folders / subfolders (a folder ticks its
  subfolders) → **Copy to Project**. Their drawings are added as library
  links (`ydLibLinkDrawings`, usage `mappingMethod: 'copy'`), never as file
  copies, so replacing a drawing in the Library (new revision) replaces it in
  every project it was copied to.
- **Project → project:** on the Drawings page tick rows that have drawings →
  **Copy Drawings** (Design only). A **one-time copy**: every drawing is
  copied as a new file (`copiedFrom: { projectId, projectNo, srNo, fileId }`,
  private to the copier for one hour like any upload). A library drawing on
  the source row is copied as a file of its current revision, not as a link,
  so later changes in the source project or Library do not reach the copy.
- The same file name / library drawing already on a target row is skipped.

### Linking into projects

- Drawings view → **📖 Library** button beside Upload on each row → pick the
  project item (the row itself or one of its BOM components, 1.1.1…) and a
  library drawing (search by assembly, subassembly, drawing no., file name; a
  library item with the same drawing no. / name as the row is flagged "Match").
- Saves a `drawingFiles` entry with `source: 'library'` (no file copy) and a
  usage record in the library (`usages[]`: projectId = project no.,
  projectComponentRef, libraryAssemblyId, librarySubassemblyId,
  libraryDrawingId, status).
- Every time the Drawings list or PDF viewer opens, the link resolves to the
  drawing's **current** revision → a new library revision appears in all
  linked projects automatically ("Library · Rev B").
- Unlinking removes the entry and marks the usage inactive; the library drawing
  and project-uploaded drawings are untouched.

---

## 9. Prototype vs live — known gaps

- Prototype parses BOMs in the browser into `subtasks`; live stores BOM files
  only. YDAstra on live needs server-side BOM parsing.
- Roles are simulated with "View as"; YDAstra's SAP-team steps are not yet
  role-gated.
- Notifications (WhatsApp / email) are not sent from the prototype.
- PO / production order / jobwork numbers are typed by hand; the plan is to
  read them from SAP (exported report, later a direct SAP S/4HANA link) keyed
  by WBS + material code.

---

## 10. Rules for AI assistants

1. **One runnable file.** Keep everything in `index.html`; no new HTML pages.
   `kickoff.html`, `drawings.html`, `activitylog.html` are references — never
   edit them, only read them.
2. **Match the live site** for Kick-Off and Drawings UI/behaviour; the three
   reference dumps are the ground truth.
3. **Browser storage only** in the prototype (IndexedDB/localStorage); no
   backend calls. Keep storage access in one clearly marked block per module so
   it can be ported to the live API.
4. **Additive changes.** Don't rework the LOE flow, stage transitions, BOM
   parsing or existing modules unless asked.
5. Test in Chrome against the sample BOMs and the Products export; report what
   was and wasn't verified.
