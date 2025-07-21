import * as d3 from "d3";

import {splom_gl2, C, cumulative_sum} from "./vis.js";

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
    let ui_height = ui_width * 0.5;

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
        col_attrs: category2.slice(0, 10),
        row_attrs: category4.slice(0, 6),

        // kde_filters: [(d) => Math.random() > 0.5, (d) => Math.random() > 0.5],
        // x_tickvalues: linspace(0,1,4),
        // ticks: 10,
        // wspace: 0.0,
        // hspace: 0.0,
        // scales: { sc: (d) => C[1] },
        // stroke: "#fff",
        // stroke_width: 1.0
    });

    //shift splom to the right
    console.log("splom", splom.subplots);

    //add bottom sliders
    //add side sliders
    //
    // splom.dimensions["Al"].filter([0, 10]);
    // splom.highlight_brushed(
    //     splom.data,
    //     // splom.subplots[0][0].scales.sc,
    //     (d) => C[1],
    //     splom.cross,
    //     splom.subplots,
    //     splom.row_attrs,
    //     splom.col_attrs,
    // );
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

function draw_bottom_sliders(svg, splom_node) {
    // grab subplot sx's

    let splom_subplots = splom_node.subplots;
    let n_cols = splom_subplots[0].length;

    // console.log(splom_subplots);

    // x scales
    let sxs = splom_subplots[0].map((subplot) => subplot.scales.sx);
    let x_offsets = cumulative_sum([
        0,
        ...splom_subplots[0].map((subplot) => subplot.plot_width),
    ]);

    //slider grey bg lines
    let sliders_bg = svg
        .selectAll("line.bg")
        .data(d3.range(n_cols))
        .join("line")
        .attr("class", "bg")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 10)
        .attr("x1", (i) => x_offsets[i] + sxs[i].range()[0])
        .attr("x2", (i) => x_offsets[i] + sxs[i].range()[1])
        .attr("y1", 10)
        .attr("y2", 10);

    let sliders_fg = svg
        .selectAll("line.fg")
        .data(d3.range(n_cols))
        .join("line")
        .attr("class", "fg")
        .attr("stroke", C[0])
        .attr("stroke-width", 6)
        .attr("x1", (i) => x_offsets[i] + sxs[i].range()[0])
        .attr("x2", (i) => x_offsets[i] + sxs[i].range()[1])
        .attr("y1", 10)
        .attr("y2", 10);

    console.log(sliders_bg);

    let sliders_controls_min; //circles
    let sliders_controls_max; //circles

    //setup callbacks to scatterplots (crossfilter and brushes display)
}

function draw_side_sliders() {}
export default {render};
