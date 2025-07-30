import * as d3 from "d3";

import {splom_gl2, C, cumulative_sum, clip} from "./vis.js";

function style_control(sel, control_size) {
    // stylize control circles
    sel.attr("fill", C[0])
        .attr("stroke", "white")
        .attr("stroke-width", control_size / 10)
        .attr("r", control_size / 2);
}

function render({model, el}) {
    console.log("model", model);
    console.log("el", el);
    // let button = document.createElement("button");
    // button.innerHTML = `count is ${model.get("value")}`;
    // button.addEventListener("click", () => {
    //     model.set("value", model.get("value") + 1);
    //     model.save_changes();
    // });
    // model.on("change:value", () => {
    //     button.innerHTML = `count is ${model.get("value")}`;
    //     console.log("button", Math.random());
    // });
    // el.classList.add("counter-widget");
    // el.appendChild(button);

    //data
    let data = model.get("data")["data"];
    let col_attrs = model.get("col_attrs");
    let row_attrs = model.get("row_attrs");

    //UI dimensions
    let side_bar_width = 90;
    let bottom_bar_height = 90;
    let subplot_width = model.get("subplot_width") || 200;
    let subplot_height = model.get("subplot_height") || 200;

    let ui_width =
        model.get("width") ||
        Math.min(
            subplot_width * col_attrs.length + side_bar_width,
            el.getBoundingClientRect().width,
        );
    let ui_height =
        model.get("height") ||
        Math.min(
            subplot_height * row_attrs.length + bottom_bar_height,
            ui_width * 0.618,
        );

    let splom_container_width = ui_width - side_bar_width;
    let splom_container_height = ui_height - bottom_bar_height;
    let splom_width = col_attrs.length * subplot_width;
    let splom_height = row_attrs.length * subplot_height;

    //UI start
    // <div (el)>
    //   <div class="root-div ui-container">
    //     <div class="splom-container"> SPLOM things </div>
    //     <svg class="side-slider"> </svg>
    //     <svg class="bottom-slider"> </svg>
    //   </div>
    // </div>
    //
    d3.select(el)
        .style("width", `${ui_width}px`)
        .style("height", `${ui_height}px`);

    let root_div = d3
        .create("div")
        .attr("class", "root-div ui-container")
        .style("position", "relative")
        .style("width", `${ui_width}px`)
        .style("height", `${ui_height}px`)
        .style("overflow", "scroll");

    let splom_container = root_div
        .append("div")
        .attr("class", "splom-container")
        .style("position", "absolute")
        .style("top", `${0}px`)
        .style("left", `${side_bar_width}px`);

    let splom = splom_gl2(splom_container, data, {
        layout: "both", //'upper', 'lower', or 'both',
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
        col_attrs: col_attrs,
        row_attrs: row_attrs,

        xticks: 3,
        yticks: 3,

        show_tick_texts: false,
        show_axis_label: false,

        // scales: { sc: (d) => C[1] },
        // stroke: "#fff",
        // stroke_width: 1.0
    });

    //add side sliders
    let side_sliders = root_div
        .append("svg")
        .attr("class", "side-slider")
        .attr("width", side_bar_width)
        .attr("height", splom_height)
        // .style("background", "white")
        // .style("border", "0.1px solid red") // debugging
        .style("position", "sticky")
        .style("left", `${0}px`)
        .style("z-index", 1)
        .call(draw_side_sliders, splom);

    //add bottom sliders
    let bottom_sliders = root_div
        .append("svg")
        .attr("class", "bottom-slider")
        .attr("width", splom_width + side_bar_width)
        .attr("height", bottom_bar_height)
        // .style("background", "white")
        // .style("border", "0.1px solid blue") // debugging
        .style("position", "sticky")
        // .style("left", `${side_bar_width}px`)
        .style("left", `${0}px`)
        .style("bottom", `${0}px`)
        .style("z-index", 2)
        .append("g")
        .attr("transform", `translate(${side_bar_width}, 0)`)
        .call(draw_bottom_sliders, splom);

    el.appendChild(root_div.node());
}

