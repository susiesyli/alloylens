// partial copy of https://observablehq.com/@tiga1231/lib
import crossfilter from "crossfilter2";
import * as d3 from "d3";
import regl2 from "regl";

// ------------ Color palettes ---------------
const pyplot_cycles = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];
export const C = pyplot_cycles;

// --------------- new ---------------
// Minimal helper that draws a SPLOM into `el` using splom_gl2.
export function renderSplom(opts) {
  const {
    el, // HTMLElement to draw into
    data, // array of row objects: [{colA:..., colB:...}, ...]
    rowAttrs, // array of column names for rows
    colAttrs, // array of column names for cols
    subplotW = 150,
    subplotH = 150,
    pointSize = 4, // optional
  } = opts;

  // Guard rails
  if (!el) throw new Error("renderSplom: missing el");
  el.innerHTML = "";
  if (!data || !Array.isArray(data) || !rowAttrs?.length || !colAttrs?.length) {
    const msg = document.createElement("div");
    msg.style.font =
      "12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    msg.style.color = "#666";
    msg.textContent = "alloylens: waiting for data, row_attrs, and col_attrs…";
    el.appendChild(msg);
    return null;
  }

  // Overall canvas size from the grid shape
  const width = Math.max(1, colAttrs.length) * subplotW + 16;
  const height = Math.max(1, rowAttrs.length) * subplotH + 20;

  // Host div
  const host = d3
    .select(document.createElement("div"))
    .style("position", "relative")
    .style("width", `${width}px`)
    .style("height", `${height}px`);
  el.appendChild(host.node());

  // Simple categorical color scale using your palette C[]
  const sc = (d, i) => C[i % C.length];

  // Draw and return the splom object from splom_gl2 (so callers can interact with it)
  const splom = splom_gl2(host, data, {
    width,
    height,
    row_attrs: rowAttrs,
    col_attrs: colAttrs,
    subplot_padding_left: 16,
    subplot_padding_right: 0,
    subplot_padding_top: 0,
    subplot_padding_bottom: 20,
    scales: { sc },
    s: () => pointSize,
    stroke: "#fff",
    stroke_width: 0.5,
    brush: true,
  });

  return splom;
}

// --------------- data utils ---------------
export function normalize(d, vmin, vmax, eps = 1e-4) {
  return (d - vmin) / (vmax - vmin + eps);
}

export function pandas2array(data_obj) {
  //parse individual column data from DataView to arrays
  for (let j = 0; j < data_obj.shape[1]; j++) {
    data_obj.data[j] = numpy2array({
      dtype: data_obj.dtypes[j],
      shape: [data_obj.shape[0]],
      data: data_obj.data[j],
    });
  }
  //construct an array of objects
  let data = [];
  for (let i = 0; i < data_obj.shape[0]; i++) {
    let datum = Object.fromEntries(
      data_obj.columns.map((c, j) => [c, data_obj.data[j][i]])
    );
    data.push(datum);
  }

  return data;
}

export function numpy2array(data_obj) {
  let { dtype, shape, data } = data_obj;
  if (dtype === "float64") {
    data = new Float64Array(data.buffer);
  } else if (dtype === "int64") {
    data = new BigInt64Array(data.buffer);
  } else if (dtype === "uint8") {
    data = new Uint8Array(data.buffer);
  } else if (dtype === "int8") {
    data = new Int8Array(data.buffer);
  } else if (dtype === "uint16") {
    data = new Uint16Array(data.buffer);
  } else if (dtype === "int16") {
    data = new Int16Array(data.buffer);
  } else if (dtype === "uint32") {
    data = new Uint32Array(data.buffer);
  } else if (dtype === "int32") {
    data = new Int32Array(data.buffer);
  } else if (dtype === "float32") {
    data = new Float32Array(data.buffer);
  }
  data = reshape(Array.from(data), shape);
  return data;
}

export function zip(a, b) {
  return a.map((ai, i) => [ai, b[i]]);
}

export function linspace(a, b, n) {
  return d3.range(n).map((i) => (i / (n - 1)) * (b - a) + a);
}

export function reshape(arr, size) {
  size = size.slice();
  if (size.length <= 1) {
    return arr;
  } else if (size.length == 2) {
    return reshape2d(arr, size[0], size[1]);
  } else {
    let res = [];
    let m = size.pop();
    for (let i = 0; i < arr.length; i = i + m) {
      res.push(arr.slice(i, i + m));
    }
    return reshape(res, size);
  }
}

function reshape2d(arr, r, c) {
  let res = [];
  let k = 0;
  for (let i = 0; i < r; i++) {
    let row = [];
    for (let j = 0; j < c; j++) {
      row.push(arr[k]);
      k++;
    }
    res.push(row);
  }
  return res;
}

// --------------- Vis Utils -----------------

export function kde(
  sel,
  data,
  {
    x = (d) => d,
    normalize = false,
    bandwidth = undefined,
    evaluation_points = undefined,
    width = 300,
    height = 300,
    padding_left = 0,
    padding_right = 0,
    padding_top = 0,
    padding_bottom = 0,
    stroke = "#1f77b4",
    stroke_width = 1,
    is_framed = true,
    histtype = "bar", // 'bar' or 'step',
    xticks = undefined,
    yticks = undefined,
    scales = {},
    title = "",
    frame_kwargs = "#eef",
    label_fontsize = 12,
  } = {}
) {
  let kde_values = data.map((seq) => seq.map((d) => x(d)));
  if (evaluation_points === undefined) {
    let extent = d3.extent(kde_values.flat());
    let r = 0;
    evaluation_points = linspace(extent[0] - 0.1 * r, extent[1] + 0.1 * r, 100);
  }

  let lines_data = [];
  for (let values of kde_values) {
    lines_data.push(
      compute_kde(values, { evaluation_points, bandwidth, normalize })
    );
  }

  return lines(sel, lines_data, {
    is_framed,
    width,
    height,
    stroke,
    stroke_width,
    // data accessors:
    x: (d) => d[0],
    y: (d) => d[1],
    xticks,
    yticks,
    title,
    padding_left,
    padding_bottom,
    padding_right,
    padding_top,
    label_fontsize,
  });
}

function compute_kde(
  data,
  {
    evaluation_points = undefined,
    bandwidth = undefined,
    kernel = gaussian_kernel,
    normalize = true,
  } = {}
) {
  if (bandwidth === undefined) {
    let extent = d3.extent(data);
    let range = extent[1] - extent[0];
    bandwidth = Math.pow(data.length, -0.2);
    bandwidth *= range / 5;
  }

  if (evaluation_points === undefined) {
    evaluation_points = linspace(...d3.extent(data), 100);
  }
  if (normalize) {
    return evaluation_points.map((x) => [
      x,
      d3.mean(data, (d) => kernel(d - x, bandwidth)),
    ]);
  } else {
    return evaluation_points.map((x) => [
      x,
      d3.sum(data, (d) => kernel(d - x, bandwidth)),
    ]);
  }
}

function gaussian_kernel(x, bandwidth = 1) {
  let h = bandwidth;
  let z = h * Math.sqrt(2 * Math.PI); // normalizing factor
  return (1 / z) * Math.exp((-x * x) / (2 * h * h));
}

