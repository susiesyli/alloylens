import * as d3 from "d3";
import { splom_gl2, C, cumulative_sum, clip, lines } from "./vis.js";

/* ----------------------- small helpers ----------------------- */

function style_control(sel, control_size) {
  sel
    .attr("fill", C[0])
    .attr("stroke", "white")
    .attr("stroke-width", control_size / 10)
    .attr("r", control_size / 2);
}

/** coerce to numbers & drop rows with non-finite values in any selected attr */
function sanitizeRows(payload, rowAttrs, colAttrs) {
  const need = new Set([...(rowAttrs || []), ...(colAttrs || [])]);
  const records = (payload && payload.records) || [];
  if (need.size === 0) return records;
  const out = [];
  for (const r of records) {
    let ok = true;
    const clone = { ...r };
    for (const k of need) {
      const v = +clone[k];
      if (!Number.isFinite(v)) {
        ok = false;
        break;
      }
      clone[k] = v;
    }
    if (ok) out.push(clone);
  }
  return out;
}

/* ----------------------- main render ------------------------- */

function render({ model, el }) {
  // --- read traits
  const payload = model.get("data") || {};
  const col_attrs = model.get("col_attrs") || [];
  const row_attrs = model.get("row_attrs") || [];

  const subplot_width = model.get("subplot_width") ?? 200;
  const subplot_height = model.get("subplot_height") ?? 200;

  // --- mount cleanly
  el.innerHTML = "";

  if (!payload.records || row_attrs.length === 0 || col_attrs.length === 0) {
    const msg = document.createElement("div");
    msg.style.cssText = "font:12px system-ui;color:#666";
    msg.textContent = "alloylens: waiting for data, row_attrs and col_attrs…";
    el.appendChild(msg);
    return;
  }

  // --- data (coerce numbers & drop NaNs/inf)
  const data = sanitizeRows(payload, row_attrs, col_attrs);

  // --- UI dimensions (same spirit as old code)
  const side_bar_width = 90;
  const bottom_bar_height = 90;

  const splom_width = col_attrs.length * subplot_width;
  const splom_height = row_attrs.length * subplot_height;

  const ui_width =
    model.get("width") ||
    Math.min(
      splom_width + side_bar_width,
      el.getBoundingClientRect().width || splom_width + side_bar_width
    );
  const ui_height =
    model.get("height") ||
    Math.min(
      splom_height + bottom_bar_height,
      Math.max(240, Math.floor(ui_width * 0.618))
    );

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

  // container for the SPLOM itself
  const splom_container = root_div
    .append("div")
    .attr("class", "splom-container")
    .style("position", "absolute")
    .style("top", `0px`)
    .style("left", `${side_bar_width}px`);

  // draw SPLOM (match old behavior)
  const splom = splom_gl2(splom_container, data, {
    layout: "both", // full matrix (upper + lower)
    histogram: true, // keep diagonal density look if your vis.js uses it
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

    s: () => 4,
    col_attrs,
    row_attrs,

    brush: true,
    xticks: 3,
    yticks: 3,

    show_tick_texts: false,
    show_axis_label: false,
  });

  d3.select(splom_container.node())
    .selectAll(".overlay .brush")
    .style("display", "none")
    .style("pointer-events", "none");

  // --- sticky side sliders (Y) & bottom sliders (X)
  const side_sliders = root_div
    .append("svg")
    .attr("class", "side-slider")
    .attr("width", side_bar_width)
    .attr("height", splom_height)
    .style("position", "sticky")
    .style("left", `0px`)
    .style("z-index", 1)
    .call(draw_side_sliders, splom, model);

  const bottom_sliders = root_div
    .append("svg")
    .attr("class", "bottom-slider")
    .attr("width", splom_width + side_bar_width)
    .attr("height", bottom_bar_height)
    .style("position", "sticky")
    .style("left", `0px`)
    .style("bottom", `0px`)
    .style("z-index", 2)
    .append("g")
    .attr("transform", `translate(${side_bar_width},0)`)
    .call(draw_bottom_sliders, splom, model);

  // --- optional: overlay surrogate curves when model.curves changes
  model.on("change:curves", function () {
    const new_curves = model.get("curves") || {};
    for (let i = 0; i < row_attrs.length; i++) {
      for (let j = 0; j < col_attrs.length; j++) {
        const line_data =
          new_curves[col_attrs[j]] && new_curves[col_attrs[j]][row_attrs[i]];
        if (!line_data) continue;
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

  // toggle surrogate overlays with "s"
  d3.select(document.body).on("keydown.alloylens", function (event) {
    if (event.key !== "s") return;
    const newFlag = !model.get("surrogate");
    model.set("surrogate", newFlag);
    model.save_changes();
    for (let i = 0; i < row_attrs.length; i++) {
      for (let j = 0; j < col_attrs.length; j++) {
        splom.subplots[i][j].overlay
          .selectAll(".line")
          .attr("display", newFlag ? "" : "none");
      }
    }
  });

  el.appendChild(root_div.node());
}

/* ----------------------- sliders (bottom) -------------------- */

function draw_bottom_sliders(svg, splom, model) {
  const subplots = splom.subplots;
  const n_cols = subplots[0].length;

  const control_size = 12;
  const y_offset = 30;

  const x_offsets = cumulative_sum([
    0,
    ...subplots[0].map((sp) => sp.plot_width),
  ]);
  const sxs = subplots[0].map((sp) => sp.scales.sx);
  const fmt = d3.format(".3~g");

  const g = svg
    .selectAll("g.bottom-slider")
    .data(d3.range(n_cols))
    .join("g")
    .attr("class", "bottom-slider")
    .attr("transform", (j) => `translate(${x_offsets[j]},0)`);

  const label_min = g
    .append("text")
    .attr("class", "bottom-range-min")
    .attr("y", y_offset - 20)
    .attr("text-anchor", "middle")
    .style("font", "10px sans-serif")
    .style("pointer-events", "none");

  const label_max = g
    .append("text")
    .attr("class", "bottom-range-max")
    .attr("y", y_offset - 20)
    .attr("text-anchor", "middle")
    .style("font", "10px sans-serif")
    .style("pointer-events", "none");

  const sliders_bg = g
    .append("line")
    .attr("class", "slider-bg")
    .attr("stroke", "#aaa")
    .attr("stroke-width", control_size * 0.6)
    .attr("x1", (j) => sxs[j].range()[0])
    .attr("x2", (j) => sxs[j].range()[1])
    .attr("y1", y_offset)
    .attr("y2", y_offset);

  const sliders_fg = g
    .append("line")
    .attr("class", "bottom-slider-fg")
    .attr("stroke", C[0])
    .attr("stroke-width", control_size * 0.6)
    .attr("x1", (j) => sxs[j].range()[0])
    .attr("x2", (j) => sxs[j].range()[1])
    .attr("y1", y_offset)
    .attr("y2", y_offset);

  g.append("g")
    .attr("class", "slider-axis")
    .attr("transform", `translate(0,${y_offset + control_size / 2})`)
    .style("z-index", 2)
    .each(function (j) {
      const ticks = subplots[0][j].frame.xticks;
      const ax = d3
        .axisBottom(sxs[j])
        .ticks(ticks)
        .tickSizeInner(-control_size);
      const axis = d3.select(this).call(ax);
      axis.selectAll("path.domain").remove();
      axis.selectAll("g.tick line").attr("stroke", "#eee");
    });

  g.append("text")
    .attr("x", (j) => d3.mean(sxs[j].range()))
    .attr("y", y_offset - 12)
    .style("text-anchor", "middle")
    .text((j) => splom.col_attrs[j]);

  const ctl_min = g
    .append("circle")
    .attr("class", "slider-control-min")
    .attr("cx", (j) => sxs[j].range()[0])
    .attr("cy", y_offset)
    .call(style_control, control_size);

  const ctl_max = g
    .append("circle")
    .attr("class", "slider-control-max")
    .attr("cx", (j) => sxs[j].range()[1])
    .attr("cy", y_offset)
    .call(style_control, control_size);

  function set_x_filter_bounds(j, lower, upper, sx) {
    d3.select(ctl_min.nodes()[j]).attr("cx", sx(lower));
    d3.select(ctl_max.nodes()[j]).attr("cx", sx(upper));
    d3.select(sliders_fg.nodes()[j])
      .attr("x1", sx(lower))
      .attr("x2", sx(upper));
    label_min
      .attr("x", (jj, i) => (i === j ? sx(lower) : null))
      .text((jj, i) => (i === j ? fmt(lower) : null));
    label_max
      .attr("x", (jj, i) => (i === j ? sx(upper) : null))
      .text((jj, i) => (i === j ? fmt(upper) : null));

    const dim = splom.dimensions[splom.col_attrs[j]];
    dim.filter([lower, upper]);
    splom.highlight_brushed_2(
      splom.data,
      subplots[0][0].scales.sc,
      splom.cross,
      splom.subplots,
      splom.row_attrs,
      splom.col_attrs
    );
    // update widget outputs
    model.set(
      "selected",
      splom.data.map((d) => d.brushed)
    );
    model.set(
      "dists",
      splom.data.map((d) => d.dist)
    );
    const ids = splom.data
      .map((d, i) => (d.brushed ? i : -1))
      .filter((i) => i >= 0);
    model.set("selected_indices", ids);
    model.save_changes();
  }

  ctl_min.call(
    d3.drag().on("drag", function (event) {
      const j = d3.select(this).datum();
      const sx = sxs[j];
      const domain = sx.domain();
      const x = sx.invert(event.x);
      const x_upper = sx.invert(+d3.select(ctl_max.nodes()[j]).attr("cx"));
      const x_lower = clip(
        x,
        domain[0],
        x_upper - (domain[1] - domain[0]) * 0.05
      );
      set_x_filter_bounds(j, x_lower, x_upper, sx);
    })
  );

  ctl_max.call(
    d3.drag().on("drag", function (event) {
      const j = d3.select(this).datum();
      const sx = sxs[j];
      const domain = sx.domain();
      const x = sx.invert(event.x);
      const x_lower = sx.invert(+d3.select(ctl_min.nodes()[j]).attr("cx"));
      const x_upper = clip(
        x,
        x_lower + (domain[1] - domain[0]) * 0.05,
        domain[1]
      );
      set_x_filter_bounds(j, x_lower, x_upper, sx);
    })
  );

  // click / dblclick on slider bars
  let timeout = null;

  sliders_fg.on("click", function (event) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const me = d3.select(this);
      const j = me.datum();
      const sx = sxs[j];
      const x1 = sx.invert(+me.attr("x1"));
      const x2 = sx.invert(+me.attr("x2"));
      const x = sx.invert(event.layerX);
      const new_x1 = Math.abs(x - x1) < Math.abs(x - x2) ? x : x1;
      const new_x2 = Math.abs(x - x1) < Math.abs(x - x2) ? x2 : x;
      set_x_filter_bounds(j, new_x1, new_x2, sx);
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
      const new_x1 = Math.abs(x - x1) < Math.abs(x - x2) ? x : x1;
      const new_x2 = Math.abs(x - x1) < Math.abs(x - x2) ? x2 : x;
      set_x_filter_bounds(j, new_x1, new_x2, sx);
    }, 300);
  });

  function reset_x_bounds(node) {
    const j = d3.select(node).datum();
    const sx = sxs[j];
    set_x_filter_bounds(j, sx.domain()[0], sx.domain()[1], sx);
  }

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
      const dx = sx.invert(event.dx) - sx.invert(0);
      const me = d3.select(this);
      const x1 = sx.invert(+me.attr("x1"));
      const x2 = sx.invert(+me.attr("x2"));
      const domain = sx.domain();
      const dxBound = clip(dx, domain[0] - x1, domain[1] - x2);
      set_x_filter_bounds(j, x1 + dxBound, x2 + dxBound, sx);
    })
  );
}

