// app.js
import AlloyLensWidget from "./mywidget.js";
import * as d3 from "https://esm.sh/d3@7.9.0";

// ----------------- tiny widget-model shim -----------------
class Model {
  constructor(initial = {}) {
    this.state = { ...initial };
    this.listeners = {};
  }
  get(k) {
    return this.state[k];
  }
  set(k, v) {
    this.state[k] = v;
    this._emit(`change:${k}`);
  }
  on(evt, cb) {
    (this.listeners[evt] ??= []).push(cb);
  }
  save_changes() {}
  _emit(evt) {
    (this.listeners[evt] || []).forEach((cb) => cb());
  }
}

// ----------------- DOM refs -----------------
const elListX = document.getElementById("list-x");
const elListY = document.getElementById("list-y");
const btnXAll = document.getElementById("x-select-all");
const btnXClear = document.getElementById("x-clear");
const btnYAll = document.getElementById("y-select-all");
const btnYClear = document.getElementById("y-clear");
const btnApply = document.getElementById("apply");
const btnExport = document.getElementById("export");
const spanCount = document.getElementById("selected-count");
const plotInfo = document.getElementById("plot-info");
const splomHost = document.getElementById("splom");

// group toggles
const groupXCheckboxes = Array.from(document.querySelectorAll(".group-x"));
const groupYCheckboxes = Array.from(document.querySelectorAll(".group-y"));

// ----------------- data & categories -----------------
let raw = [];
let numericCols = new Set();
let model = null;

// Define column groups by header names (as in CSV)
const GROUPS = {
  inputs: [
    "KS1295[%]",
    "6082[%]",
    "2024[%]",
    "bat-box[%]",
    "3003[%]",
    "4032[%]",
  ],
  elements: [
    "Al",
    "Si",
    "Cu",
    "Ni",
    "Mg",
    "Mn",
    "Fe",
    "Cr",
    "Ti",
    "Zr",
    "V",
    "Zn",
  ],
  micro: [
    "Vf_FCC_A1",
    "Vf_DIAMOND_A4",
    "Vf_AL15SI2M4",
    "Vf_AL3X",
    "Vf_AL6MN",
    "Vf_MG2ZN3",
    "Vf_AL3NI2",
    "Vf_AL3NI_D011",
    "Vf_AL7CU4NI",
    "Vf_AL2CU_C16",
    "Vf_Q_ALCUMGSI",
    "Vf_AL7CU2FE",
    "Vf_MG2SI_C1",
    "Vf_AL9FE2SI2",
    "Vf_AL18FE2MG7SI10",
    "eut. frac.[%]",
    "eut. T (°C)",
    "T_FCC_A1",
    "T_DIAMOND_A4",
    "T_AL15SI2M4",
    "T_AL3X",
    "T_AL6MN",
    "T_MG2ZN3",
    "T_AL3NI2",
    "T_AL3NI_D011",
    "T_AL7CU4NI",
    "T_AL2CU_C16",
    "T_Q_ALCUMGSI",
    "T_AL7CU2FE",
    "T_MG2SI_C1",
    "T_AL9FE2SI2",
    "T_AL18FE2MG7SI10",
    "T(liqu)",
    "T(sol)",
    "delta_T",
    "delta_T_FCC",
    "delta_T_Al15Si2M4",
    "delta_T_Si",
  ],
  props: [
    "CSC",
    "YS(MPa)",
    "hardness(Vickers)",
    "CTEvol(1/K)(20.0-300.0°C)",
    "Density(g/cm3)",
    "Volume(m3/mol)",
    "El.conductivity(S/m)",
    "El. resistivity(ohm m)",
    "heat capacity(J/(mol K))",
    "Therm.conductivity(W/(mK))",
    "Therm. diffusivity(m2/s)",
    "Therm.resistivity(mK/W)",
    "Linear thermal expansion (1/K)(20.0-300.0°C)",
    "Technical thermal expansion (1/K)(20.0-300.0°C)",
  ],
};

// ----------------- init -----------------
(async function init() {
  raw = await d3.csv("./webapp/data/sample.csv", d3.autoType);

  // which columns are numeric?
  const first = raw[0] ?? {};
  for (const k of Object.keys(first)) {
    if (typeof first[k] === "number" && Number.isFinite(first[k])) {
      numericCols.add(k);
    }
  }

  // default groups
  checkGroups(groupXCheckboxes, ["elements"]); // X defaults
  checkGroups(groupYCheckboxes, ["props"]); // Y defaults

  // build feature lists for each axis
  refreshAxisList("x");
  refreshAxisList("y");

  // ---- default feature selections ----
  const defaultX = ["Al", "Si", "Cu", "Mg", "Mn", "Fe"]; // 6 elements
  const defaultY = ["YS(MPa)", "hardness(Vickers)"]; // a couple of props

  setDefaultFeatures("x", defaultX);
  setDefaultFeatures("y", defaultY);

  plotInfo.textContent = "Showing default SPLOM (6 elements × 2 properties).";

  // Automatically draw initial SPLOM with these defaults
  applySelection();
})();

// ----------------- UI builders -----------------
function checkGroups(checkboxNodes, keysToCheck) {
  checkboxNodes.forEach((cb) => {
    cb.checked = keysToCheck.includes(cb.dataset.group);
  });
}