// Draw multiple polylines
export function lines(
  container = undefined,
  data = [
    // array of polylines, where each polyline containes array of nodes. e.g.,
    d3.range(10).map((i) => ({ x: i, y: Math.random() * 2 - 0.5 })),
    [
      { x: 3, y: 0.5 },
      { x: 4, y: -0.5 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
    ],
  ],

  {
    // plotting styles
    is_framed = true,
    width = 400,
    height = 200,
    stroke = (line_data, i) => C[i],
    stroke_width = 4,
    // data accessors:
    x = (d) => d.x,
    y = (d) => d.y,
    //scales
    scales = { sx: undefined, sy: undefined },
    xticks,
    yticks,

    padding_left = 50,
    padding_right = 0,
    padding_top = 0,
    padding_bottom = 12,
    label_fontsize = 2,
  } = {}
) {
  if (container === undefined) {
    container = create_svg(width, height);
  }
  if (is_framed) {
    let frame1 = container.call(frame, data.flat(), {
      is_square_scale: false,
      scales,
      width,
      height,
      x,
      y,
      xticks,
      yticks,
      padding_left,
      padding_right,
      padding_top,
      padding_bottom,
      label_fontsize,
    });
    scales.sx = frame1.scales.sx;
    scales.sy = frame1.scales.sy;
  } else {
    if (scales.sx === undefined) {
      scales.sx = create_scale(data.flat(), {
        value_accessor: (d) => x(d),
        range: [0, width],
      });
    }
    if (scales.sy === undefined) {
      scales.sy = create_scale(data.flat(), {
        value_accessor: (d) => y(d),
        range: [height, 0],
      });
    }
  }

  container
    .selectAll(".line")
    .data(data)
    .join("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", stroke_width)
    .attr("stroke-linecap", "round")
    .attr(
      "d",
      d3
        .line()
        .x(function (d) {
          return scales.sx(x(d));
        })
        .y(function (d) {
          return scales.sy(y(d));
        })
    );

  return container;
}

export function create_scatter_gl_program(regl) {
  let vert = `
    precision mediump float;
    attribute vec2 position;
    attribute vec4 color;
    attribute float size;
    attribute float depth;
    attribute float stroke_width;
    varying float v_size;
    varying vec4 v_color;
    varying float v_stroke_width;

    void main() {
      gl_Position = vec4(position, depth, 1.0);
      gl_PointSize = size;
      v_color = color;
      v_size = size;
      v_stroke_width = stroke_width;
    }`;

  let frag = `
    precision mediump float;
    varying vec4 v_color;
    varying float v_size;
    uniform vec3 u_stroke;
    //uniform float u_stroke_width;
    varying float v_stroke_width;

    void main() {
      float eps = 0.01;
      //round marks
      vec2 pointCoord = (gl_PointCoord.xy-0.5)*2.0;
      float dist = length(pointCoord); // distance to point center, normalized to [0,1]
      if (dist>1.0)
        discard;
      gl_FragColor = v_color;
      gl_FragColor.a = 1.0;
      if(v_stroke_width > 0.01){
        float stroke = v_stroke_width / v_size; //normalized stroke width
        float mix_factor = smoothstep(1.0-stroke-eps, 1.0-stroke+eps, dist);
        gl_FragColor = mix( v_color, vec4(u_stroke, 1.0), mix_factor);
        float alpha = 1.0 - smoothstep(1.0-stroke+stroke*0.8, 1.0, dist);
        gl_FragColor.a = alpha;
      }
      // debug depth:
      // gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);
    }`;

  let render_func = regl({
    attributes: {
      position: regl.prop("positions"),
      color: regl.prop("colors"),
      size: regl.prop("size"),
      depth: regl.prop("depth"),
      stroke_width: regl.prop("stroke_width"),
    },
    uniforms: {
      u_stroke: regl.prop("stroke"),
    },
    count: regl.prop("count"),
    primitive: "points",
    vert,
    frag,

    depth: {
      enable: true,
      mask: true,
      func: "<",
      range: [0, 1],
    },

    //alpha blend
    blend: {
      enable: true,
      func: {
        srcRGB: "src alpha",
        srcAlpha: 1,
        dstRGB: "one minus src alpha",
        dstAlpha: 1,
      },
      equation: {
        rgb: "add",
        alpha: "add",
      },
      color: [0, 0, 0, 0],
    },
  });

  return render_func;
}

export // a frame specifically for scatterplot
function scatter_frame(
  container = undefined,
  data = undefined,
  {
    background = "#eee",
    xticks = 5,
    yticks = 5,
    x_tickvalues = undefined,
    y_tickvalues = undefined,
    x = (d) => d.x,
    y = (d) => d.y,
    scales = {},
    width = 500,
    height = 500,
    padding_bottom = 18,
    padding_left = 40,
    padding_right = 0,
    padding_top = 0,
    pad = 0.1,
    title = undefined,
    is_square_scale = false,
    is_log_scale = false,
    xlabel = undefined,
    ylabel = undefined,
    label_fontsize = 10,
  } = {}
) {
  if (container === undefined) {
    container = create_svg(width, height);
  }
  container.call(frame, data, {
    background,
    xticks,
    yticks,
    x_tickvalues,
    y_tickvalues,
    x,
    y,
    scales,
    width,
    height,
    padding_bottom,
    padding_left,
    padding_right,
    padding_top,
    pad,
    title,
    is_square_scale,
    is_log_scale,
    xlabel,
    ylabel,
    label_fontsize,
  });

  let return_node = container.node();
  return_node.scales = container.scales;
  return_node.ax = container.ax;
  return_node.ay = container.ay;
  return_node.xticks = xticks;
  return_node.yticks = yticks;
  return return_node;
}

export function hex2rgb(color) {
  let c = d3.rgb(d3.color(color));
  return [c.r, c.g, c.b];
}

export function color2gl(color) {
  let c;
  if (typeof color === "string") {
    c = d3.rgb(d3.color(color));
  } else if (typeof color === "object") {
    if (color.length !== undefined) {
      c = d3.rgb(...color); //3-tuple
    } else {
      c = color; //rgb object
    }
  }
  if (!c) {
    const dc = d3.color(fallback);
    c = d3.rgb(dc || "#7f7f7f");
  }
  return [c.r / 255, c.g / 255, c.b / 255];
}

export function clip(value, vmin, vmax) {
  return Math.min(Math.max(vmin, value), vmax);
}

export function fetch_json(
  url,
  { body = null, callback = (json) => json } = {}
) {
  let args = {
    method: body === null ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (body !== null) {
    args.body = JSON.stringify(body);
  }
  return fetch(`${url}`, args)
    .then((response) => response.json())
    .then((arr) => {
      return callback(arr);
    });
}

export function create_canvas(width, height, dpi_scale = 1.0) {
  let canvas = document.createElement("canvas");
  canvas.width = width * window.devicePixelRatio * dpi_scale;
  canvas.height = height * window.devicePixelRatio * dpi_scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  return canvas;
}

export function overlay(container = undefined, nodes = []) {
  /* Take a list of DOM nodes. return a div, with children following the <selections> order.
     Following the HTML convention, later children are overlaid on top of early children. */
  if (container === undefined) {
    container = d3.create("div");
  }
  container.style("position", "relative");

  nodes = [...container.node().children, ...nodes];
  let container_height = 0;
  nodes.forEach((node, i) => {
    let sel = d3.select(node);
    sel
      .style("position", i == 0 ? "relative" : "absolute")
      .style("top", "0")
      .style("left", "0");
    let h;
    if (sel.style("height") !== "") {
      h = parseFloat(sel.style("height"));
    } else {
      h = parseFloat(sel.attr("height"));
    }
    container_height = Math.max(h, container_height);
    container.node().appendChild(sel.node());
  });
  container.style("height", `${container_height}px`);
  return container.node();
}

export function scatter_gl(
  container = undefined,
  data = undefined,
  {
    is_framed = true,
    background = "#eee",
    xticks = 5,
    yticks = 5,
    x_tickvalues = undefined,
    y_tickvalues = undefined,
    x = (d, i) => d.x,
    y = (d, i) => d.y,
    s = (d, i) => 10, //marker size
    depth = undefined, //(d, i) => i / 100,
    scales = {},
    width = 500,
    height = 500,
    padding_bottom = 18,
    padding_left = 40,
    padding_right = 0,
    padding_top = 0,
    pad = 0.1,
    title = undefined,
    is_square_scale = false,
    is_log_scale = false,
    xlabel = undefined,
    ylabel = undefined,
    label_fontsize = 12,
    stroke = "white",
    stroke_width = 1.0,
    dpi_scale = 1.0,
  } = {}
) {
  if (depth === undefined) {
    //by default, last point gets drawn on the top
    depth = (d, i) => -i / data.length;
  }
  if (container === undefined) {
    container = d3.create("div");
  }

  let underlay = create_svg(width, height);
  let overlay1 = create_svg(width, height);
  underlay.call(frame, data, {
    background,
    xticks,
    yticks,
    x_tickvalues,
    y_tickvalues,
    x,
    y,
    scales,
    width,
    height,
    padding_bottom,
    padding_left,
    padding_right,
    padding_top,
    pad,
    title,
    is_square_scale,
    is_log_scale,
    xlabel,
    ylabel,
    label_fontsize,
  });

  if (!is_framed) {
    underlay.selectAll(".scatter").remove();
  }

  // Scales
  let { sx, sy } = underlay.scales; // From data to pixel coords on svg;

  //From pixels to GL's clip space
  let sx_svg2gl = d3.scaleLinear().domain([0, width]).range([-1, 1]);
  let sy_svg2gl = d3.scaleLinear().domain([0, height]).range([1, -1]);
  // From data to clip space
  let sx_gl = d3
    .scaleLinear()
    .domain(sx.domain())
    .range([sx_svg2gl(sx.range()[0]), sx_svg2gl(sx.range()[1])]);
  let sy_gl = d3
    .scaleLinear()
    .domain(sy.domain())
    .range([sy_svg2gl(sy.range()[0]), sy_svg2gl(sy.range()[1])]);

  let sc = scales.sc || ((d) => C[0]);
  let sc_gl = (d, i) => {
    let c = sc(d, i);
    return [...color2gl(c), 1.0];
  };

  let canvas = create_canvas(width, height, dpi_scale);
  let regl = regl2({ canvas: canvas });

  let res = overlay(container, [underlay.node(), canvas, overlay1.node()]);
  //method defs
  res.underlay = underlay;
  res.overlay = overlay1;
  res.scales = { ...underlay.scales, sx_gl, sy_gl, sc_gl };
  res.clear = () => {
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1,
      stencil: 0,
    });
  };
  res._render = create_scatter_gl_program(regl);

  //rendering APIs
  res.render = ({
    positions,
    colors,
    size,
    stroke,
    stroke_width,
    depth,
  } = {}) => {
    res._render({
      positions: positions.map((d) => [sx_gl(d[0]), sy_gl(d[1])]),
      colors,
      count: positions.length,
      size: size.map((s) => s * window.devicePixelRatio * dpi_scale),
      stroke,
      stroke_width: stroke_width * window.devicePixelRatio * dpi_scale,
      depth,
    });
  };

  res.redraw = (data) => {
    res.render({
      positions: data.map((d, i) => [x(d, i), y(d, i)]), //array of two numbers
      colors: data.map((d, i) => sc_gl(d, i)), // array of RGBA tuples
      size: data.map((d, i) => s(d, i)), // array of numbers
      depth: data.map((d, i) => depth(d, i)),
      stroke: color2gl(stroke),
      stroke_width,
    });
  };

  // update color scale
  res.recolor = (new_sc, { depth } = {}) => {
    sc = new_sc;
    sc_gl = (d, i) => {
      let c = new_sc(d, i);
      return [...color2gl(c), 1.0];
    };
    // re-render
    res.render({
      positions: data.map((d, i) => [x(d, i), y(d, i)]), //array of two numbers
      colors: data.map((d, i) => sc_gl(d, i)), // array of RGBA tuples
      size: data.map((d, i) => s(d, i)), // array of numbers
      depth: data.map((d, i) => depth(d, i)),
      stroke: color2gl(stroke),
      stroke_width,
    });
  };

  res.clear();
  res.redraw(data);

  return res;
}

