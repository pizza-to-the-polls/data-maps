import * as d3 from "d3";
import { prefix } from "../constants";
import { formatAsPercentage, formatQualitativeScale } from "../utils";

const size = 20;

export const buildQuantitativeLegend = (scale, label) => {
  const legendSvg = d3.select(`.${prefix}legend`).select("svg");
  const stops = scale.thresholds().map(i => [i, scale(i)]);
  d3.select(`.${prefix}legend-label`).text(label);

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
    .attr("font-family", '"Montserrat", sans-serif')
    .attr("y", "30")
    .attr("x", (d, i) => size * i + 2 * i);
};

export const buildQualitativeLegend = (scale, label) => {
  const legendSvg = d3.select(`.${prefix}legend`).select("svg");
  legendSvg.selectAll("*").remove();
  d3.select(`.${prefix}legend-label`).text(label);
  const stops = Object.keys(scale).map(i => [i, scale[i]]);
  console.log(stops);

  legendSvg
    .append("g")
    .selectAll("rect")
    .data(stops)
    .enter()
    .append("rect")
    .attr("width", size * 2)
    .attr("height", size)
    .attr("class", "legendQuant")
    .attr("fill", d => d[1])
    .attr("transform", (d, i) => {
      return `translate(${size * i * 2 + 2 * i}, 0)`;
    });

  legendSvg
    .append("g")
    .selectAll("text")
    .data(stops)
    .enter()
    .append("text")
    .text(d => formatQualitativeScale(d[0], "short"))
    .attr("fill", "#000")
    .attr("font-size", "6px")
    .attr("y", "30")
    .attr("x", (d, i) => size * i * 2 + 2 * i);
};
