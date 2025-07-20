import * as d3 from "d3";

import {splom_gl2} from "./vis.js";

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
    let width = el.getBoundingClientRect().width;
    let height = 600;

    //UI start
    let div = d3
        .create("div")
        .attr("class", "mywidget-container")
        .style("width", `${width}px`)
        .style("height", `${height}px`);

    let splom = splom_gl2(div, data, {
        layout: "both", //'upper', 'lower', or 'both',
        histogram: true,
        width: width,
        height: height,
        padding_left: 10,
        padding_right: 0,
        padding_bottom: 10,
        padding_top: 0,

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
    console.log(splom);
    el.appendChild(splom);
}

export default {render};