export function splom_gl2(
  container_div = undefined,
  data = undefined,
  {
    width = 1000,
    height = 800,
    attrs = ["column_a", "column_b", "column_c"],
    row_attrs = undefined,
    col_attrs = undefined,
    depth = undefined,
    layout = "upper",
    padding_left = 16,
    padding_right = 0,
    padding_top = 0,
    padding_bottom = 20,
    subplot_padding_left = 16,
    subplot_padding_right = 0,
    subplot_padding_top = 0,
    subplot_padding_bottom = 20,

    //x and y axes
    scales = { sc: (d) => C[0] },
    is_square_scale = false,
    xticks = 5,
    yticks = 5,
    show_tick_texts = true,
    show_axis_label = true,

    //color styles,
    s = () => 5, //mark size,
    stroke = "#eee",
    stroke_width = 1,
    dpi_scale = 1.0,

    kde_filters = [(d) => true],
    label_fontsize = 10,

    brush = true,
    brush_highlight = false,
    brush_listeners = {
      start: () => {},
      brush: (brushed_data) => {
        console.log("brushed_data", brushed_data);
      },
      end: () => {},
    },
  } = {}
) {
  row_attrs = row_attrs || attrs;
  col_attrs = col_attrs || attrs;

  let n_row_attrs = row_attrs.length;
  let n_col_attrs = col_attrs.length;

  let plot_width, plot_height;
  plot_width = (width - padding_left - padding_right) / n_col_attrs;
  plot_height = (height - padding_top - padding_bottom) / n_row_attrs;

  if (depth === undefined) {
    depth = (d, i) => -i / data.length; //by default, last point gets drawn on the top
  }

  //DOM layout
  if (container_div === undefined) {
    container_div = d3.create("div").style("height", `${height}px`);
  }
  let frame_container = container_div
    .append("div")
    .attr("class", "frame-container")
    .style("position", "relative");

  //create a canvas, gl, with render functionality
  let canvas = create_canvas(width, height, dpi_scale);
  let regl = regl2({ canvas: canvas });
  d3.select(canvas).style("position", "absolute");
  container_div.node().appendChild(canvas);

  let overlay_container = container_div
    .append("div")
    .attr("class", "overlay-container")
    .style("position", "relative");
  let _render = create_scatter_gl_program(regl);

  //prepare crossfilter for brush
  let cross = null;
  let dimensions = {};
  let subplot_brushes = d3.range(n_row_attrs).map((_) => []);
  let active_brushes = new Set();
  if (brush) {
    //build crossfilter for all attributes (union of row and col attributes) in the plot
    cross = crossfilter(data);
    for (let attr of new Set(row_attrs.concat(col_attrs))) {
      dimensions[attr] = cross.dimension((d) => d[attr]);
    }
    cross.dimensions = dimensions;
  }

  function draw_subplots() {
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1,
      stencil: 0,
    });

    let subplots = d3.range(n_row_attrs).map((_) => []);

    //i - rows in the layout, bottom to top
    //j - cols in the layout, left to right
    for (let i = 0; i < n_row_attrs; i++) {
      for (let j = 0; j < n_col_attrs; j++) {
        if ((layout === "lower" && i > j) || (layout === "upper" && i < j)) {
          continue;
        }
        //KDE
        // console.log(i, j, row_attrs[i], col_attrs[j]);
        if (row_attrs[i] === col_attrs[j]) {
          let kde_plot = kde(
            undefined,
            kde_filters.map((f) => data.filter(f)),
            {
              x: (d) => d[col_attrs[j]],
              height: plot_height,
              width: plot_width,
              padding_top: subplot_padding_top,
              padding_bottom: subplot_padding_bottom,
              padding_left: subplot_padding_left,
              padding_right: subplot_padding_right,
              stroke: (seq, i) => C[i],
              stroke_width: 1,
              yticks: 2,
              xticks,
              label_fontsize,
              title: "",
              xlabel: col_attrs[j],
              ylabel: "Density",
            }
          );
          kde_plot.style("overflow", "visible");
          kde_plot.select(".y-axis").selectAll("text").remove();
          // if (j !== 0) {
          //   kde_plot.select(".x-axis").selectAll("text").remove();
          // }
          subplots[i][j] = kde_plot;

          let left = padding_left + j * plot_width;
          let top = padding_top + (n_row_attrs - 1 - i) * plot_height;
          kde_plot
            .attr("class", "kde")
            .style("position", "absolute")
            .style("overflow", "visible")
            .style("left", `${left}px`)
            .style("top", `${top}px`);

          if (brush) {
            //KDE brush
            //overlay for KDE brush
            let overlay_ii = create_svg(plot_width, plot_height)
              .attr("class", "overlay")
              .style("position", "absolute")
              .style("left", `${padding_left + j * plot_width}px`)
              .style(
                "top",
                `${padding_top + (n_row_attrs - 1 - i) * plot_height}px`
              );
            overlay_container.node().appendChild(overlay_ii.node());
            let extent = [
              [subplot_padding_left, subplot_padding_top],
              [
                plot_width - subplot_padding_right,
                plot_height - subplot_padding_bottom,
              ],
            ];
            // console.log("KDE brush extent", extent);
            let dim_x = dimensions[col_attrs[j]];
            brush = d3
              .brushX()
              .extent(extent)
              .on("start", () => {})
              .on("brush", ({ selection }) => {
                let { sx, sy } = kde_plot.scales;
                let [bx0, bx1] = selection; //get brushed region
                let [x0, x1] = [sx.invert(bx0), sx.invert(bx1)]; //invert brush to data domain
                dim_x.filter([x0, x1]); //filter
                let brushed_data = dim_x.bottom(Infinity); //update selection

                highlight_brushed(
                  data,
                  scales.sc,
                  cross,
                  subplots,
                  row_attrs,
                  col_attrs
                );

                //save brushed_data to returned object (return_node)
                return_node.brushed_data = brushed_data;
                if (brush_listeners["brush"]) {
                  brush_listeners["brush"](return_node.brushed_data);
                }
              })
              .on("end", (e) => {
                //brush cleared
                if (e.selection === null) {
                  //update selection
                  dim_x.filterAll();
                  let brushed_data = dim_x.bottom(Infinity);
                  data.forEach((d, i) => {
                    d.brushed = cross.isElementFiltered(i);
                  });

                  highlight_brushed(
                    data,
                    scales.sc,
                    cross,
                    subplots,
                    row_attrs,
                    col_attrs
                  );

                  // //save brushed_data to returned object (return_node)
                  return_node.brushed_data = brushed_data;

                  if (brush_listeners["end"]) {
                    brush_listeners["end"]([]);
                  }
                } else {
                  if (brush_listeners["end"]) {
                    brush_listeners["end"](return_node.brushed_data);
                  }
                }
              });
            overlay_ii.append("g").attr("class", "brush").call(brush);
          }

          frame_container.node().appendChild(kde_plot.node());
        } else {
          let plot = { plot_width, plot_height, scales, brush };
          subplots[i][j] = plot;

          //i!==j, scatter plots
          //subplot background frame
          let frame = scatter_frame(undefined, data, {
            x: (d) => d[col_attrs[j]],
            y: (d) => d[row_attrs[i]],
            width: plot_width,
            height: plot_height,
            xlabel: i == 0 ? col_attrs[j] : "",
            ylabel: j == 0 ? row_attrs[i] : "",
            is_square_scale,
            xticks: xticks,
            yticks: yticks,
            padding_top: subplot_padding_top,
            padding_bottom: subplot_padding_bottom,
            padding_left: subplot_padding_left,
            padding_right: subplot_padding_right,
            title: "",
            label_fontsize,
          });
          frame_container.node().appendChild(frame);
          //compute offset on the big gl canvas pixel coordinate
          let left = padding_left + j * plot_width;
          let top = padding_top + (n_row_attrs - 1 - i) * plot_height;
          d3.select(frame)
            .attr("class", "frame")
            .style("position", "absolute")
            .style("overflow", "visible")
            .style("left", `${left}px`)
            .style("top", `${top}px`);
          d3.select(frame)
            .selectAll("text")
            .style("font-size", `${label_fontsize}px`);
          if (!show_axis_label) {
            d3.select(frame).selectAll("text.xlabel").remove();
            d3.select(frame).selectAll("text.ylabel").remove();
          }

          //hide scatterplot x-axes tick text that are not on the bottom
          if (!show_tick_texts) {
            d3.select(frame)
              .selectAll(".x-axis .tick text")
              .style("display", "none");
            d3.select(frame)
              .selectAll(".y-axis .tick text")
              .style("display", "none");
          }
          d3.select(frame)
            .selectAll(".y-axis .tick text")
            .attr("transform", "translate(-10,0)");

          // gl render here
          let { sx, sy } = frame.scales; //updated sx, sy;
          let pixel2clip_x = d3.scaleLinear().domain([0, width]).range([-1, 1]);
          let pixel2clip_y = d3
            .scaleLinear()
            .domain([0, height])
            .range([1, -1]);
          // From data to clip space
          let sx_gl = d3
            .scaleLinear()
            .domain(sx.domain())
            .range([
              pixel2clip_x(sx.range()[0] + left),
              pixel2clip_x(sx.range()[1] + left),
            ]);
          let sy_gl = d3
            .scaleLinear()
            .domain(sy.domain())
            .range([
              pixel2clip_y(sy.range()[0] + top),
              pixel2clip_y(sy.range()[1] + top),
            ]);
          let sc = scales.sc || ((d) => C[0]);
          let sc_gl = (d) => {
            let c = sc(d);
            return [...color2gl(c), 1.0];
          };

          //create subplot overlay
          let overlay_ij = create_svg(plot_width, plot_height)
            .attr("class", "overlay")
            .style("position", "absolute")
            .style("left", `${padding_left + j * plot_width}px`)
            .style(
              "top",
              `${padding_top + (n_row_attrs - 1 - i) * plot_height}px`
            );
          overlay_container.node().appendChild(overlay_ij.node());

          // scatterplot brush
          if (brush) {
            function brush_record_format(row_attr, col_attr) {
              return `${col_attr}-vs-${row_attr}`;
            }
            let extent = [
              [subplot_padding_left, subplot_padding_top],
              [
                plot_width - subplot_padding_right,
                plot_height - subplot_padding_bottom,
              ],
            ];

            //get crossfilter dimensions
            let dim_x = dimensions[col_attrs[j]];
            let dim_y = dimensions[row_attrs[i]];

            brush = d3
              .brush()
              .extent(extent)
              .on("start", ({ selection, sourceEvent }) => {
                if (!sourceEvent) return;
                if (brush_listeners["start"]) {
                  brush_listeners["start"](return_node.brushed_data);
                }
              })
              .on("brush", ({ selection, sourceEvent }) => {
                if (!sourceEvent) return;

                //get brushed region
                let [bx0, bx1] = [selection[0][0], selection[1][0]];
                let [by0, by1] = [selection[0][1], selection[1][1]];
                //invert brush to data domain
                let [x0, x1] = [sx.invert(bx0), sx.invert(bx1)];
                let [y0, y1] = [sy.invert(by0), sy.invert(by1)];
                [y0, y1] = [Math.min(y0, y1), Math.max(y0, y1)];
                // crossfilter
                dim_x.filter([x0, x1]);
                dim_y.filter([y0, y1]);
                // update selection
                let brushed_data = dim_x.bottom(Infinity);
                active_brushes.add(
                  brush_record_format(row_attrs[i], col_attrs[j])
                );

                highlight_brushed(
                  data,
                  scales.sc,
                  cross,
                  subplots,
                  row_attrs,
                  col_attrs
                );

                // MARK go through entire row i
                for (let j2 = 0; j2 < n_col_attrs; j2++) {
                  let b = brush_record_format(row_attrs[i], col_attrs[j2]);
                  if (j !== j2 && active_brushes.has(b)) {
                    let [[cx0, cy0], [cx1, cy1]] = d3.brushSelection(
                      subplots[i][j2].g_brush.node()
                    );
                    subplots[i][j2].g_brush.call(subplots[i][j2].brush.move, [
                      [cx0, by0],
                      [cx1, by1],
                    ]);
                  }
                }
                for (let i2 = 0; i2 < n_row_attrs; i2++) {
                  let b = brush_record_format(row_attrs[i2], col_attrs[j]);
                  if (i !== i2 && active_brushes.has(b)) {
                    let [[cx0, cy0], [cx1, cy1]] = d3.brushSelection(
                      subplots[i2][j].g_brush.node()
                    );
                    subplots[i2][j].g_brush.call(subplots[i2][j].brush.move, [
                      [bx0, cy0],
                      [bx1, cy1],
                    ]);
                  }
                }
                return_node.brushed_data = brushed_data;

                if (brush_listeners["end"]) {
                  brush_listeners["end"]([]);
                }
              })
              .on("end", ({ selection, sourceEvent }) => {
                if (!sourceEvent) return;
                //brush cleared
                if (selection === null) {
                  dim_x.filterAll();
                  dim_y.filterAll();
                  active_brushes.delete(
                    brush_record_format(row_attrs[i], col_attrs[j])
                  );

                  let brushed_data = dim_x.bottom(Infinity);
                  data.forEach((d, i) => {
                    d.brushed = cross.isElementFiltered(i);
                  });

                  highlight_brushed(
                    data,
                    scales.sc,
                    cross,
                    subplots,
                    row_attrs,
                    col_attrs
                  );
                  return_node.brushed_data = brushed_data;

                  if (brush_listeners["end"]) {
                    brush_listeners["end"]([]);
                  }
                } else {
                  if (brush_listeners["end"]) {
                    brush_listeners["end"](return_node.brushed_data);
                  }
                }
              });

            let g_brush = overlay_ij
              .append("g")
              .attr("class", "brush")
              .call(brush);
            plot.brush = brush;
            plot.g_brush = g_brush;
          }

          plot.data = data;
          plot.x = (d) => d[col_attrs[j]];
          plot.y = (d) => d[row_attrs[i]];
          plot.frame = frame;
          plot.overlay = overlay_ij;
          plot.scales = {
            sx: frame.scales.sx,
            sy: frame.scales.sy,
            sc: scales.sc,
            sx_gl,
            sy_gl,
            sc_gl,
          };
          plot.positions = data.map((d) => [
            sx_gl(d[col_attrs[j]]),
            sy_gl(d[row_attrs[i]]),
          ]);
          plot.size = data.map(
            (d, i) => s(d, i) * window.devicePixelRatio * dpi_scale
          );

          plot.render = (data, {} = {}) => {
            _render({
              positions: plot.positions,
              colors: data.map((d) => sc_gl(d)),
              count: data.length,
              size: plot.size,
              stroke: color2gl(stroke),
              stroke_width: data.map(
                (_) => stroke_width * window.devicePixelRatio
              ),
              depth: data.map((d, i) => depth(d, i)),
            });
          };

          plot.recolor_data = (
            colors,
            { depths = undefined, stroke_widths = undefined } = {}
          ) => {
            let recolor_data = {
              positions: plot.positions,
              size: plot.size,
              colors: colors,
              count: data.length,
              stroke: color2gl(stroke),
              stroke_width:
                stroke_widths !== undefined
                  ? stroke_widths.map((d) => d * window.devicePixelRatio)
                  : data.map((_) => stroke_width * window.devicePixelRatio),
              depth: depths || data.map((d, i) => depth(d, i)),
            };
            return recolor_data;
          };

          plot.recolor = (
            colors,
            { depths = undefined, stroke_widths = undefined } = {}
          ) => {
            _render(plot.recolor_data(colors, { depths, stroke_widths }));
          };

          plot.render(data);
        }
      }
    }
    return subplots;
  }

  //prepare return
  let return_node = container_div.node();
  return_node.data = data;
  return_node.subplots = draw_subplots();
  return_node.cross = cross; //crossfilter
  return_node.dimensions = dimensions; //crossfilter
  return_node.row_attrs = row_attrs;
  return_node.col_attrs = col_attrs;

  return_node.clear = () => {
    // regl._gl.clearColor(0, 0, 0, 1);
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1,
      stencil: 0,
    });
  };

  return_node.highlight_brushed = highlight_brushed;
  return_node.highlight_brushed_2 = highlight_brushed_2;
  // the entire splom recolor
  return_node.recolor = (colors, { depths } = {}) => {
    return_node.clear();
    // return_node.subplots.forEach((row, i) => {
    //     row.forEach((subplot, j) => {
    //         if (subplot !== undefined && i != j) {
    //             subplot.recolor(colors, {depths});
    //         }
    //     });
    // });
    if (return_node.combined_data === undefined) {
      return_node.combined_data = {
        positions: [],
        colors: [],
        count: 0,
        size: [],
        depth: [],
        stroke_width: undefined,
        stroke: undefined,
      };
      return_node.subplots.forEach((row, i) => {
        row.forEach((subplot, j) => {
          if (subplot !== undefined && i != j) {
            let d = subplot.recolor_data(colors, { depths });
            for (let attr of ["positions", "colors", "depth", "size"]) {
              return_node.combined_data[attr] = return_node.combined_data[
                attr
              ].concat(d[attr]);
            }
            return_node.combined_data.count += d.count;
            return_node.combined_data.stroke = d.stroke;
            return_node.combined_data.stroke_width = d.stroke_width;
          }
        });
      });
    } else {
      return_node.combined_data.colors = [];
      return_node.combined_data.depth = [];
      return_node.subplots.forEach((row, i) => {
        row.forEach((subplot, j) => {
          if (subplot !== undefined && i != j) {
            return_node.combined_data.colors =
              return_node.combined_data.colors.concat(colors);
            return_node.combined_data.depth =
              return_node.combined_data.depth.concat(depths);
          }
        });
      });
    }
    _render(return_node.combined_data);
  };

  return_node.redraw_kde = (kde_filters, kde_strokes) => {
    frame_container.selectAll(".kde").remove();
    for (let i = 0; i < n_row_attrs; i++) {
      let j = i;
      let kde_data = kde_filters.map((f) => data.filter(f));
      let kde_plot = kde(undefined, kde_data, {
        x: (d) => d[col_attrs[i]],
        height: plot_height,
        width: plot_width,
        padding_top,
        padding_bottom,
        padding_left,
        padding_right,
        stroke: (seq, i) => kde_strokes[i], //TODO
        stroke_width: 1,
        yticks: 2,
        xticks,
        label_fontsize,
      });
      kde_plot.style("overflow", "visible");
      kde_plot.select(".y-axis").selectAll("text").remove();
      // if (j !== 0) {
      //   kde_plot.select(".x-axis").selectAll("text").remove();
      // }
      // subplots[i][j] = kde_plot;
      let left = padding_left + j * plot_width;
      let top = padding_top + (n_row_attrs - 1 - i) * plot_height;
      kde_plot
        .attr("class", "kde")
        .style("position", "absolute")
        .style("overflow", "visible")
        .style("left", `${left}px`)
        .style("top", `${top}px`);
      frame_container.node().appendChild(kde_plot.node());
    }
  };
  return return_node;
}

