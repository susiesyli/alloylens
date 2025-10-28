// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7?module";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
// import { csv } from "https://cdn.jsdelivr.net/npm/d3-fetch@3/+esm";

// Simple SPLOM app that reproduces the checkbox UI from the notebook
// Loads dataset/data_sample_2000.csv and creates checkboxes for numeric columns.

const dataPath = "../dataset/data_sample_2000.csv";

const checkboxContainer = document.getElementById("checkboxes");
const applyBtn = document.getElementById("apply");
const exportBtn = document.getElementById("export");
const selectedCountSpan = document.getElementById("selected-count");
const splomDiv = document.getElementById("splom");
const plotInfo = document.getElementById("plot-info");

let rawData = null;
let numericCols = [];
let currentSelected = new Set();
let lastRenderedPoints = []; // store nodes with indexes for selection export

// load CSV, parse numbers when possible
async function loadData() {
  plotInfo.textContent = "Loading data...";
  const rows = await d3.csv(dataPath, (row) => {
    // convert fields that look numeric
    const out = {};
    for (const k of Object.keys(row)) {
      const v = row[k];
      // detect numbers (including scientific notation)
      const n = v === "" ? NaN : +v;
      out[k] = isFinite(n) ? n : v;
    }
    return out;
  });
  rawData = rows;
  plotInfo.textContent = `Loaded ${rows.length} rows.`;
  detectNumericColumns();
  buildCheckboxes();
}

function detectNumericColumns() {
  if (!rawData || rawData.length === 0) return;
  const cols = Object.keys(rawData[0]);
  numericCols = cols.filter((c) => {
    // check first 200 rows if value is number
    let numCount = 0;
    let checked = Math.min(200, rawData.length);
    for (let i = 0; i < checked; i++) {
      const v = rawData[i][c];
      if (typeof v === "number" && !isNaN(v)) numCount++;
    }
    return numCount / checked > 0.9; // >90% numeric
  });
}

