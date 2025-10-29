// mywidget.js  — webapp build

// Clean ESM URLs (avoid import-map/shim headaches)
import * as d3 from "https://esm.sh/d3@7.9.0";
import regl2 from "https://esm.sh/regl@2.1.0?bundle";
import crossfilter from "https://esm.sh/crossfilter2@1.5.4";

import { splom_gl2, C, cumulative_sum, clip, lines } from "./vis.js";

/* ---------- small UI helpers ---------- */
function style_control(sel, control_size) {
  sel
    .attr("fill", C[0])
    .attr("stroke", "white")
    .attr("stroke-width", control_size / 10)
    .attr("r", control_size / 2);
}

/* ---------- robust SPLOM helpers (skip diagonal KDEs) ---------- */
function scatterInRowFrom(splom, i) {
  const row = splom.subplots[i] || [];
  return row.find((sp) => sp && sp.frame) || null; // SCATTER cell has .frame/.scales
}
function scatterInColFrom(splom, j) {
  for (let i = 0; i < splom.subplots.length; i++) {
    const sp = splom.subplots[i]?.[j];
    if (sp && sp.frame) return sp;
  }
  return null;
}

/* ---------- main render entry ---------- */
function render({ model, el }) {
  // data & selections
  const data = model.get("data")["data"];
  const col_attrs = model.get("col_attrs");
  const row_attrs = model.get("row_attrs");

  // layout
  const side_bar_width = 90;
  const bottom_bar_height = 90;
  const subplot_width = model.get("subplot_width") || 200;
  const subplot_height = model.get("subplot_height") || 200;

  const ui_width =
    model.get("width") ||
    Math.min(
      subplot_width * col_attrs.length + side_bar_width,
      el.getBoundingClientRect().width
    );
  const ui_height =
    model.get("height") ||
    Math.min(
      subplot_height * row_attrs.length + bottom_bar_height,
      ui_width * 0.618
    );

  const splom_width = col_attrs.length * subplot_width;
  const splom_height = row_attrs.length * subplot_height;

  // container
  d3.select(el)
    .style("width", `${ui_width}px`)
    .style("height", `${ui_height}px`);

  const root_div = d3
    .create("div")
    .attr("class", "root-div ui-container")
    .style("position", "relative")
    .style("width", `${ui_width}px`)
    .style("height", `${ui_height}px`)
    .style("overflow", "scroll");

  const splom_container = root_div
    .append("div")
    .attr("class", "splom-container")
    .style("position", "absolute")
    .style("top", `0px`)
    .style("left", `${side_bar_width}px`);

  // build SPLOM
  const splom = splom_gl2(splom_container, data, {
    layout: "both",
    histogram: true,
    width: splom_width,
    height: splom_height,
    padding_left: 0,
    padding_right: 0,
    padding_bottom: 0,
    padding_top: 0,
    subplot_padding_left: 0,
    subplot_padding_right: 12,
    subplot_padding_top: 6,
    subplot_padding_bottom: 6,
    s: (_) => 4,
    col_attrs,
    row_attrs,
    brush: true,
    xticks: 3,
    yticks: 3,
    show_tick_texts: false,
    show_axis_label: false,
  });

  // side sliders
  root_div
    .append("svg")
    .attr("class", "side-slider")
    .attr("width", side_bar_width)
    .attr("height", splom_height)
    .style("position", "sticky")
    .style("left", `0px`)
    .style("z-index", 1)
    .call(draw_side_sliders, splom, model);

  // bottom sliders
  root_div
    .append("svg")
    .attr("class", "bottom-slider")
    .attr("width", splom_width + side_bar_width)
    .attr("height", bottom_bar_height)
    .style("position", "sticky")
    .style("left", `0px`)
    .style("bottom", `0px`)
    .style("z-index", 2)
    .append("g")
    .attr("transform", `translate(${side_bar_width}, 0)`)
    .call(draw_bottom_sliders, splom, model, subplot_width);

  // surrogate curves from Python-side model
  model.on("change:curves", function () {
    const new_curves = model.get("curves");
    for (let i = 0; i < row_attrs.length; i++) {
      for (let j = 0; j < col_attrs.length; j++) {
        const line_data = new_curves[col_attrs[j]][row_attrs[i]];
        const sx = splom.subplots[i][j].scales.sx;
        const sy = splom.subplots[i][j].scales.sy;
        splom.subplots[i][j].overlay.call(lines, [line_data], {
          x: (d) => d[0],
          y: (d) => d[1],
          scales: { sx, sy },
          stroke_width: 4,
          stroke: () => C[1],
          is_framed: false,
        });
      }
    }
  });

  // toggle surrogate lines with "s"
  d3.select("body").on("keydown", function (event) {
    if (event.key === "s") {
      const show = !model.get("surrogate");
      model.set("surrogate", show);
      for (let i = 0; i < row_attrs.length; i++) {
        for (let j = 0; j < col_attrs.length; j++) {
          splom.subplots[i][j].overlay
            .selectAll(".line")
            .attr("display", show ? "" : "none");
        }
      }
    }
  });

  el.appendChild(root_div.node());
}