function point_on_cuboid(d, attrs, dimensions) {
  let p = attrs.map((attr) => {
    let bound = dimensions[attr].currentFilter();
    if (bound !== undefined) {
      return clip(d[attr], bound[0], bound[1]);
    } else {
      return d[attr];
    }
  });
  p = Object.fromEntries(zip(attrs, p));
  return p;
}

function distance_to_cuboid(d, attrs, dimensions, attr_extents) {
  let poc = point_on_cuboid(d, attrs, dimensions);
  let dist = d3.sum(
    attrs.map((attr) => {
      let [vmin, vmax] = attr_extents[attr];
      let p0_xi = (d[attr] - vmin) / (vmax - vmin + 1e-4);
      let p1_xi = (poc[attr] - vmin) / (vmax - vmin + 1e-4);
      return Math.pow(p0_xi - p1_xi, 2);
    })
  );
  return dist;
}

function highlight_brushed_2(data, sc, cross, subplots, row_attrs, col_attrs) {
  // A sub-routine for splom_gl2() to record the brushed to data (via crossfilter)
  // and update the color in all sub-scatterplots
  //
  let filter_nonempty = cross.allFiltered().length > 0;
  if (filter_nonempty) {
    highlight_brushed(data, sc, cross, subplots, row_attrs, col_attrs);
  } else {
    // filter returns no data points
    // color points by distance to the filter box
    let all_attrs = row_attrs.concat(col_attrs);
    let attr_extents = Object.fromEntries(
      zip(
        all_attrs,
        all_attrs.map((a) => d3.extent(data, (d) => d[a]))
      )
    );
    data.forEach((d, i) => {
      // d.brushed = cross.isElementFiltered(i);
      d.dist = distance_to_cuboid(d, all_attrs, cross.dimensions, attr_extents);
    });

    //recolor data points
    let [vmin, vmax] = d3.extent(data, (d) => d.dist);
    let color_reach = 0.02; // 0-1 color reachability
    //domain for color scale
    let [cmin, cmax] = [vmin, vmin + color_reach * (vmax - vmin)];
    data.forEach((d, i) => {
      d.brushed = d.dist < cmax;
    });
    // color scale (sc) by distance to the filter box
    sc = d3
      .scaleLinear()
      .domain([cmin, cmax])
      .range([C[1], "#aaa"])
      .interpolate(d3.interpolateHcl)
      .clamp(true);
    let sc_gl = (d) => {
      let c = sc(d.dist);
      return [...color2gl(c), 1.0];
    };
    let colors = data.map((d) => sc_gl(d));
    let depths = data.map((d, i) => (d.dist - vmin) / (vmax - vmin + 1e-4)); //-1=near, 1=far
    let stroke_widths = data.map((d, i) =>
      d.dist > vmin + color_reach * (vmax - vmin) ? 0 : 1
    );
    subplots.forEach((subplot_row, i) =>
      subplot_row.forEach((subplot, j) => {
        if (row_attrs[i] !== col_attrs[j]) {
          subplot.recolor(colors, { depths, stroke_widths });
        }
      })
    );
  }
}

