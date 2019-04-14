import { select } from "d3";
import { formatAsPercentage } from "../utils";
import { prefix } from "../constants";

// Tooltip
let tooltip;

const createTooltipContent = (data, filter) => {
  let content = `<strong>${data.label}:</strong> `;
  content += `${formatAsPercentage(data[filter])}`;
  return content;
};

const handleMouseMove = e => {
  tooltip.style("left", `${e.pageX - 20}px`).style("top", `${e.pageY + 20}px`);
};

export const addTooltip = (d, filter) => {
  tooltip.style("display", "block").html(createTooltipContent(d, filter));
};

export const removeTooltip = () => {
  tooltip
    .style("display", "none")
    .selectAll("*")
    .remove();
};

export const initTooltip = container => {
  tooltip = select(container)
    .select(`.${prefix}container`)
    .append("div")
    .attr("class", `${prefix}tooltip`)
    .style("display", "none");

  document.addEventListener("mousemove", handleMouseMove);
};
