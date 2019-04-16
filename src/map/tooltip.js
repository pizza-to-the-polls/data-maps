import { select } from "d3";
import { formatAsPercentage } from "../utils";
import { prefix } from "../constants";

// Tooltip
let tooltip;

const getPosition = e => {
  const visPosition = document.querySelectorAll(`.${prefix}vis`)[0].getBoundingClientRect();
  const bodyPosition = document.body.getBoundingClientRect();
  return {
    x: e.pageX - 20 - visPosition.left,
    y: e.pageY + 20 - visPosition.top + bodyPosition.top
  };
};

const createTooltipContent = (data, filter) => {
  let content = `<strong>${data.label}:</strong> `;
  content += `${formatAsPercentage(data[filter])}`;
  return content;
};

const handleMouseMove = e => {
  const position = getPosition(e);
  tooltip.style("left", `${position.x}px`).style("top", `${position.y}px`);
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
    .select(`.${prefix}vis`)
    .append("div")
    .attr("class", `${prefix}tooltip`)
    .style("display", "none");

  document.addEventListener("mousemove", handleMouseMove);
};
