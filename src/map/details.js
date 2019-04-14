import { select } from "d3";
import marked from "marked";
import { formatAsPercentage, makeLabel } from "../utils";
import { prefix, excludedKeys } from "../constants";

// Tooltip
let details;

const getDetailsKeys = data => {
  return Object.keys(data).filter(k => excludedKeys.indexOf(k) === -1);
};

const createDetailsContent = data => {
  let content = `<strong>${data.label}</strong>`;
  content += "<table><tbody>";
  const keys = getDetailsKeys(data);
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
};

export const addDetails = d => {
  details.style("display", "block").html(createDetailsContent(d));
};

export const removeDetails = () => {
  details
    .style("display", "none")
    .selectAll("*")
    .remove();
};

export const initDetails = container => {
  details = select(container)
    .select(`.${prefix}vis`)
    .append("div")
    .attr("class", `${prefix}details`);
};