/* ---------- bottom sliders ---------- */
function draw_bottom_sliders(svg, splom, model, subplot_width) {
  const splom_subplots = splom.subplots;
  const n_cols = splom_subplots[0].length;

  const control_size = 12;
  const y_offset = 30;

  // scales per column (use a SCATTER in that column)
  const x_offsets = cumulative_sum([
    0,
    ...d3
      .range(n_cols)
      .map((j) => scatterInColFrom(splom, j)?.plot_width ?? subplot_width),
  ]);
  const sxs = d3
    .range(n_cols)
    .map(
      (j) =>
        scatterInColFrom(splom, j)?.scales.sx ??
        d3.scaleLinear().domain([0, 1]).range([0, subplot_width])
    );
  // const sxs = d3
  //   .range(n_cols)
  //   .map((j) => scatterInColFrom(splom, j)?.scales.sx);

  const g_sliders = svg
    .selectAll("g.bottom-slider")
    .data(d3.range(n_cols))
    .join("g")
    .attr("class", "bottom-slider")
    .attr("transform", (i) => `translate(${x_offsets[i]}, 0)`);

  const fmt = d3.format(".3~g");

  const label_min = g_sliders
    .append("text")
    .attr("class", "bottom-range-min")
    .attr("y", y_offset - 20)
    .attr("text-anchor", "middle")
    .style("font", "10px sans-serif")
    .style("pointer-events", "none");

  const label_max = g_sliders
    .append("text")
    .attr("class", "bottom-range-max")
    .attr("y", y_offset - 20)
    .attr("text-anchor", "middle")
    .style("font", "10px sans-serif")
    .style("pointer-events", "none");

  const sliders_bg = g_sliders
    .append("line")
    .attr("class", "slider-bg")
    .attr("stroke", "#aaa")
    .attr("stroke-width", control_size * 0.6)
    .attr("x1", (i) => sxs[i].range()[0])
    .attr("x2", (i) => sxs[i].range()[1])
    .attr("y1", y_offset)
    .attr("y2", y_offset);

  const sliders_fg = g_sliders
    .append("line")
    .attr("class", "bottom-slider-fg")
    .attr("stroke", C[0])
    .attr("stroke-width", control_size * 0.6)
    .attr("x1", (i) => sxs[i].range()[0])
    .attr("x2", (i) => sxs[i].range()[1])
    .attr("y1", y_offset)
    .attr("y2", y_offset);

  const slider_axes = g_sliders
    .append("g")
    .attr("class", "slider-axis")
    .attr("transform", `translate(0,${y_offset + control_size / 2})`)
    .style("z-index", 2)
    .each(function (j) {
      const ticks = scatterInColFrom(splom, j)?.frame?.xticks ?? 4;
      const ax = d3
        .axisBottom(sxs[j])
        .ticks(ticks)
        .tickSizeInner(-control_size);
      const axis = d3.select(this).call(ax);
      axis.selectAll("path.domain").remove();
      axis.selectAll("g.tick line").attr("stroke", "#eee");
    });

  g_sliders
    .append("text")
    .attr("x", (j) => d3.mean(sxs[j].range()))
    .attr("y", y_offset - 12)
    .style("text-anchor", "middle")
    .text((j) => splom.col_attrs[j]);

  const control_min = g_sliders
    .append("circle")
    .attr("class", "slider-control-min")
    .attr("cx", (i) => sxs[i].range()[0])
    .attr("cy", y_offset)
    .call(style_control, control_size);

  const control_max = g_sliders
    .append("circle")
    .attr("class", "slider-control-max")
    .attr("cx", (i) => sxs[i].range()[1])
    .attr("cy", y_offset)
    .call(style_control, control_size);

  // function set_x_filter_bounds(j, lower, upper, sx, splom) {
  //   d3.select(control_min.nodes()[j]).attr("cx", sx(lower));
  //   d3.select(control_max.nodes()[j]).attr("cx", sx(upper));
  //   d3.select(sliders_fg.nodes()[j])
  //     .attr("x1", sx(lower))
  //     .attr("x2", sx(upper));
  //   d3.select(label_min.nodes()[j]).attr("x", sx(lower)).text(fmt(lower));
  //   d3.select(label_max.nodes()[j]).attr("x", sx(upper)).text(fmt(upper));

  //   // update SPLOM filters & highlight
  //   // 1) apply filter
  //   dim.filter([lower, upper]);

  //   // 1a) recompute brushed mask explicitly
  //   const filtered = splom.cross.allFiltered?.() ?? splom.cross.all();
  //   const filteredSet = new Set(filtered);
  //   splom.data.forEach((d) => {
  //     d.brushed = filteredSet.has(d);
  //   });

  //   // 2) highlight + repaint
  //   splom.highlight_brushed_2(
  //     splom.data,
  //     splom.subplots[0][0].scales.sc,
  //     splom.cross,
  //     splom.subplots,
  //     splom.row_attrs,
  //     splom.col_attrs
  //   );
  //   for (const row of splom.subplots) {
  //     for (const sp of row) {
  //       if (sp?.repaint) sp.repaint();
  //       else if (sp?.draw) sp.draw();
  //       else if (sp?.update) sp.update();
  //     }
  //   }
  //   // const dim = splom.dimensions[splom.col_attrs[j]];
  //   // dim.filter([lower, upper]);
  //   // splom.highlight_brushed_2(
  //   //   splom.data,
  //   //   splom.subplots[0][0].scales.sc,
  //   //   splom.cross,
  //   //   splom.subplots,
  //   //   splom.row_attrs,
  //   //   splom.col_attrs
  //   // );
  //   // push selection to "model"
  //   model.set(
  //     "selected",
  //     splom.data.map((d) => d.brushed)
  //   );
  //   model.set(
  //     "dists",
  //     splom.data.map((d) => d.dist)
  //   );
  //   model.save_changes();
  // }
  // --- bottom (X) slider: update bounds + grey-out + repaint ---
  function set_x_filter_bounds(j, lower, upper, sx, splom) {
    // 0) safety guards
    if (!splom || !splom.dimensions || !splom.col_attrs) return;
    const colKey = splom.col_attrs[j];
    const dim = splom.dimensions[colKey];
    if (!dim) return; // dimension not found (shouldn't happen)

    // 1) update slider UI
    d3.select(control_min.nodes()[j]).attr("cx", sx(lower));
    d3.select(control_max.nodes()[j]).attr("cx", sx(upper));
    d3.select(sliders_fg.nodes()[j])
      .attr("x1", sx(lower))
      .attr("x2", sx(upper));
    d3.select(label_min.nodes()[j]).attr("x", sx(lower)).text(fmt(lower));
    d3.select(label_max.nodes()[j]).attr("x", sx(upper)).text(fmt(upper));

    // 2) apply filter in crossfilter
    dim.filter([lower, upper]);

    // 3) recompute brushed mask explicitly
    const filtered = splom.cross.allFiltered?.() ?? splom.cross.all();
    const filteredSet = new Set(filtered);
    splom.data.forEach((d) => {
      d.brushed = filteredSet.has(d);
    });

    // 4) recolor/highlight + repaint
    splom.highlight_brushed_2(
      splom.data,
      splom.subplots[0][0].scales.sc,
      splom.cross,
      splom.subplots,
      splom.row_attrs,
      splom.col_attrs
    );
    for (const row of splom.subplots) {
      for (const sp of row) {
        if (!sp) continue;
        if (sp.repaint) sp.repaint();
        else if (sp.draw) sp.draw();
        else if (sp.update) sp.update();
      }
    }

    // 5) push selection to the widget model
    model.set(
      "selected",
      splom.data.map((d) => d.brushed)
    );
    model.set(
      "dists",
      splom.data.map((d) => d.dist)
    );
    model.save_changes();
  }

  control_min.call(
    d3.drag().on("drag", function (event) {
      const j = d3.select(this).datum();
      const sx = sxs[j];
      const domain = sx.domain();
      const x = sx.invert(event.x);
      const x_upper = sx.invert(+d3.select(control_max.nodes()[j]).attr("cx"));
      const x_lower = clip(
        x,
        domain[0],
        x_upper - (domain[1] - domain[0]) * 0.05
      );
      set_x_filter_bounds(j, x_lower, x_upper, sx, splom);
    })
  );

  control_max.call(
    d3.drag().on("drag", function (event) {
      const j = d3.select(this).datum();
      const sx = sxs[j];
      const domain = sx.domain();
      const x = sx.invert(event.x);
      const x_lower = sx.invert(+d3.select(control_min.nodes()[j]).attr("cx"));
      const x_upper = clip(
        x,
        x_lower + (domain[1] - domain[0]) * 0.05,
        domain[1]
      );
      set_x_filter_bounds(j, x_lower, x_upper, sx, splom);
    })
  );

  // click/dblclick to snap/reset
  let timeout = null;
  function snap_x_bounds(node, x, x1, x2) {
    const j = d3.select(node).datum();
    const sx = sxs[j];
    const pickMin = Math.abs(x - x1) < Math.abs(x - x2);
    set_x_filter_bounds(j, pickMin ? x : x1, pickMin ? x2 : x, sx, splom);
  }
  function reset_x_bounds(node) {
    const j = d3.select(node).datum();
    const sx = sxs[j];
    set_x_filter_bounds(j, sx.domain()[0], sx.domain()[1], sx, splom);
  }

  sliders_fg.on("click", function (event) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const me = d3.select(this);
      const j = me.datum();
      const sx = sxs[j];
      const x1 = sx.invert(+me.attr("x1"));
      const x2 = sx.invert(+me.attr("x2"));
      const x = sx.invert(event.layerX);
      snap_x_bounds(this, x, x1, x2);
    }, 300);
  });
  sliders_bg.on("click", function (event) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const j = d3.select(this).datum();
      const sx = sxs[j];
      const fg = d3.select(sliders_fg.nodes()[j]);
      const x1 = sx.invert(+fg.attr("x1"));
      const x2 = sx.invert(+fg.attr("x2"));
      const x = sx.invert(event.layerX);
      snap_x_bounds(this, x, x1, x2);
    }, 300);
  });
  sliders_fg.on("dblclick", function () {
    clearTimeout(timeout);
    reset_x_bounds(this);
  });
  sliders_bg.on("dblclick", function () {
    clearTimeout(timeout);
    reset_x_bounds(this);
  });

  sliders_fg.call(
    d3.drag().on("drag", function (event) {
      const j = d3.select(this).datum();
      const sx = sxs[j];
      let dx = sx.invert(event.dx) - sx.invert(0);
      const me = d3.select(this);
      const x1 = sx.invert(+me.attr("x1"));
      const x2 = sx.invert(+me.attr("x2"));
      const domain = sx.domain();
      dx = clip(dx, domain[0] - x1, domain[1] - x2);
      set_x_filter_bounds(j, x1 + dx, x2 + dx, sx, splom);
    })
  );
}

