import * as d3 from "d3";

import {splom_gl2, C, cumulative_sum, clip} from "./vis.js";

function render({model, el}) {
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

    console.log("render() start");

    //data
    let data = model.get("data")["data"];
    let category1 = Object.keys(data[0]).slice(0, 6);
    let category2 = Object.keys(data[0]).slice(6, 18);
    let category3 = Object.keys(data[0]).slice(18, 18 + 38);
    let category4 = Object.keys(data[0]).slice(56);

    //UI dimensions
    let ui_width = el.getBoundingClientRect().width;
    let ui_height = ui_width * 0.6;
    d3.select(el)
        .style("width", `${ui_width}px`)
        .style("height", `${ui_height}px`);

    let side_bar_width = 30;
    let bottom_bar_height = 30;
    let splom_width = ui_width - side_bar_width;
    let splom_height = ui_height - bottom_bar_height;

    //UI start
    let root_div = d3
        .create("div")
        .attr("class", "root-div ui-container")
        .style("position", "relative")
        .style("width", `${ui_width}px`)
        .style("height", `${ui_height}px`);
    // .style("background-color", "#eef");

    let splom_container = root_div
        .append("div")
        .attr("class", "splom-container")
        .style("width", `${splom_width}px`)
        .style("height", `${splom_height}px`)
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
        // subplot_padding_left: 0,
        subplot_padding_right: 0,
        // subplot_padding_bottom: 0,
        subplot_padding_top: 0,

        s: (_) => 4,
        col_attrs: category2.slice(0, 5),
        row_attrs: category4.slice(0, 4),

        // kde_filters: [(d) => Math.random() > 0.5, (d) => Math.random() > 0.5],
        // x_tickvalues: linspace(0,1,4),
        // ticks: 10,
        // wspace: 0.0,
        // hspace: 0.0,
        // scales: { sc: (d) => C[1] },
        // stroke: "#fff",
        // stroke_width: 1.0
    });

    //add bottom sliders
    let bottom_sliders = root_div
        .append("svg")
        .attr("class", "bottom-sliders")
        .attr("width", splom_width)
        .attr("height", bottom_bar_height)
        .style("background", "#efe") //bg for layout debugging
        .style("position", "absolute")
        .style("left", `${bottom_bar_height}px`)
        .style("top", `${splom_height}px`)
        .call(draw_bottom_sliders, splom);

    //add side sliders
    let side_sliders = root_div
        .append("svg")
        .attr("class", "side-sliders")
        .attr("width", side_bar_width)
        .attr("height", splom_height)
        .style("background", "#efe") //bg for layout debugging
        .style("position", "absolute")
        .style("left", `${0}px`)
        .style("top", `${0}px`)
        .call(draw_side_sliders, splom);
    el.appendChild(root_div.node());
}