function buildCheckboxes() {
  checkboxContainer.innerHTML = "";
  numericCols.forEach((col) => {
    const id = `cb-${col.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    const wrapper = document.createElement("div");
    wrapper.style.margin = "2px 0";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = id;
    cb.value = col;
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = col;
    wrapper.appendChild(cb);
    wrapper.appendChild(label);
    checkboxContainer.appendChild(wrapper);
  });
}

function getSelectedCols() {
  const boxes = checkboxContainer.querySelectorAll("input[type=checkbox]");
  const sel = [];
  boxes.forEach((b) => {
    if (b.checked) sel.push(b.value);
  });
  return sel;
}

// create SPLOM with selected columns
function renderSplom(cols) {
  splomDiv.innerHTML = "";
  lastRenderedPoints = [];
  currentSelected.clear();
  selectedCountSpan.textContent = "[0 selected]";

  if (cols.length === 0) {
    plotInfo.textContent = "No columns selected.";
    return;
  }

  plotInfo.textContent = `Plotting ${cols.length} feature(s)`;

  const size = 130; // subplot size
  const padding = 20;
  const n = cols.length;
  const width = size * n + padding;
  const height = size * n + padding;

  const svg = d3
    .select(splomDiv)
    .append("svg")
    .attr("width", width + 40)
    .attr("height", height + 40)
    .style("font-family", "sans-serif");

  // compute scales for each column
  const colScales = {};
  cols.forEach((c) => {
    const extent = d3.extent(rawData, (d) => d[c]);
    // if flat, extend a bit
    if (extent[0] === extent[1]) {
      extent[0] = extent[0] - 1;
      extent[1] = extent[1] + 1;
    }
    colScales[c] = d3
      .scaleLinear()
      .domain(extent)
      .nice()
      .range([padding, size - padding]);
  });

  // create group for plots
  const g = svg.append("g").attr("transform", "translate(20,20)");

  // add subplots
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const xpos = j * size;
      const ypos = i * size;
      const cell = g
        .append("g")
        .attr("transform", `translate(${xpos}, ${ypos})`)
        .attr("class", "cell");

      const xcol = cols[j];
      const ycol = cols[i];

      // diagonal: show label and histogram
      if (i === j) {
        cell
          .append("rect")
          .attr("width", size)
          .attr("height", size)
          .attr("fill", "white");
        cell
          .append("text")
          .attr("x", size / 2)
          .attr("y", size / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .text(xcol)
          .style("font-size", "11px");
        // simple histogram
        const values = rawData.map((d) => d[xcol]);
        const x = d3
          .scaleLinear()
          .domain(colScales[xcol].domain())
          .range([padding, size - padding]);
        const bins = d3.bin().domain(x.domain()).thresholds(16)(values);
        const y = d3
          .scaleLinear()
          .domain([0, d3.max(bins, (b) => b.length)])
          .range([size - padding, padding]);
        const bar = cell.append("g").attr("transform", `translate(0,${0})`);
        bar
          .selectAll("rect")
          .data(bins)
          .join("rect")
          .attr("x", (d) => x(d.x0))
          .attr("y", (d) => y(d.length))
          .attr("width", (d) => Math.max(1, x(d.x1) - x(d.x0) - 1))
          .attr("height", (d) => size - padding - y(d.length))
          .attr("fill", "#888")
          .attr("opacity", 0.6);
        continue;
      }

      // background
      cell
        .append("rect")
        .attr("width", size)
        .attr("height", size)
        .attr("fill", "white");

      const sx = colScales[xcol].range([padding, size - padding]);
      const sy = colScales[ycol].range([size - padding, padding]);

      // axes ticks on leftmost and bottommost
      if (i === n - 1) {
        const xAxis = d3.axisBottom(sx).ticks(3).tickSize(3);
        cell
          .append("g")
          .attr("transform", `translate(0,${size - padding})`)
          .call(xAxis)
          .selectAll("text")
          .style("font-size", "8px");
      }
      if (j === 0) {
        const yAxis = d3.axisLeft(sy).ticks(3).tickSize(3);
        cell
          .append("g")
          .attr("transform", `translate(${padding},0)`)
          .call(yAxis)
          .selectAll("text")
          .style("font-size", "8px");
      }

      // points group
      const pts = cell.append("g").attr("class", "points");

      // render points; store index for linking selections
      rawData.forEach((d, idx) => {
        // small circles
        pts
          .append("circle")
          .attr("cx", sx(d[xcol]))
          .attr("cy", sy(d[ycol]))
          .attr("r", 2.2)
          .attr("fill", "#999")
          .attr("opacity", 0.9)
          .attr("data-idx", idx);
        // push ref for global selection
      });

      // add brush
      const brush = d3
        .brush()
        .extent([
          [0, 0],
          [size, size],
        ])
        .on("start brush end", ({ selection }) => {
          if (!selection) {
            // on clear - if end, clear currentSelected and recompute from other brushes
            // compute across all cells
            updateSelectionFromBrushes(svg);
            return;
          }
          const [[x0, y0], [x1, y1]] = selection;
          // select points in this cell
          cell.selectAll("circle").classed("brushed", function () {
            const cx = +d3.select(this).attr("cx");
            const cy = +d3.select(this).attr("cy");
            return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
          });
          updateSelectionFromBrushes(svg);
        });

      cell.append("g").attr("class", "brush").call(brush);
    }
  }

  // after drawing, collect all points for easy access
  lastRenderedPoints = Array.from(svg.selectAll("circle").nodes()).map((n) => ({
    node: n,
    idx: +n.getAttribute("data-idx"),
  }));
}

function updateSelectionFromBrushes(svg) {
  // gather all circles that have class 'brushed' across all cells
  const brushedNodes = Array.from(svg.selectAll("circle.brushed").nodes());
  // get unique data indices
  const idxs = new Set(brushedNodes.map((n) => +n.getAttribute("data-idx")));
  currentSelected = idxs;

  // highlight globally: set all circles with these indices to highlighted color
  lastRenderedPoints.forEach(({ node, idx }) => {
    if (currentSelected.has(idx)) {
      d3.select(node).attr("fill", "#e6550d").attr("r", 3.2).attr("opacity", 1);
    } else {
      d3.select(node).attr("fill", "#999").attr("r", 2.2).attr("opacity", 0.6);
    }
  });

  selectedCountSpan.textContent = `[${currentSelected.size} selected]`;
}

function exportSelectedCSV() {
  if (!rawData) return;
  if (currentSelected.size === 0) {
    alert("No rows selected");
    return;
  }
  const arr = Array.from(currentSelected).map((i) => rawData[i]);
  const cols = Object.keys(rawData[0]);
  const csv = [cols.join(",")]
    .concat(
      arr.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(","))
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "selected_rows.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

applyBtn.addEventListener("click", () => {
  const cols = getSelectedCols();
  // limit for performance
  if (cols.length > 8) {
    if (
      !confirm("You selected more than 8 columns. That may be slow. Continue?")
    )
      return;
  }
  renderSplom(cols);
});

exportBtn.addEventListener("click", exportSelectedCSV);

loadData();