function highlight_brushed(
  data,
  sc,
  cross,
  subplots,
  row_attrs,
  col_attrs,
  brush_highlight = true
) {
  // A sub-routine for splom_gl2() to record the brushed to data (via crossfilter)
  // and update the color in all sub-scatterplots
  data.forEach((d, i) => {
    d.brushed = cross.isElementFiltered(i);
  });

  //new color scale (sc) by brushed
  const colors = data.map((d, i) => {
    const c = d.brushed ? sc(d, i) : "#aaa";
    return [...color2gl(c), 1.0];
  });
  const depths = data.map((d, i) => (d.brushed ? -i / data.length : 0.0));
  const stroke_widths = data.map((d) => (d.brushed ? 1 : 0));

  if (brush_highlight) {
    subplots.forEach((subplot_row, i) =>
      subplot_row.forEach((subplot, j) => {
        if (row_attrs[i] !== col_attrs[j]) {
          subplot.recolor(colors, { depths, stroke_widths });
        }
      })
    );
  }
}

export function overflow_box(nodes, height, width = undefined) {
  let wrapping_div = d3
    .create("div")
    .classed("overflow", true)
    .style("height", `${height}px`)
    .style("overflow", "auto")
    .style("scrollbar-width", "none");

  if (width !== undefined) {
    wrapping_div.style("width", `${width}px`);
  }

  for (let node of nodes) {
    wrapping_div.node().appendChild(node);
  }
  return wrapping_div.node();
}

