import * as d3 from "d3";
import { legendWidth, prefix } from "../constants";

const intervals = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

const getStops = scale => {
  return intervals.map(i => [i, scale(i)]);
};

const buildLegend = scale => {
  const stops = getStops(scale);

  const legendSvg = d3.select(`.${prefix}legend`).select("svg");

  legendSvg.selectAll("*").remove();
  legendSvg.append("g");

  const gradient = legendSvg
    .append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%") // bottom
    .attr("y1", "0%")
    .attr("x2", "100%") // to top
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

  stops.forEach(d => {
    gradient
      .append("stop")
      .attr("offset", d[0])
      .attr("stop-color", d[1])
      .attr("stop-opacity", 1);
  });

  legendSvg
    .append("rect")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("y", 30)
    .attr("width", legendWidth)
    .attr("height", 10)
    .style("fill", "url(#gradient)");

  legendSvg
    .selectAll("text")
    .data([0, 100])
    .enter()
    .append("text")
    .text(d => `${d.toString()}%`)
    .attr("fill", "#000")
    .attr("font-size", "12px")
    .attr("y", "25")
    .attr("x", d => {
      const position = legendWidth * (d / 100);
      if (position === legendWidth) {
        return position - 30;
      }
      return position;
    });
};

export default buildLegend;
