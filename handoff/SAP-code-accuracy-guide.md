# Turning BOM rows into SAP codes: an accuracy guide

**For:** the developer and the Claude he works with.
**Purpose:** his code already turns Design BOM rows into SAP codes. This
guide explains how to make it as accurate as possible and how to prove it.
It describes rules, checks and test examples in plain English. It contains
no code, so it applies whatever his code looks like.

Everything here was checked against our real data:
- the SAP Products export (about 61,600 codes);
- ten Design BOMs from projects 2427 and 2630 (192 rows);
- SAP's own descriptions of about 2,150 standard parts.

---

## 1. What the output must be

For every BOM, two things are produced.

**For the assembly:**
- a YF code;
- a YF description;
- a WBS element.

**For every BOM row:**
- an SAP code, which is a YS code for a drawing part or an FS code for a
  standard part such as a bolt;
- an SAP description;
- a confidence colour and a short reason.

The confidence colour is as important as the code:
- **Green:** the code exists in SAP and the names agree. No one needs to
  check it.
- **Yellow:** either a new code the SAP team must create, or a closest
  match a person should check.
- **Red:** no usable code. A person must type one.

Accuracy means two things: the right code, and the right colour. A wrong
code shown as green is the worst possible result, worse than a red,
because nobody looks at it again.

---

## 2. Principles to follow

1. **Fixed rules first, library search second, a person last.** SAP codes
   follow strict patterns, so most rows can be built exactly. Use a search
   only when no rule applies, and always show its result as yellow.
2. **Don't let an AI model guess codes while the system is running.** A
   model will sometimes invent a code that looks right but isn't, and
   nobody will notice. Use Claude to help write and test rules, not to
   produce codes.
3. **SAP is the authority.** When a code already exists in the SAP
   library, use SAP's own description, not the BOM text.
4. **Never use deleted items.** About 1,330 items in the library have a
   description that starts with "DELETE". If a code only matches a deleted
   item, the row is red.
5. **Respect SAP's limits:** a code is at most 18 characters and a
   description at most 40 characters. Anything longer is red.
6. **Never change the Design BOM.** Codes, corrections and orders are
   stored separately, per assembly and per row. A re-uploaded BOM must not
   wipe a PM's work.
7. **Remember what people correct.** When a PM types a code for a row that
   had none, save it against that part number and description. Offer it
   automatically the next time the same row appears.

---

## 3. Reading the BOM correctly

Many errors start here, before any code is built.

**The standard layout:**
- Row 1 is a merged title.
- Row 2 is the header: S NO, PART NO, REVISION, DESCRIPTION, QTY, MTL,
  UNIT WT, T.WT.
- Data starts on row 3.

**Things that go wrong:**
- **Columns move.** Some BOMs have two extra columns, YSCODE and
  YSDESCRIPTION, inserted right after S NO. One example is the ROLL FORCE
  CYLINDER BOM (2427-RFC-01-01-00-000). If columns are read by position,
  every column shifts by two: drawing numbers are read as descriptions, and
  5 of 13 rows came out red in our test. **Always find columns by their
  header names, never by position.**
- **"PART N0."** in the header is usually written with a zero, not the
  letter O. Match both.
- **Line breaks inside cells.** Header and description cells are full of
  line breaks. For example, "Hexagon Head Screw (Grade C) IS 1363(Part2) -
  M8 x 25" is split across four lines in the cell. Join every cell into one
  line, with single spaces, before any rule looks at it.
- **Ready-made answers.** When a BOM already has YSCODE values filled in,
  someone has already done the work for those rows. Keep those values: they
  are a free answer key for testing.
- **Weight:** use the total weight column; use the unit weight only when
  the total is empty.

---

## 4. The assembly: YF code, YF description and WBS

Everything comes from the assembly's drawing number. It always has six
groups: four digits, then 2 to 5 letters, then four groups of digits. For
example, 2630-CAR-01-03-00-000.

**YF code:** the letters YF, followed by the drawing number with the
hyphens removed. 2630-CAR-01-03-00-000 becomes **YF2630CAR010300000**.

**WBS element:** the first four groups with the hyphens removed.
2630-CAR-01-03-00-000 becomes **2630CAR0103**.

