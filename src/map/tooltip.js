import * as d3 from "d3";
import marked from "marked";
import { formatAsPercentage } from "../utils";
import { excludedKeys, labelMap } from "../constants";

// Tooltip
const tooltip = d3.select("#details").append("p");

function getTooltipKeys(data) {
  return Object.keys(data).filter(k => excludedKeys.indexOf(k) === -1);
}

function createTooltipContent(data) {
  let content = `<strong>${data.label}</strong>`;
  content += "<table><tbody>";
  const keys = getTooltipKeys(data);
  keys.forEach(key => {
    if (key !== "content") {
      content += `<tr><td>${labelMap[key]}</td><td>${formatAsPercentage(data[key])}</td></tr>`;
    }
  });
  content += "</tbody></table>";
  if (data.content) {
    content += `<p class="details-content">${marked(data.content)}</p>`;
  }

  return content;
}

export function addTooltip(d) {
  tooltip.html(createTooltipContent(d));
}

export function removeTooltip() {
  tooltip.selectAll("*").remove();
}