function draw_bottom_sliders(svg, splom) {
    //data
    let splom_subplots = splom.subplots;
    let n_cols = splom_subplots[0].length;

    //style
    let control_size = 12;
    let y_offset = 30;

    // x scales of the slider follows the scale of SPLOM subplots
    let x_offsets = cumulative_sum([
        0,
        ...splom_subplots[0].map((subplot) => subplot.plot_width),
    ]);
    let sxs = splom_subplots[0].map((subplot, j) => subplot.scales.sx);

    let g_sliders = svg
        .selectAll("g.bottom-slider")
        .data(d3.range(n_cols))
        .join("g")
        .attr("class", "bottom-slider")
        .attr("transform", (i) => `translate(${x_offsets[i]}, ${0})`);

    //slider grey bg lines
    let sliders_bg = g_sliders
        .append("line")
        .attr("class", "slider-bg")
        .attr("stroke", "#aaa")
        .attr("stroke-width", control_size * 0.6)
        .attr("x1", (i) => sxs[i].range()[0])
        .attr("x2", (i) => sxs[i].range()[1])
        .attr("y1", y_offset)
        .attr("y2", y_offset);

    let sliders_fg = g_sliders
        .append("line")
        .attr("class", "bottom-slider-fg")
        .attr("stroke", C[0])
        .attr("stroke-width", control_size * 0.6)
        .attr("x1", (i) => sxs[i].range()[0])
        .attr("x2", (i) => sxs[i].range()[1])
        .attr("y1", y_offset)
        .attr("y2", y_offset);

    let slider_axes = g_sliders
        .append("g")
        .attr("class", "slider-axis")
        .attr("transform", `translate(${0},${y_offset + control_size / 2})`)
        .style("z-index", 2)
        .each(function (j) {
            //follows the number of ticks on splom
            let ticks = splom.subplots[0][j].frame.xticks;
            let ax = d3
                .axisBottom(sxs[j])
                .ticks(ticks)
                .tickFormat(d3.format(".3s"))
                .tickSizeInner(-control_size);
            let axis = d3.select(this).call(ax);
            axis.selectAll("path.domain").remove();
            axis.selectAll("g.tick line").attr("stroke", "#eee");
            //rotate tick text
            // axis.selectAll("g.tick text").attr("transform", "rotate(15 -10 0)");
        });

    let slider_labels = g_sliders
        .append("text")
        .attr("x", (j) => {
            return d3.mean(sxs[j].range());
        })
        .attr("y", y_offset - 12)
        .style("text-anchor", "middle")
        .text((j) => splom.col_attrs[j]);

    let control_min = g_sliders
        .append("circle")
        .attr("class", "slider-control-min")
        .attr("cx", (i) => sxs[i].range()[0])
        .attr("cy", y_offset)
        .call(style_control, control_size);

    let control_max = g_sliders
        .append("circle")
        .attr("class", "slider-control-max")
        .attr("cx", (i) => sxs[i].range()[1])
        .attr("cy", y_offset)
        .call(style_control, control_size);

    //interactions
    function set_x_filter_bounds(j, lower, upper, sx, splom) {
        // update control
        d3.select(control_min.nodes()[j]).attr("cx", sx(lower));
        d3.select(control_max.nodes()[j]).attr("cx", sx(upper));
        d3.select(sliders_fg.nodes()[j])
            .attr("x1", sx(lower))
            .attr("x2", sx(upper));
        // update splom subplots
        let dim = splom.dimensions[splom.col_attrs[j]];
        let currentFilter = dim.currentFilter();
        dim.filter([lower, upper]);
        splom.highlight_brushed_2(
            splom.data,
            splom.subplots[0][0].scales.sc,
            splom.cross,
            splom.subplots,
            splom.row_attrs,
            splom.col_attrs,
        );
    }

    control_min.call(
        d3.drag().on("drag", function (event) {
            let j = d3.select(this).datum();
            let sx = sxs[j];
            let domain = sx.domain();
            let x = sx.invert(event.x);
            let x_upper = sx.invert(
                +d3.select(control_max.nodes()[j]).attr("cx"),
            );
            //bound x value between x scale's range min and upper bound of the current slider;
            let x_lower = clip(
                x,
                domain[0],
                x_upper - (domain[1] - domain[0]) * 0.05,
            );
            set_x_filter_bounds(j, x_lower, x_upper, sx, splom);
        }),
    );

    control_max.call(
        d3.drag().on("drag", function (event) {
            let j = d3.select(this).datum();
            let sx = sxs[j];
            let domain = sx.domain();
            let x = sx.invert(event.x);
            let x_lower = sx.invert(
                +d3.select(control_min.nodes()[j]).attr("cx"),
            );
            let x_upper = clip(
                x,
                x_lower + (domain[1] - domain[0]) * 0.05,
                domain[1],
            );
            set_x_filter_bounds(j, x_lower, x_upper, sx, splom);
        }),
    );

    //single and double click
    function snap_x_bounds(this_node, x, current_x1, current_x2) {
        let j = d3.select(this_node).datum();
        let sx = sxs[j];
        let new_x1 = current_x1;
        let new_x2 = current_x2;
        if (Math.abs(x - current_x1) < Math.abs(x - current_x2)) {
            new_x1 = x;
        } else {
            new_x2 = x;
        }
        // update slider fg and splom
        set_x_filter_bounds(j, new_x1, new_x2, sx, splom);
    }

    let timeout = null; //to distinguish single and double click on the slider bar

    sliders_fg.on("click", function (event) {
        // single click to snap min/max to the click
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            let me = d3.select(this);
            let j = me.datum();
            let sx = sxs[j];
            let x1 = sx.invert(+me.attr("x1"));
            let x2 = sx.invert(+me.attr("x2"));
            let x = sx.invert(event.layerX);
            snap_x_bounds(this, x, x1, x2);
        }, 300); //  the delay (in milliseconds) for single click
    });

    sliders_bg.on("click", function (event) {
        // single click to snap min/max to the click
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            let j = d3.select(this).datum();
            let sx = sxs[j];
            let fg = d3.select(sliders_fg.nodes()[j]);
            let x1 = sx.invert(+fg.attr("x1"));
            let x2 = sx.invert(+fg.attr("x2"));
            let x = sx.invert(event.layerX);
            snap_x_bounds(this, x, x1, x2);
        }, 300); //  the delay (in milliseconds) for single click
    });

    function reset_x_bounds(this_node) {
        //get the x scale (sx)
        let j = d3.select(this_node).datum();
        let sx = sxs[j];
        let new_x1 = sx.domain()[0];
        let new_x2 = sx.domain()[1];
        set_x_filter_bounds(j, new_x1, new_x2, sx, splom);
    }

    sliders_fg.on("dblclick", function (event) {
        //double click to reset slider min & max
        clearTimeout(timeout); // Clear the single-click timeout
        reset_x_bounds(this);
    });

    sliders_bg.on("dblclick", function (event) {
        //double click to reset slider min & max
        clearTimeout(timeout); // Clear the single-click timeout
        reset_x_bounds(this);
    });

    sliders_fg.call(
        d3.drag().on("drag", function (event) {
            let j = d3.select(this).datum();
            let sx = sxs[j];
            let dx = sx.invert(event.dx) - sx.invert(0);
            //get current bounding values
            let me = d3.select(this);
            let x1 = sx.invert(+me.attr("x1"));
            let x2 = sx.invert(+me.attr("x2"));
            let domain = sx.domain();
            //bound dx value by the available space on both sides
            dx = clip(dx, domain[0] - x1, domain[1] - x2);
            // update slider fg
            let new_x1 = x1 + dx;
            let new_x2 = x2 + dx;
            set_x_filter_bounds(j, new_x1, new_x2, sx, splom);
        }),
    );

    // todo tooltip
    //
}