**YF description:**
- If the YF code already exists in SAP, use SAP's description.
- Otherwise write the project number, a hyphen, then the assembly name in
  capitals, kept within 40 characters. For example, "2630-COIL SADDLE @
  POR".
- This is the most common form in SAP for recent projects (about 3,400
  items).

**If the assembly row has no drawing number,** look at the BOM's own part
numbers. Take the first four groups that appear most often and add
"-00-000".

**If the YF code isn't in SAP yet,** it goes on the list of new codes for
the SAP team.

---

## 5. Every row: try these in order, and stop at the first that works

### Step 1. A code a person already chose
If a PM typed a code before for the same part number and description, use
it.

### Step 2. A project drawing part (YS code)
**Recognising one:** the part number is a project drawing number, like
2630-TRL-01-01-00-001: four digits, a letter group, then digit groups.
It is not a standard designation such as "IS 1363 …" or "DIN …", and it
doesn't mention a gasket.

**The code:** the letters YS, followed by the part number with every
hyphen, space and dot removed. 2630-TRL-01-01-00-001 becomes
**YS2630TRL010100001**. If the part number already starts with YS, don't
add a second YS.

**If the code exists in SAP:**
- Use SAP's description.
- Compare the words of the BOM name with SAP's name. If fewer than about
  60% of the BOM words appear in SAP's name, make the row yellow ("SAP
  name differs from BOM name"). This catches drawing numbers that were
  reused for a different part.
- Count shortened words as a match, so "CYL" matches "CYLINDER".

**If the code doesn't exist in SAP:**
- It is a new code, so the row is yellow and the code goes to the SAP
  team.
- Description: the BOM name in capitals, a space, then the first seven
  letters and digits of the part number in brackets. For example, "L
  BRACKET (2427BUP)". SAP uses this form for about 26,500 items, and for
  recent projects it has the space before the bracket.
- If it's too long for 40 characters, shorten the name, never the
  bracket. Cut at a word boundary when you can, and remove a trailing
  comma, dot or hyphen.

### Step 3. A standard part (FS code)
Bolts, nuts, washers, pins and similar parts are recognised from their IS
standard number or their name.

**Read the part number and the description together.** The part number
often says "IS 2016 A- 18" while the description says "Plain Washer
(Type A) IS 2016 - 18". You need both.

**Check the part types in this order.** Many bolt lines also mention a nut
or washer, so checking bolts first gives wrong answers:
1. lock nut
2. thin nut
3. ordinary nut
4. plain washer
5. spring washer
6. Allen bolt
7. countersunk bolt
8. grub screw
9. hexagon bolt
10. dowel pin
11. grease nipple
12. circlip
13. parallel key
14. gasket

**How each type is recognised and written:**

| Part | Recognised by | SAP code looks like | SAP description looks like |
|---|---|---|---|
| Hexagon head bolt | IS 1363, IS 1364 HHB, "hexagon head bolt/screw" | FSBT08M08L20G2 | HEXAGON HEAD BOLT- M08X20MM ,G-10.9 |
| Allen bolt | IS 2269, "socket head cap screw", "Allen" | FSBT01M10L35G2 | ALLEN BOLT- M10X35MM ,G-10.9 |
| Countersunk bolt | IS 6761, "countersunk", "CSK" | FSBT03M12L45G2 | CSK BOLT- M12X45MM ,G-10.9 |
| Grub screw | IS 6094, "grub screw", "set screw" | FSSW06M08L10G2 | HEX SOCKET GRUB SCREW- M08X10MM ,G-10.9 |
| Hexagon nut | IS 1364 part 3, "nut" | FSNT07M48 G2 (note the space) | HEXAGON NUT- M48 ,G-10.9 |
| Thin nut | IS 1364 part 4, "thin nut" | FSNT38M48 | HEXAGON THIN NUT-M48,THD-5MM |
| Lock nut | IS 6731, "lock nut", "KM" number | FSNT10KM12 | LOCK NUT -M60 x 2.00 ,KM12 |
| Plain washer | IS 2016, "plain/flat washer" | FSWR13M16 | PLAIN WASHER -M16 |
| Spring washer | IS 6735, IS 3063, "spring washer" | FSWR16D18 | SPRING WASHER-18MM |
| Dowel pin | "dowel pin" | FSPN25M10L35 | DOWEL PIN- M10X35MM |
| Grease nipple | "grease nipple" + inch size | FSNP05D1/8 | GREASE NIPPLE 1/8" BSP SS304 |
| Circlip | "circlip", "retaining ring" | FSCC19D40 (external), FSCC20D40 (internal) | EXTERNAL CIRCLIP ,DIA-40 MM |
| Parallel key | "parallel key", or "key" with three sizes | FSKE12D10L08H50 | PARALLEL KEY-(10X8X50)MM |
| Gasket | "gasket" + DN or NB size | GFL… (ANSI class 150) or GPFL… (EN-1092 PN6) | GASKET,PN6 FLANGE,DN65,3THK,EN-1092 |

