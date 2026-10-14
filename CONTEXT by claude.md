# YDComplan — Full Project Context for AI Assistants

> **Purpose of this file:** This document gives any AI assistant (Claude, Gemini, etc.) on any machine complete context about the YDComplan panel so it can understand, modify, debug, and extend this codebase without needing to re-read every line of `index.html`.

---

## 1. What Is This Project?

**YDComplan** (YD Component Planning) is a **single-page, browser-based project management panel** built for **YOGIJI DIGI LIMITED** — a heavy engineering company based in Faridabad, Haryana, India that manufactures **industrial steel processing equipment** (Cold Rolling Mills, Galvanizing Lines, Color Coating Lines, Pickling Lines, Temper Mills, etc.).

The panel digitizes the **entire project lifecycle** from Sales Initiation → Design → Finance → Kickoff → Planning → Drawings Upload → Manufacturing Execution, all in one monolithic `index.html` file.

### Company Context
- **Company:** YOGIJI DIGI LIMITED (YD Group)
- **Location:** 147-148, Sector-58, Faridabad 121004, Haryana
- **Products:** 6-Hi Cold Rolling Mills, 4-Hi Temper Mills, GI/GL Lines, Color Coating Lines, Pickling Lines, Acid Regeneration Plants
- **Clients (examples):** JSW, Apollo, BMWIL, AMNS India, Vikas Iron & Steel, Prompt, SG Mart, AECPL, Alshaker (Egypt)

---

## 1A. Real-World Operational Workflow & Why YDComplan Exists

> **This is the most important section.** It explains the actual business process and who uses what.

### The Live Website (Kick-Off Panel) — Already Working in Production

The **Kick-Off Panel** (the dashboard view) is the live website that is **already deployed and working fine**. It handles the entire project lifecycle from Sales to Active status:

```
Sales Team creates project → Design Team assigns project number →
Director decides (advance or bypass) → Finance collects advance →
COO/VP assigns Project Manager → PM conducts kickoff →
Design Team uploads LOE (List of Equipment Excel) →
Planning Team sets Dispatch Weeks & Billing Values →
Design Team sets Drawing Release Weeks →
VP approves → Director approves → PROJECT GOES ACTIVE (Stage 10)
```

### After Stage 10: The Drawings Page — For Design Team

Once a project reaches **Stage 10 (Active)**, the **Drawings page** becomes the operational workspace. This page is **exclusively for the Design Team**. Here's what they do:

1. **View all assemblies** from the LOE (List of Equipment) in a hierarchical table
2. **Upload engineering drawings (PDFs)** for each assembly
3. **Upload BOMs (Bill of Materials Excel files)** for each assembly — these contain the component-level breakdown: component name, drawing number, quantity, material, weight
4. The Design Team can upload individually per assembly, or use **bulk upload** to auto-map files to assemblies by matching filenames to drawing/doc numbers

**Key point:** Assemblies are the top-level items from the LOE. Some assemblies are simple (no sub-components), and some assemblies have **sub-assemblies/components** — the BOM Excel defines these components.

### After Design Uploads: YDComplan — For Project Managers (Projects Team)

**This is where YDComplan comes in.** Once the Design Team has uploaded BOMs and drawings on the Drawings page, the **Project Managers (PM)** need their own workspace to manage manufacturing execution. This is what YDComplan solves.

**The PM's workflow in YDComplan:**