/* ----------------------- sliders (side) ---------------------- */

function draw_side_sliders(svg, splom, model) {
  const subplots = splom.subplots;
  const n_rows = subplots.length;

  const control_size = 12;
  const x_offset = 60;

  const y_offsets = cumulative_sum(subplots.map((row) => row[0].plot_height));
  const total_height = y_offsets[y_offsets.length - 1];
  const sys = subplots.map((row) => row[0].scales.sy);
  const fmt = d3.format(".3~g");

  const g = svg
    .selectAll("g.side-slider")
    .data(d3.range(n_rows))
    .join("g")
    .attr("class", "side-slider")
    .attr("transform", (i) => `translate(0, ${total_height - y_offsets[i]})`);

  const label_min = g
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

  const label_max = g
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

  const sliders_bg = g
    .append("line")
    .attr("class", "slider-bg")
    .attr("stroke", "#aaa")
    .attr("stroke-width", control_size * 0.6)
    .attr("y1", (i) => sys[i](sys[i].domain()[0]))
    .attr("y2", (i) => sys[i](sys[i].domain()[1]))
    .attr("x1", x_offset)
    .attr("x2", x_offset);

  const sliders_fg = g
    .append("line")
    .attr("class", "side-slider-fg")
    .attr("stroke", C[0])
    .attr("stroke-width", control_size * 0.6)
    .attr("y1", (i) => sys[i](sys[i].domain()[0]))
    .attr("y2", (i) => sys[i](sys[i].domain()[1]))
    .attr("x1", x_offset)
    .attr("x2", x_offset);

  const ctl_min = g
    .append("circle")
    .attr("class", "slider-control-min")
    .attr("cx", x_offset)
    .attr("cy", (i) => sys[i](sys[i].domain()[0]))
    .call(style_control, control_size);

  const ctl_max = g
    .append("circle")
    .attr("class", "slider-control-max")
    .attr("cx", x_offset)
    .attr("cy", (i) => sys[i](sys[i].domain()[1]))
    .call(style_control, control_size);

  g.append("g")
    .attr("class", "slider-axis")
    .attr("transform", `translate(${x_offset - control_size / 2}, 0)`)
    .style("z-index", 2)
    .each(function (i) {
      const ticks = subplots[i][0].frame.yticks;
      const ay = d3
        .axisLeft(sys[i])
        .ticks(ticks)
        .tickFormat(d3.format(".3s"))
        .tickSizeInner(-control_size);
      const axis = d3.select(this).call(ay);
      axis.selectAll("path.domain").remove();
      axis.selectAll("g.tick line").attr("stroke", "#eee");
    });

  g.append("text")
    .attr("y", (i) => d3.mean(sys[i].range()))
    .attr("x", x_offset + 20)
    .attr(
      "transform",
      (i) => `rotate(-90 ${x_offset + 20} ${d3.mean(sys[i].range())})`
    )
    .style("text-anchor", "middle")
    .text((i) => splom.row_attrs[i]);

  function set_y_filter_bounds(i, lower, upper, sy) {
    d3.select(ctl_min.nodes()[i]).attr("cy", sy(lower));
    d3.select(ctl_max.nodes()[i]).attr("cy", sy(upper));
    d3.select(sliders_fg.nodes()[i])
      .attr("y1", sy(lower))
      .attr("y2", sy(upper));
    label_min
      .attr("y", (ii, idx) => (idx === i ? sy(lower) + 3 : null))
      .text((ii, idx) => (idx === i ? fmt(lower) : null));
    label_max
      .attr("y", (ii, idx) => (idx === i ? sy(upper) + 3 : null))
      .text((ii, idx) => (idx === i ? fmt(upper) : null));

    const dim = splom.dimensions[splom.row_attrs[i]];
    dim.filter([lower, upper]);
    splom.highlight_brushed_2(
      splom.data,
      subplots[0][0].scales.sc,
      splom.cross,
      splom.subplots,
      splom.row_attrs,
      splom.col_attrs
    );
    model.set(
      "selected",
      splom.data.map((d) => d.brushed)
    );
    model.set(
      "dists",
      splom.data.map((d) => d.dist)
    );
    const ids = splom.data
      .map((d, i) => (d.brushed ? i : -1))
      .filter((i) => i >= 0);
    model.set("selected_indices", ids);
    model.save_changes();
  }

  ctl_min.call(
    d3.drag().on("drag", function (event) {
      const i = d3.select(this).datum();
      const sy = sys[i];
      const domain = sy.domain();
      const y = sy.invert(event.y);
      const y_upper = sy.invert(+d3.select(ctl_max.nodes()[i]).attr("cy"));
      const y_lower = clip(
        y,
        domain[0],
        y_upper - (domain[1] - domain[0]) * 0.05
      );
      set_y_filter_bounds(i, y_lower, y_upper, sy);
    })
  );

  ctl_max.call(
    d3.drag().on("drag", function (event) {
      const i = d3.select(this).datum();
      const sy = sys[i];
      const domain = sy.domain();
      const y = sy.invert(event.y);
      const y_lower = sy.invert(+d3.select(ctl_min.nodes()[i]).attr("cy"));
      const y_upper = clip(
        y,
        y_lower + (domain[1] - domain[0]) * 0.05,
        domain[1]
      );
      set_y_filter_bounds(i, y_lower, y_upper, sy);
    })
  );

  let timeout = null;

  sliders_fg.on("click", function (event) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const me = d3.select(this);
      const i = me.datum();
      const sy = sys[i];
      const y1 = sy.invert(+me.attr("y1"));
      const y2 = sy.invert(+me.attr("y2"));
      const y = sy.invert(event.layerY);
      const new_y1 = Math.abs(y - y1) < Math.abs(y - y2) ? y : y1;
      const new_y2 = Math.abs(y - y1) < Math.abs(y - y2) ? y2 : y;
      set_y_filter_bounds(i, new_y1, new_y2, sy);
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
      const new_y1 = Math.abs(y - y1) < Math.abs(y - y2) ? y : y1;
      const new_y2 = Math.abs(y - y1) < Math.abs(y - y2) ? y2 : y;
      set_y_filter_bounds(i, new_y1, new_y2, sy);
    }, 300);
  });

  function reset_y_bounds(node) {
    const i = d3.select(node).datum();
    const sy = sys[i];
    set_y_filter_bounds(i, sy.domain()[0], sy.domain()[1], sy);
  }

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
      const dy = sy.invert(event.dy) - sy.invert(0);
      const me = d3.select(this);
      const y1 = sy.invert(+me.attr("y1"));
      const y2 = sy.invert(+me.attr("y2"));
      const domain = sy.domain();
      const dyBound = clip(dy, domain[0] - y1, domain[1] - y2);
      set_y_filter_bounds(i, y1 + dyBound, y2 + dyBound, sy);
    })
  );
}

/* ----------------------- export for AnyWidget ---------------- */
export default { render };