**Sizes:**
- The thread size (M) and length are written with at least two digits:
  M8 × 20 becomes "M08" and "L20".
- Read sizes written as "M12 x 40", "M12X40" or "12 X 40 MM", and treat
  the "×" symbol as an X.

**Plain washers:**
- IS 2016 washers are sized by their **hole**, not the bolt. The hole has
  to be converted to the bolt size: hole 18 is for M16, 22 for M20, 26 for
  M24, 13 for M12, and so on.
- This table is easy to get wrong and causes many errors. Check it
  against the SAP library.

**Lock nuts:** the KM number comes from the thread size (M60 is KM12).
The description includes the thread pitch.

**Grade:**
- 12.9 is G3, 10.9 is G2, 8.8 is G1.
- Stainless steel 304 is G4, 316 is G5, 310 is G6.
- **If the BOM gives no usable grade, use G2 (10.9).** This is a company
  decision: our BOMs often say "Grade C" (4.6), which SAP doesn't stock.
  Don't "correct" this default, even if some SAP BOMs show another grade.
  Report such cases instead.

**Matching the library is forgiving about the grade ending.** SAP isn't
consistent: ordinary nuts have a space before the grade (FSNT07M30 G2),
bolts don't (FSBT08M12L40G2), and thin nuts often have no grade at all
(FSNT38M48). So try the code four ways:
1. as built;
2. without the space;
3. with a space;
4. without the grade.

If any of them is in SAP, use SAP's exact code and description, and the
row is green. If none is, keep the built code as a new code (yellow).

### Step 4. Bought-out items with no rule
Bearings, oil seals, rotary unions and similar items are matched by
searching the SAP library.

**Which items to search:** leave out YS and YF items and deleted items.

**What counts as a candidate:**
- Compare the numbers in the BOM text (two or more digits each) and the
  words (three or more letters). Ignore filler words such as MM, THK,
  LONG, MODEL, NO, DIA, SIZE, TYPE, WITH, AND, FOR, STD, MAKE, REV.
- A candidate needs **at least two shared numbers, or one shared number
  of four or more digits**, plus **at least one shared word**.
- Numbers count twice as much as words. Take the best score.

**The result is always yellow, never green.** It is a suggestion.

### Step 5. Nothing found
Leave the code empty, use the BOM name (within 40 characters) as the
description, and mark the row red. When the PM types the code, remember it
(step 1).

### Final checks on the whole BOM
- **Red** if the code is longer than 18 characters, the description is
  empty or longer than 40 characters, or the code is a deleted item.
- **Red** if the same code appears twice in one BOM with two different
  descriptions. That always means one of them is wrong.
- **New codes are requested only once per project.** If another assembly
  already asked for a code, say so ("already requested with SR …") and
  don't request it again.
- When the SAP team marks a code as created, treat it as being in SAP
  until the next Products export is loaded.

---

## 6. What "good" looks like: our measured results

**On the ten sample BOMs (192 rows):** 99 green, 89 yellow, 4 red.
- Most yellows are new 2630 drawing parts that don't exist in SAP yet.
  That is the correct answer, not a failure.
- The four reds are a proximity switch and an O-ring, each appearing
  twice. No rule covers them.
- The one row in these files that already had an SAP code matched it
  exactly.

