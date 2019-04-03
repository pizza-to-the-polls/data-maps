import * as d3 from "d3";
import { legendWidth, prefix } from "../constants";
import { formatAsPercentage } from "../utils";

const colorStops = 11;

const buildLegend = (scale, domain) => {
  const domainSize = domain[1] - domain[0];
  const stops = d3.range(domain[0], domain[1], domainSize/colorStops)
                  .map(i => [i, scale(i)]);

  const legendSvg = d3.select(`.${prefix}legend`).select("svg");

  legendSvg.selectAll("*").remove();
  legendSvg.append("g");

  const gradient = legendSvg.append("defs")
                            .append("linearGradient")
                            .attr("id", "gradient")
                            .attr("x1", "0%") // bottom
                            .attr("y1", "0%")
                            .attr("x2", "100%") // to top
                            .attr("y2", "0%")
                            .attr("spreadMethod", "pad");

  stops.forEach((d, i) => gradient.append("stop")
                                  .attr("offset", i/colorStops)
                                  .attr("stop-color", d[1])
                                  .attr("stop-opacity", 1));

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
    .data(domain)
    .enter()
    .append("text")
    .text(formatAsPercentage)
    .attr("fill", "#000")
    .attr("font-size", "12px")
    .attr("y", "25")
    .attr("x", (_, i) => (i > 0 ? legendWidth - 31 : 0));
};

export default buildLegend;