function draw_side_sliders(svg, splom) {
    //data
    let splom_subplots = splom.subplots;
    let n_rows = splom_subplots.length;

    ////style
    let control_size = 12;
    let x_offset = 60;

    // y scales of the slider follows the scale of SPLOM subplots
    let y_offsets = cumulative_sum([
        ...splom_subplots.map((row_subplots) => row_subplots[0].plot_height),
    ]);
    let sys = splom_subplots.map((row_subplots) => row_subplots[0].scales.sy);
    let total_height = y_offsets[y_offsets.length - 1];

    let g_sliders = svg
        .selectAll("g.side_slider")
        .data(d3.range(n_rows))
        .join("g")
        .attr("class", "side-slider")
        .attr(
            "transform",
            (i) => `translate(${0}, ${total_height - y_offsets[i]})`,
        );

    //slider grey bg lines
    let sliders_bg = g_sliders
        .append("line")
        .attr("class", "slider-bg")
        .attr("stroke", "#aaa")
        .attr("stroke-width", control_size * 0.6)
        .attr("y1", (i) => sys[i](sys[i].domain()[0]))
        .attr("y2", (i) => sys[i](sys[i].domain()[1]))
        .attr("x1", x_offset)
        .attr("x2", x_offset);

    let sliders_fg = g_sliders
        .append("line")
        .attr("class", "side-slider-fg")
        .attr("stroke", C[0])
        .attr("stroke-width", control_size * 0.6)
        .attr("y1", (i) => sys[i](sys[i].domain()[0]))
        .attr("y2", (i) => sys[i](sys[i].domain()[1]))
        .attr("x1", x_offset)
        .attr("x2", x_offset);

    let control_min = g_sliders
        .append("circle")
        .attr("class", "slider-control-min")
        .attr("cx", x_offset)
        .attr("cy", (i) => sys[i](sys[i].domain()[0]))
        .call(style_control, control_size);

    let control_max = g_sliders
        .append("circle")
        .attr("class", "slider-control-max")
        .attr("cx", x_offset)
        .attr("cy", (i) => sys[i](sys[i].domain()[1]))
        .call(style_control, control_size);

    let slider_axes = g_sliders
        .append("g")
        .attr("class", "slider-axis")
        .attr("transform", `translate(${x_offset - control_size / 2}, 0)`)
        .style("z-index", 2)
        .each(function (i) {
            //follows the number of ticks on splom
            let ticks = splom.subplots[i][0].frame.yticks;
            let ay = d3
                .axisLeft(sys[i])
                .ticks(ticks)
                // .tickFormat(d3.format(".3s"))
                .tickSizeInner(-control_size);
            let axis = d3.select(this).call(ay);
            axis.selectAll("path.domain").remove();
            axis.selectAll("g.tick line").attr("stroke", "#eee");
        });

    let slider_labels = g_sliders
        .append("text")
        .attr("y", (i) => {
            return d3.mean(sys[i].range());
        })
        .attr("x", x_offset + 20)
        .attr(
            "transform",
            (i) => `rotate(-90 ${x_offset + 20} ${d3.mean(sys[i].range())})`,
        )
        .style("text-anchor", "middle")
        .text((i) => splom.row_attrs[i]);

    //interactions
    function set_y_filter_bounds(i, lower, upper, sy, splom) {
        // inputs (lower, upper, sy) are in data domain scale
        // update control
        d3.select(control_min.nodes()[i]).attr("cy", sy(lower));
        d3.select(control_max.nodes()[i]).attr("cy", sy(upper));
        d3.select(sliders_fg.nodes()[i])
            .attr("y1", sy(lower))
            .attr("y2", sy(upper));
        // update splom subplots
        let dim = splom.dimensions[splom.row_attrs[i]];
        let currentFilter = dim.currentFilter();
        dim.filter([lower, upper]);
        splom.highlight_brushed_2(
            splom.data,
            splom.subplots[0][0].scales.sc,
            splom.cross,
            splom.subplots,
            splom.row_attrs,
            splom.col_attrs,
        );
    }

    control_min.call(
        d3.drag().on("drag", function (event) {
            let i = d3.select(this).datum();
            let sy = sys[i];
            let domain = sy.domain();
            let y = sy.invert(event.y);
            let y_upper = sy.invert(
                +d3.select(control_max.nodes()[i]).attr("cy"),
            );
            let y_lower = clip(
                y,
                domain[0],
                y_upper - (domain[1] - domain[0]) * 0.05,
            );
            set_y_filter_bounds(i, y_lower, y_upper, sy, splom);
        }),
    );

    control_max.call(
        d3.drag().on("drag", function (event) {
            let i = d3.select(this).datum();
            let sy = sys[i];
            let domain = sy.domain();
            let y = sy.invert(event.y);
            let y_lower = sy.invert(
                +d3.select(control_min.nodes()[i]).attr("cy"),
            );
            let y_upper = clip(
                y,
                y_lower + (domain[1] - domain[0]) * 0.05,
                domain[1],
            );
            set_y_filter_bounds(i, y_lower, y_upper, sy, splom);
        }),
    );

    //single and double click
    function snap_y_bounds(this_node, y, current_y1, current_y2) {
        //snap either lower or upper bound
        //--- whichever closer to the current click ---
        // to the current click
        //inputs y, current_y1, current_y2 are in data domain scale
        let i = d3.select(this_node).datum();
        let sy = sys[i];
        let new_y1 = current_y1;
        let new_y2 = current_y2;
        if (Math.abs(y - current_y1) < Math.abs(y - current_y2)) {
            new_y1 = y;
        } else {
            new_y2 = y;
        }
        // update slider fg and splom
        set_y_filter_bounds(i, new_y1, new_y2, sy, splom);
    }

    let timeout = null; //to distinguish single and double click on the slider bar

    sliders_fg.on("click", function (event) {
        // single click to snap min/max to the click
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            let me = d3.select(this);
            let i = me.datum();
            let sy = sys[i];
            let y1 = sy.invert(+me.attr("y1"));
            let y2 = sy.invert(+me.attr("y2"));
            let y = sy.invert(event.layerY);
            snap_y_bounds(this, y, y1, y2);
        }, 300); //  the delay (in milliseconds) for single click
    });

    sliders_bg.on("click", function (event) {
        // single click to snap min/max to the click
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            let i = d3.select(this).datum();
            let sy = sys[i];
            let fg = d3.select(sliders_fg.nodes()[i]);
            let y1 = sy.invert(+fg.attr("y1"));
            let y2 = sy.invert(+fg.attr("y2"));
            let y = sy.invert(event.layerY);
            snap_y_bounds(this, y, y1, y2);
        }, 300); //  the delay (in milliseconds) for single click
    });

    function reset_y_bounds(this_node) {
        //get the x scale (sx)
        let i = d3.select(this_node).datum();
        let sy = sys[i];
        let new_y1 = sy.domain()[0];
        let new_y2 = sy.domain()[1];
        set_y_filter_bounds(i, new_y1, new_y2, sy, splom);
    }

    sliders_fg.on("dblclick", function (event) {
        //double click to reset slider min & max
        clearTimeout(timeout); // Clear the single-click timeout
        reset_y_bounds(this);
    });

    sliders_bg.on("dblclick", function (event) {
        //double click to reset slider min & max
        clearTimeout(timeout); // Clear the single-click timeout
        reset_y_bounds(this);
    });

    sliders_fg.call(
        d3.drag().on("drag", function (event) {
            let i = d3.select(this).datum();
            let sy = sys[i];
            let dy = sy.invert(event.dy) - sy.invert(0);
            //get current bounding values
            let me = d3.select(this);
            let y1 = sy.invert(+me.attr("y1"));
            let y2 = sy.invert(+me.attr("y2"));
            let domain = sy.domain();
            //bound dx value by the available space on both sides
            dy = clip(dy, domain[0] - y1, domain[1] - y2);
            // update slider fg
            let new_y1 = y1 + dy;
            let new_y2 = y2 + dy;
            set_y_filter_bounds(i, new_y1, new_y2, sy, splom);
        }),
    );
}

export default {render};
