import * as d3 from "d3";
import { prefix } from "../constants";
import { formatAsPercentage } from "../utils";

const size = 20;

const buildLegend = scale => {
  const stops = scale.thresholds().map(i => [i, scale(i)]);

  const legendSvg = d3.select(`.${prefix}legend`).select("svg");
  legendSvg.selectAll("*").remove();

  legendSvg
    .append("g")
    .selectAll("rect")
    .data(stops)
    .enter()
    .append("rect")
    .attr("width", size)
    .attr("height", size)
    .attr("class", "legendQuant")
    .attr("fill", d => d[1])
    .attr("transform", (d, i) => {
      return `translate(${size * i + 2 * i}, 0)`;
    });

  legendSvg
    .append("g")
    .selectAll("text")
    .data(stops)
    .enter()
    .append("text")
    .text(d => formatAsPercentage(d[0]))
    .attr("fill", "#000")
    .attr("font-size", "6px")
    .attr("y", "30")
    .attr("x", (d, i) => size * i + 2 * i);
};

export default buildLegend;