export function flexbox(items, width) {
  // wrap items in a div with flexbox properties
  let res = d3
    .create("div")
    .style("width", `${width}px`)
    .style("display", "inline-flex")
    .style("flex-direction", "row")
    .style("flex-wrap", "wrap");
  items.forEach((i) => {
    res.node().appendChild(i);
  });
  return res.node();
}

export function create_svg(width = 400, height = 300, bg = undefined) {
  let svg = d3.create("svg").attr("width", width).attr("height", height);
  if (bg) {
    svg.style("background", bg);
  }
  return svg;
}

export function scatter(
  sel = undefined,
  data = undefined,
  {
    xticks = 5,
    yticks = 5,
    background = "#eee",
    x_tickvalues = undefined,
    y_tickvalues = undefined,
    x = (d) => d.x,
    y = (d) => d.y,
    text = undefined, // text to be show along side markers (d)=>d.text
    scales = {},
    width = undefined,
    height = undefined,
    padding_bottom = 18,
    padding_left = 40,
    padding_right = 0,
    padding_top = 0,
    pad = 0.1,
    s = (d, i) => 10, //marker size
    return_obj = "g",
    title = undefined,
    is_square_scale = false,
    is_log_scale = false,
    xlabel = undefined,
    ylabel = undefined,
    label_fontsize = 12,
    stroke = "#fff",
    stroke_width = 0.5,
    zoom = false,
    brush = false,
    brush_highlight = true,
    brush_listeners = {
      start: () => {},
      brush: (brushed_data) => {
        console.log("brushed_data", brushed_data);
      },
      end: () => {},
    },
  } = {}
) {
  if (sel === undefined) {
    width = width || 500;
    height = height || 500;
    sel = d3.create("svg").attr("width", width).attr("height", height);
  } else {
    width = width || sel.attr("width") || 500;
    height = height || sel.attr("height") || 500;
  }
  let res = sel;
  let sc = scales.sc || ((d, i) => C[0]);

  let main = sel.append("g").attr("class", "scatter");
  let bg = main.append("g").attr("class", "bg"); // g that draws frame (axes and ticks)
  let fg = main.append("g").attr("class", "fg"); // g that draws marks
  // let inter = main.append("g").attr("class", "interaction");

  //draw a frame
  bg.call(frame, data, {
    background,
    xticks,
    yticks,
    x_tickvalues,
    y_tickvalues,
    x,
    y,
    scales,
    width,
    height,
    padding_bottom,
    padding_left,
    padding_right,
    padding_top,
    pad,
    title,
    is_square_scale,
    is_log_scale,
    xlabel,
    ylabel,
    label_fontsize,
  });
  let { sx, sy } = bg.scales;

  //marks
  let r = (d, i) => Math.sqrt(s(d, i));
  let points = fg
    .selectAll(".point")
    .data(data, (d, i) => (d.id !== undefined ? d.id : i))
    .join("circle")
    .attr("class", "point")
    .attr("cx", (d, i) => sx(x(d, i)))
    .attr("cy", (d, i) => sy(y(d, i)))
    .attr("fill", (d, i) => sc(d, i))
    .attr("stroke-width", stroke_width)
    .attr("stroke", stroke)
    .attr("r", (d, i) => r(d, i));

  // Zoom
  let { ax, ay, gx, gy } = bg;
  if (zoom) {
    zoom = d3
      .zoom()
      .scaleExtent([0.3, 20])
      .on("zoom", function zoomed({ transform }) {
        fg.attr("transform", transform);
        points
          .attr("r", (d) => r(d) / Math.sqrt(transform.k))
          .attr("stroke-width", stroke_width / Math.sqrt(transform.k));
        gx.call(ax.scale(transform.rescaleX(sx)));
        gy.call(ay.scale(transform.rescaleY(sy)));

        sel
          .selectAll(".tick > line")
          .style("stroke", d3.color(background).brighter());
        sel.selectAll("path.domain").style("display", "none");
      });
    sel.call(zoom); //assuming sel is the svg;

    res.reset = function reset() {
      sel.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    };
  }

  // Brush
  if (brush) {
    let extent = [
      [padding_left, padding_top],
      [width - padding_right, height - padding_bottom],
    ];

    let cross = crossfilter(data);
    let dim_x = cross.dimension((d) => x(d));
    let dim_y = cross.dimension((d) => y(d));
    brush = d3
      .brush()
      .extent(extent)
      .on("start", () => {
        if (brush_listeners["start"]) {
          brush_listeners["start"](res.brushed_data);
        }
      })
      .on("brush", ({ selection }) => {
        //get brushed region
        let [bx0, bx1] = [selection[0][0], selection[1][0]];
        let [by0, by1] = [selection[0][1], selection[1][1]];
        //invert brush to data domain
        let [x0, x1] = [sx.invert(bx0), sx.invert(bx1)];
        let [y0, y1] = [sy.invert(by0), sy.invert(by1)];
        [y0, y1] = [Math.min(y0, y1), Math.max(y0, y1)];
        //filter
        dim_x.filter([x0, x1]);
        dim_y.filter([y0, y1]);
        //update selection
        let brushed_data = dim_x.bottom(Infinity);
        data.forEach((d) => {
          d.brushed = false;
        });
        brushed_data.forEach((d) => {
          d.brushed = true;
        });
        if (brush_highlight) {
          res.update_style1("fill", (d, i) =>
            d.brushed ? scales.sc(d, i) : "#aaa"
          );
        }
        //save brushed_data to returned object (res)
        res.brushed_data = brushed_data;
        if (brush_listeners["brush"]) {
          brush_listeners["brush"](res.brushed_data);
        }
      })
      .on("end", (e) => {
        if (e.selection === null) {
          //brush cleared
          res.update_style1("fill", (d, i) => scales.sc(d, i));
          if (brush_listeners["end"]) {
            brush_listeners["end"]([]);
          }
        } else {
          if (brush_listeners["end"]) {
            brush_listeners["end"](res.brushed_data);
          }
        }
      });
    main.append("g").attr("class", "brush").call(brush);
  }

  function update_style1(attr_name, attr_func) {
    points.attr(attr_name, attr_func);
  }

  function update_style(style) {
    points
      .attr("fill", (d, i) => style(d)["fill"])
      .attr("stroke", (d, i) => style(d)["stroke"] || stroke);
  }

  function update_position(data, { duration = 600, autoscale = true } = {}) {
    if (autoscale) {
      // TODO
    }
    points
      .data(data)
      .transition()
      .duration(duration)
      .attr("cx", (d) => sx(x(d)))
      .attr("cy", (d) => sy(y(d)));
  }

  //expose functions and attribute
  res.update_position = update_position;
  res.update_style = update_style;
  res.update_style1 = update_style1;
  res.scales = { sx, sy, sc };
  res.x = x;
  res.y = y;
  res.r = r;
  res.ax = bg.ax;
  res.ay = bg.ay;
  res.gx = bg.gx;
  res.gy = bg.gy;

  res.fg = fg;
  res.bg = bg;

  res.points = points;
  res.styles = {
    stroke_width,
    background,
    plot_width: width,
    plot_height: height,
    padding_left: padding_left,
    padding_right: padding_right,
    padding_top: padding_top,
    padding_bottom: padding_bottom,
  };
  return res;
}