function gatherGroupCols(axis) {
  // axis: "x" | "y"
  const cbs = axis === "x" ? groupXCheckboxes : groupYCheckboxes;
  const selectedGroups = cbs
    .filter((cb) => cb.checked)
    .map((cb) => cb.dataset.group);
  // flatten columns in those groups & keep only numeric columns present in CSV
  const cols = [];
  for (const g of selectedGroups) {
    for (const col of GROUPS[g] || []) {
      if (numericCols.has(col)) cols.push(col);
    }
  }
  return Array.from(new Set(cols));
}

function refreshAxisList(axis) {
  const listEl = axis === "x" ? elListX : elListY;
  const cols = gatherGroupCols(axis);
  listEl.innerHTML = "";

  // Build checkboxes for the visible columns in this axis
  const frag = document.createDocumentFragment();
  for (const c of cols) {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = c;
    cb.checked = false; // start unchecked
    label.appendChild(cb);
    label.appendChild(document.createTextNode(c));
    frag.appendChild(label);
  }
  listEl.appendChild(frag);
}

// respond to group toggles
groupXCheckboxes.forEach((cb) =>
  cb.addEventListener("change", () => refreshAxisList("x"))
);
groupYCheckboxes.forEach((cb) =>
  cb.addEventListener("change", () => refreshAxisList("y"))
);

// select/clear helpers
btnXAll.addEventListener("click", () => {
  elListX
    .querySelectorAll('input[type="checkbox"]')
    .forEach((cb) => (cb.checked = true));
});
btnXClear.addEventListener("click", () => {
  elListX
    .querySelectorAll('input[type="checkbox"]')
    .forEach((cb) => (cb.checked = false));
});
btnYAll.addEventListener("click", () => {
  elListY
    .querySelectorAll('input[type="checkbox"]')
    .forEach((cb) => (cb.checked = true));
});
btnYClear.addEventListener("click", () => {
  elListY
    .querySelectorAll('input[type="checkbox"]')
    .forEach((cb) => (cb.checked = false));
});

function setDefaultFeatures(axis, featureNames) {
  const listEl = axis === "x" ? elListX : elListY;
  listEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = featureNames.includes(cb.value);
  });
}

function selectedFeaturesFromList(listEl) {
  return Array.from(
    listEl.querySelectorAll('input[type="checkbox"]:checked')
  ).map((cb) => cb.value);
}

// ----------------- Apply → mount widget -----------------
// btnApply.addEventListener("click", () => {
//   const x_feats = selectedFeaturesFromList(elListX);
//   const y_feats = selectedFeaturesFromList(elListY);

//   if (x_feats.length === 0 || y_feats.length === 0) {
//     plotInfo.textContent = "Select at least one X feature and one Y feature.";
//     return;
//   }
//   plotInfo.textContent = "";

//   splomHost.innerHTML = "";

//   model = new Model({
//     data: { data: raw },
//     col_attrs: x_feats, // X axis = columns
//     row_attrs: y_feats, // Y axis = rows
//     subplot_width: 180,
//     subplot_height: 160,
//     width: Math.min(window.innerWidth - 340, x_feats.length * 180 + 90),
//     height: Math.min(window.innerHeight - 40, y_feats.length * 160 + 90),
//     surrogate: true,
//   });

//   model.on("change:selected", () => {
//     const sel = model.get("selected") || [];
//     const n = sel.reduce((acc, v) => acc + (v ? 1 : 0), 0);
//     spanCount.textContent = `[${n} selected]`;
//   });

//   AlloyLensWidget.render({ model, el: splomHost });
// });
function applySelection() {
  const x_feats = selectedFeaturesFromList(elListX);
  const y_feats = selectedFeaturesFromList(elListY);

  if (x_feats.length === 0 || y_feats.length === 0) {
    plotInfo.textContent = "Select at least one X feature and one Y feature.";
    return;
  }
  plotInfo.textContent = "";

  splomHost.innerHTML = "";

  model = new Model({
    data: { data: raw },
    col_attrs: x_feats, // X axis = columns
    row_attrs: y_feats, // Y axis = rows
    subplot_width: 180,
    subplot_height: 160,
    width: Math.min(window.innerWidth - 340, x_feats.length * 180 + 90),
    height: Math.min(window.innerHeight - 40, y_feats.length * 160 + 90),
    surrogate: true,
  });

  model.on("change:selected", () => {
    const sel = model.get("selected") || [];
    const n = sel.reduce((acc, v) => acc + (v ? 1 : 0), 0);
    spanCount.textContent = `[${n} selected]`;
  });

  AlloyLensWidget.render({ model, el: splomHost });
}

btnApply.addEventListener("click", applySelection);

// ----------------- Export -----------------
btnExport.addEventListener("click", () => {
  if (!model) return;
  const mask = model.get("selected") || [];
  const hasAny = mask.some(Boolean);
  const rows = hasAny ? raw.filter((_, i) => mask[i]) : raw;

  const csv = d3.csvFormat(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = hasAny ? "alloylens_selection.csv" : "alloylens_data.csv";
  a.click();
  URL.revokeObjectURL(url);
});