1. **PM clicks "YDComplan"** button (next to the "Drawings" button) for a project in the Kick-Off table
2. PM sees all assemblies and their components (auto-populated from the Design Team's uploaded BOMs)
3. **SAP Stage:** PM reviews each component, edits description columns, and sends **two key columns to the SAP team** — the SAP team then enters SAP codes for each component in their ERP system. PM fills in the SAP codes back into YDComplan.
4. **Fabrication Stage:** PM tracks each component's fabrication status:
   - **Type:** FIH (Fabrication In-House) or FBOI (Fabrication Bought-Out/Outsourced)
   - **Person/Vendor:** Who is doing the fabrication
   - **Job ID / PO:** Internal job ID or purchase order for tracking
   - **Release Date** and **Remarks**
5. **Machining Stage:** PM tracks each component's machining status:
   - **Type:** MIH (Machining In-House) or MBOI (Machining Bought-Out/Outsourced)
   - **Person/Vendor, Job ID/PO, Remarks**
6. **Arranging & Assembly stages** are placeholders for future expansion

### The Gap YDComplan Fills

**Before YDComplan**, Project Managers could only track **bought-out** fabrication and machining (items sent to external vendors with a PO number). They had **no way to track in-house fabrication or machining** — work done inside YOGIJI DIGI's own factory floor. YDComplan solves this by giving PMs a unified environment where they can track **both in-house (FIH/MIH) and bought-out (FBOI/MBOI)** work for every component.

### Summary: Who Uses What

| Page/Module | Primary User | Purpose |
|-------------|-------------|---------|
| **Kick-Off Panel** (Dashboard) | All teams (Sales, Design, Finance, Directors, VP, PM) | Project lifecycle management from initiation to approval |
| **Drawings Page** | Design Team | Upload engineering drawings (PDFs) and BOMs (Excel) for each assembly |
| **YDComplan** | Project Managers / Projects Team | Manufacturing execution tracking — SAP codes, fabrication, machining for every component |

### Data Flow Between Modules

```
Design Team uploads LOE Excel (Stage 6)
        ↓
Planning Team adds Dispatch Weeks (Stage 7)
        ↓
Design Team adds Release Weeks (Stage 8) → Approvals (8.5, 9) → Active (10)
        ↓
Design Team uploads Drawings (PDFs) + BOMs (Excel) on Drawings page
        ↓
BOM components automatically flow into YDComplan
        ↓
Project Manager works in YDComplan:
  → SAP stage (edit descriptions → send to SAP team → get SAP codes back)
  → Fabrication stage (track FIH/FBOI per component)
  → Machining stage (track MIH/MBOI per component)
  → Future: Arranging, Assembly, QA, Painting, Dispatch, etc.
```

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Vanilla HTML5 + jQuery 3.6 (SPA pattern, no build tools, no bundler) |
| **CSS** | Bootstrap 5.3.0 + custom inline `<style>` block (~980 lines of CSS) |
| **Icons** | Font Awesome 6.5.2 |
| **Tables** | DataTables 1.13.4 (only for the Kick-Off table; all other tables are hand-rendered) |
| **Dropdowns** | Select2 4.1.0 (for client name search in Create modal) |
| **Alerts** | SweetAlert2 |
| **Excel Parsing** | SheetJS (xlsx.full.min.js 0.18.5) — used to parse LOE workbooks and BOM Excel files |
| **PDF Generation** | jsPDF 2.5.1 + jspdf-autotable 3.5.25 (included but minimally used currently) |
| **Storage** | IndexedDB (`YDKickoffDB_v1`) with localStorage fallback. **No server, no database, no API.** |
| **Fonts** | Google Fonts: Nunito (headings) + Inter (body) |

### Key Architecture Decisions
- **Everything is in one file:** `index.html` is ~7,276 lines containing ALL HTML, CSS, and JavaScript.
- **No backend:** 100% client-side. Data persists in IndexedDB/localStorage.
- **SPA pattern:** Multiple views (`#dashboardView`, `#drawingsView`, `#ydcProjectSummary`, `#ydcAssemblyView`) are shown/hidden with jQuery `.show()/.hide()/.fadeIn()`.
- **File storage:** Uploaded PDFs, images, and Excel files are stored as **base64 Data URLs** inside the project data objects in IndexedDB. This is a deliberate choice for offline/local usage but can hit storage limits with many large files.

---

## 3. File Structure

```
ydcomplan/
├── index.html                          # THE ENTIRE APPLICATION (~7,276 lines, ~322KB)
├── CONTEXT.md                          # THIS FILE — full project context for AI assistants
├── YDLOGO.png                          # Company logo (header)
├── yd-favicon.png                      # Browser favicon
├── yd-footer.png                       # Footer logo image
├── ydbg.jpg                            # Full-page background image
├── L.O.E. 2611.xls                     # Sample LOE (List of Equipment) Excel file
├── ITEM CODE DUMP 14 JULY 2026.xlsx    # SAP material master dump (~55,000 items, see §12A)
├── original live website source code.css                 # ⚠️ REFERENCE FILE (see below)
├── original live website drawings.html source code.css   # ⚠️ REFERENCE FILE (see below)
└── .git/                               # Git repository
```

### Reference Source Code Files (UI/UX Ground Truth)

The following two files are **complete source code dumps** (HTML + CSS + JS) from the **live production website**. They are the **ground truth** for how the UI/UX should look and behave:

| File | What It Contains | Live Page |
|------|-----------------|----------|
| `original live website source code.css` | Full source of the **Kick-Off Panel** page (~7,572 lines, ~242KB). Contains the project dashboard, all modals, workflow stage logic, LOE parsing, schedule/dates modals, and the full project lifecycle. This is the **live `kickOff.html`** page. | `kickOff.html` on production |
| `original live website drawings.html source code.css` | Full source of the **Assembly Drawings** page (~3,992 lines, ~122KB). Contains the drawings dashboard, assembly table, upload logic, BOM parsing, bulk upload mapping, subtasks modal, and PDF viewer. This is the **live `drawings.html`** page — a **separate page** on the live site. | `drawings.html` on production |

**Key difference:** On the live website, these are **two separate HTML pages** with a shared `assets/css/main.css` stylesheet and a **real backend API** (fetch calls to `/api/...`). In this repo, **everything is consolidated into a single `index.html`** with no backend — using IndexedDB/localStorage instead.

> **⚠️ UI/UX MATCHING RULE:** The Kick-Off Panel and Drawings page in `index.html` must **visually match** the live website as closely as possible. If you notice any styling mismatch, layout difference, or UX deviation between `index.html` and these reference files — **flag it immediately** and propose a fix. The reference files are the source of truth for styling.

---

## 4. CSS Design System (Custom Variables & Classes)

### Brand Colors
```css
--yd-primary: #2a5071;   /* Deep navy blue — used for headers, buttons, primary UI */
--yd-red: #ad283f;       /* Maroon/crimson — used for page titles, accents, hover states */
--yd-bg: #f5f7fa;        /* Light gray background */
```

### Key Custom CSS Classes
| Class | Purpose |
|-------|---------|
| `.table-container` | Main card wrapper with glassmorphism effect |
| `.content-card` | Secondary card wrapper with blur backdrop |
| `.page-title-bar` | Title + meta section at top of each view |
| `.stats-strip` | Horizontal stats bar (Total/Released/Pending) |
| `.stepper-wrapper/.stepper-item` | Progress stepper visualization (project stages) |
| `.badge-sla-green/amber/red` | SLA status badges (green=on track, amber=pending, red=overdue) |
| `.bg-stage-0` through `.bg-stage-5` | Stage-specific background colors for workflow badges |
| `.ydc-*` | YDComplan execution module classes (prefixed for namespace isolation) |
| `.act-mini` | Compact button styling for action buttons in kick-off table |
| `.toggle-chevron` | Expandable row chevron icon with rotation animation |
| `.section-divider` | Full-width section header rows in assembly tables |

---

## 5. Data Model

### Primary Data Object: `projectsData` (Array of Projects)

Each project object has this shape:

```javascript
{
  id: Number,              // Unique ID (timestamp-based)
  status: String,          // "New" (always "New" currently)
  projNo: String,          // Project number e.g. "2623", "TBD" before allocation
  client: String,          // Client company name
  site: String,            // Location/city
  machine: String,         // Machine type description
  desc: String,            // Full machine description
  speed: String|null,      // Speed in MPM
  thickness: String|null,  // Thickness in mm
  width: String|null,      // Width in mm
  soNo: String,            // Sales Order number
  isElectrical: Boolean,   // If true, goes to Stage 1.5 instead of Stage 1
  
  // Stage & Ownership
  stage: Number,           // Current workflow stage (0-10, 99 for blocked). See Stage Map below.
  owner: String,           // Current responsible department/role
  pm: String,              // Assigned Project Manager name, or "Pending"
  
  // Dates
  initiatedOn: String,     // Date string when project was created
  timeline: Object,        // Map of stage → completion date { "1": "01/06/2026", ... }
  
  // File attachments (stored as base64 Data URLs)
  hasTechScope: Boolean,
  techScopeUrl: String,    // base64 Data URL or external URL
  techScopeName: String,
  hasPO: Boolean,
  poUrl: String,
  poName: String,
  hasAdvanceReceipt: Boolean,
  advanceReceiptUrl: String,
  advReceiptUrl: String,   // Legacy duplicate field (both are checked)
  advReceiptName: String,
  advanceAmount: String,
  
  // LOE (List of Equipment) Data
  hasLoe: Boolean,
  loeUrl: String,          // base64 Data URL of original .xls file
  loeData: Array,          // Parsed LOE items (see LOE Item shape below)
  
  // Execution data (YDComplan module)
  execution: {
    assemblies: Array      // Per-assembly execution tracking (see Execution shape below)
  },
  
  // Remarks / Audit Trail
  remarks: Array,          // Array of remark objects { id, author, text, timestamp, stage }
  
  // Flags
  bypassedAdvance: Boolean // True if director chose to skip advance payment
}
```

### LOE Item Shape (inside `project.loeData[]`)

```javascript
{
  autoId: Number,           // Sequential ID
  sheetName: String,        // Excel sheet name it was parsed from (e.g. "Terminal", "Furnace")
  sectionType: String,      // "Assembly" or "BO Specification"
  srNo: String,             // Serial number from Excel (e.g. "1", "1.1", "BO-1")
  section: String,          // Section/equipment group name
  assemblyName: String,     // Assembly/equipment name
  drawingNo: String,        // Drawing/document number (unique identifier)
  docRevNo: String,         // Document revision number
  bomRevNo: String,         // BOM revision number
  qty: String,              // Quantity
  remark: String,
  refDwgNo: String,         // Reference drawing number
  scope: String,            // "Bought-Out" or empty
  unitWeight: String,
  totalWeight: String,
  planDate: String,         // Plan date from Excel
  issuedDate: String,       // Issued/actual date from Excel
  designEngineer: String,
  designStatus: String,     // "Pending", "Issued", "Released", "In Progress", "Completed"
  
  // Added by Planning team (Stage 7):
  dispatchWeek: String,     // e.g. "Wk 43", "WW35 2026"
  billingValue: String,     // INR value
  
  // Added by Design team (Stage 8):
  releaseWeek: String,      // Drawing release week
  
  // Added during Drawings phase (Stage 10):
  drawingFiles: Array,      // [{ _id, originalName, fileData (base64) }]
  subtasks: Array           // BOM components: [{ component, drawingNo, qty, material, weight }]
}
```

### Execution Assembly Shape (inside `project.execution.assemblies[]`)

```javascript
{
  loeIdx: Number,           // Index into project.loeData
  assemblyId: String,       // e.g. "ass_1001_0"
  sap: Array,               // SAP stage rows (per component)
  fabrication: Array,       // Fabrication stage rows
  machining: Array,         // Machining stage rows
  arranging: Array,         // (empty for now)
  assembly: Array           // (empty for now)
}
```

Each stage row in execution has:
```javascript
{
  componentId: String,
  component: String,
  qty: String,
  material: String,
  status: String,           // "pending" or "submitted"
  // Stage-specific fields (see YDC_COLS definition in code):
  // SAP: description, sapCode, sapDescription, remarks
  // Fabrication: fabricationRequired, executionType (FIH/FBOI), personVendor, jobIdOrPO, releaseDate, remarks
  // Machining: executionType (MIH/MBOI), personVendor, jobIdOrPO, remarks
}
```

---

## 6. Workflow Stages (The Core Business Logic)

The project flows through stages 0→10. Each stage has a responsible owner and a required action:

```
STAGE MAP (CONSTANTS.STAGE_MAP):
──────────────────────────────────────────────────────────
Stage 0   → SALES_INITIATED              (Sales creates project)
Stage 1   → AWAITING_DESIGN_PROJECT_NO   (Design Team assigns project number)
Stage 1.5 → AWAITING_ELECTRICAL_DESIGN   (Only if isElectrical=true)
Stage 2   → PENDING_DIRECTOR_DECISION    (Director decides: advance or bypass)
Stage 3   → AWAITING_ADVANCE             (Finance collects advance payment)
Stage 4   → PENDING_PM_ASSIGNMENT        (COO/VP assigns Project Manager)
Stage 5   → PENDING_KICKOFF              (PM conducts kickoff meeting)
Stage 6   → PENDING_DESIGN_LOE           (Design uploads LOE Excel)
Stage 7   → PENDING_PLANNING_COLUMNS     (Planning adds Dispatch Week + Billing Value)
Stage 8   → PENDING_DESIGN_RELEASE_WEEK  (Design adds Drawing Release Week)
Stage 9   → PENDING_DIRECTOR_APPROVAL    (ONE "Final Approval" by Director OR VP — Approve / Require Revision)
Stage 10  → ACTIVE                       (Project is live — Drawings Upload phase)
Stage 99  → BLOCKED_NO_APPROVAL          (Escalated/blocked)
```

### Stage Transitions (Button → Action → New Stage):
| Button | Stage From | Stage To | Owner Change |
|--------|-----------|----------|-------------|
| "Next" (Allocate Project) | 1 | 2 | → Director |
| "Electrical" | 1.5 | 2 | → Director |
| "Dir Decision" → "WITH Advance" | 2 | 3 | → Finance |
| "Dir Decision" → "WITHOUT Advance" | 2 | 4 | → COO/VP (bypass) |
| "Advance" | 3 | 4 | → COO/VP |
| "Allocate PM" | 4 | 5 | → Project Manager |
| "Kickoff" | 5 | 6 | → Design Team |
| "LOE" (upload Excel) | 6 | 7 | → Planning & Forecasting |
| "Schedule" (dispatch week + billing) | 7 | 8 | → Design Team |
| "Dates" (release week) | 8 | 9 | → Directors |
| "Final Approval" → Approve | 9 | 10 | → Operations / Active |
| "Final Approval" → Require Revision (message required) | 9 | 8 | → Design Team (row shows "Re-Fill Release Week") |

> Stage 8.5 (separate VP approval) was REMOVED in Oct 2026 to match live. Stored 8.5 projects are migrated to 9 on load.

---

## 7. SPA Views (View Switching Architecture)

The app has 4 main views, all inside `<main>`. Only one is visible at a time:

### View 1: Dashboard / Kick-Off Panel (`#dashboardView`)
- **Default view on load**
- Shows DataTable with all projects
- Columns: Status, Project No., Client & Site, Machine Description, Stage, Owner, PM, Action
- Action buttons change based on current stage
- Row click → opens `#detailsModal` with project details + stepper

### View 2: Assembly Drawings (`#drawingsView`)
- Shows when `showDrawingsView(projId)` is called
- Contains `#drawingsAssembliesDetail` with assembly table
- Project selector dropdown at top to switch between projects at stage ≥ 8
- Stats strip: Total Assemblies / Released / Pending
- Assemblies table with parent/child row hierarchy, search, filters
- Upload drawings (PDF) and BOMs (Excel) per assembly
- Columns: SR, Assembly, Doc No, Qty, Release Week, Status, Drawings & BOM Upload

### View 3: YDComplan Project Summary (`#ydcProjectSummary`)
- Shows when `showYDComplanView(projId)` is called
- Available for projects at stage ≥ 7
- Displays a grid table of all assemblies with expandable rows
- Each assembly row shows all 5 execution stages: SAP → Fabrication → Machining → Arranging → Assembly
- Click on assembly row → navigates to View 4

### View 4: YDComplan Assembly Detail (`#ydcAssemblyView`)
- Shows when clicking an assembly in View 3
- Breadcrumb navigation: YDComplan > Project > Assembly
- Displays an Excel-like editable table for the selected assembly's components
- Columns are stage-specific (e.g., SAP shows Description/SAP Code/SAP Description/Remarks)
- Each row has Save and Submit buttons
- Context menu on right-click for additional actions

### View Switching Functions:
```javascript
showDashboardView()        // → View 1 (hides everything else, shows dashboard)
showDrawingsView(projId)   // → View 2 (hides dashboard, shows drawings)
showYDComplanView(projId)  // → View 3 (hides all, shows YDComplan summary)
// View 4 is triggered by clicking an assembly row in View 3
```

---

## 8. LOE Excel Parsing Logic

The LOE (List of Equipment) parser (`parseLOEWorkbook()`) is a critical function that handles YOGIJI DIGI's proprietary Excel format:

### Expected Excel Structure:
- **Multiple sheets** (e.g., "Terminal", "Furnace", "Coating", etc.)
- **Header row** contains: SR. | SECTION/EQUIPMENT | GA/ASSEMBLY | DRAWING/DOC NO | DOC REV | BOM REV | QTY | REMARK | etc.
- **Sub-header row** may follow with: REV NO | TOTAL WT | etc.
- **Main data rows** follow after headers
- **BO Specification** section appears after main data, marked by "BO SPECIFICATION" row
- **Revision Note** block signals end of data

### Parser Behavior:
1. Iterates all sheets in the workbook
2. For each sheet, auto-detects the header row by scanning first 30 rows for keywords
3. Handles both Main Assembly rows and BO Specification rows
4. Column indices are dynamically detected (not hardcoded positions)
5. Special handling for "Furnace" sheets (different column layout)
6. `mergeLoeData()` function preserves existing data (drawings, subtasks, dispatch weeks) when replacing LOE

---

## 9. Key JavaScript Functions Reference

### Storage
| Function | Purpose |
|----------|---------|
| `IDBStorage.init/get/set/remove` | IndexedDB CRUD operations |
| `saveProjects()` | Saves `projectsData` to IDB + localStorage fallback |
| `initProjectsData()` | Loads data from IDB/localStorage or falls back to mock data |
| `fileToDataUrl(file)` | Converts File to base64 Data URL |
| `dataUrlToBlob(dataUrl)` | Converts base64 Data URL back to Blob for viewing |

### Rendering
| Function | Purpose |
|----------|---------|
| `renderTable()` | Redraws the DataTable (Kick-Off panel) |
| `renderAssemblies()` | Redraws the assemblies table in Drawings view |
| `renderAsmGrid(proj)` | Renders the YDComplan assembly grid table |
| `renderLoeViewerTableRows(loeItems)` | Renders the LOE editor modal table |
| `renderScheduleModalRows(proj)` | Renders the Schedule (dispatch week) modal |
| `renderDatesModalRows(proj)` | Renders the Release Dates modal |
| `rowHtml(assembly, opts)` | Generates HTML for a single assembly row (handles parent/child) |

### View Navigation
| Function | Purpose |
|----------|---------|
| `showDashboardView()` | Switch to Kick-Off dashboard |
| `showDrawingsView(projId)` | Switch to Assembly Drawings view |
| `showYDComplanView(projId)` | Switch to YDComplan execution view |
| `openProjectDrawings(projId)` | Load a specific project's assemblies |
| `openYDComplanProject(projId)` | Load a specific project in YDComplan |
| `ydcBackToProjects()` | Navigate back from assembly detail to project list |

### Data Operations
| Function | Purpose |
|----------|---------|
| `getProject(id)` | Find project by ID in `projectsData` |
| `parseLOEWorkbook(workbook)` | Parse LOE Excel into structured data |
| `mergeLoeData(old, new)` | Smart-merge LOE data preserving existing uploads |
| `initExec(proj, loeIdx)` | Initialize YDComplan execution data from BOM |
| `getExec(proj, loeIdx)` | Get or create execution data for an assembly |

### File Operations
| Function | Purpose |
|----------|---------|
| `uploadAssemblyDrawing(projId, loeIdx, id)` | Upload drawing PDF or BOM Excel to an assembly |
| `handleGlobalBOMUpload(input)` | Bulk upload with auto-mapping to assemblies |
| `openDrawingsModal(id)` | View/download uploaded drawings |
| `viewPdf(projId, loeIdx, fileId)` | View PDF in modal viewer |
| `openExcelViewer(projId)` | Open LOE editor modal |
| `openProjectFileFromId(projId, field)` | Open any attached file (tech scope, PO, etc.) |

---

## 10. Work Week (WW) Color System

Weeks are color-coded based on urgency relative to the current date:
- 🔴 **Red badge** — Past due or ≤ WW34 2026
- 🟡 **Amber badge** — Upcoming (WW35–WW41 2026)
- 🟢 **Green badge** — Comfortable (≥ WW42 2026 or any 2027+)

Function: `getWeekColorBadge(val)` — renders the badge HTML
Function: `parseWeekValue(val)` — converts "Wk 43" or "WW35 2026" to sortable number

---

## 11. Assembly Row Hierarchy (Parent/Child System)

Assemblies use a numbering system based on SR numbers:
- **Parent rows** (e.g., SR "1", "2", "3") — bold, gray background, show aggregated stats
- **Child rows** (e.g., SR "1.1", "1.2", "1.3") — indented, collapsible under parent
- **Section dividers** — full-width dark rows separating equipment groups
- **BO (Bought-Out)** items — prefixed with "BO-", have a yellow badge

Functions: `isType1Parent(a)`, `toggleChildren(parentKey, iconEl)`, `toggleAllAssemblies(e, iconEl)`

---

## 12. YDComplan Execution Module

The YDComplan module (lines ~5528-7276) is a **self-contained IIFE** that adds execution tracking without modifying any existing code. It's wrapped in:

```javascript
(function (w) {
  'use strict';
  // ... all YDComplan code ...
})(window);
```

### Execution Stages (5 stages):
| Stage Key | Label | Icon | Color | Badge Class |
|-----------|-------|------|-------|-------------|
| `sap` | SAP | fa-barcode | #6610f2 (purple) | `ydc-stage-badge-sap` |
| `fabrication` | Fabrication | fa-industry | #fd7e14 (orange) | `ydc-stage-badge-fab` |
| `machining` | Machining | fa-cog | #0dcaf0 (cyan) | `ydc-stage-badge-mach` |
| `arranging` | Arranging | fa-boxes-packing | #20c997 (teal) | `ydc-stage-badge-arr` |
| `assembly` | Assembly | fa-layer-group | #198754 (green) | `ydc-stage-badge-asm` |

Each stage has configurable columns defined in `YDC_COLS`:
- **SAP**: Description, SAP Code, SAP Description, Remarks
- **Fabrication**: Fab Required (checkbox), Type (FIH/FBOI), Person/Vendor, Job ID/PO, Release Date, Remarks
- **Machining**: Type (MIH/MBOI), Person/Vendor, Job ID/PO, Remarks
- **Arranging**: (empty — future expansion)
- **Assembly**: (empty — future expansion)

### Assembly Grid Table (`#ydcAssemblyGridTable`):
- Collapsible parent/child rows (chevron toggle)
- Main rows: bold, gray background
- Sub rows: white, thinner
- Each row shows the assembly name + a compact grid of all 5 stage statuses
- Right-click context menu for additional actions
- Column resizing support (`ydc-col-resizer`)

### Assembly Detail View:
- Breadcrumb: YDComplan > Project > Assembly
- Excel-like editable table with columns specific to each stage
- Row-level Save + Submit buttons
- Submitted rows get green background (`ydc-submitted-row`)
- Bulk paste from Excel supported (`ydc-paste-target`)

---

## 12A. SAP Code Auto-Mapper (Built by Fable — Critical Module)

> **This section documents the SAP auto-mapping rule engine that was built by Claude Fable 5.0 in September 2026.** It is one of the most complex and domain-specific parts of the codebase.

### What Problem It Solves

In the SAP stage of YDComplan, each BOM component needs a **YSCODE** (SAP material code) and a **YSDESCRIPTION**. There are two fundamentally different cases:

1. **Components WITH a drawing number** → Auto-generate a YS code using a deterministic formula
2. **Components WITHOUT a drawing number** (standard/bought-out parts) → Look up or generate a family-specific code from the SAP material master

### Case 1: Drawing-Based Parts (YS Codes)

When a BOM component has a drawing number (e.g., `2305-CAR-01-01-00-001`), the mapper generates:

| Field | Input | Output |
|-------|-------|--------|
| YSCODE | Drawing No: `2305-CAR-01-01-00-001` | `YS2305CAR010100001` |
| YSDESCRIPTION | Component: `L.H. WHEEL SHAFT` | `L.H. WHEEL SHAFT (2305CAR)` |

**Formula:**
- YSCODE = `"YS"` + drawing number with all hyphens/spaces removed
- YSDESCRIPTION = component name + `" ("` + first 7 chars of drawing no (no hyphens) + `")"`
- The project tag in parentheses is the project code extracted from the drawing number

### Case 2: Standard Parts (Family Codes from Item Code Dump)

When a BOM component has NO drawing number (or the "drawing number" field contains an IS standard reference like `IS 1363(Part2) - M12 x 40`), the component is a **standard/bought-out part**.

#### The Item Code Dump

The file `ITEM CODE DUMP 14 JULY 2026.xlsx` is the **SAP material master** — a single sheet with ~55,000 items and 5 columns:

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| Product (SAP code) | Description | Product Type | Product Group | Base Unit of Measure |

This is NOT a BOM — it's the master list of ALL materials in SAP. The code prefix identifies the family:

- **~27,600 YS-prefixed codes** → Drawing-based parts (already handled by Case 1)
- **~27,000 non-YS codes** → Standard/bought-out materials with family-specific coding

#### Decoded Family Coding Schemes

Fable decoded these families from the dump:

**Fasteners (prefix: `FS`):**
```
FS + TypeCode + M-size + L-length + G-grade

Type Codes:
  BT08 = Hexagon Head Bolt
  BT01 = Allen (Socket Head Cap Screw) Bolt  
  BT03 = CSK (Countersunk) Bolt
  NT07 = Hex Nut
  NT10 = Lock Nut (by KM number)
  WR13 = Plain Washer
  WR16 = Spring Washer
  
Grade Map:
  G1 = Grade 8.8
  G2 = Grade 10.9
  G3 = Grade 12.9
  G4 = SS-304
  G5 = SS-316
  G6 = SS-310
```

**Example:** `FSBT08M12L40G2` = "HEXAGON HEAD BOLT- M12X40MM ,G-10.9"

**Gaskets (prefix: `GP`):**
```
GPFL + size + S2    (for EN-1092 PN6 flanges)
```

**Other families (NOT yet decoded — manual lookup required):**
- `BG` = Bearings (e.g., `BG013207SF` = "BEARING, ANGULAR CONTACT BALL, 3207, SKF")
- `MO` = Motors (e.g., `MOAC0.09P8FL01` = AC Motor)
- `GB` = Gearboxes
- `HC` = Hydraulic Cylinders
- `CB` = Cables
- `MAP` = Semi-finished in-house parts (e.g., `MAP00001SP` = "ABUTMENT RING")
- `ZZ` = Electrical components (MCBs, MCCBs, ACBs, switchgear)

### The Rule Engine

The SAP auto-mapper works as follows for each BOM row:

```
1. If component has a real drawing number → Generate YS code (Case 1)
2. If "drawing number" field contains an IS standard reference (IS 1363, IS 1364, etc.):
   a. Parse the part type, size, length, and grade from the description
   b. Identify the family (bolt, nut, washer, etc.)
   c. Generate the code using the decoded scheme
   d. Generate the description in the master's exact format
3. If no rule matches → Flag as "Search item code dump" (PM looks it up manually)
```

### Badge System (Visual Indicators)

Each row in the SAP table shows a status badge:

| Badge | Color | Meaning |
|-------|-------|---------|
| **STD** | 🟢 Green | Exact rule match — code generated with high confidence |
| **Assumed** | 🟡 Amber | Code generated but grade/standard was assumed (e.g., default 10.9 grade) |
| **Search item code dump** | 🔴 Red | No rule applies — PM must search the master and paste the code manually |

### BOM Parser Bug Fix

Fable identified and fixed a bug: the BOM parser was mapping the Excel "PART NO." column into the `drawingNo` field. This caused standard designations like `IS 1363(Part2) - M12 x 40` to be treated as drawing numbers and generate garbage YS codes like `YSIS1363Part2M12x40`. The fix ensures these are now recognized as standard part references and processed through the family rule engine instead.

### Open Decisions (Need PM Input)

1. **Default grade for IS 1363 "Grade C" hex bolts:** Grade C corresponds to grade 4.6, which doesn't exist in the master. Currently defaults to 10.9 (G2) and flags as "assumed". Should it default to 8.8 (G1) instead?
2. **Missing families:** Bearings, motors, cylinders, and cables have no auto-mapping rules yet. Need example BOM rows for these families to decode the scheme.
3. **Dump refresh strategy:** The file is dated "14 July 2026". Designed as "upload the latest dump" rather than baked in — the PM can upload a fresh dump when the master is updated.
4. **MAP-prefix items (semi-finished):** Do in-house semi-finished parts (like `MAP00001SP` "ABUTMENT RING") ever appear in BOMs, or are no-drawing components always bought-out?

---

## 13. Modal System

The app has **15+ Bootstrap modals**, each for a specific workflow step:

| Modal ID | Purpose |
|----------|---------|
| `#createModal` | Create new project (Sales initiation) |
| `#allocateProjModal` | Assign project number (Design) |
| `#directorDecisionModal` | Director: advance or bypass |
| `#financeAdvanceModal` | Finance: enter advance amount + receipt |
| `#allocatePmModal` | Assign Project Manager (COO/VP) |
| `#kickoffModal` | Kickoff meeting notes |
| `#loeModal` | Upload LOE Excel file (Design) |
| `#scheduleModal` | Dispatch Week + Billing Value (Planning) |
| `#datesModal` | Drawing Release Week (Design) |
| `#excelModal` | View planning document |
| `#excelViewerModal` | Edit LOE equipment list |
| `#attendanceModal` | Mark attendance with live clock |
| `#detailsModal` | Project details + stepper + remarks |
| `#drawingsModal` | View/download uploaded drawings |
| `#subtasksModal` | Edit BOM components (subtasks) |
| `#pdfViewerModal` | PDF/image viewer |
| `#bulkUploadMappingModal` | Bulk upload file mapping |
| `#replaceDocsModal` | Replace/upload project documents |
| `#ydcAssemblyDetailsModal` | YDComplan assembly progress stepper |
| `#approvalsModal` | Edit-Excel approval requests |

---

## 14. Remarks / Audit Trail System

Every significant action auto-generates a remark:
```javascript
addAutoRemark(proj, author, text, stage)
// Example: addAutoRemark(proj, "Finance Team", "Advance collection completed (₹500000).", "Advance Collection")
```

Remarks are stored per-project and shown in the details modal with:
- Author name with user icon
- Stage badge
- Timestamp
- Collapsible list (shows last 2 by default, expandable)

---

## 15. Bulk Paste Support

The app supports Excel-like copy-paste for rapid data entry:
- **Schedule modal** (`.paste-target`): Paste dispatch weeks + billing values from Excel
- **Dates modal** (`.paste-target`): Paste release weeks from Excel
- **Subtasks modal** (`.st-paste-target`): Paste BOM component data from Excel
- **YDComplan table** (`.ydc-paste-target`): Paste execution data from Excel

Pattern: Listens for `paste` event, splits by `\n` and `\t`, fills across rows/columns.

---

## 16. Project Manager Names (Hardcoded List)

The PM dropdown includes these team members:
Mayank Bandha, Sarthak Handa, Shivendu Sharma, Aditya Sharma, Sujal Kumar, Aditya Saini, Saurabh Jangra, Tripurari Kumar, Gulshan, Om Dev, Kush Pahuja, Shashwat Dubey, Preet Nagar, Shashikant Tripathi, Kunal Dagar, Satwinder

---

## 17. Mock Data (Default Projects)

The app ships with ~20 real project entries as mock data. These are actual YOGIJI DIGI projects:
- Project 2623: VIKAS IRON — 4Hi Skin Pass Mill
- Project 2631: JSW — 4HI Twin Stand Temper Mill
- Project 2611: APOLLO — AL-Zn Line
- Project 2630: JSW — 6HI Reversing CRM
- ... and more

If IndexedDB/localStorage is empty, these mock projects are loaded. The ⚙️ settings button resets to this mock data.

---

## 18. Known Patterns & Conventions

### Code Style
- jQuery is used extensively (`$('#id')`, `$(document).on('click', ...)`)
- Functions exposed to `window` for cross-scope access: `window.functionName = function() {...}`
- HTML is built via template literals and injected with `.html()`, `.append()`, `.innerHTML`
- No modules, no imports, no components — everything is procedural in one scope

### Naming Conventions
- `btn-*` classes for action buttons (e.g., `btn-allocate-proj`, `btn-finance-advance`)
- `inp*` IDs for form inputs (e.g., `inpClient`, `inpLoeFile`)
- `ydc-*` prefix for all YDComplan-specific classes and IDs
- `det*` IDs for details modal fields (e.g., `detCode`, `detStatus`)

### Error Handling
- SweetAlert2 (`Swal.fire()`) for all user-facing errors and confirmations
- Console errors for debugging
- Storage errors show user-friendly messages

### Data Flow Pattern
1. User action triggers event handler
2. Handler gets project via `getProject(id)`
3. Modifies project data in-memory
4. Calls `saveProjects()` (async — writes to IDB)
5. Calls `renderTable()` or view-specific render function
6. Shows SweetAlert success/error

---

## 19. Important Edge Cases & Gotchas

1. **Dual field names:** `advanceReceiptUrl` and `advReceiptUrl` both exist for the advance receipt. Always check both.
2. **Blob URL expiry:** When the page reloads, `blob:` URLs become invalid. The `initProjectsData()` function sanitizes these by replacing with dummy URLs.
3. **LOE merge logic:** When replacing an LOE Excel, `mergeLoeData()` matches old→new items by Drawing No, then SR+Name, then Name alone, then SR alone — preserving existing `drawingFiles`, `subtasks`, `dispatchWeek`, `billingValue`.
4. **Stage 1.5:** Special stage only for electrical-only projects. Bypasses the normal design allocation step.
5. **`bypassedAdvance`:** If the director skips advance, the stepper shows stage 3 (Finance) as skipped with a share icon.
6. **The DataTable** (`#kickoffTable`) is only used for the dashboard view. All other tables are hand-rendered `<table>` elements.

---

## 20. External Dependencies (CDN URLs)

```
Bootstrap 5.3.0          → cdn.jsdelivr.net/npm/bootstrap@5.3.0
Font Awesome 6.5.2       → cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2
jQuery 3.6.0             → code.jquery.com/jquery-3.6.0.min.js
DataTables 1.13.4        → cdn.datatables.net/1.13.4
Select2 4.1.0-rc.0       → cdn.jsdelivr.net/npm/select2@4.1.0-rc.0
SweetAlert2 @11          → cdn.jsdelivr.net/npm/sweetalert2@11
SheetJS 0.18.5           → cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5
jsPDF 2.5.1              → cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1
jspdf-autotable 3.5.25   → cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25
Google Fonts (Nunito, Inter)
```

---

## 21. How to Run

1. Open `index.html` in any modern browser (Chrome recommended)
2. No server needed — works entirely offline
3. Data persists in the browser's IndexedDB
4. To reset data: Click the ⚙️ gear icon → "Reset Demo State"

---

## 22. Future Extension Points

The codebase was designed with these future expansions in mind:
- **More execution stages:** The `YDC_STAGES` array can be extended with: purchase, qa, heatTreatment, painting, stores, dispatch, installation
- **Column customization:** `YDC_COLS` maps stage keys to column definitions
- **Backend integration:** Replace `IDBStorage` with API calls to a server
- **User authentication:** The user dropdown exists but is non-functional
- **Notifications:** Bell icon exists but notification system is placeholder
- **Approvals workflow:** Shield icon for edit-excel approvals exists but is hidden

---

## 23. ⚠️ CRITICAL RULES FOR AI ASSISTANTS

> **Read this section carefully. These are non-negotiable constraints.**

### Rule 1: Single File Architecture — ONE `index.html` Only
The entire application MUST remain in a **single `index.html` file**. Do NOT split it into separate files, modules, components, or pages. Even if the file grows to 10,000+ lines — keep it in one file. This is a deliberate architectural choice for simplicity and portability.

### Rule 2: Local Storage Only — No Backend, No API Calls
This project uses **IndexedDB (with localStorage fallback) only**. There is NO server, NO API, NO database. All data — including uploaded files (stored as base64 Data URLs) — lives in the browser's IndexedDB. When the Design Team uploads a BOM on the Drawings page, that BOM data is saved into `project.loeData[idx].subtasks` in IndexedDB. When a PM opens YDComplan, it reads that same data from IndexedDB via `initExec()`. **The shared storage is what connects the Drawings page and YDComplan.**

### Rule 3: UI/UX Must Match the Live Website
The **Kick-Off Panel** (dashboard) and **Drawings Page** must visually match the live production website. The reference source code files in this repo are the ground truth:
- `original live website source code.css` → Kick-Off Panel reference
- `original live website drawings.html source code.css` → Drawings page reference

**If you notice even a slight mismatch** in styling, layout, spacing, colors, fonts, button styling, table design, modal appearance, or any other visual element between `index.html` and the reference files — **you MUST flag it** and suggest a fix. Do not silently ignore differences.

### Rule 4: This Is a Functional Prototype (Not a Toy)
This project is a **working prototype** to prove the concept and get approval from management. It is NOT a throwaway demo. The Kick-Off Panel and Drawings page must function **exactly like the live website** — same workflow, same stage transitions, same modals, same data flow. The only difference is that the live site uses a real backend and this uses local storage.

### Rule 5: YDComplan Is the New Part — It Will Evolve
The YDComplan module (execution tracking for PMs) is the **new addition** that doesn't exist on the live website yet. It is being actively developed and will become more advanced over time. When making changes to YDComplan:
- Preserve the existing stage architecture (`YDC_STAGES`, `YDC_COLS`)
- New stages can be added to the arrays
- The execution data model (`project.execution.assemblies`) is the extension point
- Keep YDComplan code inside the IIFE wrapper `(function(w) { ... })(window);`

### Rule 6: BOM Data Flows From Drawings → YDComplan
When a BOM Excel is uploaded on the Drawings page (via `uploadAssemblyDrawing()` or `handleGlobalBOMUpload()`), it is parsed and stored as `project.loeData[loeIdx].subtasks` (array of `{ component, drawingNo, qty, material, weight }`). When the PM opens YDComplan and clicks on an assembly, `initExec()` reads those subtasks and creates execution copies for each stage (SAP, Fabrication, Machining). **The Design BOM is never modified by YDComplan** — it creates independent copies for execution tracking.

### Rule 7: Don't Break Existing Functionality
The YDComplan module was designed as **additive only** — "Zero existing code modified." Follow this principle. When adding features:
- Don't modify the Kick-Off Panel logic
- Don't modify the Drawings page logic
- Don't change the stage transition flow (stages 0-10)
- Add new functionality by extending, not replacing

---

## 24. October 2026 Update (supersedes older notes above where they conflict)

**Ground truth for live UI/UX is now the three `.txt` dumps:** `kickoff live html.txt`, `drawing live html.txt`, `activity log live html.txt` (the older `.css` dumps are outdated). The module formerly called YDComplan is now **YDAstra**.

### Kick-Off panel (matched to live)
- Stage badge shows the stage number ("Stage 7 · …"); stage column sorts numerically.
- Electrical (1.5): "Electrical Design Review" modal (Project No required). PM assignment on an electrical project → ACTIVE.
- Finance: receipt (PDF/image) required; no Advance Amount field. Uploading a receipt from Details does not move the stage.
- Assign PM: select2 multi-select with workload badges, Notify Teams, "Kick-Off meeting not required" (`noKickOff`), spares "LOE not required" (`noLOE` → stage 6 "Confirm Kickoff Complete" → ACTIVE, row shows "Running"). `proj.pms` array + `proj.pm` comma string.
- Change PM (pen icon in PM column) with reason + Notify Teams.
- Planning (stage 7) grid has a **Category** column per LOE row (`loeRow.category`), used on Drawings + YDAstra filters. Grid sorting only reorders the display — never `proj.loeData` (rows are referenced by index).
- `mergeLoeData` now starts from the old row (`{...old, ...new}`) so downstream fields survive an LOE re-upload.

### Shared helpers (top `<script>` block)
- `ydNotify({to, channels, title, message, projId, projNo})` — mock WhatsApp/Email outbox shown under the header bell (`ydShowNotifications`). Live sends these server-side.
- `ydDrawingProgress(loeRow)` → `{total, uploaded, left}` from `loeRow.totalDrawings` and `drawingFiles`.
- `ydLoeHierarchy(proj)`, `ydGetLoeSection(s)`, `ydLoeDisplaySr`, `ydIsBoLoeRow` — section-scoped parent/child structure (BO rows keep raw SR; old "BO-n" data still reads correctly).

### BOM pipeline (Drawings page)
- One parser `ydParseBomWorkbook` (header detection; legacy fixed layout fallback). `ydMergeBomRows` / `ydApplyBom` / `ydImportBomFile`.
- `loeRow.boms = [{bomId, fileName, baseName, rev, uploadedAt, rowCount}]` — multiple BOMs per assembly, shown separately. `subtasks[]` stays flat; each row has `bomId` + stable `rowKey`.
- Re-upload = MERGE: non-BOM fields (YDAstra codes, PO data) carried over by rowKey; changed rows `needsReview` + `changeNote`, new rows `isNew`, removed rows with data kept as `removedInRevision`; resets `sapSent`, `sapReviewCompleted`, `codesFrozen`.
- Bulk mapping: exact drawing-number match only (revision suffix `_R1`, `REV-A`… stripped), one line per LOE row sharing the number, parents never targeted, Add vs Replace per line, duplicate revisions → keep highest.
- After a BOM upload Design is asked for the assembly's total drawing count (`loeRow.totalDrawings`).

### Drawings page (matched to live)
Raw SR, section dividers, search keeps parent expanded, OR-combined filters on aggregate status, hierarchical numeric sort, Section + Category filters + "Drawings left > 0", delete/replace approval tickets, 1-hour private window, Download All (.zip via JSZip CDN), cross-project Pending Drawings + Excel export, Download Updated LOE, any file type.

### YDAstra flow
1. **Stage 1 BOM to SAP (PM):** WBS Element + YF Code per assembly (`lr.wbsElement`, `lr.yfCode`, required). Rows colour-coded: green Confirmed (in SAP master, description matches) / blue New (SAP to create) / amber Doubtful / red Wrong (code > 18, desc > 40, conflict) / grey Not found. Lookup modal searches the SAP item master. Auto values (`ysCodeAuto`) kept separate from PM overrides. Send → validates, downloads `SAP_Code_Request_<proj>_SR<sr>_<date>.xlsx` ("New codes" + "All rows"), records `lr.sapRequest`, notifies SAP Team (Yashveer, Shivam).
2. **Stage 2 SAP Code Creation & Sync:** SAP team marks rows Created in SAP → Notify PM (blocked until all created) → PM Synchronise against the latest SAP export (uploads MERGE into the master) → Synced / Not in SAP / Differs → Freeze codes (`lr.codesFrozen`).
3. **Stage 3 Ordering:** two lines per component, each "PO No / Jobwork ID" + "Vendor / Operator" (fields po1/po2, vendor1/2, price1/2, date1/2, ready1/2).
- SAP item master (`ITEM CODE DUMP … .xlsx`, 54,943 codes; max code length 18, max description 40 → company limits) is stored in IndexedDB key `ydSapItemMaster`, separate from projects.
- Future: replace the Excel item-master/PO steps with S/4HANA Cloud OData APIs (Product, Purchase Order, Material Document, Enterprise Project) called from the live server — never from the browser.

---

*This context file was created on 2026-09-04 and should be updated whenever significant architectural changes are made. Last git commit: `2fa29f4 feat: add assembly drawings page with custom styling and table layout components`*