/* ---------- side sliders ---------- */
function draw_side_sliders(svg, splom, model) {
  const splom_subplots = splom.subplots;
  const n_rows = splom_subplots.length;

  const control_size = 12;
  const x_offset = 60;

  // Each row's y-scale; prefer a SCATTER cell, fall back to first cell
  // const sys = splom_subplots.map((row, i) => {
  //   return scatterInRowFrom(splom, i)?.scales.sy || row[0].scales.sy;
  // });
  const sys = splom.subplots.map(
    (row, i) => scatterInRowFrom(splom, i)?.scales.sy ?? row[0].scales.sy
  );

  const y_offsets = cumulative_sum(
    splom_subplots.map((row) => row[0].plot_height)
  );
  const total_height = y_offsets[y_offsets.length - 1];

  const g_sliders = svg
    .selectAll("g.side_slider")
    .data(d3.range(n_rows))
    .join("g")
    .attr("class", "side-slider")
    .attr("transform", (i) => `translate(0, ${total_height - y_offsets[i]})`);

  const fmt = d3.format(".3~g");

  const label_min = g_sliders
    .append("text")
    .attr("class", "side-range-min")
    .attr("x", x_offset - 60)
    .attr("text-anchor", "start")
    .style("font", "10px sans-serif")
    .style("pointer-events", "none")
    .style("paint-order", "stroke")
    .style("stroke", "white")
    .style("stroke-width", 2)
    .style("stroke-linejoin", "round");

  const label_max = g_sliders
    .append("text")
    .attr("class", "side-range-max")
    .attr("x", x_offset - 60)
    .attr("text-anchor", "start")
    .style("font", "10px sans-serif")
    .style("pointer-events", "none")
    .style("paint-order", "stroke")
    .style("stroke", "white")
    .style("stroke-width", 2)
    .style("stroke-linejoin", "round");

  const sliders_bg = g_sliders
    .append("line")
    .attr("class", "slider-bg")
    .attr("stroke", "#aaa")
    .attr("stroke-width", control_size * 0.6)
    .attr("y1", (i) => sys[i](sys[i].domain()[0]))
    .attr("y2", (i) => sys[i](sys[i].domain()[1]))
    .attr("x1", x_offset)
    .attr("x2", x_offset);

  const sliders_fg = g_sliders
    .append("line")
    .attr("class", "side-slider-fg")
    .attr("stroke", C[0])
    .attr("stroke-width", control_size * 0.6)
    .attr("y1", (i) => sys[i](sys[i].domain()[0]))
    .attr("y2", (i) => sys[i](sys[i].domain()[1]))
    .attr("x1", x_offset)
    .attr("x2", x_offset);

  const control_min = g_sliders
    .append("circle")
    .attr("class", "slider-control-min")
    .attr("cx", x_offset)
    .attr("cy", (i) => sys[i](sys[i].domain()[0]))
    .call(style_control, control_size);

  const control_max = g_sliders
    .append("circle")
    .attr("class", "slider-control-max")
    .attr("cx", x_offset)
    .attr("cy", (i) => sys[i](sys[i].domain()[1]))
    .call(style_control, control_size);

  const slider_axes = g_sliders
    .append("g")
    .attr("class", "slider-axis")
    .attr("transform", `translate(${x_offset - control_size / 2}, 0)`)
    .style("z-index", 2)
    .each(function (i) {
      const ticks = scatterInRowFrom(splom, i)?.frame?.yticks ?? 4;
      const ay = d3.axisLeft(sys[i]).ticks(ticks).tickSizeInner(-control_size);
      const axis = d3.select(this).call(ay);
      axis.selectAll("path.domain").remove();
      axis.selectAll("g.tick line").attr("stroke", "#eee");
    });

  g_sliders
    .append("text")
    .attr("y", (i) => d3.mean(sys[i].range()))
    .attr("x", x_offset + 20)
    .attr(
      "transform",
      (i) => `rotate(-90 ${x_offset + 20} ${d3.mean(sys[i].range())})`
    )
    .style("text-anchor", "middle")
    .text((i) => splom.row_attrs[i]);

  // --- side (Y) slider: update bounds + grey-out + repaint ---
  function set_y_filter_bounds(i, lower, upper, sy, splom) {
    // 0) safety guards
    if (!splom || !splom.dimensions || !splom.row_attrs) return;
    const rowKey = splom.row_attrs[i];
    const dim = splom.dimensions[rowKey];
    if (!dim) return;

    // 1) update slider UI
    d3.select(control_min.nodes()[i]).attr("cy", sy(lower));
    d3.select(control_max.nodes()[i]).attr("cy", sy(upper));
    d3.select(sliders_fg.nodes()[i])
      .attr("y1", sy(lower))
      .attr("y2", sy(upper));
    d3.select(label_min.nodes()[i])
      .attr("y", sy(lower) + 3)
      .text(fmt(lower));
    d3.select(label_max.nodes()[i])
      .attr("y", sy(upper) + 3)
      .text(fmt(upper));

    // 2) apply filter in crossfilter
    dim.filter([lower, upper]);

    // 3) recompute brushed mask explicitly
    const filtered = splom.cross.allFiltered?.() ?? splom.cross.all();
    const filteredSet = new Set(filtered);
    splom.data.forEach((d) => {
      d.brushed = filteredSet.has(d);
    });

    // 4) recolor/highlight + repaint
    splom.highlight_brushed_2(
      splom.data,
      splom.subplots[0][0].scales.sc,
      splom.cross,
      splom.subplots,
      splom.row_attrs,
      splom.col_attrs
    );
    for (const row of splom.subplots) {
      for (const sp of row) {
        if (!sp) continue;
        if (sp.repaint) sp.repaint();
        else if (sp.draw) sp.draw();
        else if (sp.update) sp.update();
      }
    }

    // 5) push selection to the widget model
    model.set(
      "selected",
      splom.data.map((d) => d.brushed)
    );
    model.set(
      "dists",
      splom.data.map((d) => d.dist)
    );
    model.save_changes();
  }

  control_min.call(
    d3.drag().on("drag", function (event) {
      const i = d3.select(this).datum();
      const sy = sys[i];
      const domain = sy.domain();
      const y = sy.invert(event.y);
      const y_upper = sy.invert(+d3.select(control_max.nodes()[i]).attr("cy"));
      const y_lower = clip(
        y,
        domain[0],
        y_upper - (domain[1] - domain[0]) * 0.05
      );
      set_y_filter_bounds(i, y_lower, y_upper, sy, splom);
    })
  );

  control_max.call(
    d3.drag().on("drag", function (event) {
      const i = d3.select(this).datum();
      const sy = sys[i];
      const domain = sy.domain();
      const y = sy.invert(event.y);
      const y_lower = sy.invert(+d3.select(control_min.nodes()[i]).attr("cy"));
      const y_upper = clip(
        y,
        y_lower + (domain[1] - domain[0]) * 0.05,
        domain[1]
      );
      set_y_filter_bounds(i, y_lower, y_upper, sy, splom);
    })
  );

  // click/dblclick to snap/reset
  let timeout = null;
  function snap_y_bounds(node, y, y1, y2) {
    const i = d3.select(node).datum();
    const sy = sys[i];
    const pickMin = Math.abs(y - y1) < Math.abs(y - y2);
    set_y_filter_bounds(i, pickMin ? y : y1, pickMin ? y2 : y, sy, splom);
  }
  function reset_y_bounds(node) {
    const i = d3.select(node).datum();
    const sy = sys[i];
    set_y_filter_bounds(i, sy.domain()[0], sy.domain()[1], sy, splom);
  }

  sliders_fg.on("click", function (event) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const me = d3.select(this);
      const i = me.datum();
      const sy = sys[i];
      const y1 = sy.invert(+me.attr("y1"));
      const y2 = sy.invert(+me.attr("y2"));
      const y = sy.invert(event.layerY);
      snap_y_bounds(this, y, y1, y2);
    }, 300);
  });
  sliders_bg.on("click", function (event) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const i = d3.select(this).datum();
      const sy = sys[i];
      const fg = d3.select(sliders_fg.nodes()[i]);
      const y1 = sy.invert(+fg.attr("y1"));
      const y2 = sy.invert(+fg.attr("y2"));
      const y = sy.invert(event.layerY);
      snap_y_bounds(this, y, y1, y2);
    }, 300);
  });
  sliders_fg.on("dblclick", function () {
    clearTimeout(timeout);
    reset_y_bounds(this);
  });
  sliders_bg.on("dblclick", function () {
    clearTimeout(timeout);
    reset_y_bounds(this);
  });

  sliders_fg.call(
    d3.drag().on("drag", function (event) {
      const i = d3.select(this).datum();
      const sy = sys[i];
      let dy = sy.invert(event.dy) - sy.invert(0);
      const me = d3.select(this);
      const y1 = sy.invert(+me.attr("y1"));
      const y2 = sy.invert(+me.attr("y2"));
      const domain = sy.domain();
      dy = clip(dy, domain[0] - y1, domain[1] - y2);
      set_y_filter_bounds(i, y1 + dy, y2 + dy, sy, splom);
    })
  );
}

export default { render };
