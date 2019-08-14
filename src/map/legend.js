import * as d3 from "d3";
import { prefix, rootURL } from "../constants";
import { formatAsPercentage, formatQualitativeScale } from "../utils";

const size = 20;

export const buildQuantitativeLegend = (scale, label) => {
  const legendSvg = d3.select(`.${prefix}legend`).select("svg");
  const stops = scale.thresholds().map(i => [i, scale(i)]);

  // Add the minimum bucket
  // Necessary because usually D3 just shows the thresholds
  const min = scale.domain()[0];
  stops.splice(0, 0, [min, scale(min)]);

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
      return `translate(${size * i + 4 * i}, 0)`;
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
    .attr("x", (d, i) => size * i + 4 * i);
};

const buildLegend = (stops, label) => {
  const legend = d3
    .select(`.${prefix}legend`)
    .append("div")
    .attr("class", `${prefix}legend--qualitative`);

  legend
    .append("span")
    .attr("class", `${prefix}legend-label`)
    .text(label);

  legend
    .append("div")
    .selectAll("div")
    .data(stops)
    .enter()
    .append("div")
    .attr("width", size * 3)
    .attr("height", size)
    .attr("class", `${prefix}legend-segment`)
    .attr("style", d => `background-image: url(${rootURL}${d[1]})`);

  legend
    .append("div")
    .selectAll("span")
    .data(stops)
    .enter()
    .append("span")
    .text(d => formatQualitativeScale(d[0], "short"));
};

export const buildQualitativeLegend = (scale, filter) => {
  d3.select(`.${prefix}legend`)
    .selectAll("*")
    .remove();

  const label = filter === "proposed" ? "Proposed policy" : "Current policy";
  const stops = ["no", "yes_low", "yes_high"].map(i => [i, scale[i]]);

  buildLegend(stops, label);

  if (filter === "current-and-proposed") {
    const proposedStops = ["proposed_low", "proposed_high"].map(i => [i, scale[i]]);
    buildLegend(proposedStops, "Proposed policy");
  }
};