function draw_bottom_sliders(svg, splom) {
    // grab subplot sx's
    //data
    let splom_subplots = splom.subplots;
    let n_cols = splom_subplots[0].length;

    //style
    let control_size = 12;
    let y_offset = 10;

    // x scales of the slider follows the scale of SPLOM subplots
    let x_offsets = cumulative_sum([
        0,
        ...splom_subplots[0].map((subplot) => subplot.plot_width),
    ]);
    let sxs = splom_subplots[0].map((subplot, j) => {
        let sx0 = subplot.scales.sx;
        let range0 = sx0.range();
        return d3
            .scaleLinear()
            .domain(sx0.domain())
            .range([range0[0] + x_offsets[j], range0[1] + x_offsets[j]]);
    });

    //slider grey bg lines
    let sliders_bg = svg
        .selectAll("line.slider_bg")
        .data(d3.range(n_cols))
        .join("line")
        .attr("class", "slider_bg")
        .attr("stroke", "#aaa")
        .attr("stroke-width", control_size * 0.6)
        .attr("x1", (i) => sxs[i].range()[0])
        .attr("x2", (i) => sxs[i].range()[1])
        .attr("y1", y_offset)
        .attr("y2", y_offset);

    let sliders_fg = svg
        .selectAll("line.slider_fg")
        .data(d3.range(n_cols))
        .join("line")
        .attr("class", "slider_fg")
        .attr("stroke", C[0])
        .attr("stroke-width", control_size * 0.6)
        .attr("x1", (i) => sxs[i].range()[0])
        .attr("x2", (i) => sxs[i].range()[1])
        .attr("y1", y_offset)
        .attr("y2", y_offset);

    // control circles
    function style_control(sel) {
        sel.attr("fill", C[0])
            .attr("stroke", "white")
            .attr("stroke-width", control_size / 10)
            .attr("r", control_size / 2);
    }
    let control_min = svg
        .selectAll("circle.slider_control_min")
        .data(d3.range(n_cols))
        .join("circle")
        .attr("class", "slider_control_min")
        .attr("cx", (i) => sxs[i].range()[0])
        .attr("cy", 10)
        .call(style_control);

    let control_max = svg
        .selectAll("circle.slider_control_max")
        .data(d3.range(n_cols))
        .join("circle")
        .attr("class", "slider_control_max")
        .attr("cx", (i) => sxs[i].range()[1])
        .attr("cy", 10)
        .call(style_control);

    control_min.call(
        d3.drag().on("drag", function (event) {
            let j = d3.select(this).datum();
            let sx = sxs[j];
            let x = event.x;
            let range = sx.range();
            let upper = +d3.select(control_max.nodes()[j]).attr("cx");
            //bound x value between x scale's range min and upper bound of the current slider;
            x = clip(x, range[0], upper - (range[1] - range[0]) * 0.05);

            // update control
            d3.select(this).attr("cx", x);
            // update slider fg
            d3.select(sliders_fg.nodes()[j]).attr("x1", x);
            // update splom subplots
            let dim = splom.dimensions[splom.col_attrs[j]];
            let currentFilter = dim.currentFilter();
            if (currentFilter !== undefined) {
                dim.filter([sx.invert(x), dim.currentFilter()[1]]);
            } else {
                dim.filter([sx.invert(x), sx.domain()[1]]);
            }
            splom.highlight_brushed(
                splom.data,
                splom.subplots[0][0].scales.sc,
                splom.cross,
                splom.subplots,
                splom.row_attrs,
                splom.col_attrs,
            );
        }),
    );

    control_max.call(
        d3.drag().on("drag", function (event) {
            let j = d3.select(this).datum();
            let sx = sxs[j];
            let x = event.x;

            let range = sx.range();
            let lower = +d3.select(control_min.nodes()[j]).attr("cx");
            x = clip(x, lower + (range[1] - range[0]) * 0.05, range[1]);

            // update control
            d3.select(this).attr("cx", x);
            // update slider fg
            d3.select(sliders_fg.nodes()[j]).attr("x2", x);
            // update splom subplots
            let dim = splom.dimensions[splom.col_attrs[j]];
            let currentFilter = dim.currentFilter();
            if (currentFilter !== undefined) {
                dim.filter([currentFilter[0], sx.invert(x)]);
            } else {
                dim.filter([sx.domain()[0], sx.invert(x)]);
            }
            splom.highlight_brushed(
                splom.data,
                splom.subplots[0][0].scales.sc,
                splom.cross,
                splom.subplots,
                splom.row_attrs,
                splom.col_attrs,
            );
        }),
    );

    sliders_fg.on("click", function (event) {
        console.log("click");
    });
    sliders_fg.on("dblclick", function (event) {
        console.log("dblclick");
        //get the x scale (sx)
        let j = d3.select(this).datum();
        let sx = sxs[j];

        // update slider fg
        let new_x1 = sx.range()[0];
        let new_x2 = sx.range()[1];
        let me = d3.select(this).attr("x1", new_x1).attr("x2", new_x2);
        // update control
        d3.select(control_min.nodes()[j]).attr("cx", new_x1);
        d3.select(control_max.nodes()[j]).attr("cx", new_x2);

        // update splom subplots
        let dim = splom.dimensions[splom.col_attrs[j]];
        dim.filter([sx.invert(new_x1), sx.invert(new_x2)]);
        // console.log("new filter", sx.invert(new_x1), sx.invert(new_x2));
        splom.highlight_brushed(
            splom.data,
            splom.subplots[0][0].scales.sc,
            splom.cross,
            splom.subplots,
            splom.row_attrs,
            splom.col_attrs,
        );
    });
    sliders_fg.call(
        d3.drag().on("drag", function (event) {
            let dx = event.dx;

            //get the x scale (sx)
            let j = d3.select(this).datum();
            let sx = sxs[j];

            //get current bounding values
            let me = d3.select(this);
            let x1 = +me.attr("x1");
            let x2 = +me.attr("x2");
            let range = sx.range();

            //bound dx value by the available space on both sides
            dx = clip(dx, range[0] - x1, range[1] - x2);

            // update slider fg
            let new_x1 = x1 + dx;
            let new_x2 = x2 + dx;
            me.attr("x1", new_x1).attr("x2", new_x2);
            // update control
            d3.select(control_min.nodes()[j]).attr("cx", new_x1);
            d3.select(control_max.nodes()[j]).attr("cx", new_x2);

            // update splom subplots
            let dim = splom.dimensions[splom.col_attrs[j]];
            dim.filter([sx.invert(new_x1), sx.invert(new_x2)]);
            // console.log("new filter", sx.invert(new_x1), sx.invert(new_x2));
            splom.highlight_brushed(
                splom.data,
                splom.subplots[0][0].scales.sc,
                splom.cross,
                splom.subplots,
                splom.row_attrs,
                splom.col_attrs,
            );
        }),
    );
    //
    // todo tooltip
}

function draw_side_sliders() {}
export default {render};