export function frame(
  sel = undefined,
  data = undefined,
  {
    x_label_offset = 24,
    y_label_offset = -10,
    background = "#eee",
    xticks = 4,
    yticks = 4,
    x_tickvalues = undefined,
    y_tickvalues = undefined,
    x = (d) => d.x,
    y = (d) => d.y,
    scales = {},
    width = 200,
    height = 200,
    padding_bottom = 18,
    padding_left = 40,
    padding_right = 0,
    padding_top = 0,
    pad = 0.1,
    s = (d) => 10, //marker size
    return_obj = "g",
    title = undefined,
    font_family = "sans-serif",
    font_size = 14,
    is_square_scale = true,
    is_log_scale = false,
    xlabel = undefined,
    ylabel = undefined,
    label_fontsize = 10,
    stroke = "#fff",
    stroke_width = 0.2,
  } = {}
) {
  if (sel === undefined) {
    sel = create_svg(width, height);
  }
  let ex = data !== undefined ? d3.extent(data, (d) => x(d)) : [0, 1];
  let ey = data !== undefined ? d3.extent(data, (d) => y(d)) : [0, 1];
  if (x_tickvalues !== undefined) {
    ex[0] = Math.min(ex[0], d3.min(x_tickvalues));
    ex[1] = Math.max(ex[1], d3.max(x_tickvalues));
  }
  if (y_tickvalues !== undefined) {
    ey[0] = Math.min(ey[0], d3.min(y_tickvalues));
    ey[1] = Math.max(ey[1], d3.max(y_tickvalues));
  }
  ex = [ex[0] - (ex[1] - ex[0]) * pad, ex[1] + (ex[1] - ex[0]) * pad];
  ey = [ey[0] - (ey[1] - ey[0]) * pad, ey[1] + (ey[1] - ey[0]) * pad];
  let rx = [padding_left, width - padding_right];
  let ry = [height - padding_bottom, padding_top];
  let sx, sy;
  if (is_square_scale) {
    let [sx0, sy0] = square_scale(ex, ey, rx, ry);
    sx = scales.sx || sx0;
    sy = scales.sy || sy0;
  } else {
    sx = is_log_scale ? d3.scaleLog() : d3.scaleLinear();
    sy = is_log_scale ? d3.scaleLog() : d3.scaleLinear();
    sx = scales.sx || sx.domain(ex).range(rx);
    sy = scales.sy || sy.domain(ey).range(ry);
  }

  let main = sel.append("g").attr("class", "frame");
  //bg
  main
    .selectAll(".bg-rect")
    .data([0])
    .join("rect")
    .attr("class", "bg-rect")
    .attr("x", padding_left)
    .attr("y", padding_top)
    .attr("width", width - padding_left - padding_right)
    .attr("height", height - padding_top - padding_bottom)
    .attr("fill", background);
  let g_axes = main.append("g").attr("class", "axes");
  let g_labels = main.append("g").attr("class", "labels");

  // Axes
  let ax = d3
    .axisBottom(sx)
    .ticks(xticks)
    .tickSizeInner(-(height - padding_bottom - padding_top));
  if (x_tickvalues !== undefined) {
    ax.tickValues(x_tickvalues);
  }
  let gx = g_axes
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - padding_bottom})`)
    .call(ax);
  gx.selectAll("text").style("font-size", `${label_fontsize}px`);

  let ay = d3
    .axisLeft(sy)
    .ticks(yticks)
    .tickSizeInner(-(width - padding_left - padding_right));
  if (y_tickvalues !== undefined) {
    ay.tickValues(y_tickvalues);
  }
  let gy = g_axes
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${padding_left},0)`)
    .call(ay);
  gy.selectAll("text").style("font-size", `${label_fontsize}px`);

  sel
    .selectAll(".tick > line")
    .style("stroke", stroke || d3.color(background).brighter());
  sel.selectAll("path.domain").style("display", "none");

  if (title) {
    g_labels
      .selectAll(".title")
      .data([title])
      .join("text")
      .attr("class", "title")
      .attr(
        "transform",
        `translate(${
          padding_left + (width - padding_right - padding_left) / 2
        },${padding_top - 2})`
      )
      .attr("alignment-baseline", "top")
      .attr("text-anchor", "middle")
      .style("font-size", `${font_size}px`)
      .style("font-family", font_family)
      .text((d) => d);
  }

  if (xlabel !== undefined) {
    g_labels
      .selectAll(".xlabel")
      .data([xlabel])
      .join("text")
      .attr("class", "xlabel")
      .attr(
        "transform",
        `translate(${d3.mean(sx.range())},${
          height - padding_bottom - 2 + x_label_offset
        })`
      )
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .style("font-size", `${label_fontsize}px`)
      .text((d) => d);
  }
  if (ylabel !== undefined) {
    g_labels
      .selectAll(".ylabel")
      .data([ylabel])
      .join("text")
      .attr("class", "ylabel")
      .attr(
        "transform",
        `translate(${padding_left + 2 + y_label_offset},${d3.mean(
          sy.range()
        )}) rotate(90)`
      )
      .attr("alignment-baseline", "bottom")
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .style("font-size", `${label_fontsize}px`)
      .text((d) => d);
  }

  let res = sel;
  res.scales = { sx, sy };
  res.x = x;
  res.y = y;
  res.ax = ax;
  res.ay = ay;
  res.gx = gx;
  res.gy = gy;

  res.styles = {
    plot_width: width,
    plot_height: height,
    padding_left: padding_left,
    padding_right: padding_right,
    padding_top: padding_top,
    padding_bottom: padding_bottom,
  };
  return res;
}