**On SAP's own standard parts:** each rule was given SAP's description of
every standard item in the library and checked to rebuild the same code.

| Part | Rebuilt correctly |
|---|---|
| Allen bolts | 801 of 811 (99%) |
| Hexagon bolts | 701 of 719 (97.5%) |
| Countersunk bolts | 73 of 74 |
| Grub screws | 101 of 106 |
| Spring washers | 45 of 45 |
| Circlips | 40 of 40 |
| Dowel pins | 88 of 90 |
| Hexagon nuts | 68 of 72 |
| Lock nuts | 39 of 42 |
| Plain washers | 50 of 56 |
| Thin nuts | 10 of 11 |
| Grease nipples | 6 of 7 |
| Parallel keys | 61 of 80 (76%, the weakest) |

If his code scores clearly below these numbers on the same data, the gap
is in his rules or his BOM reading.

---

## 7. Test examples: input and the correct answer

These are real rows. His code should give exactly these results.

| Part number | Description | Correct code | Correct description | Colour |
|---|---|---|---|---|
| 2427-BUP-03-01-00-001 | STUD | YS2427BUP030100001 | STUD (2427BUP) | green |
| 2427-BUP-03-01-00-008 | PROXIMITY SENSOR MOUNTING PLATE | YS2427BUP030100008 | SLIDING PLATE (2427BUP), taken from SAP | yellow: SAP name differs |
| 2427-BUP-03-01-05-000 | L BRACKET | YS2427BUP030105000 | L BRACKET (2427BUP) | yellow: new code |
| IS 1363(Part2) - M8 x 20- NN | Hexagon Head Screw (Grade C) IS 1363(Part2) - M8 x 20 | FSBT08M08L20G2 | HEXAGON HEAD BOLT- M08X20MM ,G-10.9 | green |
| IS 2269 - M10 x 35-N | Socket Head Cap Screw IS 2269 - M10 x 35 | FSBT01M10L35G2 | ALLEN BOLT- M10X35MM ,G-10.9 | green |
| IS 6761 - M12 x 45-N | Socket Countersunk Head Cap Screw IS 6761 - M12 x 45 | FSBT03M12L45G2 | CSK BOLT- M12X45MM ,G-10.9 | green |
| IS 1364-3 - M48-D-N | Hexagon Nut Style 1 IS 1364-Part3 - M48- D-N | FSNT07M48 G2 | HEXAGON NUT- M48 ,G-10.9 | green |
| IS 1364-4 - M48-N | Hexagon Thin Nut (chamfered) IS 1364- Part4 - M48-N | FSNT38M48 | HEXAGON THIN NUT-M48,THD-5MM | green |
| IS 2016 A- 18 | Plain Washer (Type A) IS 2016 - 18 | FSWR13M16 | PLAIN WASHER -M16 | green |
| IS 6735- 18 | Spring Lock Washer IS 6735 - 18 | FSWR16D18 | SPRING WASHER-18MM | green |
| Grease Nipple 1-8 BSP | GREASE NIPPLE 1/8" BSP | FSNP05D1/8 | GREASE NIPPLE 1/8" BSP SS304 | green |
| DOWEL PIN Ø10X35 MM LONG | DOWEL PIN-Ø10X35 MM LONG | FSPN25M10L35 | DOWEL PIN- M10X35MM | yellow: new code |
| SKF - 32036 X - 24,SI,NC,24 | (empty) | BG0832036SF | BEARING,TAPER ROLLER,32036 X,SKF | yellow: closest item |
| 250X280X15_OIL SEAL_AIA2500805 | AIA2500805-OIL SEAL- ID250XOD280X15 THK. | OSS250X280Y15 | OIL SEAL-250ID x 280OD x 15THK | yellow: closest item |
| PROXIMITY SWITCH PX-IIC209 | PROXIMITY SWITCH PX-IIC209 | (none) | PROXIMITY SWITCH PX-IIC209 | red |
| O RING D-6 ID-320 | O RING D-6, ID-320 | (none) | O RING D-6, ID-320 | red |

**Assemblies:**

