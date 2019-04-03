import { select } from "d3";
import marked from "marked";
import { formatAsPercentage, makeLabel } from "../utils";
import { excludedKeys } from "../constants";
import { prefix } from "../constants";

// Tooltip
let tooltip;

const getTooltipKeys = data => {
  return Object.keys(data).filter(k => excludedKeys.indexOf(k) === -1);
}

const createTooltipContent = data => {
  let content = `<strong>${data.label}</strong>`;
  content += "<table><tbody>";
  const keys = getTooltipKeys(data);
  keys.forEach(key => {
    if (key !== "content") {
      content += `<tr><td>${makeLabel(key)}</td><td>${formatAsPercentage(data[key])}</td></tr>`;
    }
  });
  content += "</tbody></table>";
  if (data.content) {
    content += `<p class="details-content">${marked(data.content)}</p>`;
  }

  return content;
}

export const addTooltip = d => {
  tooltip.html(createTooltipContent(d));
}

export const removeTooltip = d => {
  tooltip.selectAll("*").remove();
}

export const initTooltip = container => {
  tooltip = select(container).select(`.${prefix}details`).append("p");
}
