// YDAstra row colours — shared by frontend/ydAstra.html and
// backend/scripts/checkYdAstraRules.js, so the page and the accuracy check
// judge rows the same way. From the team's SAP accuracy guide:
//
//   green  — the code is in SAP and the names agree; nobody needs to check it
//   yellow — a new code for the SAP team to create, or a suggestion to check
//   red    — no usable code; a person must fix it
//
// A wrong code shown green is the worst result, so anything uncertain is
// yellow at best.
(function (root) {
    const SAP_CODE_MAX = 18;
    const SAP_DESC_MAX = 40;

    const words = (s) =>
    (String(s || "")
        .toUpperCase()
        .replace(/\([0-9A-Z]{4,8}\)\s*$/, "") // the "(2427BUP)" tag
        .match(/[A-Z0-9]{2,}/g) || []);

    // Share of the BOM name's words that are in SAP's name. A shortened word
    // counts: CYL matches CYLINDER.
    function nameAgreement(bomName, sapName) {
        const b = words(bomName);
        if (!b.length) return 1;
        const s = words(sapName);
        const same = (x, y) =>
            x === y || (Math.min(x.length, y.length) >= 3 && (x.startsWith(y) || y.startsWith(x)));
        return b.filter((w) => s.some((x) => same(w, x))).length / b.length;
    }

    // row: { code, description, source, check, bomName }
    //   source: "memory" | "drawing" | "standard" | "sap" | "bom" | "user" | "none" | ""
    // ctx:  { sap: { CODE: description } (in SAP, not deleted),
    //         deleted: { CODE: true }, conflicting: { CODE: true } }
    // → { colour: "green" | "yellow" | "red", reason, isNew }
    function rowStatus(row, ctx) {
        const code = row.code || "";
        const desc = row.description || "";
        const red = (reason) => ({ colour: "red", reason, isNew: false });
        if (!code) return red("No code — type one");
        if (code.length > SAP_CODE_MAX) return red(`Code longer than ${SAP_CODE_MAX} characters`);
        if (ctx.deleted[code]) return red("Code is a deleted SAP item");
        if (!desc) return red("No description");
        if (desc.length > SAP_DESC_MAX) return red(`Description longer than ${SAP_DESC_MAX} characters`);
        if (ctx.conflicting[code]) return red("Same code on another row with a different description");

        if (!(code in ctx.sap)) return { colour: "yellow", reason: "New code — SAP team to create", isNew: true };
        const yellow = (reason) => ({ colour: "yellow", reason, isNew: false });
        if (row.source === "sap") return yellow("Closest SAP match — check");
        if (row.check) return yellow(row.check);
        if (row.source === "drawing" && nameAgreement(row.bomName, ctx.sap[code]) < 0.6)
            return yellow("SAP name differs from BOM name");
        const how = {
            drawing: "from the drawing no.",
            standard: "standard part",
            memory: "chosen before",
            bom: "from the BOM",
        }[row.source];
        return { colour: "green", reason: how ? `In SAP · ${how}` : "In SAP", isNew: false };
    }

    // Codes used on two rows with two different descriptions.
    function conflictingCodes(rows) {
        const seen = {};
        const out = {};
        rows.forEach((r) => {
            if (!r.code) return;
            const d = (r.description || "").toUpperCase();
            if (r.code in seen && seen[r.code] !== d) out[r.code] = true;
            else seen[r.code] = d;
        });
        return out;
    }

    const api = { SAP_CODE_MAX, SAP_DESC_MAX, nameAgreement, rowStatus, conflictingCodes };
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    else root.YdAstraRules = api;
})(this);