| Assembly drawing no. | YF code | Status in SAP | YF description | WBS element |
|---|---|---|---|---|
| 2427-BUP-03-01-00-000 | YF2427BUP030100000 | exists | 2427-BACKUP CLAMP ASSEMBLY | 2427BUP0301 |
| 2630-TRL-02-01-00-000 | YF2630TRL020100000 | new | 2630-DTR MANDREL | 2630TRL0201 |

**The ROLL FORCE CYLINDER BOM (2427-RFC-01-01-00-000)** is the test for
moved columns. Its first row is 2427-RFC-01-01-01-000, and the BOM itself
already gives the answer, YS2427RFC010101000. All 13 rows should come out
with a code: 11 green and 2 yellow, with no reds.

---

## 8. How to raise accuracy: the method

His SAP BOMs (BOMs already entered in SAP) are the answer key. Accuracy
only improves by measuring against them.

1. **Pair the rows.**
   - For each Design BOM that has a matching SAP BOM, pair the rows by
     part number, ignoring hyphens and spaces.
   - Where there's no part number, pair by serial number and a similar
     description.
   - Keep a list of unpaired rows; they show what SAP added or dropped.
2. **Record every pair:** which step produced the code, the code
   produced, the code in SAP, and whether they match exactly (ignoring
   spaces).
3. **Report by part type and by step, not one overall percentage.** A
   result of 95% overall can hide a part type that is only 40% right.
4. **Sort every mismatch into one of these groups** before changing
   anything:
   - **Reading error:** the right pattern but the wrong size, length or
     grade. Fix the reading of the text.
   - **Missing rule:** a part type with no rule, such as O-rings, sensors
     or cable glands. First check that SAP uses a consistent code pattern
     for that type; only then add a rule.
   - **SAP variant:** SAP uses a special ending for this case (see the
     list below). Add it as an extra way to look the code up, not as a new
     default.
   - **PM's own choice:** a one-off decision. Let the memory step handle
     it; don't turn it into a rule.
   - **Grade difference:** for example, SAP used 8.8 where the rule
     defaults to 10.9. That's company policy, so report it rather than
     change the default.
5. **Never fix a single row by its exact part number.** Every fix must be
   a pattern that applies to all similar rows.
6. **Re-run the full set after every change.** A fix for one part type
   often breaks another. Keep the examples in section 7, and every
   mismatch you fix, as a permanent test list.

**SAP variants that cause most of the remaining misses.** Use them as
extra ways to look a code up, only when the BOM text supports them:

| Case | SAP example | When the BOM says |
|---|---|---|
| Full thread bolt | FSBT08M08L100FT, FSBT01M10L30FTG2 | "full thread" or "FT" |
| Sold by weight | FSWR13M05K, FSNT07M10K | "(KG)". Usually a PM's choice, so leave it yellow |
| Fine thread pitch | FSNT07M301.5, FSNT38M241.5G2 | "thread 1.5" or "× 1.5" after the size |
| Left-hand thread | FSNT07M36 G7 | "LH" or "LHS" |
| Inch grub screw | FSSW06D1/4L10 | an inch size with BSP |
| Dowel written with D | FSPN25D25L150 | "Ø25". The M form is still normal (88 of 90) |
| Key height not padded | FSKE12D14L9H50 | try both "L09" and "L9" |

**SAP's own mistakes:** some library items have descriptions that
contradict their own code. For example, FSBT01M06L90FT is described as
M20 × 90. Don't build rules around these; send the list to the SAP team
to clean up.

---

## 9. Where this sits in the process

1. **Design** uploads a BOM on the lowest level of the project's LOE: the
   subassembly, or the assembly when it has no subassemblies. An assembly
   that has subassemblies never gets its own BOM.
2. **The PM** reviews the converted rows by colour and fixes the reds.
   New codes go to the SAP team as one list with these columns: type,
   code, description, WBS element, YF code, project, assembly.
3. **The SAP team** creates the new codes and marks each one as created.
4. **The BOM goes into SAP** with these columns: YF code, YF description,
   WBS element, YS code, YS description, quantity, material, weight, part
   number.
5. **POs or jobwork** are raised per component. GRNs in SAP, matched by
   WBS element and material code, show when each item reaches the plant.