export function square_scale(x_extent, y_extent, width_extent, height_extent) {
  //centers
  let cx = (x_extent[0] + x_extent[1]) / 2;
  let cy = (y_extent[0] + y_extent[1]) / 2;
  let cw = (width_extent[0] + width_extent[1]) / 2;
  let ch = (height_extent[0] + height_extent[1]) / 2;

  //radii/range
  let rx = (x_extent[1] - x_extent[0]) / 2;
  let ry = (y_extent[1] - y_extent[0]) / 2;
  let rw = (width_extent[1] - width_extent[0]) / 2;
  let rh = (height_extent[1] - height_extent[0]) / 2;
  let sx, sy;
  if (Math.abs(rw / rh) > rx / ry) {
    sy = d3
      .scaleLinear()
      .domain([cy - ry, cy + ry])
      .range([ch - rh, ch + rh]);
    sx = d3
      .scaleLinear()
      .domain([cx - ry, cx + ry])
      .range([
        cw - Math.abs(rh) * Math.sign(rw),
        cw + Math.abs(rh) * Math.sign(rw),
      ]);
  } else {
    sx = d3
      .scaleLinear()
      .domain([cx - rx, cx + rx])
      .range([cw - rw, cw + rw]);
    sy = d3
      .scaleLinear()
      .domain([cy - rx, cy + rx])
      .range([
        ch - Math.abs(rw) * Math.sign(rh),
        ch + Math.abs(rw) * Math.sign(rh),
      ]);
  }
  return [sx, sy];
}

export function cumulative_sum(arr) {
  const cumulativeArr = [];
  let currentSum = 0;
  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];
    cumulativeArr.push(currentSum);
  }
  return cumulativeArr;
}
